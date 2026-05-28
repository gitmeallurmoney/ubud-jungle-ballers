// Globe nationality data — sourced from roster.json (dumped from Futtos).
//
// Built at import time via top-level await so main.js's `import {
// NATIONALITIES }` keeps its synchronous-looking shape. Each entry matches
// what the globe renderer expects:
//
//   { code, iso, name, flag, lat, lon, note?, players: [{ number, name, position }] }
//
// `iso` is the numeric ISO 3166-1 code that matches the `id` field in
// vendor/countries-110m.geo.json — used by main.js to raycast a click on
// the globe surface to a country polygon. `lat`/`lon` are approximate
// centroids used for tooltip anchoring and camera focus.

// Aliases collapse home-nation passports onto a single GB polygon, since
// countries-110m.geo.json has no Scotland/Wales/England polygons.
const ALIASES = {
  Scotland: "United Kingdom",
  Wales: "United Kingdom",
  England: "United Kingdom",
};

// Country meta lookup. Add new countries here as more nationalities show
// up in the Futtos roster. Centroids are rough — they only need to be
// close enough for the camera to frame the polygon.
const COUNTRY_META = {
  Algeria:               { code: "DZ", iso: "012", flag: "🇩🇿", lat: 28.0,  lon: 3.0   },
  "Antigua and Barbuda": { code: "AG", iso: "028", flag: "🇦🇬", lat: 17.05, lon: -61.8 },
  Argentina:             { code: "AR", iso: "032", flag: "🇦🇷", lat: -34.0, lon: -64.0 },
  Australia:             { code: "AU", iso: "036", flag: "🇦🇺", lat: -25.0, lon: 134.0 },
  Bangladesh:            { code: "BD", iso: "050", flag: "🇧🇩", lat: 23.7,  lon: 90.4  },
  Brazil:                { code: "BR", iso: "076", flag: "🇧🇷", lat: -10.0, lon: -55.0 },
  Colombia:              { code: "CO", iso: "170", flag: "🇨🇴", lat: 4.0,   lon: -72.0 },
  Denmark:               { code: "DK", iso: "208", flag: "🇩🇰", lat: 56.0,  lon: 10.0  },
  Egypt:                 { code: "EG", iso: "818", flag: "🇪🇬", lat: 27.0,  lon: 30.0  },
  France:                { code: "FR", iso: "250", flag: "🇫🇷", lat: 46.0,  lon: 2.0   },
  Germany:               { code: "DE", iso: "276", flag: "🇩🇪", lat: 51.0,  lon: 10.0  },
  Indonesia:             { code: "ID", iso: "360", flag: "🇮🇩", lat: -2.5,  lon: 118.0 },
  Iran:                  { code: "IR", iso: "364", flag: "🇮🇷", lat: 32.0,  lon: 53.0  },
  Italy:                 { code: "IT", iso: "380", flag: "🇮🇹", lat: 42.0,  lon: 12.0  },
  Japan:                 { code: "JP", iso: "392", flag: "🇯🇵", lat: 36.0,  lon: 138.0 },
  Netherlands:           { code: "NL", iso: "528", flag: "🇳🇱", lat: 52.0,  lon: 5.0   },
  Portugal:              { code: "PT", iso: "620", flag: "🇵🇹", lat: 39.5,  lon: -8.0  },
  Romania:               { code: "RO", iso: "642", flag: "🇷🇴", lat: 46.0,  lon: 25.0  },
  Russia:                { code: "RU", iso: "643", flag: "🇷🇺", lat: 61.0,  lon: 99.0  },
  "South Africa":        { code: "ZA", iso: "710", flag: "🇿🇦", lat: -29.0, lon: 24.0  },
  Spain:                 { code: "ES", iso: "724", flag: "🇪🇸", lat: 40.0,  lon: -3.7  },
  Sweden:                { code: "SE", iso: "752", flag: "🇸🇪", lat: 62.0,  lon: 15.0  },
  Turkey:                { code: "TR", iso: "792", flag: "🇹🇷", lat: 39.0,  lon: 35.0  },
  "United Kingdom":      { code: "GB", iso: "826", flag: "🇬🇧", lat: 54.0,  lon: -2.0  },
  "United States":       { code: "US", iso: "840", flag: "🇺🇸", lat: 39.0,  lon: -98.0 },
};

async function buildNationalities() {
  let players = [];
  try {
    const r = await fetch("./roster.json", { cache: "no-cache" });
    if (!r.ok) throw new Error(`roster.json ${r.status}`);
    const data = await r.json();
    players = data.players ?? [];
  } catch (err) {
    console.error("[globe] failed to load roster.json:", err);
    return [];
  }

  const byCountry = new Map();
  const skipped = [];
  for (const p of players) {
    const raw = p.nationality;
    if (!raw) continue;
    const countryName = ALIASES[raw] || raw;
    const meta = COUNTRY_META[countryName];
    if (!meta) {
      skipped.push(raw);
      continue;
    }
    if (!byCountry.has(countryName)) {
      byCountry.set(countryName, { ...meta, name: countryName, players: [] });
    }
    const bucket = byCountry.get(countryName);
    bucket.players.push({
      number: bucket.players.length + 1,
      name: p.name,
      position: p.primaryPosition || "—",
      imageUrl: p.imageUrl || "",
    });
  }

  if (skipped.length) {
    const uniq = [...new Set(skipped)];
    console.warn("[globe] no COUNTRY_META for:", uniq.join(", "), "— add to players.js");
  }

  // Sort countries by squad-size descending so the most-represented sit
  // first in any country list that iterates this array.
  return [...byCountry.values()].sort((a, b) => b.players.length - a.players.length);
}

export const NATIONALITIES = await buildNationalities();
