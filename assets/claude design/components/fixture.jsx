// Next fixture with countdown
const Fixture = () => {
  // target: next Saturday 18:00 local
  const [now, setNow] = React.useState(new Date());
  React.useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const target = React.useMemo(() => {
    const d = new Date();
    const day = d.getDay();
    const offset = (6 - day + 7) % 7 || 7;
    d.setDate(d.getDate() + offset);
    d.setHours(18, 0, 0, 0);
    return d;
  }, []);
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  const pad = (n) => String(n).padStart(2, "0");

  return (
    <section id="fixture" style={{ background: "var(--bg-2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
      <div className="container" style={{ padding: "100px 40px" }}>
        <SectionHead idx="01 / FIXTURE" eyebrow="Next Matchday" title={<>Saturday<br/><span style={{color:"var(--gold)"}}>18:00 WITA</span></>} kicker="Lapangan Ubud · Gianyar Regional · Liga 4 Group B" />

        <div style={{ marginTop: 60, display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 40 }}>
          {/* match card */}
          <div style={{ border: "1px solid var(--line)", padding: 40, position: "relative", background: "var(--bg-3)" }}>
            <div style={{ position: "absolute", top: 16, left: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, background: "var(--rust)", borderRadius: "50%", animation: "pulseDot 1.4s infinite" }} />
              <span className="mono" style={{ fontSize: 10, letterSpacing: ".22em", color: "var(--rust)" }}>UPCOMING · MD 04</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 20, alignItems: "center", paddingTop: 20 }}>
              <div style={{ textAlign: "center" }}>
                <Crest size={84} />
                <div className="display" style={{ fontSize: 30, marginTop: 16 }}>UBUD<br/>JUNGLE</div>
                <div className="mono" style={{ fontSize: 10, color: "var(--ink-dim)", letterSpacing: ".2em", marginTop: 8 }}>HOME · 4W 1D 1L</div>
              </div>
              <div className="display" style={{ fontSize: 64, color: "var(--gold)", textAlign: "center" }}>VS</div>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 84, height: 84, margin: "0 auto", border: "2px solid var(--ink-dim)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}>
                  <span className="display" style={{ fontSize: 32, color: "var(--ink-dim)" }}>BU</span>
                </div>
                <div className="display" style={{ fontSize: 30, marginTop: 16 }}>BALI<br/>UNITED B</div>
                <div className="mono" style={{ fontSize: 10, color: "var(--ink-dim)", letterSpacing: ".2em", marginTop: 8 }}>AWAY · 3W 2D 1L</div>
              </div>
            </div>

            {/* countdown */}
            <div style={{ marginTop: 40, paddingTop: 32, borderTop: "1px solid var(--line)", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
              {[["DAYS", days],["HOURS", pad(hours)],["MIN", pad(mins)],["SEC", pad(secs)]].map(([k,v]) => (
                <div key={k} style={{ textAlign: "center" }}>
                  <div className="display" style={{ fontSize: 56, color: "var(--ink)" }}>{v}</div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--ink-dim)", letterSpacing: ".22em", marginTop: 4 }}>{k}</div>
                </div>
              ))}
            </div>
          </div>

          {/* form / table */}
          <div>
            <div className="eyebrow" style={{ marginBottom: 16 }}>Last 5 — Form</div>
            <div style={{ display: "flex", gap: 6, marginBottom: 32 }}>
              {["W","W","D","L","W"].map((r,i) => (
                <div key={i} style={{
                  width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--display)", fontSize: 18,
                  background: r==="W"?"var(--gold)":r==="D"?"var(--bg-3)":"var(--rust)",
                  color: r==="D"?"var(--ink)":"#1a1408",
                  border: r==="D" ? "1px solid var(--line)" : "none"
                }}>{r}</div>
              ))}
            </div>

            <div className="eyebrow" style={{ marginBottom: 16 }}>Group B · Standings</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--mono)", fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--line)", color: "var(--ink-dim)" }}>
                  <th style={{ textAlign: "left", padding: "8px 4px", fontWeight: 400 }}>#</th>
                  <th style={{ textAlign: "left", padding: "8px 4px", fontWeight: 400 }}>CLUB</th>
                  <th style={{ padding: "8px 4px", fontWeight: 400 }}>P</th>
                  <th style={{ padding: "8px 4px", fontWeight: 400 }}>GD</th>
                  <th style={{ padding: "8px 4px", fontWeight: 400 }}>PTS</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["1","PSS Sleman B","6","+9","13"],
                  ["2","Bali United B","6","+5","11"],
                  ["3","Ubud Jungle","6","+4","10",true],
                  ["4","Persikab","6","+1","8"],
                  ["5","Lombok FC","6","-3","6"],
                  ["6","Persema U23","6","-16","1"]
                ].map(([p,c,pl,gd,pt,me]) => (
                  <tr key={p} style={{ borderBottom: "1px solid var(--line)", color: me?"var(--gold)":"var(--ink)" }}>
                    <td style={{ padding: "10px 4px" }}>{p}</td>
                    <td style={{ padding: "10px 4px", fontWeight: me?700:400 }}>{c}{me && <span style={{marginLeft:8,color:"var(--gold)"}}>◆</span>}</td>
                    <td style={{ textAlign: "center", padding: "10px 4px" }}>{pl}</td>
                    <td style={{ textAlign: "center", padding: "10px 4px" }}>{gd}</td>
                    <td style={{ textAlign: "center", padding: "10px 4px", fontWeight: 700 }}>{pt}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <a href="#" className="mono" style={{ display: "inline-block", marginTop: 24, fontSize: 11, letterSpacing: ".18em", color: "var(--gold)", borderBottom: "1px solid var(--gold)", paddingBottom: 4 }}>FULL FIXTURES →</a>
          </div>
        </div>
      </div>
    </section>
  );
};
window.Fixture = Fixture;
