// Floating WhatsApp contact button — set NEXT_PUBLIC_WHATSAPP_NUMBER in
// .env.local (country code, no + or spaces, e.g. 919876543210) to activate.

export default function WhatsAppButton() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  const href = number
    ? `https://wa.me/${number}?text=${encodeURIComponent("Hi Parkolyn Amsterdam, I have a question about your products.")}`
    : "/contact";

  return (
    <a
      href={href}
      target={number ? "_blank" : undefined}
      rel={number ? "noopener noreferrer" : undefined}
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/40 transition hover:scale-105"
      aria-label="Chat on WhatsApp"
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.82L2 22l5.4-1.36a9.9 9.9 0 0 0 4.64 1.13h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm5.8 14.1c-.24.68-1.38 1.31-1.9 1.36-.51.05-1 .25-3.35-.7-2.84-1.15-4.66-4-4.8-4.19-.14-.19-1.15-1.53-1.15-2.92 0-1.39.73-2.07 1-2.35.24-.28.55-.34.73-.34.18 0 .37 0 .53.01.17.01.4-.06.62.48.24.58.81 2 .88 2.15.07.15.12.32.02.51-.1.19-.15.31-.3.48-.15.17-.31.38-.44.51-.15.15-.31.31-.13.6.18.29.8 1.32 1.72 2.14 1.18 1.05 2.17 1.38 2.46 1.53.29.15.46.13.63-.08.17-.2.72-.84.91-1.13.19-.29.38-.24.63-.14.26.1 1.65.78 1.93.92.29.14.48.21.55.33.07.12.07.68-.17 1.36Z" />
      </svg>
    </a>
  );
}
