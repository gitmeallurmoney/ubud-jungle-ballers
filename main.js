// =================================================================
// Ubud Jungle Ballers — interactive football-globe (Three.js)
// =================================================================
//
// What's on screen:
//   - A textured Earth sphere — Earth + truncated-icosahedron seams
//     (white dashed stitching with a dark "valley" beneath) baked
//     into a single canvas texture so the panels read as embossed
//     leather instead of decorative overlay lines.
//   - Pin markers at each player nationality (raycaster picks them).
//   - OrbitControls — drag to spin, idle auto-rotate after ~2.5s,
//     scroll to zoom (camera dollies in/out, canvas size never changes).
//
// Vendored locally under ./vendor/. No CDN required.
// =================================================================

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import earcut from "./vendor/earcut.js";
import { NATIONALITIES } from "./players.js";

// ---------- Constants ----------
const GLOBE_RADIUS  = 1.0;
const MARKER_RADIUS = 1.012;
const COLOR_GOLD    = 0xC9A14A;
const COLOR_GREEN   = 0x1E4F3F;

// ---------- DOM ----------
const canvas       = document.getElementById("globe-canvas");
const wrap         = canvas.parentElement;
const loader       = document.getElementById("globe-loader");
const tooltip      = document.getElementById("globe-tooltip");
const panel        = document.getElementById("country-panel");
const panelClose   = panel.querySelector(".panel-close");
const panelFlag    = panel.querySelector(".panel-flag");
const panelCountry = panel.querySelector(".panel-country");
const panelMeta    = panel.querySelector(".panel-meta");
const panelNote    = panel.querySelector(".panel-note");
const panelRoster  = panel.querySelector(".panel-roster");

// ---------- Scene basics ----------
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  42,                                     // slightly tighter FOV
  wrap.clientWidth / wrap.clientHeight,
  0.01,
  100
);
camera.position.set(0, 0.3, 3.39);   // ≈ distance 3.4 (matches CAM_DIST_FAR)

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(wrap.clientWidth, wrap.clientHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;

// ---------- Lights (brighter, more contrast) ----------
scene.add(new THREE.AmbientLight(0xb6cdc4, 0.85));

const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
keyLight.position.set(3, 2.5, 4);
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x86c2a8, 0.55);
rimLight.position.set(-3, -1, -2);
scene.add(rimLight);

// ---------- Star field ----------
(function addStars() {
  const starGeom = new THREE.BufferGeometry();
  const N = 600;
  const positions = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const r = 30 + Math.random() * 20;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  starGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const stars = new THREE.Points(
    starGeom,
    new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.06,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.5,
    })
  );
  scene.add(stars);
})();

// ---------- Globe (Earth-football composite texture) ----------
const globeGroup = new THREE.Group();
scene.add(globeGroup);

const sphereGeom = new THREE.SphereGeometry(GLOBE_RADIUS, 128, 128);

// Material starts plain (dark green) so something visible is on screen
// while the textures load and the composite is built
const sphereMat = new THREE.MeshStandardMaterial({
  color: COLOR_GREEN,
  roughness: 0.78,
  metalness: 0.04,
});
const earth = new THREE.Mesh(sphereGeom, sphereMat);
globeGroup.add(earth);

// Build the composite Earth + country borders + highlights + seams texture.
// We fetch the GeoJSON in parallel with loading the Earth jpg.
// Once loaded, we also stash the geo for sphere-raycasting / point-in-polygon hit testing.
let countryGeo = null;
const NAT_BY_ISO = new Map(NATIONALITIES.map(n => [String(n.iso), n]));

Promise.all([
  loadEarthImage("./vendor/textures/earth-blue-marble.jpg"),
  fetch("./vendor/countries-110m.geo.json").then(r => r.json()).catch(() => null),
])
  .then(([img, geo]) => {
    countryGeo = geo;
    const tex = buildFootballEarthTexture(img, geo, NAT_BY_ISO);
    sphereMat.map = tex;
    sphereMat.color = new THREE.Color(0xffffff); // no tint — let texture shine
    sphereMat.needsUpdate = true;
    hideLoader();
  })
  .catch((err) => {
    console.warn("[UJB] Composite texture failed, using procedural fallback.", err);
    sphereMat.map = makeProceduralEarthTexture();
    sphereMat.color = new THREE.Color(0xffffff);
    sphereMat.needsUpdate = true;
    hideLoader();
  });

// Bump/relief map adds the leather "panel" feel to the surface
const texLoader = new THREE.TextureLoader();
texLoader.load(
  "./vendor/textures/earth-topology.png",
  (tex) => {
    sphereMat.bumpMap = tex;
    sphereMat.bumpScale = 0.045;            // pronounced enough to read as leather
    sphereMat.needsUpdate = true;
  },
  undefined,
  () => { /* topology missing — silent skip */ }
);

function hideLoader() {
  if (loader) loader.classList.add("hidden");
}

// ---------- Soft halo around the globe ----------
// Radius kept tight (1.07×) so the halo sits as a thin glow rim around the
// sphere and doesn't get clipped at the canvas edges when the hero zooms in.
(function addHalo() {
  const haloGeom = new THREE.SphereGeometry(GLOBE_RADIUS * 1.07, 64, 64);
  const haloMat = new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: { uColor: { value: new THREE.Color(0x6fb494) } },
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.62 - dot(vNormal, vec3(0,0,1)), 2.0);
        gl_FragColor = vec4(uColor, 1.0) * intensity;
      }
    `,
  });
  scene.add(new THREE.Mesh(haloGeom, haloMat));
})();

// ---------- Lat/Lon helpers ----------
function latLonToVec3(lat, lon, radius) {
  const polar = (90 - lat) * Math.PI / 180;
  const azim  = (lon + 180) * Math.PI / 180;
  return new THREE.Vector3(
    -radius * Math.sin(polar) * Math.cos(azim),
     radius * Math.cos(polar),
     radius * Math.sin(polar) * Math.sin(azim)
  );
}

// Map a unit-sphere Vector3 → equirectangular UV (matches Three.js
// SphereGeometry default UV layout, which is what the blue-marble texture expects).
function vec3ToUV(v) {
  const lat = Math.asin(Math.max(-1, Math.min(1, v.y)));     // -π/2..π/2
  let theta = Math.atan2(v.z, -v.x);                          // -π..π
  if (theta < 0) theta += Math.PI * 2;                        // 0..2π
  return {
    u: theta / (Math.PI * 2),
    v: 1 - (lat / Math.PI + 0.5),
  };
}

// ---------- Truncated-icosahedron edges (the football pattern) ----------
function computeFootballEdges() {
  const phi = (1 + Math.sqrt(5)) / 2;
  const raw = [];

  function pushFamily(a, b, c) {
    const perms = [
      [a, b, c],
      [b, c, a],
      [c, a, b],
    ];
    for (const [x, y, z] of perms) {
      const xs = x === 0 ? [0] : [x, -x];
      const ys = y === 0 ? [0] : [y, -y];
      const zs = z === 0 ? [0] : [z, -z];
      for (const sx of xs)
        for (const sy of ys)
          for (const sz of zs) raw.push([sx, sy, sz]);
    }
  }
  pushFamily(0, 1, 3 * phi);
  pushFamily(1, 2 + phi, 2 * phi);
  pushFamily(phi, 2, 2 * phi + 1);

  // Normalize each vertex onto the unit sphere
  const verts = raw.map(([x, y, z]) => {
    const r = Math.hypot(x, y, z);
    return new THREE.Vector3(x / r, y / r, z / r);
  });

  // Build edges: any pair of raw vertices at distance ~2
  const edges = [];
  const tol = 0.05;
  for (let i = 0; i < raw.length; i++) {
    for (let j = i + 1; j < raw.length; j++) {
      const dx = raw[i][0] - raw[j][0];
      const dy = raw[i][1] - raw[j][1];
      const dz = raw[i][2] - raw[j][2];
      const d = Math.hypot(dx, dy, dz);
      if (Math.abs(d - 2) < tol) edges.push([verts[i], verts[j]]);
    }
  }
  return edges;
}

// ---------- Composite "football Earth" texture ----------
//
// Layered onto a 4096×2048 equirectangular canvas, in order:
//   1. The Earth jpg
//   2. Brightness / saturation lifts
//   3. Country borders (thin white lines from GeoJSON)
//   4. Football panel seams: dark "groove" strokes, then white dashed stitching
//
function loadEarthImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
}

function buildFootballEarthTexture(img, geo, natByIso) {
  const W = 4096;
  const H = 2048;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");

  // 1. Earth
  ctx.drawImage(img, 0, 0, W, H);

  // 2. Brightness lift via screen blend
  ctx.globalCompositeOperation = "screen";
  ctx.fillStyle = "rgba(48, 56, 72, 1)";
  ctx.fillRect(0, 0, W, H);

  // Light warmth via soft-light
  ctx.globalCompositeOperation = "soft-light";
  ctx.fillStyle = "rgba(255, 240, 220, 0.18)";
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = "source-over";

  // 3a. Highlighted countries (filled gold) — drawn before borders so the
  //     border outline still reads on top of the fill.
  if (geo && geo.features && natByIso) {
    fillHighlightedCountries(ctx, geo, natByIso, W, H);
  }

  // 3b. Country borders (drawn UNDER the football seams so seams sit on top)
  if (geo && geo.features) {
    drawCountryBorders(ctx, geo, W, H);
  }

  // 4. Football panel seams
  const edges = computeFootballEdges();

  // Pass A — dark "groove" beneath the stitching
  ctx.lineCap = "butt";
  ctx.setLineDash([]);
  ctx.lineWidth = 18;
  ctx.strokeStyle = "rgba(0, 0, 0, 0.55)";
  for (const [a, b] of edges) drawGreatCircleStroke(ctx, a, b, W, H);

  // Pass B — soft inner shadow for depth
  ctx.lineWidth = 8;
  ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
  for (const [a, b] of edges) drawGreatCircleStroke(ctx, a, b, W, H);

  // Pass C — white dashed stitching (the thread on top of the groove)
  ctx.lineCap = "round";
  ctx.lineWidth = 5;
  ctx.setLineDash([18, 14]);
  ctx.strokeStyle = "rgba(248, 245, 235, 0.95)";
  for (const [a, b] of edges) drawGreatCircleStroke(ctx, a, b, W, H);
  ctx.setLineDash([]);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

// ---------- Draw country borders from GeoJSON onto the equirectangular canvas ----------
//
// Each feature has a Polygon or MultiPolygon geometry whose coordinates are
// arrays of [lon, lat] pairs. We project to canvas pixels via the standard
// equirectangular formula and split any polyline that crosses the dateline.
//
function lonLatToPx(lon, lat, W, H) {
  return [
    ((lon + 180) / 360) * W,
    (0.5 - lat / 180) * H,
  ];
}

// Fill countries that have at least one player on the squad. Each country gets
// a saturated bright-gold layer; the borders pass that follows then outlines
// them so they read clearly even at small sizes.
function fillHighlightedCountries(ctx, geo, natByIso, W, H) {
  ctx.save();
  ctx.fillStyle = "rgba(255, 198, 60, 0.72)";       // bright saturated gold
  ctx.strokeStyle = "rgba(255, 235, 160, 1.0)";     // bright bone-gold outline
  ctx.lineWidth = 3.0;
  ctx.lineJoin = "round";
  for (const f of geo.features) {
    if (!natByIso.has(String(f.id))) continue;
    const g = f.geometry;
    if (!g) continue;
    const polys = g.type === "Polygon" ? [g.coordinates] :
                  g.type === "MultiPolygon" ? g.coordinates : [];
    for (const poly of polys) {
      // Build path, splitting on dateline crossings
      const subPaths = ringsToSubPaths(poly[0], W, H);
      for (const sp of subPaths) {
        ctx.beginPath();
        sp.forEach((pt, i) => i === 0 ? ctx.moveTo(pt[0], pt[1]) : ctx.lineTo(pt[0], pt[1]));
        ctx.fill();
        ctx.stroke();
      }
      // Holes (rings beyond the first) — punch them out with a darker tint
      for (let r = 1; r < poly.length; r++) {
        const subs = ringsToSubPaths(poly[r], W, H);
        for (const sp of subs) {
          ctx.beginPath();
          sp.forEach((pt, i) => i === 0 ? ctx.moveTo(pt[0], pt[1]) : ctx.lineTo(pt[0], pt[1]));
          ctx.save();
          ctx.fillStyle = "rgba(0, 0, 0, 0)";
          ctx.fill();
          ctx.restore();
        }
      }
    }
  }
  ctx.restore();
}

// Convert a ring of [lon,lat] pairs into a list of pixel-space sub-paths,
// splitting wherever the path would jump across the dateline.
function ringsToSubPaths(ring, W, H) {
  const subs = [];
  let cur = [];
  let prevX = null;
  for (const [lon, lat] of ring) {
    const [x, y] = lonLatToPx(lon, lat, W, H);
    if (prevX !== null && Math.abs(x - prevX) > W * 0.5) {
      if (cur.length > 1) subs.push(cur);
      cur = [];
    }
    cur.push([x, y]);
    prevX = x;
  }
  if (cur.length > 1) subs.push(cur);
  return subs;
}

function drawCountryBorders(ctx, geo, W, H) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  // Soft drop-shadow effect: dark stroke first, white on top — borders read on
  // both light desert and dark ocean.
  for (const pass of [
    { color: "rgba(0, 0, 0, 0.55)", width: 4 },
    { color: "rgba(248, 245, 235, 0.85)", width: 1.6 },
  ]) {
    ctx.strokeStyle = pass.color;
    ctx.lineWidth = pass.width;
    for (const f of geo.features) {
      const g = f.geometry;
      if (!g) continue;
      const polys = g.type === "Polygon" ? [g.coordinates] :
                    g.type === "MultiPolygon" ? g.coordinates : [];
      for (const poly of polys) {
        for (const ring of poly) drawRing(ctx, ring, W, H);
      }
    }
  }
  ctx.restore();
}

function drawRing(ctx, ring, W, H) {
  ctx.beginPath();
  let prevX = null;
  for (let i = 0; i < ring.length; i++) {
    const [lon, lat] = ring[i];
    const [x, y] = lonLatToPx(lon, lat, W, H);
    if (prevX === null) {
      ctx.moveTo(x, y);
    } else if (Math.abs(x - prevX) > W * 0.5) {
      // Dateline crossing — break the path so we don't streak across the texture
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    prevX = x;
  }
  ctx.stroke();
}

// Stroke a great-circle arc between two unit vectors on the equirectangular canvas.
// Splits when the projection wraps around the dateline so we don't draw across the seam.
function drawGreatCircleStroke(ctx, a, b, W, H) {
  const STEPS = 36;
  const dot = Math.max(-1, Math.min(1, a.dot(b)));
  const omega = Math.acos(dot);
  const sinO = Math.sin(omega);

  let prev = null;
  ctx.beginPath();
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    let p;
    if (sinO < 1e-6) {
      p = a.clone();
    } else {
      const w1 = Math.sin((1 - t) * omega) / sinO;
      const w2 = Math.sin(t * omega) / sinO;
      p = a.clone().multiplyScalar(w1).addScaledVector(b, w2).normalize();
    }
    const uv = vec3ToUV(p);
    const px = uv.u * W;
    const py = uv.v * H;

    if (prev) {
      // Dateline wrap detection — large jump in u means the arc crosses the seam
      if (Math.abs(uv.u - prev.u) > 0.5) {
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    } else {
      ctx.moveTo(px, py);
    }
    prev = uv;
  }
  ctx.stroke();
}

// (Chameleon "conquered" stamps removed — country highlights alone signal
// which countries the squad represents.)

// ---------- OrbitControls ----------
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = false;

// Wheel-zoom on the canvas is intentionally disabled — the wheel is reserved
// for the page-scroll-driven hero animation (see updateHeroProgress below),
// which maps scroll position to camera distance directly. Drag still rotates.
controls.enableZoom = false;

controls.rotateSpeed = 0.7;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.32;

// Camera distance is driven by the scroll-progress variable.
// Sphere radius = 1, FOV = 42°. For the sphere to fully fit inside the FOV
// with breathing room, we need distance ≥ 1 / sin(0.4 * FOV) ≈ 3.04.
// Anything closer crops the sphere at the canvas edges.  These two values
// stay above that threshold so the full circle is always visible.
const CAM_DIST_FAR  = 3.4;          // when hero is fresh (--scroll-progress = 0)
const CAM_DIST_NEAR = 3.05;         // when hero is fully zoomed-in   (= 1)
const CAM_DIST_LERP = 0.1;
let currentDistance = camera.position.distanceTo(controls.target);
let targetDistance  = CAM_DIST_FAR;

const IDLE_MS = 2500;
let lastInteractionAt = 0;
controls.addEventListener("start", () => {
  controls.autoRotate = false;
  lastInteractionAt = performance.now();
  // User drag cancels any in-progress focus animation
  focusAnimation = null;
});
controls.addEventListener("end", () => {
  lastInteractionAt = performance.now();
});

// ---------- Country-focus camera animation ----------
//
// When the user clicks a highlighted country, we SLERP the camera around the
// globe so the country's lat/lon ends up centered in the view.  Both the
// current and target camera positions live on a sphere of radius
// `currentDistance`, so spherical interpolation gives the natural great-circle
// arc.  Auto-rotate pauses during the focus; user drag cancels it.
//
let focusAnimation = null;          // { fromDir: Vector3, toDir: Vector3, t0, duration }
const FOCUS_DURATION = 950;         // ms

function focusCameraOn(nat) {
  if (!nat) return;
  // Direction from globe center to the country's surface point
  const targetDir = latLonToVec3(nat.lat, nat.lon, 1).normalize();
  // Add a slight tilt-up (~12°) for cinematic angle, not flat-on
  // (rotate the direction vector around the X axis a touch)
  const TILT = 0.21;                // radians (~12°)
  const tiltedDir = new THREE.Vector3(
    targetDir.x,
    targetDir.y * Math.cos(TILT) - targetDir.z * Math.sin(TILT) * 0,  // keep y for now
    targetDir.z
  );
  // Bias the camera slightly above the equator so the country sits in upper
  // half of the view (looks more dynamic than dead-center)
  tiltedDir.y += 0.18;
  tiltedDir.normalize();

  const fromDir = camera.position.clone().sub(controls.target).normalize();
  focusAnimation = {
    fromDir,
    toDir: tiltedDir,
    t0: performance.now(),
    duration: FOCUS_DURATION,
  };
  controls.autoRotate = false;
  lastInteractionAt = performance.now();
}

// ---------- Raycasting against the sphere → which country was hit? ----------
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hoveredNat = null;
let selectedNat = null;

function setPointerFromEvent(evt) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;
}

// Convert a 3D unit vector on the sphere → (lon, lat) in degrees.
// Inverse of latLonToVec3 above.
function vec3ToLonLat(v) {
  const len = v.length() || 1;
  const lat = Math.asin(Math.max(-1, Math.min(1, v.y / len))) * 180 / Math.PI;
  let azim = Math.atan2(v.z, -v.x);
  if (azim < 0) azim += Math.PI * 2;
  const lon = azim * 180 / Math.PI - 180;
  return { lon, lat };
}

// Standard ray-casting point-in-polygon. `ring` is [[lon,lat], ...].
function pointInRing(lon, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersects = ((yi > lat) !== (yj > lat)) &&
                       (lon < (xj - xi) * (lat - yi) / (yj - yi + 1e-12) + xi);
    if (intersects) inside = !inside;
  }
  return inside;
}

// Find the nationality (if any) whose country contains the given lon/lat.
// Walks only the highlighted countries (since the rest aren't clickable).
function pickNationalityAt(lon, lat) {
  if (!countryGeo) return null;
  for (const f of countryGeo.features) {
    const nat = NAT_BY_ISO.get(String(f.id));
    if (!nat) continue;
    const g = f.geometry;
    if (!g) continue;
    const polys = g.type === "Polygon" ? [g.coordinates] :
                  g.type === "MultiPolygon" ? g.coordinates : [];
    for (const poly of polys) {
      // Outer ring contains, no holes contain
      if (!pointInRing(lon, lat, poly[0])) continue;
      let inHole = false;
      for (let r = 1; r < poly.length; r++) {
        if (pointInRing(lon, lat, poly[r])) { inHole = true; break; }
      }
      if (!inHole) return nat;
    }
  }
  return null;
}

// ---------- Lifted-country 3D plateau ----------
//
// On click, we build a SINGLE BufferGeometry with two kinds of vertices:
//   - "lifting" verts (top face + wall tops)  — radius rises with animation
//   - "static"  verts (wall bottoms)          — stay glued to sphere surface
//
// Each vertex stores its unit-direction-from-origin in `mesh.userData.dirs`
// and a 0/1 lift tag in `mesh.userData.lifts`.  Per frame we recompute
// `position = direction × (1 + lifts[i] × LIFT_DELTA × t)`, so as t animates
// from 0 → 1, the top face peels up off the globe while the base ring stays
// anchored — a real plateau, not a hovering sheet.
//
const LIFT_TARGET_DELTA = 0.06;                 // top rises this much (in sphere radii)

let liftedMesh = null;
let liftedNat = null;
let liftAnimT = 0;
let liftAnimDir = 1;

function buildLiftedCountryMesh(nat) {
  if (!countryGeo) return null;
  const feature = countryGeo.features.find(f => String(f.id) === String(nat.iso));
  if (!feature) return null;

  const positions = [];   // current animated positions
  const dirs = [];        // unit direction (constant)
  const lifts = [];       // 0 (static) or 1 (lifting)
  const indices = [];

  // Helper: push one vertex, return its new index
  function addVertex(lon, lat, lifting) {
    const v = latLonToVec3(lat, lon, 1);   // unit direction
    dirs.push(v.x, v.y, v.z);
    lifts.push(lifting ? 1 : 0);
    // Initial position: at sphere surface (t=0, all verts there)
    positions.push(v.x * GLOBE_RADIUS, v.y * GLOBE_RADIUS, v.z * GLOBE_RADIUS);
    return positions.length / 3 - 1;
  }

  const polys = feature.geometry.type === "Polygon"
    ? [feature.geometry.coordinates]
    : feature.geometry.coordinates;

  for (const poly of polys) {
    // ---- 1) TOP FACE — triangulated polygon, all vertices "lifting" ----
    const flat = [];
    const topIdx = [];                   // index in our buffer for each ring point
    for (const [lon, lat] of poly[0]) {
      flat.push(lon, lat);
      topIdx.push(addVertex(lon, lat, true));
    }
    const holeStarts = [];
    let cursor = poly[0].length;
    for (let r = 1; r < poly.length; r++) {
      holeStarts.push(cursor);
      for (const [lon, lat] of poly[r]) {
        flat.push(lon, lat);
        topIdx.push(addVertex(lon, lat, true));
      }
      cursor += poly[r].length;
    }
    const tris = earcut(flat, holeStarts.length ? holeStarts : undefined, 2);
    for (const idx of tris) indices.push(topIdx[idx]);

    // ---- 2) SIDE WALLS — duplicated verts so wall normals are independent ----
    function buildWall(ring) {
      const N = ring.length;
      const wallTop = [];                 // wall TOP vertex indices  (lifting)
      const wallBot = [];                 // wall BOTTOM vertex indices (static)
      for (const [lon, lat] of ring) {
        wallTop.push(addVertex(lon, lat, true));
        wallBot.push(addVertex(lon, lat, false));
      }
      for (let i = 0; i < N; i++) {
        const j = (i + 1) % N;
        // Two triangles per wall segment, outward-facing winding
        indices.push(wallTop[i], wallBot[i], wallTop[j]);
        indices.push(wallTop[j], wallBot[i], wallBot[j]);
      }
    }
    buildWall(poly[0]);
    for (let r = 1; r < poly.length; r++) buildWall(poly[r]);
  }

  if (!positions.length) return null;

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    color: 0xFFD24A,
    emissive: 0xE8A028,
    emissiveIntensity: 0.55,
    roughness: 0.45,
    metalness: 0.25,
    // Front-side only — back faces are inside the plateau & invisible
    side: THREE.FrontSide,
  });

  const mesh = new THREE.Mesh(geom, mat);
  mesh.userData.dirs  = new Float32Array(dirs);
  mesh.userData.lifts = new Float32Array(lifts);
  mesh.userData.vertexCount = positions.length / 3;
  return mesh;
}

// Recompute the plateau's vertex positions for a given animation parameter
// (0 = flush with sphere, 1 = fully extruded). Cheap: ~hundreds of verts.
function updateLiftedMeshGeometry(mesh, t) {
  const positions = mesh.geometry.attributes.position.array;
  const dirs  = mesh.userData.dirs;
  const lifts = mesh.userData.lifts;
  const N     = mesh.userData.vertexCount;
  for (let i = 0; i < N; i++) {
    const r = GLOBE_RADIUS * (1.0 + lifts[i] * LIFT_TARGET_DELTA * t);
    positions[i * 3]     = dirs[i * 3]     * r;
    positions[i * 3 + 1] = dirs[i * 3 + 1] * r;
    positions[i * 3 + 2] = dirs[i * 3 + 2] * r;
  }
  mesh.geometry.attributes.position.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}

function setLiftedCountry(nat) {
  // If we're already showing this country, leave it alone
  if (liftedNat === nat && nat) return;

  // Tear down any existing mesh immediately
  if (liftedMesh) {
    globeGroup.remove(liftedMesh);
    liftedMesh.geometry.dispose();
    liftedMesh.material.dispose();
    liftedMesh = null;
  }

  liftedNat = nat;
  if (nat) {
    liftedMesh = buildLiftedCountryMesh(nat);
    if (liftedMesh) {
      globeGroup.add(liftedMesh);
      liftAnimT = 0;
      liftAnimDir = 1;
    }
  } else {
    // Animate the (just-removed) mesh back? We've already torn it down,
    // so just reset state. (Future: keep the mesh and animate down before
    // removing — for now an instant pop on close keeps the code simple.)
    liftAnimT = 0;
    liftAnimDir = 0;
  }
}

// Raycast the pointer against the globe sphere, then convert to country.
function pickCountry() {
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObject(earth);
  if (!hits.length) return null;
  // Convert hit to globe-local space (in case the globeGroup ever gets rotated/scaled)
  const localHit = earth.worldToLocal(hits[0].point.clone());
  const { lon, lat } = vec3ToLonLat(localHit);
  return pickNationalityAt(lon, lat);
}

// Track pointer-down position so we can distinguish a click from a drag.
// Using pointer events (not click) because OrbitControls' pointer handling
// can swallow synthetic clicks in some browsers / pointer modes.
let mouseDownPos = null;
let mouseDownTime = 0;

canvas.addEventListener("pointerdown", (e) => {
  mouseDownPos = { x: e.clientX, y: e.clientY };
  mouseDownTime = performance.now();
});

canvas.addEventListener("pointermove", (e) => {
  setPointerFromEvent(e);
  const nat = pickCountry();
  if (nat !== hoveredNat) {
    hoveredNat = nat;
    if (nat) {
      tooltip.textContent = `${nat.flag}  ${nat.name}`;
      tooltip.classList.add("visible");
      canvas.style.cursor = "pointer";
    } else {
      tooltip.classList.remove("visible");
      canvas.style.cursor = "";
    }
  }
  if (nat) {
    tooltip.style.left = e.clientX + "px";
    tooltip.style.top = e.clientY + "px";
  }
});

// Use the synthesized "click" event so we don't fight OrbitControls for
// pointerup/pointerdown ordering. The browser only fires `click` when the
// down + up happen on the same target without a drag, which is exactly the
// gesture we want for opening the panel.
canvas.addEventListener("click", (e) => {
  // Belt-and-braces: if the user did move significantly between down/up, bail.
  if (mouseDownPos) {
    const dx = e.clientX - mouseDownPos.x;
    const dy = e.clientY - mouseDownPos.y;
    if (Math.hypot(dx, dy) > 4) { mouseDownPos = null; return; }
  }
  mouseDownPos = null;
  setPointerFromEvent(e);
  const nat = pickCountry();
  if (nat) openCountryPanel(nat);
});

canvas.addEventListener("pointerleave", () => {
  hoveredNat = null;
  tooltip.classList.remove("visible");
});

// ---------- Country panel ----------
function openCountryPanel(nat) {
  selectedNat = nat;
  setLiftedCountry(nat);                            // build + animate the lifted 3D mesh
  focusCameraOn(nat);                               // animate camera so this country is centered

  panelFlag.textContent = nat.flag;
  panelCountry.textContent = nat.name.toUpperCase();
  panelMeta.textContent = `${nat.players.length} player${nat.players.length === 1 ? "" : "s"} on the squad`;
  panelNote.textContent = nat.note || "";

  panelRoster.innerHTML = "";
  nat.players.forEach((p) => {
    const li = document.createElement("li");
    li.className = "player-row";
    li.innerHTML = `
      <span class="player-num">${p.number}</span>
      <span class="player-name">${escapeHtml(p.name)}</span>
      <span class="player-pos">${p.position}</span>
    `;
    panelRoster.appendChild(li);
  });

  panel.classList.add("open");
  controls.autoRotate = false;
  lastInteractionAt = performance.now();
}

function closeCountryPanel() {
  panel.classList.remove("open");
  selectedNat = null;
  // Animate back down before removing — `liftAnimDir = -1` will trigger that
  if (liftedMesh) {
    liftAnimDir = -1;                              // tick loop will ease it down
  }
}
panelClose.addEventListener("click", closeCountryPanel);
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeCountryPanel();
});

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

// ---------- Resize (keeps the camera aspect tied to the canvas) ----------
function resize() {
  const w = wrap.clientWidth;
  const h = wrap.clientHeight;
  if (w === 0 || h === 0) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);
resize();

// We no longer grow the canvas via CSS width — scroll progress drives a
// transform: scale instead, so the wrap's actual dimensions stay constant
// during scroll. A window-level resize listener (above) is enough; no
// ResizeObserver needed (and avoiding it removes the per-frame setSize
// thrash that was causing flicker).

// ---------- Scroll-driven hero animation ----------
//
// The hero anchor reserves 200vh of scroll. As the user scrolls within it, we
// map the scrolled-past distance (0 → anchorHeight - viewportHeight) to a
// progress value 0..1 and write it both to a CSS variable (which drives the
// content slide-out + globe grow + recenter) and to `targetDistance` (which
// dollies the camera in for added depth).
//
const heroAnchor = document.getElementById("hero-anchor");

function updateHeroProgress() {
  if (!heroAnchor) return;
  const rect = heroAnchor.getBoundingClientRect();
  const vh = window.innerHeight;
  if (vh <= 0) return;
  const scrolled = -rect.top;

  // -------- Globe phase: --scroll-progress 0 → 1 over the FIRST viewport ----
  const heroP = Math.max(0, Math.min(1, scrolled / vh));
  document.documentElement.style.setProperty("--scroll-progress", heroP);
  targetDistance = CAM_DIST_FAR + (CAM_DIST_NEAR - CAM_DIST_FAR) * heroP;

  // -------- Jungle phase: --jungle-progress 0 → 1 STARTS BEFORE the hero
  //          finishes (overlap zone) so the jungle begins materialising on
  //          top of the globe.  Maps scrollY 0.85·vh → 2.15·vh into 0 → 1.
  const jStart = vh * 0.85;
  const jSpan  = vh * 1.30;
  const jungleP = Math.max(0, Math.min(1, (scrolled - jStart) / jSpan));
  document.documentElement.style.setProperty("--jungle-progress", jungleP);
}

// Throttle scroll updates to animation frames (cheaper than per-event).
// updateHeroProgress drives BOTH --scroll-progress (globe) and --jungle-progress
// (jungle parallax) from the same scroll position with overlapping ranges.
let scrollTickQueued = false;
function onScrollOrResize() {
  if (scrollTickQueued) return;
  scrollTickQueued = true;
  requestAnimationFrame(() => {
    updateHeroProgress();
    scrollTickQueued = false;
  });
}
window.addEventListener("scroll", onScrollOrResize, { passive: true });
window.addEventListener("resize", onScrollOrResize);
updateHeroProgress();   // initial

// ---------- Procedural Earth fallback (in case the texture file is missing) ----------
function makeProceduralEarthTexture() {
  const c = document.createElement("canvas");
  c.width = 2048;
  c.height = 1024;
  const ctx = c.getContext("2d");

  // Ocean
  const grad = ctx.createLinearGradient(0, 0, 0, c.height);
  grad.addColorStop(0, "#1e4f6e");
  grad.addColorStop(0.5, "#143952");
  grad.addColorStop(1, "#0f2840");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, c.width, c.height);

  // Decorative landmasses (not geographically accurate)
  ctx.fillStyle = "#3f7a5e";
  const blobs = [
    [400, 360, 220, 140], [460, 640, 140, 180],
    [1040, 400, 280, 150], [1120, 640, 160, 180],
    [1540, 680, 200, 130], [1220, 180, 100, 60],
  ];
  for (const [x, y, w, h] of blobs) {
    ctx.beginPath();
    ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Bake same seam pass on the fallback so it still reads as a football
  const edges = computeFootballEdges();
  ctx.lineCap = "butt"; ctx.setLineDash([]);
  ctx.lineWidth = 14; ctx.strokeStyle = "rgba(0,0,0,0.55)";
  for (const [a, b] of edges) drawGreatCircleStroke(ctx, a, b, c.width, c.height);
  ctx.lineCap = "round"; ctx.setLineDash([14, 10]);
  ctx.lineWidth = 4; ctx.strokeStyle = "rgba(248,245,235,0.95)";
  for (const [a, b] of edges) drawGreatCircleStroke(ctx, a, b, c.width, c.height);
  ctx.setLineDash([]);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ---------- Animation loop ----------
function tick(now) {
  // Auto-resume idle spin
  if (!controls.autoRotate && !panel.classList.contains("open")) {
    if (now - lastInteractionAt > IDLE_MS) controls.autoRotate = true;
  }

  // ---------- Lifted-country plateau animation ----------
  if (liftedMesh) {
    const STEP = 0.075;
    if (liftAnimDir > 0) {
      liftAnimT = Math.min(1, liftAnimT + STEP);
    } else if (liftAnimDir < 0) {
      liftAnimT = Math.max(0, liftAnimT - STEP);
    }
    const eased = liftAnimDir >= 0
      ? 1 - Math.pow(1 - liftAnimT, 3)         // ease-out cubic on the way up
      : liftAnimT * liftAnimT;                 // ease-in  quad  on the way down

    // Per-frame vertex update: top face + wall tops rise to `eased × LIFT_TARGET_DELTA`
    // above the sphere; wall bottoms stay glued to the surface.
    updateLiftedMeshGeometry(liftedMesh, eased);

    // Quiet emissive breathe while selected
    const breathe = 0.55 + 0.18 * Math.sin(now * 0.003);
    liftedMesh.material.emissiveIntensity = breathe * (0.4 + 0.6 * eased);

    if (liftAnimDir < 0 && liftAnimT <= 0) {
      globeGroup.remove(liftedMesh);
      liftedMesh.geometry.dispose();
      liftedMesh.material.dispose();
      liftedMesh = null;
      liftedNat = null;
      liftAnimDir = 0;
    }
  }

  controls.update();

  // Country-focus SLERP: animate camera direction toward the selected country
  if (focusAnimation) {
    const elapsed = now - focusAnimation.t0;
    const t = Math.min(1, elapsed / focusAnimation.duration);
    // Ease-out cubic for a "settling into view" feel
    const eased = 1 - Math.pow(1 - t, 3);

    const a = focusAnimation.fromDir;
    const b = focusAnimation.toDir;
    const dot = Math.max(-1, Math.min(1, a.dot(b)));
    const omega = Math.acos(dot);
    const sinO = Math.sin(omega);

    let dir;
    if (sinO < 1e-6) {
      dir = a.clone();
    } else {
      const w1 = Math.sin((1 - eased) * omega) / sinO;
      const w2 = Math.sin(eased * omega) / sinO;
      dir = a.clone().multiplyScalar(w1).addScaledVector(b, w2).normalize();
    }
    camera.position.copy(controls.target).addScaledVector(dir, currentDistance);
    if (t >= 1) focusAnimation = null;
  }

  // Smoothly ease the camera distance toward the scroll-driven target.
  // OrbitControls handled azimuth + polar above; we override only the radius.
  currentDistance += (targetDistance - currentDistance) * CAM_DIST_LERP;
  const dir = camera.position.clone().sub(controls.target).normalize();
  camera.position.copy(controls.target).addScaledVector(dir, currentDistance);

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
