// Squad page — full roster with filtering, formation, captain card.
const ROSTER = [
  { num: "01", name: "Komang Arta",    pos: "GK",  flag: "ID", age: 27, h: 188, caps: 18, goals: 0,  group: "Goalkeepers" },
  { num: "13", name: "Bagus Putra",    pos: "GK",  flag: "ID", age: 22, h: 184, caps: 4,  goals: 0,  group: "Goalkeepers" },

  { num: "02", name: "Gede Mahendra",  pos: "RB",  flag: "ID", age: 24, h: 175, caps: 16, goals: 1,  group: "Defenders" },
  { num: "03", name: "Henrik Lund",    pos: "LB",  flag: "NO", age: 28, h: 182, caps: 12, goals: 0,  group: "Defenders" },
  { num: "04", name: "Made Surya",     pos: "CB",  flag: "ID", age: 26, h: 186, caps: 22, goals: 2,  group: "Defenders" },
  { num: "05", name: "David Okafor",   pos: "CB",  flag: "NG", age: 30, h: 191, caps: 19, goals: 3,  group: "Defenders" },
  { num: "15", name: "Nyoman Bagus",   pos: "CB",  flag: "ID", age: 21, h: 184, caps: 6,  goals: 0,  group: "Defenders" },

  { num: "06", name: "Wayan Pradnya",  pos: "CDM", flag: "ID", age: 29, h: 178, caps: 31, goals: 4,  group: "Midfielders", captain: true },
  { num: "08", name: "Tomás Reyes",    pos: "CM",  flag: "AR", age: 26, h: 175, caps: 14, goals: 3,  group: "Midfielders" },
  { num: "10", name: "Putu Adi",       pos: "AM",  flag: "ID", age: 25, h: 173, caps: 27, goals: 11, group: "Midfielders" },
  { num: "14", name: "Marc Dubois",    pos: "CM",  flag: "FR", age: 27, h: 180, caps: 9,  goals: 1,  group: "Midfielders" },
  { num: "16", name: "Aji Krishna",    pos: "CDM", flag: "ID", age: 23, h: 176, caps: 8,  goals: 0,  group: "Midfielders" },

  { num: "07", name: "Ketut Wira",     pos: "RW",  flag: "ID", age: 24, h: 172, caps: 17, goals: 6,  group: "Forwards" },
  { num: "09", name: "Lucas Berger",   pos: "ST",  flag: "DE", age: 25, h: 187, caps: 12, goals: 9,  group: "Forwards" },
  { num: "11", name: "Kojiro Sato",    pos: "LW",  flag: "JP", age: 23, h: 171, caps: 9,  goals: 4,  group: "Forwards" },
  { num: "17", name: "Liam O'Connor",  pos: "RW",  flag: "IE", age: 26, h: 178, caps: 11, goals: 5,  group: "Forwards" },
  { num: "19", name: "Rafa Mendes",    pos: "ST",  flag: "BR", age: 22, h: 181, caps: 7,  goals: 6,  group: "Forwards" },
  { num: "21", name: "Ari Suputra",    pos: "LW",  flag: "ID", age: 20, h: 170, caps: 3,  goals: 1,  group: "Forwards" }
];

const POS_GROUPS = ["All", "Goalkeepers", "Defenders", "Midfielders", "Forwards"];

function PageHeader() {
  return (
    <section style={{ position: "relative", paddingTop: 76, borderBottom: "1px solid var(--line)" }}>
      <div className="container" style={{ padding: "100px 40px 80px" }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: ".22em", color: "var(--gold)", marginBottom: 20 }}>
          <a href="index.html" style={{ color: "var(--ink-dim)", borderBottom: "1px solid transparent" }}>HOME</a>
          <span style={{ margin: "0 12px", color: "var(--ink-dim)" }}>/</span>
          THE BROTHERHOOD
        </div>
        <h1 className="display" style={{ fontSize: "clamp(80px, 14vw, 220px)", margin: 0, lineHeight: 0.9 }}>
          Squad <span style={{ color: "var(--gold)" }}>26/27</span>.
        </h1>
        <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
          {[
            ["Players", "18"],
            ["Average age", "24.7"],
            ["Tallest", "191cm"],
            ["Nations", "11"],
            ["Goals · season", "56"]
          ].map(([k, v], i) => (
            <div key={k} style={{ padding: "20px 16px 20px 0", borderRight: i < 4 ? "1px solid var(--line)" : "none" }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: ".18em", color: "var(--ink-dim)", textTransform: "uppercase", marginBottom: 8 }}>{k}</div>
              <div className="display" style={{ fontSize: 32 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Filters({ filter, setFilter, view, setView }) {
  return (
    <div className="container" style={{ padding: "32px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
      <div style={{ display: "flex", gap: 0, border: "1px solid var(--line)" }}>
        {POS_GROUPS.map((g, i) => (
          <button key={g} onClick={() => setFilter(g)} style={{
            padding: "12px 18px", border: "none", background: filter === g ? "var(--gold)" : "transparent",
            color: filter === g ? "#1a1408" : "var(--ink)",
            fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", cursor: "pointer",
            borderRight: i < POS_GROUPS.length - 1 ? "1px solid var(--line)" : "none"
          }}>{g}</button>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span className="mono" style={{ fontSize: 10, letterSpacing: ".22em", color: "var(--ink-dim)" }}>VIEW</span>
        <div style={{ display: "flex", border: "1px solid var(--line)" }}>
          {["grid", "list", "formation"].map((v, i) => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: "10px 16px", border: "none", background: view === v ? "var(--ink)" : "transparent",
              color: view === v ? "var(--bg)" : "var(--ink)",
              fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", cursor: "pointer",
              borderRight: i < 2 ? "1px solid var(--line)" : "none"
            }}>{v}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlayerCard({ p }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative", border: "1px solid var(--line)", padding: 24,
        background: hover ? "var(--bg-3)" : "var(--bg-2)",
        transition: "background .2s ease",
        cursor: "pointer", overflow: "hidden"
      }}
    >
      <div style={{ position: "absolute", top: 0, right: 0, padding: 12 }}>
        <span className="mono" style={{ fontSize: 10, letterSpacing: ".18em", color: "var(--ink-dim)" }}>{p.flag}</span>
      </div>
      {p.captain && (
        <div className="mono" style={{ position: "absolute", top: 12, left: 12, fontSize: 10, color: "var(--gold)", letterSpacing: ".22em", border: "1px solid var(--gold)", padding: "2px 6px" }}>CAPTAIN</div>
      )}
      <Placeholder style={{ height: 180, marginTop: p.captain ? 28 : 0 }}>{`#${p.num} ${p.name.toUpperCase()}`}</Placeholder>
      <div style={{ marginTop: 20, display: "flex", alignItems: "baseline", gap: 12 }}>
        <div className="display" style={{ fontSize: 56, lineHeight: 1, color: hover ? "var(--gold)" : "var(--ink)" }}>{p.num}</div>
        <div>
          <div className="display" style={{ fontSize: 22, lineHeight: 1 }}>{p.name}</div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: ".22em", color: "var(--ink-dim)", marginTop: 6 }}>{p.pos} · {p.age}Y · {p.h}CM</div>
        </div>
      </div>
      <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", fontSize: 12, fontFamily: "var(--mono)", color: "var(--ink-dim)" }}>
        <span>CAPS <span style={{ color: "var(--ink)", fontWeight: 700 }}>{p.caps}</span></span>
        <span>GOALS <span style={{ color: "var(--gold)", fontWeight: 700 }}>{p.goals}</span></span>
      </div>
    </div>
  );
}

function Grid({ players }) {
  const groups = {};
  players.forEach((p) => { (groups[p.group] = groups[p.group] || []).push(p); });
  return (
    <div className="container" style={{ padding: "20px 40px 100px" }}>
      {Object.entries(groups).map(([g, list]) => (
        <div key={g} style={{ marginBottom: 60 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 24, paddingBottom: 14, borderBottom: "1px solid var(--line)" }}>
            <div className="display" style={{ fontSize: 36 }}>{g}</div>
            <div className="mono" style={{ fontSize: 11, color: "var(--gold)", letterSpacing: ".2em" }}>· {String(list.length).padStart(2,"0")} MEN</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
            {list.map((p) => <PlayerCard key={p.num} p={p} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

function ListView({ players }) {
  return (
    <div className="container" style={{ padding: "20px 40px 100px" }}>
      <div style={{ border: "1px solid var(--line)" }}>
        <div className="mono" style={{ display: "grid", gridTemplateColumns: "60px 1fr 80px 60px 60px 80px 80px", padding: "14px 20px", fontSize: 10, letterSpacing: ".22em", color: "var(--ink-dim)", borderBottom: "1px solid var(--line)", background: "var(--bg-2)" }}>
          <span>#</span><span>NAME</span><span>POS</span><span>FLAG</span><span>AGE</span><span style={{textAlign:"right"}}>CAPS</span><span style={{textAlign:"right"}}>GOALS</span>
        </div>
        {players.map((p, i) => (
          <div key={p.num} style={{
            display: "grid", gridTemplateColumns: "60px 1fr 80px 60px 60px 80px 80px",
            padding: "16px 20px", alignItems: "center",
            borderBottom: i < players.length - 1 ? "1px solid var(--line)" : "none",
            cursor: "pointer", transition: "background .15s ease"
          }}
            onMouseEnter={(e)=>e.currentTarget.style.background="var(--bg-3)"}
            onMouseLeave={(e)=>e.currentTarget.style.background="transparent"}
          >
            <span className="display" style={{ fontSize: 22, color: "var(--gold)" }}>{p.num}</span>
            <span className="display" style={{ fontSize: 18 }}>{p.name}{p.captain && <span style={{color:"var(--gold)",fontSize:10,marginLeft:8,letterSpacing:".2em"}}>(C)</span>}</span>
            <span className="mono" style={{ fontSize: 11, letterSpacing: ".18em", color: "var(--ink-dim)" }}>{p.pos}</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--ink-dim)" }}>{p.flag}</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--ink-dim)" }}>{p.age}</span>
            <span className="mono" style={{ fontSize: 13, textAlign: "right" }}>{p.caps}</span>
            <span className="mono" style={{ fontSize: 13, textAlign: "right", color: "var(--gold)", fontWeight: 700 }}>{p.goals}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Formation() {
  // 4-3-3 starting XI
  const xi = [
    { num: "01", name: "ARTA",     x: 50, y: 92 },
    { num: "02", name: "MAHENDRA", x: 18, y: 72 },
    { num: "04", name: "SURYA",    x: 38, y: 76 },
    { num: "05", name: "OKAFOR",   x: 62, y: 76 },
    { num: "03", name: "LUND",     x: 82, y: 72 },
    { num: "06", name: "WAYAN",    x: 50, y: 56, captain: true },
    { num: "08", name: "REYES",    x: 28, y: 46 },
    { num: "10", name: "PUTU",     x: 72, y: 46 },
    { num: "11", name: "SATO",     x: 18, y: 22 },
    { num: "09", name: "BERGER",   x: 50, y: 14 },
    { num: "07", name: "WIRA",     x: 82, y: 22 }
  ];

  return (
    <div className="container" style={{ padding: "20px 40px 100px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 40 }}>
        <div style={{ position: "relative", aspectRatio: "0.7", background: "var(--bg-2)", border: "1px solid var(--line)", overflow: "hidden" }}>
          {/* pitch */}
          <svg viewBox="0 0 100 140" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <rect x="0" y="0" width="100" height="140" fill="var(--bg-3)" />
            {[...Array(14)].map((_, i) => (
              <rect key={i} x="0" y={i*10} width="100" height="10" fill={i%2===0 ? "rgba(255,255,255,0.015)" : "transparent"} />
            ))}
            <g stroke="rgba(243,236,220,.35)" strokeWidth="0.3" fill="none">
              <rect x="2" y="2" width="96" height="136" />
              <line x1="2" y1="70" x2="98" y2="70" />
              <circle cx="50" cy="70" r="9" />
              <circle cx="50" cy="70" r="0.6" fill="rgba(243,236,220,.5)" />
              <rect x="20" y="2" width="60" height="18" />
              <rect x="36" y="2" width="28" height="6" />
              <rect x="20" y="120" width="60" height="18" />
              <rect x="36" y="132" width="28" height="6" />
            </g>
          </svg>

          {xi.map((p) => (
            <div key={p.num} style={{
              position: "absolute", left: `${p.x}%`, top: `${p.y}%`, transform: "translate(-50%, -50%)",
              textAlign: "center"
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: p.captain ? "var(--gold)" : "var(--bg)",
                color: p.captain ? "#1a1408" : "var(--ink)",
                border: "2px solid var(--gold)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--display)", fontSize: 22,
                margin: "0 auto"
              }}>{p.num}</div>
              <div className="mono" style={{ marginTop: 6, fontSize: 10, letterSpacing: ".18em", color: "var(--ink)", textShadow: "0 1px 2px rgba(0,0,0,.6)" }}>{p.name}{p.captain && <span style={{color:"var(--gold)"}}> (C)</span>}</div>
            </div>
          ))}
        </div>

        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Starting XI · 4-3-3</div>
          <div className="display" style={{ fontSize: 56, lineHeight: 1 }}>4<span style={{color:"var(--gold)"}}>—</span>3<span style={{color:"var(--gold)"}}>—</span>3</div>
          <p style={{ color: "var(--ink-dim)", fontSize: 14, marginTop: 16, lineHeight: 1.7 }}>
            High line, narrow midfield, wingers staying wide. Pradnya anchors.
            Putu drifts. Berger hunts the channel.
          </p>

          <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Subs (7)</div>
            {[
              ["13", "Putra"], ["15", "Bagus"], ["14", "Dubois"],
              ["16", "Krishna"], ["17", "O'Connor"], ["19", "Mendes"], ["21", "Suputra"]
            ].map(([n, name]) => (
              <div key={n} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
                <span className="mono" style={{ fontSize: 12, color: "var(--gold)" }}>#{n}</span>
                <span className="display" style={{ fontSize: 16 }}>{name}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 28, padding: 20, background: "var(--bg-3)", border: "1px solid var(--line)" }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".22em", color: "var(--gold)", marginBottom: 6 }}>HEAD COACH</div>
            <div className="display" style={{ fontSize: 22 }}>I Made Suarjana</div>
            <div className="mono" style={{ fontSize: 10, color: "var(--ink-dim)", letterSpacing: ".2em", marginTop: 6 }}>15 YRS · UEFA B · EX-PERSEBAYA</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SquadApp() {
  const [tweaks, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  const [filter, setFilter] = React.useState("All");

  React.useEffect(() => {
    document.body.dataset.palette = tweaks.palette;
    document.body.dataset.headline = tweaks.headlineFont;
  }, [tweaks.palette, tweaks.headlineFont]);

  const view = tweaks.view;
  const setView = (v) => setTweak("view", v);
  const filtered = filter === "All" ? ROSTER : ROSTER.filter((p) => p.group === filter);

  return (
    <>
      <Nav page="squad" />
      <PageHeader />
      <Filters filter={filter} setFilter={setFilter} view={view} setView={setView} />
      {view === "grid" && <Grid players={filtered} />}
      {view === "list" && <ListView players={filtered} />}
      {view === "formation" && <Formation />}
      <Footer />

      <window.TweaksPanel title="Tweaks">
        <window.TweakSection title="Palette">
          <window.TweakRadio
            label="Color"
            value={tweaks.palette}
            options={[
              { value: "jungle", label: "Jungle" },
              { value: "bone",   label: "Bone" },
              { value: "acid",   label: "Acid" }
            ]}
            onChange={(v) => setTweak("palette", v)}
          />
        </window.TweakSection>
        <window.TweakSection title="Headline type">
          <window.TweakRadio
            label="Display font"
            value={tweaks.headlineFont}
            options={[
              { value: "anton",     label: "Anton" },
              { value: "narrow",    label: "Narrow" },
              { value: "bricolage", label: "Bricolage" }
            ]}
            onChange={(v) => setTweak("headlineFont", v)}
          />
        </window.TweakSection>
      </window.TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("app")).render(<SquadApp />);
