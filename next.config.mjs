/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // 100 is used for the logo/crest so it stays crisp under browser zoom.
    qualities: [100, 75],
  },
  async headers() {
    return [
      {
        // Admin panel: keep it out of search engines and caches, and never let
        // another site frame it (clickjacking).
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;
