"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    // TODO: wire to an email provider (Mailchimp/Resend/etc). For now this
    // simply confirms receipt on the client so the flow is demoable end to end.
    setSubmitted(true);
  }

  return (
    <div className="mx-auto max-w-lg text-center">
      <h3 className="font-serif text-2xl">Be first to the launch</h3>
      <p className="mt-3 text-sm text-ink-dim">
        Join the list for production updates and early access when Parkolyn
        Amsterdam ships.
      </p>
      {submitted ? (
        <p className="mt-6 text-sm text-gold">Thank you — you&apos;re on the list.</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-full border hairline bg-transparent px-5 py-3 text-sm text-ink placeholder:text-ink-dim/50 focus:border-gold focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-gold px-7 py-3 text-sm font-medium text-ink transition hover:bg-gold-light"
          >
            Notify Me
          </button>
        </form>
      )}
    </div>
  );
}
