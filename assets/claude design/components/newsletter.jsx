const Newsletter = () => {
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);
  return (
    <section id="join" style={{ background: "var(--gold)", color: "#1a1408" }}>
      <div className="container" style={{ padding: "120px 40px", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 60, alignItems: "center" }}>
        <div>
          <div className="mono" style={{ fontSize: 11, letterSpacing: ".22em", marginBottom: 20 }}>08 / DISPATCH FROM THE JUNGLE</div>
          <h2 className="display" style={{ fontSize: "clamp(56px, 8vw, 128px)", margin: 0, color: "#1a1408" }}>
            Join the<br/>brotherhood.
          </h2>
          <p style={{ maxWidth: 460, fontSize: 17, lineHeight: 1.6, marginTop: 24, color: "#1a1408" }}>
            One match report a week. Squad news, kit drops, and the occasional
            blurry photo from the back of the team bus. No spam. Unsubscribe anytime.
          </p>
        </div>

        <form onSubmit={(e)=>{e.preventDefault(); if(email) setSent(true);}}
          style={{ background: "#1a1408", color: "var(--ink)", padding: 32, border: "2px solid #1a1408" }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: ".22em", color: "var(--gold)", marginBottom: 20 }}>WEEKLY DISPATCH · FREE</div>

          {!sent ? (
            <>
              <label className="mono" style={{ display: "block", fontSize: 10, letterSpacing: ".22em", color: "var(--ink-dim)", marginBottom: 8 }}>EMAIL</label>
              <input
                type="email" required value={email} onChange={(e)=>setEmail(e.target.value)}
                placeholder="you@in-the-jungle.com"
                style={{
                  width: "100%", background: "transparent", border: "none", borderBottom: "1px solid var(--line)",
                  color: "var(--ink)", padding: "12px 0", fontSize: 18, outline: "none", fontFamily: "inherit"
                }}
              />
              <div style={{ display: "flex", gap: 12, marginTop: 24, alignItems: "center" }}>
                <button type="submit" className="btn btn--gold" style={{ flex: 1 }}>Sign me up →</button>
                <span className="mono" style={{ fontSize: 10, letterSpacing: ".18em", color: "var(--ink-dim)" }}>~ 1100 SUBS</span>
              </div>
            </>
          ) : (
            <div style={{ padding: "16px 0" }}>
              <div className="display" style={{ fontSize: 32, color: "var(--gold)" }}>You're in.</div>
              <p style={{ color: "var(--ink-dim)", marginTop: 12 }}>First dispatch arrives Friday. Welcome to the green.</p>
            </div>
          )}
        </form>
      </div>
    </section>
  );
};
window.Newsletter = Newsletter;
