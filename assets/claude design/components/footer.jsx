const Footer = () => (
  <footer id="contact" style={{ background: "var(--bg)", borderTop: "1px solid var(--line)" }}>
    <div className="container" style={{ padding: "80px 40px 32px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr", gap: 48 }}>
        <div>
          <Wordmark />
          <p style={{ marginTop: 24, color: "var(--ink-dim)", fontSize: 14, maxWidth: 320, lineHeight: 1.6 }}>
            A football club from Ubud, Bali. Open to everyone who'll run for the man next to them.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            {["IG", "TT", "YT", "WA"].map((s) => (
              <a key={s} href="#" className="mono" style={{
                width: 36, height: 36, border: "1px solid var(--line)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, letterSpacing: ".1em", color: "var(--ink-dim)"
              }}>{s}</a>
            ))}
          </div>
        </div>

        <FooterCol head="The Club" links={["Manifesto","Squad","Fixtures","Coaches","Press kit"]} />
        <FooterCol head="Get involved" links={["Open trials","Women's team","Junior Jungle","Walking football","Volunteer"]} />
        <div>
          <div className="eyebrow" style={{ marginBottom: 16 }}>Contact</div>
          <div style={{ fontSize: 14, lineHeight: 1.8 }}>
            <div>Lapangan Astina</div>
            <div>Jl. Cok Gede Rai, Ubud</div>
            <div>Gianyar, Bali 80571</div>
            <div style={{ marginTop: 12 }}><a href="mailto:salam@ubudjungle.fc" style={{ borderBottom: "1px solid var(--line)" }}>salam@ubudjungle.fc</a></div>
            <div><a href="tel:+6281234567890" style={{ borderBottom: "1px solid var(--line)" }}>+62 812 3456 7890</a></div>
          </div>
        </div>
      </div>

      <div className="hairline" style={{ margin: "60px 0 24px" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: ".22em", color: "var(--ink-dim)" }}>
          © 2026 UBUD JUNGLE BALLERS FC · ALL RIGHTS RESERVED · SALAM HIJAU
        </div>
        <div className="mono" style={{ fontSize: 10, letterSpacing: ".22em", color: "var(--ink-dim)" }}>
          PRIVACY · TERMS · COOKIES · SITE BY THE BROTHERHOOD
        </div>
      </div>
    </div>
  </footer>
);

const FooterCol = ({ head, links }) => (
  <div>
    <div className="eyebrow" style={{ marginBottom: 16 }}>{head}</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {links.map((l) => (
        <a key={l} href="#" style={{ fontSize: 14, color: "var(--ink)", borderBottom: "1px solid transparent", paddingBottom: 2, alignSelf: "start" }}
          onMouseEnter={(e)=>{e.currentTarget.style.borderColor="var(--gold)"; e.currentTarget.style.color="var(--gold)";}}
          onMouseLeave={(e)=>{e.currentTarget.style.borderColor="transparent"; e.currentTarget.style.color="var(--ink)";}}
        >{l}</a>
      ))}
    </div>
  </div>
);

window.Footer = Footer;
