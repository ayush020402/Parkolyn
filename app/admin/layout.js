// Everything under /admin: never indexed, never cached, never framed.
// (Matching HTTP headers are set in next.config.mjs.)
export const metadata = {
  title: { default: "Admin", template: "%s · Parkolyn Admin" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }) {
  return <div className="min-h-screen bg-[#f6f5f2] text-ink">{children}</div>;
}
