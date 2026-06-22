// Roster data — sourced from the Futtos group "Ubud Jungle Ballers".
// Regenerate roster.json by running:
//   node --experimental-strip-types scripts/dump-ujb-roster.ts
// in the futto repo.
//
// Player record shape (see scripts/dump-ujb-roster.ts):
//   { userId, name, username, imageUrl, nationality, flag,
//     positions[], primaryPosition, role, joinedAt,
//     stats: { games, wins, goals, assists, mvps },
//     topBadge?: { type, label, tier } }

let rosterPromise = null;

export async function loadRoster() {
  if (!rosterPromise) {
    rosterPromise = fetch("/roster.json", { cache: "no-cache" })
      .then((r) => {
        if (!r.ok) throw new Error(`roster.json fetch failed: ${r.status}`);
        return r.json();
      });
  }
  return rosterPromise;
}

// Build the squad picker views by role.
// Returns the same shape the renderer expects: { [key]: { name, label, blurb, players[] } }
export async function buildSquads() {
  const data = await loadRoster();
  const all = data.players ?? [];
  const admins = all.filter((p) => p.role === "owner" || p.role === "admin");
  const members = all.filter((p) => p.role === "member");

  return {
    all: {
      name: "Full Squad",
      label: `Roster · ${all.length} players`,
      blurb: `Every active member of Ubud Jungle Ballers on Futtos. Tap any player for detail.`,
      players: all,
    },
    admins: {
      name: "Captains & Admins",
      label: `Leadership · ${admins.length}`,
      blurb: `Founders, captains, and the people who keep the sessions running.`,
      players: admins,
    },
    members: {
      name: "Members",
      label: `Members · ${members.length}`,
      blurb: `Everyone else in the squad. Same standards, same shirt.`,
      players: members,
    },
  };
}
