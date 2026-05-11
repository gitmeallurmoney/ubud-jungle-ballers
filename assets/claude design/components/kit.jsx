const Kit = () => {
  const [active, setActive] = React.useState(0);
  const kits = [
    { name: "Home — JUNGLE GREEN", color: "var(--bg-3)", trim: "var(--gold)", year: "26/27" },
    { name: "Away — BONE", color: "#e8e1cc", trim: "var(--bg)", year: "26/27" },
    { name: "Third — RUST", color: "#7a3320", trim: "var(--ink)", year: "26/27" }
  ];
  const k = kits[active];
  return (
    <section id="kit" style={{ position: "relative" }}>
      <div className="container" style={{ padding: "120px 40px" }}>
        <SectionHead idx="04 / KIT" eyebrow="2026/27 Drop" title={<>Wear the <span style={{color:"var(--gold)"}}>green</span>.</>} kicker="Three shirts. One badge. Pre-order opens 12 May." />

        <div style={{ marginTop: 60, display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 60, alignItems: "start" }}>
          <div style={{ background: "var(--bg-2)", border: "1px solid var(--line)", padding: 40, position: "relative", minHeight: 540, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <KitJersey bg={k.color} trim={k.trim} num="10" />
            <div className="mono" style={{ position: "absolute", top: 16, left: 16, fontSize: 10, color: "var(--gold)", letterSpacing: ".22em" }}>0{active+1} / 03 · {k.year}</div>
            <div className="mono" style={{ position: "absolute", bottom: 16, right: 16, fontSize: 10, color: "var(--ink-dim)", letterSpacing: ".22em" }}>{k.name}</div>
          </div>

          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0, border: "1px solid var(--line)" }}>
              {kits.map((kit, i) => (
                <button key={i} onClick={() => setActive(i)} style={{
                  textAlign: "left", padding: "20px 24px", background: active===i?"var(--bg-3)":"transparent",
                  borderBottom: i<kits.length-1?"1px solid var(--line)":"none", border: "none",
                  borderTop: active===i ? "0":"0",
                  color: "var(--ink)", cursor: "pointer", fontFamily: "inherit",
                  display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 18, alignItems: "center"
                }}>
                  <span style={{ width: 28, height: 28, background: kit.color, border: "1px solid var(--line)" }} />
                  <span className="display" style={{ fontSize: 22 }}>{kit.name}</span>
                  <span className="mono" style={{ fontSize: 11, color: active===i?"var(--gold)":"var(--ink-dim)", letterSpacing: ".18em" }}>{active===i?"VIEWING":"VIEW →"}</span>
                </button>
              ))}
            </div>

            <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Stat k="Price" v="IDR 690K" />
              <Stat k="Drop" v="12 May" />
            </div>

            <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="#" className="btn btn--gold">Pre-order →</a>
              <a href="#" className="btn btn--ghost">Size guide</a>
            </div>

            <p style={{ marginTop: 28, color: "var(--ink-dim)", fontSize: 14, lineHeight: 1.6 }}>
              Hand-screened in Denpasar. Recycled poly + organic cotton blend.
              Number, name and flag — your choice. 10% of every shirt funds youth football in Gianyar.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const KitJersey = ({ bg, trim, num }) => (
  <svg viewBox="0 0 360 420" width="380" style={{ maxWidth: "100%" }}>
    <defs>
      <linearGradient id="kfade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="rgba(255,255,255,.08)" />
        <stop offset="100%" stopColor="rgba(0,0,0,.25)" />
      </linearGradient>
    </defs>
    {/* shirt body */}
    <path d="M70 60 L130 30 L150 50 L210 50 L230 30 L290 60 L310 130 L260 150 L260 380 L100 380 L100 150 L50 130 Z"
      fill={bg} stroke={trim} strokeWidth="2" />
    <path d="M70 60 L130 30 L150 50 L210 50 L230 30 L290 60 L310 130 L260 150 L260 380 L100 380 L100 150 L50 130 Z"
      fill="url(#kfade)" />
    {/* collar v */}
    <path d="M150 50 L180 90 L210 50" fill="none" stroke={trim} strokeWidth="3" />
    {/* sleeve cuff */}
    <line x1="50" y1="130" x2="100" y2="150" stroke={trim} strokeWidth="2" />
    <line x1="310" y1="130" x2="260" y2="150" stroke={trim} strokeWidth="2" />
    {/* badge */}
    <g transform="translate(110 110)">
      <rect width="44" height="56" fill={trim} opacity=".15" />
      <text x="22" y="34" textAnchor="middle" fontFamily="var(--display)" fontSize="20" fill={trim}>UJB</text>
    </g>
    {/* number */}
    <text x="180" y="280" textAnchor="middle" fontFamily="var(--display)" fontSize="140" fill={trim} opacity=".9">{num}</text>
    {/* sponsor placeholder */}
    <text x="180" y="200" textAnchor="middle" fontFamily="var(--mono)" fontSize="11" letterSpacing="3" fill={trim} opacity=".7">— SPONSOR —</text>
  </svg>
);

window.Kit = Kit;
