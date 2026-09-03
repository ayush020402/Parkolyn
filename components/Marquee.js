export default function Marquee({ items }) {
  const track = [...items, ...items];
  return (
    <div className="group relative overflow-hidden border-y hairline bg-ink-soft py-5">
      <div className="animate-marquee flex w-max gap-x-16 group-hover:[animation-play-state:paused]">
        {track.map((item, i) => (
          <div key={i} className="flex items-center gap-x-16">
            <span className="whitespace-nowrap text-[11px] uppercase tracking-[0.3em] text-cream-dim">
              {item}
            </span>
            <span className="h-1 w-1 shrink-0 rounded-full bg-gold/60" />
          </div>
        ))}
      </div>
    </div>
  );
}
