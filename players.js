// Mock player roster — grouped by nationality.
// `iso` = ISO 3166-1 numeric code (matches the `id` field in countries-110m.geo.json).
// `lat`/`lon` = country centroid (used for tooltip anchoring; main highlighting
//   draws the whole country polygon on the globe texture).
// Replace with real data once the squad is finalised.

export const NATIONALITIES = [
  {
    code: "ID",
    iso: "360",
    name: "Indonesia",
    flag: "🇮🇩",
    lat: -2.5,
    lon: 118.0,
    note: "Local backbone of the squad.",
    players: [
      { number: 4,  name: "Wayan Surya",   position: "LB" },
      { number: 8,  name: "Made Putra",    position: "CM" },
      { number: 9,  name: "Komang Bagus",  position: "ST" },
      { number: 5,  name: "Ketut Eko",     position: "CB" },
      { number: 7,  name: "Gede Arya",     position: "RW" },
    ],
  },
  {
    code: "AU",
    iso: "036",
    name: "Australia",
    flag: "🇦🇺",
    lat: -25.0,
    lon: 134.0,
    note: "Bali's nearest neighbours — three from Bondi to Ubud.",
    players: [
      { number: 6,  name: "Jack Thompson", position: "CM" },
      { number: 3,  name: "Liam O'Brien",  position: "CB" },
      { number: 1,  name: "Nate Carter",   position: "GK" },
    ],
  },
  {
    code: "DE",
    iso: "276",
    name: "Germany",
    flag: "🇩🇪",
    lat: 51.0,
    lon: 10.0,
    note: "Discipline up the spine.",
    players: [
      { number: 16, name: "Felix Hartmann", position: "CDM" },
      { number: 11, name: "Jonas Vogel",    position: "LW" },
    ],
  },
  {
    code: "NL",
    iso: "528",
    name: "Netherlands",
    flag: "🇳🇱",
    lat: 52.0,
    lon: 5.0,
    note: "Total football, jungle edition.",
    players: [
      { number: 14, name: "Daan van der Berg", position: "CB" },
      { number: 2,  name: "Lars de Vries",     position: "RB" },
    ],
  },
  {
    code: "FR",
    iso: "250",
    name: "France",
    flag: "🇫🇷",
    lat: 46.0,
    lon: 2.0,
    note: "Le pivot.",
    players: [
      { number: 17, name: "Thomas Moreau", position: "CM" },
    ],
  },
  {
    code: "GB",
    iso: "826",
    name: "United Kingdom",
    flag: "🇬🇧",
    lat: 54.0,
    lon: -2.0,
    note: "Sunday League grit, equatorial humidity.",
    players: [
      { number: 10, name: "Oliver Walsh",  position: "ST" },
      { number: 22, name: "Henry Clarke",  position: "CDM" },
    ],
  },
  {
    code: "BR",
    iso: "076",
    name: "Brazil",
    flag: "🇧🇷",
    lat: -10.0,
    lon: -55.0,
    note: "Samba on the left wing.",
    players: [
      { number: 19, name: "Rafael Costa", position: "LW" },
    ],
  },
  {
    code: "AR",
    iso: "032",
    name: "Argentina",
    flag: "🇦🇷",
    lat: -34.0,
    lon: -64.0,
    note: "Number 10 by birthright.",
    players: [
      { number: 21, name: "Mateo Rivera", position: "AM" },
    ],
  },
  {
    code: "JP",
    iso: "392",
    name: "Japan",
    flag: "🇯🇵",
    lat: 36.0,
    lon: 138.0,
    note: "Quiet engine on the right.",
    players: [
      { number: 12, name: "Hiroshi Tanaka", position: "RB" },
    ],
  },
  {
    code: "US",
    iso: "840",
    name: "United States",
    flag: "🇺🇸",
    lat: 39.0,
    lon: -98.0,
    note: "Goalkeeper with safe hands.",
    players: [
      { number: 13, name: "Tyler Brooks", position: "GK" },
    ],
  },
  {
    code: "ZA",
    iso: "710",
    name: "South Africa",
    flag: "🇿🇦",
    lat: -29.0,
    lon: 24.0,
    note: "Box-to-box energy.",
    players: [
      { number: 18, name: "Sipho Ndlovu", position: "CM" },
    ],
  },
  {
    code: "IT",
    iso: "380",
    name: "Italy",
    flag: "🇮🇹",
    lat: 42.0,
    lon: 12.0,
    note: "Catenaccio in the tropics.",
    players: [
      { number: 20, name: "Luca Bianchi", position: "ST" },
    ],
  },
];
