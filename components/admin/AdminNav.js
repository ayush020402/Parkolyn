"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Dashboard", exact: true, icon: "M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10" },
  { href: "/admin/orders", label: "Orders", badge: "toShip", icon: "M6 2l-3 5v13a1 1 0 001 1h16a1 1 0 001-1V7l-3-5H6zM3 7h18M9 11a3 3 0 006 0" },
  { href: "/admin/couriers", label: "Couriers", icon: "M1 6h13v10H1zM14 10h4l3 3v3h-7M5.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" },
  { href: "/admin/messages", label: "Messages", badge: "messages", icon: "M4 4h16v12H7l-3 3V4z" },
  { href: "/admin/subscribers", label: "Subscribers", icon: "M3 7l9 6 9-6M3 7v10h18V7M3 7l9-4 9 4" },
  { href: "/admin/account", label: "Account", icon: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0" },
];

export default function AdminNav({ counts }) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible" aria-label="Admin">
      {ITEMS.map((item) => {
        const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const count = item.badge ? counts?.[item.badge] : 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition ${
              active ? "bg-ink text-white" : "text-stone-600 hover:bg-stone-100 hover:text-ink"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={item.icon} />
            </svg>
            <span>{item.label}</span>
            {count > 0 && (
              <span className={`ml-auto rounded-full px-1.5 text-[11px] font-semibold ${active ? "bg-white/20 text-white" : "bg-gold/15 text-gold-deep"}`}>
                {count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
