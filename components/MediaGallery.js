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
  const exists = item.src ? fileExists(item.src) : false;

  if (exists && item.type === "video") {
    return (
      <div className="group relative aspect-[3/4] overflow-hidden rounded-2xl border hairline transition-colors duration-300 hover:border-gold/40">
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
      <div className="group relative aspect-[3/4] overflow-hidden rounded-2xl border hairline transition-colors duration-300 hover:border-gold/40">
        <Image src={item.src} alt={item.title || "Parkolyn Amsterdam"} fill className="object-cover transition duration-700 group-hover:scale-105" />
        {item.title && (
          <span className="absolute bottom-3 left-3 rounded-full bg-ink/70 px-3 py-1 text-[10px] uppercase tracking-widest text-gold backdrop-blur">
            {item.title}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="group relative flex aspect-[3/4] flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-dashed hairline bg-surface p-6 text-center transition-colors duration-300 hover:border-gold/40">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(150,116,42,0.1),transparent_60%)] opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
      <span className="relative flex flex-col items-center transition-transform duration-500 group-hover:scale-105">
        <span className="font-serif text-2xl uppercase tracking-wide text-gradient-gold">Parkolyn</span>
        <span className="mt-1 text-[10px] uppercase tracking-[0.25em] text-ink-dim">Amsterdam</span>
      </span>
      <p className="relative text-xs uppercase tracking-[0.25em] text-ink-dim">{item.title}</p>
      <p className="relative max-w-[220px] text-[11px] text-ink-dim/60">{item.caption}</p>
    </div>
  );
}

export default function MediaGallery() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {MEDIA_ITEMS.map((item) => (
        <MediaTile key={item.id} item={item} />
      ))}
    </div>
  );
}
