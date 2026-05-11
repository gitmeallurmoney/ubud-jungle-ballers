// Shared little bits used across sections.
const Crest = ({ size = 40, mono = false }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
    {/* shield */}
    <path d="M32 3 L58 12 V30 C58 46 46 56 32 61 C18 56 6 46 6 30 V12 Z"
      stroke={mono ? "currentColor" : "var(--gold)"} strokeWidth="2" fill="none" />
    {/* inner divider */}
    <path d="M6 26 H58" stroke="currentColor" strokeWidth="1" opacity=".5" />
    {/* palm leaves crossed */}
    <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none">
      <path d="M22 44 C22 36 27 30 32 30" />
      <path d="M42 44 C42 36 37 30 32 30" />
      <path d="M24 40 L21 38 M26 36 L23 34 M28 33 L25 31" />
      <path d="M40 40 L43 38 M38 36 L41 34 M36 33 L39 31" />
    </g>
    {/* ball */}
    <circle cx="32" cy="48" r="4" fill={mono ? "currentColor" : "var(--gold)"} />
    {/* est text dot */}
    <circle cx="32" cy="16" r="1.6" fill={mono ? "currentColor" : "var(--gold)"} />
  </svg>
);

const Wordmark = ({ small = false }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <Crest size={small ? 28 : 36} />
    <div style={{ lineHeight: 1, fontFamily: "var(--display)", letterSpacing: "0.01em" }}>
      <div style={{ fontSize: small ? 13 : 16, textTransform: "uppercase" }}>
        Ubud Jungle <span style={{ color: "var(--gold)" }}>Ballers</span>
      </div>
      <div className="mono" style={{ fontSize: 9, letterSpacing: ".22em", color: "var(--ink-dim)", marginTop: 4 }}>
        EST. 2026 · UBUD · BALI
      </div>
    </div>
  </div>
);

// Striped placeholder block
const Placeholder = ({ children, style }) => (
  <div className="ph" style={style}>{children}</div>
);

// Section heading with index, eyebrow, big title, optional rule
const SectionHead = ({ idx, eyebrow, title, kicker, align = "left" }) => (
  <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 24, alignItems: "end", paddingBottom: 28, borderBottom: "1px solid var(--line)" }}>
    <div className="mono" style={{ fontSize: 12, color: "var(--gold)" }}>{idx}</div>
    <div>
      <div className="eyebrow" style={{ marginBottom: 12 }}>{eyebrow}</div>
      <div className="display" style={{ fontSize: "clamp(44px, 6vw, 92px)" }}>{title}</div>
    </div>
    {kicker && <div className="mono" style={{ fontSize: 11, color: "var(--ink-dim)", textAlign: "right", maxWidth: 220 }}>{kicker}</div>}
  </div>
);

Object.assign(window, { Crest, Wordmark, Placeholder, SectionHead });
