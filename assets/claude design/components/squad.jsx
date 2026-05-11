const SQUAD = [
  { num: "01", name: "Komang Arta",   pos: "GK",  flag: "ID", caps: 18 },
  { num: "04", name: "Made Surya",    pos: "CB",  flag: "ID", caps: 22 },
  { num: "06", name: "Wayan P.",      pos: "CDM", flag: "ID", caps: 31, captain: true },
  { num: "08", name: "Tomás Reyes",   pos: "CM",  flag: "AR", caps: 14 },
  { num: "09", name: "Lucas Berger",  pos: "ST",  flag: "DE", caps: 12 },
  { num: "10", name: "Putu Adi",      pos: "AM",  flag: "ID", caps: 27 },
  { num: "11", name: "Kojiro Sato",   pos: "LW",  flag: "JP", caps: 9 },
  { num: "17", name: "Liam O'Connor", pos: "RW",  flag: "IE", caps: 11 }
];

const SquadPreview = () => {
  const [hover, setHover] = React.useState(null);
  return (
    <section id="squad" style={{ background: "var(--bg-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
      <div className="container" style={{ padding: "120px 40px" }}>
        <SectionHead idx="03 / SQUAD" eyebrow="The Brotherhood" title={<>27 men.<br/><span style={{color:"var(--gold)"}}>11 flags.</span></>} kicker="From Denpasar to Dublin. Hover a name to meet the man." />

        <div style={{ marginTop: 60, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, border: "1px solid var(--line)" }}>
          {/* List */}
          <div>
            {SQUAD.map((p, i) => (
              <div
                key={p.num}
                onMouseEnter={() => setHover(i)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "70px 1fr 60px 60px",
                  alignItems: "center",
                  padding: "22px 24px",
                  borderBottom: i < SQUAD.length - 1 ? "1px solid var(--line)" : "none",
                  background: hover === i ? "var(--bg-3)" : "transparent",
                  cursor: "pointer", transition: "background .15s ease"
                }}
              >
                <div className="display" style={{ fontSize: 36, color: hover === i ? "var(--gold)" : "var(--ink)" }}>{p.num}</div>
                <div>
                  <div className="display" style={{ fontSize: 22 }}>
                    {p.name} {p.captain && <span style={{ fontSize: 10, color: "var(--gold)", marginLeft: 8, letterSpacing: ".2em" }}>(C)</span>}
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--ink-dim)", letterSpacing: ".18em", marginTop: 4 }}>{p.pos} · {p.caps} CAPS</div>
                </div>
                <div className="mono" style={{ fontSize: 11, color: "var(--ink-dim)", letterSpacing: ".18em", textAlign: "right" }}>{p.flag}</div>
                <div style={{ textAlign: "right", color: hover === i ? "var(--gold)" : "var(--ink-dim)", fontFamily: "var(--mono)", fontSize: 18 }}>→</div>
              </div>
            ))}
          </div>

          {/* Detail panel */}
          <div style={{ borderLeft: "1px solid var(--line)", padding: 32, position: "relative", display: "flex", flexDirection: "column", gap: 16 }}>
            <Placeholder style={{ height: 300 }}>{`PORTRAIT · #${(hover!==null?SQUAD[hover].num:"06")} ${(hover!==null?SQUAD[hover].name:"WAYAN P.")}`}</Placeholder>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Stat k="Position" v={(hover!==null?SQUAD[hover].pos:"CDM")} />
              <Stat k="Caps" v={(hover!==null?SQUAD[hover].caps:31)} />
              <Stat k="Flag" v={(hover!==null?SQUAD[hover].flag:"ID")} />
              <Stat k="Joined" v="2026" />
            </div>
            <a href="squad.html" className="btn btn--gold" style={{ alignSelf: "flex-start", marginTop: 8 }}>Full squad →</a>
          </div>
        </div>
      </div>
    </section>
  );
};

const Stat = ({ k, v }) => (
  <div style={{ border: "1px solid var(--line)", padding: 16 }}>
    <div className="mono" style={{ fontSize: 10, letterSpacing: ".22em", color: "var(--ink-dim)", textTransform: "uppercase" }}>{k}</div>
    <div className="display" style={{ fontSize: 28, marginTop: 6 }}>{v}</div>
  </div>
);

window.SquadPreview = SquadPreview;
window.SQUAD_DATA = SQUAD;
