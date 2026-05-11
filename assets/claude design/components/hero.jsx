// Spinning football composed from CSS — hex panels on a sphere with rotating gradient.
const SpinningBall = ({ size = 520 }) => {
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {/* outer ring marks */}
      <svg viewBox="0 0 520 520" width={size} height={size} style={{ position: "absolute", inset: 0, animation: "spin360 80s linear infinite" }}>
        <defs>
          <pattern id="ticks" width="20" height="20" patternUnits="userSpaceOnUse">
            <line x1="10" y1="0" x2="10" y2="4" stroke="var(--line)" strokeWidth="1" />
          </pattern>
        </defs>
        <circle cx="260" cy="260" r="252" fill="none" stroke="var(--line)" strokeWidth="1" strokeDasharray="2 6" />
        <circle cx="260" cy="260" r="248" fill="none" stroke="var(--line)" strokeWidth="1" />
        {/* compass marks */}
        {[0,45,90,135,180,225,270,315].map((deg) => (
          <g key={deg} transform={`rotate(${deg} 260 260)`}>
            <line x1="260" y1="6" x2="260" y2="14" stroke="var(--gold)" strokeWidth="1" />
          </g>
        ))}
        <text x="260" y="22" textAnchor="middle" fontFamily="var(--mono)" fontSize="9" fill="var(--gold)" letterSpacing="2">N</text>
      </svg>

      {/* The ball itself */}
      <div
        style={{
          position: "absolute", inset: 40,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 35% 30%, #2a5a3f 0%, #133525 35%, #0a1f15 70%, #051208 100%)",
          boxShadow: "inset -30px -40px 80px rgba(0,0,0,.55), inset 20px 30px 60px rgba(232,179,57,.08), 0 30px 80px rgba(0,0,0,.5)",
          overflow: "hidden",
          animation: "spin360 24s linear infinite"
        }}
      >
        {/* Hex panel pattern on sphere */}
        <svg viewBox="0 0 440 440" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: .9 }}>
          <defs>
            <radialGradient id="sphereLight" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="100%" stopColor="rgba(0,0,0,.55)" />
            </radialGradient>
            <clipPath id="sphereClip">
              <circle cx="220" cy="220" r="220" />
            </clipPath>
          </defs>

          <g clipPath="url(#sphereClip)">
            {/* meridians */}
            {[...Array(7)].map((_, i) => {
              const rx = 30 + i * 30;
              return <ellipse key={"m"+i} cx="220" cy="220" rx={rx} ry="220" fill="none" stroke="rgba(243,236,220,.18)" strokeWidth="0.8" strokeDasharray="3 5" />;
            })}
            {/* parallels */}
            {[...Array(6)].map((_, i) => {
              const ry = 30 + i * 30;
              return <ellipse key={"p"+i} cx="220" cy="220" rx="220" ry={ry} fill="none" stroke="rgba(243,236,220,.14)" strokeWidth="0.8" />;
            })}
            {/* pentagon panels */}
            <Pentagon cx={220} cy={70} r={26} fill="rgba(232,179,57,.85)" />
            <Pentagon cx={120} cy={170} r={22} fill="rgba(232,179,57,.55)" />
            <Pentagon cx={320} cy={170} r={22} fill="rgba(232,179,57,.55)" />
            <Pentagon cx={170} cy={310} r={20} fill="rgba(232,179,57,.45)" />
            <Pentagon cx={290} cy={300} r={22} fill="rgba(232,179,57,.5)" />
            <Pentagon cx={220} cy={400} r={18} fill="rgba(232,179,57,.35)" />

            {/* hex outlines */}
            <Hex cx={220} cy={220} r={42} stroke="rgba(243,236,220,.35)" />
            <Hex cx={150} cy={150} r={36} stroke="rgba(243,236,220,.28)" />
            <Hex cx={290} cy={150} r={36} stroke="rgba(243,236,220,.28)" />
            <Hex cx={290} cy={290} r={36} stroke="rgba(243,236,220,.22)" />
            <Hex cx={150} cy={290} r={36} stroke="rgba(243,236,220,.22)" />

            {/* lighting */}
            <circle cx="220" cy="220" r="220" fill="url(#sphereLight)" />
          </g>

          {/* rim */}
          <circle cx="220" cy="220" r="218" fill="none" stroke="rgba(232,179,57,.25)" strokeWidth="1" />
        </svg>
      </div>

      {/* Static crosshair overlay */}
      <svg viewBox="0 0 520 520" width={size} height={size} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <line x1="0" y1="260" x2="40" y2="260" stroke="var(--gold)" strokeWidth="1" />
        <line x1="480" y1="260" x2="520" y2="260" stroke="var(--gold)" strokeWidth="1" />
        <line x1="260" y1="0" x2="260" y2="40" stroke="var(--gold)" strokeWidth="1" />
        <line x1="260" y1="480" x2="260" y2="520" stroke="var(--gold)" strokeWidth="1" />
      </svg>

      {/* Coordinate label */}
      <div className="mono" style={{ position: "absolute", bottom: -28, left: 0, right: 0, textAlign: "center", fontSize: 10, color: "var(--ink-dim)", letterSpacing: ".2em" }}>
        08°30′24″S · 115°15′45″E · UBUD/BALI
      </div>
    </div>
  );
};

const Pentagon = ({ cx, cy, r, fill }) => {
  const pts = [];
  for (let i = 0; i < 5; i++) {
    const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    pts.push(`${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`);
  }
  return <polygon points={pts.join(" ")} fill={fill} stroke="rgba(255,255,255,.25)" strokeWidth="1" />;
};

const Hex = ({ cx, cy, r, stroke }) => {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI * 2 * i) / 6;
    pts.push(`${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`);
  }
  return <polygon points={pts.join(" ")} fill="none" stroke={stroke} strokeWidth="1" />;
};

const Hero = ({ variant = "globe" }) => {
  return (
    <section style={{ position: "relative", minHeight: "100vh", paddingTop: 76, overflow: "hidden" }}>
      {/* faint topo background */}
      <BackgroundTopo />

      <div className="container" style={{ position: "relative", zIndex: 2, paddingTop: 80, paddingBottom: 80, display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 48, alignItems: "center", minHeight: "calc(100vh - 76px)" }}>
        {/* left copy */}
        <div>
          <div className="label-line" style={{ marginBottom: 28 }}>
            <span className="mono" style={{ fontSize: 11, letterSpacing: ".22em", color: "var(--gold)" }}>EST. 2026 · UBUD · BALI · ID</span>
          </div>

          <h1 className="display" style={{ fontSize: "clamp(72px, 10vw, 168px)", margin: "0 0 28px" }}>
            One ball.<br />
            One <span style={{ color: "var(--gold)" }}>jungle</span>.<br />
            Many flags.
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
            <span style={{ width: 36, height: 1, background: "var(--gold)" }} />
            <span style={{ fontFamily: "var(--body)", fontStyle: "italic", fontSize: 18, color: "var(--ink)" }}>Community. Brotherhood. Football.</span>
          </div>

          <p style={{ maxWidth: 480, color: "var(--ink-dim)", fontSize: 16, lineHeight: 1.6, marginBottom: 36 }}>
            A Bali football club competing at regional level — built by Balinese
            and international men who travelled here to wear the green.
            Spin the ball. Find the squad.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="#join" className="btn btn--gold">Join the Brotherhood →</a>
            <a href="#manifesto" className="btn btn--ghost">Read the story</a>
          </div>

          {/* meta strip */}
          <div style={{ marginTop: 64, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
            {[
              { k: "Founded", v: "2026" },
              { k: "Squad", v: "27" },
              { k: "Nations", v: "11" },
              { k: "League", v: "Liga 4" }
            ].map((s, i) => (
              <div key={s.k} style={{ padding: "18px 16px 18px 0", borderRight: i < 3 ? "1px solid var(--line)" : "none" }}>
                <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", color: "var(--ink-dim)", marginBottom: 8, textTransform: "uppercase" }}>{s.k}</div>
                <div className="display" style={{ fontSize: 32 }}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* right ball */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <SpinningBall size={520} />
        </div>
      </div>

      {/* scroll cue */}
      <div style={{ position: "absolute", bottom: 28, left: 0, right: 0, textAlign: "center", zIndex: 2 }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: ".24em", color: "var(--ink-dim)" }}>SCROLL · ENTER THE JUNGLE</div>
        <div style={{ width: 1, height: 28, background: "var(--gold)", margin: "10px auto 0", animation: "flicker 3s infinite" }} />
      </div>
    </section>
  );
};

const BackgroundTopo = () => (
  <svg
    viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"
    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: .35, pointerEvents: "none" }}
    aria-hidden="true"
  >
    <defs>
      <radialGradient id="vignette" cx="50%" cy="40%" r="70%">
        <stop offset="0%" stopColor="rgba(0,0,0,0)" />
        <stop offset="100%" stopColor="rgba(0,0,0,.6)" />
      </radialGradient>
    </defs>
    <g stroke="var(--line)" strokeWidth="0.6" fill="none">
      {[...Array(14)].map((_, i) => (
        <path key={i} d={`M -100 ${100 + i * 60} C 200 ${60 + i * 60}, 600 ${160 + i * 60}, 900 ${80 + i * 60} S 1500 ${140 + i * 60}, 1600 ${110 + i * 60}`} />
      ))}
    </g>
    <rect width="1440" height="900" fill="url(#vignette)" />
  </svg>
);

window.Hero = Hero;
window.SpinningBall = SpinningBall;
