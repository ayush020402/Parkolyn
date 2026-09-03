// Designed placeholder artwork for a perfume bottle, generated purely in SVG
// so every product looks premium and on-brand before real product photography
// exists. Once you have a real shot, set `image` on the product in
// lib/products.js and it will be used instead automatically (see ProductCard).

export default function BottleArt({ accent = "#c9a962", accent2 = "#1a140c", className = "" }) {
  const id = accent.replace("#", "");
  return (
    <svg
      viewBox="0 0 300 400"
      className={className}
      role="img"
      aria-label="Parkolyn perfume bottle illustration"
    >
      <defs>
        <radialGradient id={`bg-${id}`} cx="50%" cy="32%" r="80%">
          <stop offset="0%" stopColor={accent2} stopOpacity="0.95" />
          <stop offset="100%" stopColor="#0a0907" />
        </radialGradient>
        <linearGradient id={`glass-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.9" />
          <stop offset="45%" stopColor={accent} stopOpacity="0.32" />
          <stop offset="100%" stopColor={accent2} stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id={`cap-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f3e6bd" />
          <stop offset="45%" stopColor="#c9a962" />
          <stop offset="100%" stopColor="#7a611f" />
        </linearGradient>
        <linearGradient id={`shine-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="50%" stopColor="#fff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`floor-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`rim-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="300" height="400" fill={`url(#bg-${id})`} />

      {/* soft ground shadow */}
      <ellipse cx="150" cy="354" rx="86" ry="16" fill={`url(#floor-${id})`} />

      {/* cap */}
      <rect x="126" y="56" width="48" height="36" rx="7" fill={`url(#cap-${id})`} />
      <rect x="126" y="56" width="48" height="6" rx="3" fill="#fff" opacity="0.35" />
      <rect x="139" y="44" width="22" height="18" rx="4" fill={`url(#cap-${id})`} />
      <line x1="132" y1="66" x2="168" y2="66" stroke="#000" strokeOpacity="0.15" strokeWidth="1" />
      <line x1="132" y1="76" x2="168" y2="76" stroke="#000" strokeOpacity="0.15" strokeWidth="1" />

      {/* neck */}
      <rect x="137" y="90" width="26" height="20" fill={accent} opacity="0.55" />

      {/* bottle body */}
      <path
        d="M111 110 H189 C197 110 201 118 201 128 V322 C201 338 189 350 173 350 H127 C111 350 99 338 99 322 V128 C99 118 103 110 111 110 Z"
        fill={`url(#glass-${id})`}
        stroke={accent}
        strokeOpacity="0.55"
      />

      {/* liquid line */}
      <path
        d="M103 198 H197 V322 C197 336 187 346 173 346 H127 C113 346 103 336 103 322 Z"
        fill={accent}
        opacity="0.3"
      />
      <rect x="103" y="196" width="94" height="3" fill={accent} opacity="0.5" />

      {/* label */}
      <rect x="119" y="220" width="62" height="72" rx="2" fill="#f4efe4" opacity="0.92" />
      <rect x="119" y="220" width="62" height="72" rx="2" fill="none" stroke={accent2} strokeOpacity="0.3" />
      <line x1="130" y1="238" x2="170" y2="238" stroke="#0a0907" strokeWidth="1" opacity="0.55" />
      <line x1="130" y1="248" x2="170" y2="248" stroke="#0a0907" strokeWidth="1" opacity="0.4" />
      <circle cx="150" cy="268" r="9" fill="none" stroke="#0a0907" strokeWidth="1" opacity="0.55" />
      <line x1="136" y1="284" x2="164" y2="284" stroke="#0a0907" strokeWidth="0.75" opacity="0.3" />

      {/* left rim light */}
      <path d="M101 112 C101 112 99 118 99 128 V320 C99 336 111 348 127 348" fill="none" stroke={`url(#rim-${id})`} strokeWidth="2" />

      {/* glass shine sweep */}
      <rect x="99" y="110" width="102" height="240" fill={`url(#shine-${id})`} className="animate-shimmer" />

      {/* small highlight dot */}
      <circle cx="118" cy="140" r="3" fill="#fff" opacity="0.5" />
    </svg>
  );
}
