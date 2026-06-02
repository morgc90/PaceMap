// ─── Pacemap Logo Component ───────────────────────────────────────────────────
// Usage:
//   <Logo />               — icon only (32px, for top bars)
//   <Logo size={48} />     — icon only, custom size
//   <Logo full />          — icon + PACEMAP wordmark (for auth screen)

export default function Logo({ size = 32, full = false, light = false }) {
  const fg = light ? "#0a0a0a" : "#0a0a0a";
  const bg = "#FC4C02";

  if (full) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      {/* Pin mark */}
      <svg width="64" height="80" viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M32 2C14 2 12 20 12 32C12 54 32 78 32 78C32 78 52 54 52 32C52 20 50 2 32 2Z" fill={bg}/>
        <circle cx="32" cy="26" r="14" fill={fg}/>
        <path d="M20 20L26 27L32 20L38 27" stroke={bg} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="32" cy="74" r="3" fill={bg} opacity="0.35"/>
      </svg>
      {/* Wordmark */}
      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 300,
        fontSize: 22,
        letterSpacing: "0.5em",
        color: "#ffffff",
        marginLeft: "0.5em",
      }}>PACEMAP</div>
      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 400,
        fontSize: 10,
        letterSpacing: "0.35em",
        color: bg,
        marginLeft: "0.35em",
      }}>RUN CLUB FINDER</div>
    </div>
  );

  // Icon only
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 64 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 2C14 2 12 20 12 32C12 54 32 78 32 78C32 78 52 54 52 32C52 20 50 2 32 2Z" fill={bg}/>
      <circle cx="32" cy="26" r="14" fill={fg}/>
      <path d="M20 20L26 27L32 20L38 27" stroke={bg} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}
