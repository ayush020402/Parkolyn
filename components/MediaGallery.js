import fs from "fs";
import path from "path";
import Image from "next/image";
import { MEDIA_ITEMS } from "@/lib/media";

function fileExists(src) {
  try {
    return fs.existsSync(path.join(process.cwd(), "public", src));
  } catch {
    return false;
  }
}

function MediaTile({ item }) {
  const spanClass = item.size === "large" ? "sm:col-span-2 sm:row-span-2" : "";
  const exists = item.src ? fileExists(item.src) : false;

  if (exists && item.type === "video") {
    return (
      <div className={`group relative overflow-hidden rounded-2xl border hairline transition-colors duration-300 hover:border-gold/40 ${spanClass}`}>
        <video className="h-full w-full object-cover transition duration-700 group-hover:scale-105" src={item.src} autoPlay muted loop playsInline />
        {item.title && (
          <span className="absolute bottom-3 left-3 rounded-full bg-ink/70 px-3 py-1 text-[10px] uppercase tracking-widest text-gold backdrop-blur">
            {item.title}
          </span>
        )}
      </div>
    );
  }

  if (exists && item.type === "image") {
    return (
      <div className={`group relative overflow-hidden rounded-2xl border hairline transition-colors duration-300 hover:border-gold/40 ${spanClass}`}>
        <Image src={item.src} alt={item.title || "Parkolyn"} fill className="object-cover transition duration-700 group-hover:scale-105" />
        {item.title && (
          <span className="absolute bottom-3 left-3 rounded-full bg-ink/70 px-3 py-1 text-[10px] uppercase tracking-widest text-gold backdrop-blur">
            {item.title}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`group relative flex min-h-[220px] flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-dashed hairline bg-ink-card p-6 text-center transition-colors duration-300 hover:border-gold/40 ${spanClass}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(201,169,98,0.12),transparent_60%)] opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
      <span className="relative font-serif text-2xl text-gradient-gold transition-transform duration-500 group-hover:scale-105">Parkolyn</span>
      <p className="relative text-xs uppercase tracking-[0.25em] text-cream-dim">{item.title}</p>
      <p className="relative max-w-[220px] text-[11px] text-cream-dim/60">{item.caption}</p>
    </div>
  );
}

export default function MediaGallery() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {MEDIA_ITEMS.map((item) => (
        <MediaTile key={item.id} item={item} />
      ))}
    </div>
  );
}
