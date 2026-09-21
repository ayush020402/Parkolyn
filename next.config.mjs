/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // 100 is used for the logo/crest so it stays crisp under browser zoom.
    qualities: [100, 75],
  },
};

export default nextConfig;
