"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [trap, setTrap] = useState(""); // honeypot — bots fill it, people never see it (odd name so autofill skips it)
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, hp_x7c1e: trap }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
            type="text"
            name="hp_x7c1e"
            tabIndex={-1}
            autoComplete="off"
            data-1p-ignore data-lpignore="true" data-form-type="other"
            aria-hidden="true"
            value={trap}
            onChange={(e) => setTrap(e.target.value)}
            className="absolute left-[-9999px] h-0 w-0 opacity-0"
          />
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
            disabled={loading}
            className="shrink-0 rounded-full bg-gold px-7 py-3 text-sm font-medium text-ink transition hover:bg-gold-light disabled:opacity-60"
          >
            {loading ? "Joining…" : "Notify Me"}
          </button>
        </form>
      )}
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
    </div>
  );
}
