const Ticker = () => {
  const items = [
    "MATCHDAY 04 · UJB vs BALI UTD · SAT 18:00 · LAPANGAN UBUD",
    "TRIALS OPEN · TUE & THU 17:30",
    "NEW KIT DROPPING · 2026/27 SEASON",
    "11 NATIONS · ONE GREEN",
    "ROAD TO LIGA 3",
    "JOIN THE BROTHERHOOD"
  ];
  const line = items.join("   ✦   ");
  return (
    <div style={{
      background: "var(--gold)", color: "#1a1408",
      borderTop: "1px solid #c89a2c", borderBottom: "1px solid #c89a2c",
      overflow: "hidden", whiteSpace: "nowrap", padding: "12px 0", fontFamily: "var(--mono)", fontSize: 12, letterSpacing: ".18em",
      textTransform: "uppercase", fontWeight: 700
    }}>
      <div style={{ display: "inline-block", animation: "ticker 60s linear infinite" }}>
        <span style={{ paddingRight: 40 }}>{line}</span>
        <span style={{ paddingRight: 40 }}>{line}</span>
      </div>
    </div>
  );
};
window.Ticker = Ticker;
