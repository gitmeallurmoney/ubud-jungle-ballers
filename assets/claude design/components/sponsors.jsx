const Sponsors = () => {
  const tiers = [
    { tier: "PRINCIPAL", names: ["Warung Hijau", "Bali Bintang"] },
    { tier: "TECHNICAL", names: ["Cok Boots Co.", "Tropic FC Apparel"] },
    { tier: "FRIENDS OF THE CLUB", names: ["Ubud Coffee", "Sanur Surf", "Monkey Forest Press", "Padang Padang", "Kintamani Kopi", "Tegallalang Cycle"] }
  ];
  return (
    <section style={{ position: "relative" }}>
      <div className="container" style={{ padding: "120px 40px" }}>
        <SectionHead idx="07 / PARTNERS" eyebrow="Sponsors" title={<>Stand with the <span style={{color:"var(--gold)"}}>green</span>.</>} kicker="Local businesses keeping the lights on. Want your name on the shirt? Talk to us." />

        <div style={{ marginTop: 60, display: "flex", flexDirection: "column", gap: 0, border: "1px solid var(--line)" }}>
          {tiers.map((t, i) => (
            <div key={t.tier} style={{ display: "grid", gridTemplateColumns: "200px 1fr", borderBottom: i<tiers.length-1?"1px solid var(--line)":"none" }}>
              <div className="mono" style={{ padding: 28, fontSize: 11, letterSpacing: ".22em", color: "var(--gold)", borderRight: "1px solid var(--line)", background: "var(--bg-2)" }}>
                {t.tier}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(t.names.length, 4)}, 1fr)`, gap: 0 }}>
                {t.names.map((n, j) => (
                  <div key={n} style={{
                    padding: 28, borderRight: (j+1)%4!==0 && j<t.names.length-1 ?"1px solid var(--line)":"none",
                    fontFamily: "var(--display)", fontSize: i===0? 28 : i===1 ? 22 : 16, textTransform: "uppercase",
                    color: i===2 ? "var(--ink-dim)" : "var(--ink)",
                    display: "flex", alignItems: "center"
                  }}>{n}</div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, padding: 28, border: "1px dashed var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div className="display" style={{ fontSize: 24 }}>Become a partner.</div>
            <div className="mono" style={{ fontSize: 11, letterSpacing: ".18em", color: "var(--ink-dim)", marginTop: 4 }}>FROM IDR 5M / SEASON · BADGE, SHIRT, MATCHDAY</div>
          </div>
          <a href="#contact" className="btn btn--gold">Partnership deck →</a>
        </div>
      </div>
    </section>
  );
};
window.Sponsors = Sponsors;
