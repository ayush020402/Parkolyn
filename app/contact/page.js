"use client";

import { useState } from "react";
import SectionHeading from "@/components/SectionHeading";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // TODO: wire to an email/form provider (e.g. Resend, Formspree) once
    // available — for now this confirms receipt so the flow is demoable.
    setSent(true);
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
          <p className="rounded-2xl border hairline bg-ink-card p-8 text-sm text-gold">
            Thank you — your message has been received. We&apos;ll be in touch shortly.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-widest text-cream-dim">Name</span>
              <input
                required
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className="w-full rounded-xl border hairline bg-transparent px-4 py-3 text-sm text-cream focus:border-gold focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-widest text-cream-dim">Email</span>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="w-full rounded-xl border hairline bg-transparent px-4 py-3 text-sm text-cream focus:border-gold focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-widest text-cream-dim">Message</span>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                className="w-full resize-none rounded-xl border hairline bg-transparent px-4 py-3 text-sm text-cream focus:border-gold focus:outline-none"
              />
            </label>
            <button
              type="submit"
              className="rounded-full bg-gold px-8 py-3 text-sm font-medium text-ink transition hover:bg-gold-light"
            >
              Send Message
            </button>
          </form>
        )}

        <div className="space-y-6 text-sm text-cream-dim">
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
