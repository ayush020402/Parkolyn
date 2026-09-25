"use client";

import { useState } from "react";
import SectionHeading from "@/components/SectionHeading";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "", hp_x7c1e: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="container-px py-20">
      <SectionHeading
        eyebrow="Contact"
        title="Get in Touch"
        description="Questions about an order, a collaboration, or the collection — we'd love to hear from you."
      />

      <div className="mt-12 grid gap-12 md:grid-cols-2">
        {sent ? (
          <p className="rounded-2xl border hairline bg-surface p-8 text-sm text-gold">
            Thank you — your message has been received. We&apos;ll be in touch shortly.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Honeypot — hidden from people, filled in by bots. Its name is meaningless on
                purpose so browsers and password managers never autofill it for a real visitor. */}
            <input
              type="text"
              name="hp_x7c1e"
              tabIndex={-1}
              autoComplete="off"
              data-1p-ignore data-lpignore="true" data-form-type="other"
              aria-hidden="true"
              value={form.hp_x7c1e}
              onChange={(e) => update("hp_x7c1e", e.target.value)}
              className="absolute left-[-9999px] h-0 w-0 opacity-0"
            />
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-widest text-ink-dim">Name</span>
              <input
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className="w-full rounded-xl border hairline bg-transparent px-4 py-3 text-sm text-ink focus:border-gold focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-widest text-ink-dim">Email</span>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="w-full rounded-xl border hairline bg-transparent px-4 py-3 text-sm text-ink focus:border-gold focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-widest text-ink-dim">Message</span>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                className="w-full resize-none rounded-xl border hairline bg-transparent px-4 py-3 text-sm text-ink focus:border-gold focus:outline-none"
              />
            </label>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={sending}
              className="rounded-full bg-gold px-8 py-3 text-sm font-medium text-ink transition hover:bg-gold-light disabled:opacity-60"
            >
              {sending ? "Sending…" : "Send Message"}
            </button>
          </form>
        )}

        <div className="space-y-6 text-sm text-ink-dim">
          <div>
            <h3 className="text-xs uppercase tracking-[0.25em] text-gold">Email</h3>
            <p className="mt-2">hello@parkolyn.com</p>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-[0.25em] text-gold">Studio</h3>
            <p className="mt-2">Amsterdam, Netherlands</p>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-[0.25em] text-gold">WhatsApp</h3>
            <p className="mt-2">Available via the chat button in the corner of this site.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
