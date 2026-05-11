const Nav = ({ page = "home" }) => {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const items = [
    { label: "The Club", href: "#manifesto" },
    { label: "Squad", href: "squad.html" },
    { label: "Fixtures", href: "#fixture" },
    { label: "Kit", href: "#kit" },
    { label: "Community", href: "#community" },
    { label: "Contact", href: "#contact" }
  ];

  return (
    <header
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        background: scrolled ? "rgba(10,31,21,.86)" : "transparent",
        backdropFilter: scrolled ? "blur(10px)" : "none",
        borderBottom: scrolled ? "1px solid var(--line)" : "1px solid transparent",
        transition: "background .25s ease, border-color .25s ease"
      }}
    >
      <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 76 }}>
        <a href="index.html" style={{ display: "block" }}><Wordmark /></a>
        <nav style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {items.map((it) => (
            <a key={it.label} href={it.href}
              className="mono"
              style={{
                fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase",
                color: "var(--ink)", paddingBottom: 4,
                borderBottom: "1px solid transparent",
                transition: "border-color .15s ease, color .15s ease"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--gold)"; e.currentTarget.style.color = "var(--gold)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.color = "var(--ink)"; }}
            >{it.label}</a>
          ))}
          <a href="#join" className="btn btn--gold" style={{ marginLeft: 8 }}>Join the Brotherhood →</a>
        </nav>
      </div>
    </header>
  );
};

window.Nav = Nav;
