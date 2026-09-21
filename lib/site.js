// Public base URL of the site (no trailing slash), used for links in emails.
// SITE_URL wins; on Vercel the production domain is picked up automatically.
export function getSiteUrl() {
  const explicit = process.env.SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return vercel ? `https://${vercel}` : null;
}
