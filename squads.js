// Mock squad rosters — 15 players per side.
// Replace with the real squads once selection is finalised.
//
// Format: { number, name, position, flag, role? }
//   - number  : shirt number
//   - name    : full name
//   - position: short tag (GK, CB, LB, RB, CDM, CM, AM, LW, RW, ST)
//   - flag    : nationality flag emoji
//   - role    : optional badge ("captain", "vice", "academy")

export const SQUADS = {
  "first-team": {
    name: "First Team",
    label: "Tier 01 · Competitive",
    blurb:
      "Bali regional league & cup squad. Selection earned through attendance, attitude, and ability — Friday training is mandatory.",
    players: [
      { number: 1,  name: "Nate Carter",        position: "GK",  flag: "🇦🇺" },
      { number: 2,  name: "Lars de Vries",      position: "RB",  flag: "🇳🇱" },
      { number: 3,  name: "Liam O'Brien",       position: "CB",  flag: "🇦🇺", role: "vice" },
      { number: 4,  name: "Wayan Surya",        position: "LB",  flag: "🇮🇩" },
      { number: 5,  name: "Ketut Eko",          position: "CB",  flag: "🇮🇩" },
      { number: 6,  name: "Jack Thompson",      position: "CM",  flag: "🇦🇺" },
      { number: 7,  name: "Gede Arya",          position: "RW",  flag: "🇮🇩" },
      { number: 8,  name: "Made Putra",         position: "CM",  flag: "🇮🇩", role: "captain" },
      { number: 9,  name: "Komang Bagus",       position: "ST",  flag: "🇮🇩" },
      { number: 10, name: "Oliver Walsh",       position: "ST",  flag: "🇬🇧" },
      { number: 11, name: "Jonas Vogel",        position: "LW",  flag: "🇩🇪" },
      { number: 14, name: "Daan van der Berg",  position: "CB",  flag: "🇳🇱" },
      { number: 16, name: "Felix Hartmann",     position: "CDM", flag: "🇩🇪" },
      { number: 17, name: "Thomas Moreau",      position: "CM",  flag: "🇫🇷" },
      { number: 21, name: "Mateo Rivera",       position: "AM",  flag: "🇦🇷" },
    ],
  },

  "second-team": {
    name: "Second Team",
    label: "Tier 02 · Development",
    blurb:
      "Lower-tier matches, friendlies, and a bridge into the First Team. Same shirt, same standards, slightly less ruthless.",
    players: [
      { number: 12, name: "Hiroshi Tanaka",     position: "GK",  flag: "🇯🇵" },
      { number: 13, name: "Tyler Brooks",       position: "GK",  flag: "🇺🇸" },
      { number: 15, name: "Putu Adi",           position: "RB",  flag: "🇮🇩" },
      { number: 18, name: "Sipho Ndlovu",       position: "CM",  flag: "🇿🇦", role: "vice" },
      { number: 19, name: "Rafael Costa",       position: "LW",  flag: "🇧🇷" },
      { number: 20, name: "Luca Bianchi",       position: "ST",  flag: "🇮🇹" },
      { number: 22, name: "Henry Clarke",       position: "CDM", flag: "🇬🇧" },
      { number: 23, name: "Nyoman Surya",       position: "CB",  flag: "🇮🇩" },
      { number: 24, name: "Kadek Wirawan",      position: "LB",  flag: "🇮🇩" },
      { number: 25, name: "Diego Hernández",    position: "CM",  flag: "🇪🇸" },
      { number: 26, name: "Ben Jacobs",         position: "ST",  flag: "🇨🇦" },
      { number: 27, name: "Wayan Suastika",     position: "RW",  flag: "🇮🇩", role: "captain" },
      { number: 28, name: "Lukas Andersen",     position: "CB",  flag: "🇩🇰" },
      { number: 29, name: "Émile Dubois",       position: "AM",  flag: "🇫🇷" },
      { number: 30, name: "Made Wirana",        position: "CM",  flag: "🇮🇩" },
    ],
  },

  "fun-first": {
    name: "Fun First",
    label: "Tier 03 · Community",
    blurb:
      "Open to all members regardless of ability. Mixed levels, mixed pace, futsal & mini-soccer formats. Bibs provided.",
    players: [
      { number: 31, name: "Amir Saleh",         position: "GK",  flag: "🇲🇾" },
      { number: 32, name: "Ketut Putra",        position: "DEF", flag: "🇮🇩" },
      { number: 33, name: "Gede Mahendra",      position: "MID", flag: "🇮🇩" },
      { number: 34, name: "Sam Williams",       position: "FWD", flag: "🇦🇺" },
      { number: 35, name: "Wayan Sudarma",      position: "MID", flag: "🇮🇩" },
      { number: 36, name: "Marco Rossi",        position: "DEF", flag: "🇮🇹" },
      { number: 37, name: "Pieter Janssen",     position: "FWD", flag: "🇳🇱" },
      { number: 38, name: "Rohan Mehta",        position: "MID", flag: "🇮🇳" },
      { number: 39, name: "Made Sukarta",       position: "GK",  flag: "🇮🇩", role: "captain" },
      { number: 40, name: "Carlos Mendes",      position: "FWD", flag: "🇵🇹" },
      { number: 41, name: "Niko Petrov",        position: "DEF", flag: "🇧🇬" },
      { number: 42, name: "Yuto Mori",          position: "MID", flag: "🇯🇵" },
      { number: 43, name: "Kadek Ananda",       position: "FWD", flag: "🇮🇩" },
      { number: 44, name: "James O'Connor",     position: "DEF", flag: "🇮🇪" },
      { number: 45, name: "Putu Surya",         position: "MID", flag: "🇮🇩" },
    ],
  },
};
