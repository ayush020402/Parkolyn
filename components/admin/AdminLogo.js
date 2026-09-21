import Image from "next/image";

// The storefront's crest + "Parkolyn / Amsterdam" wordmark (same assets and
// brand font as components/Header.js), scaled for the admin panel.
//   size="sm" — sidebar / mobile bar, crest beside the name
//   size="lg" — sign-in page, crest above the name
export default function AdminLogo({ size = "sm" }) {
  const large = size === "lg";
  return (
    <span className={`flex ${large ? "flex-col items-center gap-3" : "items-center gap-2.5"}`}>
      <Image
        src="/brand/crest.png"
        alt=""
        width={300}
        height={300}
        quality={100}
        priority
        className={`object-contain ${large ? "h-20 w-20" : "h-10 w-10"}`}
      />
      <span className={`flex flex-col leading-none ${large ? "items-center" : "items-start"}`}>
        <span className={`font-brand uppercase tracking-[0.06em] text-ink ${large ? "text-3xl" : "text-xl"}`}>Parkolyn</span>
        <span className={`mt-1.5 font-medium uppercase tracking-[0.4em] text-ink-dim ${large ? "text-[10px]" : "text-[9px]"}`}>
          Amsterdam
        </span>
      </span>
    </span>
  );
}
