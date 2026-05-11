const Gallery = () => {
  const tiles = [
    { tall: true,  label: "MATCHDAY · ENTRANCE TUNNEL" },
    { tall: false, label: "TRAINING · 06:00 SUNRISE" },
    { tall: false, label: "FANS · ULTRAS NORTH STAND" },
    { tall: true,  label: "BENCH · CAPTAIN AT REST" },
    { tall: false, label: "GOAL · INJURY TIME WINNER" },
    { tall: false, label: "POST-MATCH · MUDDY BOOTS" }
  ];
  return (
    <section style={{ position: "relative" }}>
      <div className="container" style={{ padding: "120px 40px" }}>
        <SectionHead idx="05 / FIELD NOTES" eyebrow="Gallery" title={<>From the <span style={{color:"var(--gold)"}}>touchline</span>.</>} kicker="Photography by the lads, for the lads. Updated weekly." />
        <div style={{ marginTop: 60, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridAutoRows: "240px", gap: 16 }}>
          {tiles.map((t, i) => (
            <Placeholder key={i} style={{ gridRow: t.tall ? "span 2" : "span 1", minHeight: t.tall ? 496 : 240 }}>{t.label}</Placeholder>
          ))}
        </div>
        <div style={{ marginTop: 32, textAlign: "right" }}>
          <a href="#" className="mono" style={{ fontSize: 11, letterSpacing: ".18em", color: "var(--gold)", borderBottom: "1px solid var(--gold)", paddingBottom: 4 }}>OPEN ARCHIVE →</a>
        </div>
      </div>
    </section>
  );
};
window.Gallery = Gallery;
