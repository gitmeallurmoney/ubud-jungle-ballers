const Community = () => (
  <section id="community" style={{ background: "var(--bg-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
    <div className="container" style={{ padding: "120px 40px" }}>
      <SectionHead idx="06 / COMMUNITY" eyebrow="Open Sessions" title={<>The pitch is<br/><span style={{color:"var(--gold)"}}>open</span>.</>} kicker="Trials, kids' clinics, women's football, walking groups. Show up. Bring boots." />

      <div style={{ marginTop: 60, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, border: "1px solid var(--line)" }}>
        {[
          { day: "TUE", time: "17:30 — 19:30", t: "Open Trials", who: "Men's first team trial — bring ID and boots.", tag: "OPEN" },
          { day: "THU", time: "16:00 — 18:00", t: "Women's Training", who: "Coached session, all levels welcome.", tag: "OPEN" },
          { day: "SAT", time: "08:00 — 10:00", t: "Junior Jungle (U12)", who: "Free youth clinic + breakfast.", tag: "FREE" },
          { day: "SUN", time: "07:00 — 08:30", t: "Walking Football", who: "55+ casual session. Coffee after.", tag: "FREE" },
          { day: "DAILY", time: "06:00 — 07:00", t: "Sunrise Run Club", who: "5K loop through the rice paddies.", tag: "DROP-IN" },
          { day: "FRI", time: "20:00 — late", t: "Match Watch", who: "Big games at Warung Hijau. All welcome.", tag: "SOCIAL" }
        ].map((x, i, arr) => (
          <div key={i} style={{
            padding: 32,
            borderRight: (i+1)%3!==0 ? "1px solid var(--line)" : "none",
            borderBottom: i < arr.length-3 ? "1px solid var(--line)" : "none",
            position: "relative"
          }}>
            <div className="mono" style={{ position: "absolute", top: 16, right: 16, fontSize: 10, color: "var(--gold)", letterSpacing: ".22em", border: "1px solid var(--gold)", padding: "3px 8px" }}>{x.tag}</div>
            <div className="display" style={{ fontSize: 56, lineHeight: 0.9 }}>{x.day}</div>
            <div className="mono" style={{ fontSize: 11, color: "var(--ink-dim)", letterSpacing: ".18em", marginTop: 8 }}>{x.time}</div>
            <div className="display" style={{ fontSize: 24, marginTop: 24 }}>{x.t}</div>
            <div style={{ color: "var(--ink-dim)", fontSize: 14, marginTop: 8, lineHeight: 1.6 }}>{x.who}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 40, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div style={{ color: "var(--ink-dim)", fontSize: 14 }}>📍 Lapangan Astina, Jl. Cok Gede Rai, Ubud · GPS 8°30′24″S 115°15′45″E</div>
        <a href="#" className="btn btn--ghost">Add to calendar</a>
      </div>
    </div>
  </section>
);
window.Community = Community;
