import { after, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { isEmailConfigured, sendEmail, welcomeEmail } from "@/lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Newsletter signup: stores the address (unique, lower-cased) and sends a
// one-time welcome email. Re-subscribing an existing address succeeds silently
// — we don't reveal who is on the list, and never email the same address twice.

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Hidden "website" field: humans never fill it, bots do. Pretend success.
  if (body?.website) return NextResponse.json({ ok: true });

  const email = String(body?.email ?? "").trim().toLowerCase().slice(0, 254);
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  try {
    // ignoreDuplicates => rows are returned only for genuinely new addresses.
    const { data, error } = await getSupabase()
      .from("subscribers")
      .upsert({ email }, { onConflict: "email", ignoreDuplicates: true })
      .select();
    if (error) throw error;

    if (data?.length > 0 && isEmailConfigured()) {
      after(async () => {
        try {
          await sendEmail({ to: email, ...welcomeEmail(), idempotencyKey: `welcome-${data[0].id}` });
        } catch (err) {
          console.error("[newsletter] welcome email failed:", err?.message ?? err);
        }
      });
    }
  } catch (err) {
    console.error("[newsletter] signup failed:", err?.message ?? err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
