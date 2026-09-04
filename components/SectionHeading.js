export default function SectionHeading({ eyebrow, title, description, align = "left" }) {
  const isCenter = align === "center";
  return (
    <div className={`max-w-2xl ${isCenter ? "mx-auto text-center" : ""}`}>
      {eyebrow && (
        <span className="text-xs uppercase tracking-[0.35em] text-gold">{eyebrow}</span>
      )}
      <h2 className="mt-3 font-serif text-3xl leading-tight sm:text-4xl">{title}</h2>
      {description && (
        <p className="mt-4 text-sm leading-relaxed text-ink-dim sm:text-base">{description}</p>
      )}
    </div>
  );
}
