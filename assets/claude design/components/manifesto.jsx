const Manifesto = () => (
  <section id="manifesto" style={{ position: "relative" }}>
    <div className="container" style={{ padding: "120px 40px" }}>
      <SectionHead idx="02 / THE CLUB" eyebrow="Manifesto" title={<>The Jungle<br/>doesn't quit.</>} kicker="A field carved between the rice paddies. A team carved out of everyone who showed up." />

      <div style={{ marginTop: 80, display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 80 }}>
        <div>
          <p className="display" style={{ fontSize: 36, lineHeight: 1, marginBottom: 32 }}>
            We didn't get scouted.<br/>
            We got <span style={{color:"var(--gold)"}}>here</span>.
          </p>
          <p style={{ color: "var(--ink-dim)", fontSize: 17, lineHeight: 1.7, marginBottom: 20 }}>
            Some of us were born five minutes from the pitch. Some flew sixteen
            hours and never went back. The green doesn't ask where you're from
            — only if you'll run for the man next to you.
          </p>
          <p style={{ color: "var(--ink-dim)", fontSize: 17, lineHeight: 1.7 }}>
            We train under floodlights and rainstorms. We win on Saturdays and
            argue about it on Sundays. We carry every flag onto the pitch and
            leave with one shirt.
          </p>

          <div style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid var(--line)" }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Three tenets</div>
            {[
              ["01", "Brotherhood over brilliance.", "The squad outranks the ego."],
              ["02", "Local first, global welcome.", "Balinese leadership. Open doors."],
              ["03", "Earn the green.", "Every cap, every shift, every shirt."]
            ].map(([n,t,d]) => (
              <div key={n} style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 20, padding: "20px 0", borderBottom: "1px solid var(--line)" }}>
                <div className="mono" style={{ color: "var(--gold)", fontSize: 12, paddingTop: 4 }}>{n}</div>
                <div>
                  <div className="display" style={{ fontSize: 22, marginBottom: 6 }}>{t}</div>
                  <div style={{ color: "var(--ink-dim)", fontSize: 14 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Placeholder style={{ height: 360 }}>HERO IMAGE — TEAM HUDDLE, SUNSET, JERSEY GREEN</Placeholder>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <Placeholder style={{ height: 220 }}>MATCHDAY · BOOT MUD CLOSE-UP</Placeholder>
            <Placeholder style={{ height: 220 }}>TRAINING · UBUD PADDIES BG</Placeholder>
          </div>
          <div style={{ border: "1px solid var(--line)", padding: 28, background: "var(--bg-2)" }}>
            <div className="eyebrow" style={{ marginBottom: 12 }}>Quote · Captain</div>
            <p className="display" style={{ fontSize: 28, lineHeight: 1.05, margin: 0 }}>
              "If you can run, you can play.<br/>If you can listen, you can lead."
            </p>
            <div className="mono" style={{ fontSize: 11, marginTop: 16, color: "var(--ink-dim)", letterSpacing: ".2em" }}>— WAYAN P., #06 · CAPTAIN</div>
          </div>
        </div>
      </div>
    </div>
  </section>
);
window.Manifesto = Manifesto;
