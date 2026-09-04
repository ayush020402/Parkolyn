// Minimal line-art icons for the three Parkolyn Amsterdam category houses.
// Deliberately spare (stroke only, no fill) so they read as an iconographic
// index on the homepage rather than product photography — the detailed
// bottle art lives on the Perfumes page itself.

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.1,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function PerfumeIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} {...base}>
      <rect x="26" y="8" width="12" height="8" rx="2" />
      <rect x="29" y="16" width="6" height="6" />
      <path d="M20 22 h24 c2 0 3 1.5 3 3.5 V50 c0 3.3-2.7 6-6 6 H23 c-3.3 0-6-2.7-6-6 V25.5 c0-2 1-3.5 3-3.5Z" />
      <line x1="17" y1="34" x2="47" y2="34" />
      <rect x="24" y="38" width="16" height="12" rx="1" />
      <circle cx="32" cy="44" r="2.4" />
    </svg>
  );
}

export function CosmeticsIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} {...base}>
      <ellipse cx="32" cy="20" rx="14" ry="6" />
      <path d="M18 20 v6 c0 3.3 6.3 6 14 6 s14-2.7 14-6 v-6" />
      <path d="M20 32 c0 12 0 18 2.5 22 c2 3.4 6 4 9.5 4 s7.5-.6 9.5-4 c2.5-4 2.5-10 2.5-22" />
      <line x1="26" y1="40" x2="26" y2="48" />
    </svg>
  );
}

export function ClothingIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} {...base}>
      <path d="M32 10 c-2.5 0-4.5 2-4.5 4.5 h9 c0-2.5-2-4.5-4.5-4.5Z" />
      <path d="M27.5 14.5 14 22 l5 8 8-4.5 V52 h10 V25.5 l8 4.5 5-8-13.5-7.5" />
    </svg>
  );
}
