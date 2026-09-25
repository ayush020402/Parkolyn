import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { contactMessageEmail, getOwnerEmail, isEmailConfigured, sendEmail } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clip = (value, max) => String(value ?? "").trim().slice(0, max);

// Contact form: emails the message to the owner (reply-to = the sender) and
// keeps a copy in the database so nothing is lost if an email bounces.

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Hidden honeypot field: humans never fill it, bots do. Pretend success.
  if (body?.hp_x7c1e) return NextResponse.json({ ok: true });

  const name = clip(body?.name, 120);
  const email = clip(body?.email, 254).toLowerCase();
  const message = clip(body?.message, 5000);
  if (!name || !message || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please fill in your name, a valid email and a message." }, { status: 400 });
  }

  const ownerEmail = getOwnerEmail();
  const tasks = [
    (async () => {
      const { error } = await getSupabase().from("contact_messages").insert({ name, email, message });
      if (error) throw error;
    })(),
  ];
  if (isEmailConfigured() && ownerEmail) {
    tasks.push(sendEmail({ to: ownerEmail, ...contactMessageEmail({ name, email, message }), replyTo: email }));
  }

  // Succeed if the message reached at least one place we'll actually see it.
  const results = await Promise.allSettled(tasks);
  for (const r of results) {
    if (r.status === "rejected") console.error("[contact] delivery failed:", r.reason?.message ?? r.reason);
  }
  if (results.every((r) => r.status === "rejected")) {
    return NextResponse.json(
      { error: "We couldn't send your message right now. Please email hello@parkolyn.com instead." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
