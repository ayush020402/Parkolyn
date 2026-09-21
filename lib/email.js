// Transactional email via Resend's REST API (no SDK needed).
//
// Env:
//   RESEND_API_KEY     — from https://resend.com/api-keys
//   EMAIL_FROM         — e.g. "Parkolyn Amsterdam <orders@parkolyn.com>". The
//                        domain must be verified in Resend to email customers.
//                        Falls back to Resend's sandbox sender, which can only
//                        deliver to the Resend account owner's own address.
//   ORDER_ALERT_EMAIL  — where new-order alerts and contact messages go (you).

const FROM_FALLBACK = "Parkolyn Amsterdam <onboarding@resend.dev>";

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

export function getOwnerEmail() {
  return process.env.ORDER_ALERT_EMAIL || null;
}

// Every user-supplied value that ends up in an HTML email goes through this.
export function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
const formatRupees = (n) => inr.format(n);

// `idempotencyKey` makes retries safe: Resend returns the original result
// instead of sending the same email twice (keys live for 24h).
export async function sendEmail({ to, subject, html, text, replyTo, idempotencyKey }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Email is not configured — set RESEND_API_KEY in .env.local.");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || FROM_FALLBACK,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend responded ${res.status}: ${detail.slice(0, 300)}`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Templates. Inline styles only — email clients ignore <style> and classes.
// ---------------------------------------------------------------------------

function layout(title, bodyHtml) {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f4efe6;font-family:Georgia,'Times New Roman',serif;color:#1c1a17;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4efe6;padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;padding:32px;">
        <tr><td style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#96742a;">Parkolyn Amsterdam</td></tr>
        <tr><td style="font-size:24px;padding:12px 0 20px;">${esc(title)}</td></tr>
        <tr><td style="font-size:15px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">${bodyHtml}</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function itemsTable(items, amountPaise) {
  const rows = items
    .map(
      (i) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;">${esc(i.name)} × ${esc(i.qty)}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${formatRupees(i.price * i.qty)}</td>
      </tr>`
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;font-size:14px;">
    ${rows}
    <tr>
      <td style="padding:12px 0 0;font-weight:bold;">Total</td>
      <td style="padding:12px 0 0;text-align:right;font-weight:bold;">${formatRupees(amountPaise / 100)}</td>
    </tr>
  </table>`;
}

const addressHtml = (a) => esc(a).replace(/\n/g, "<br>");
const itemsText = (items) => items.map((i) => `- ${i.name} x ${i.qty}: ${formatRupees(i.price * i.qty)}`).join("\n");

export function orderConfirmationEmail(order) {
  const firstName = String(order.customer_name).trim().split(/\s+/)[0];
  return {
    subject: `Your Parkolyn Amsterdam order ${order.order_ref} is confirmed`,
    html: layout(
      "Thank you — payment received",
      `<p>Hi ${esc(firstName)},</p>
       <p>We've received your payment for order <strong>${esc(order.order_ref)}</strong>. Our team will reach out shortly to confirm shipping as your fragrance completes production.</p>
       ${itemsTable(order.items, order.amount_paise)}
       <p style="margin:20px 0 4px;font-weight:bold;">Shipping to</p>
       <p style="margin:0;">${esc(order.customer_name)}<br>${addressHtml(order.shipping_address)}<br>${esc(order.customer_phone)}</p>
       <p style="margin-top:24px;">Questions? Just reply to this email.</p>`
    ),
    text: `Hi ${firstName},

We've received your payment for order ${order.order_ref}. Our team will reach out shortly to confirm shipping as your fragrance completes production.

${itemsText(order.items)}
Total: ${formatRupees(order.amount_paise / 100)}

Shipping to:
${order.customer_name}
${order.shipping_address}
${order.customer_phone}

Questions? Just reply to this email.`,
  };
}

export function newOrderAlertEmail(order) {
  return {
    subject: `New order ${order.order_ref} — ${formatRupees(order.amount_paise / 100)}`,
    html: layout(
      "New paid order",
      `<p><strong>${esc(order.order_ref)}</strong> · Razorpay payment <code>${esc(order.razorpay_payment_id)}</code></p>
       ${itemsTable(order.items, order.amount_paise)}
       <p style="margin:20px 0 4px;font-weight:bold;">Customer</p>
       <p style="margin:0;">${esc(order.customer_name)}<br>
         <a href="mailto:${esc(order.customer_email)}">${esc(order.customer_email)}</a><br>
         ${esc(order.customer_phone)}</p>
       <p style="margin:20px 0 4px;font-weight:bold;">Shipping address</p>
       <p style="margin:0;">${addressHtml(order.shipping_address)}</p>
       ${order.notes ? `<p style="margin:20px 0 4px;font-weight:bold;">Order notes</p><p style="margin:0;">${addressHtml(order.notes)}</p>` : ""}`
    ),
    text: `New paid order ${order.order_ref} (Razorpay payment ${order.razorpay_payment_id})

${itemsText(order.items)}
Total: ${formatRupees(order.amount_paise / 100)}

Customer: ${order.customer_name}
Email: ${order.customer_email}
Phone: ${order.customer_phone}

Shipping address:
${order.shipping_address}
${order.notes ? `\nOrder notes:\n${order.notes}\n` : ""}`,
  };
}

export function contactMessageEmail({ name, email, message }) {
  return {
    subject: `Website message from ${name}`,
    html: layout(
      "New contact message",
      `<p><strong>${esc(name)}</strong> · <a href="mailto:${esc(email)}">${esc(email)}</a></p>
       <p style="white-space:pre-wrap;">${esc(message)}</p>
       <p style="color:#888;font-size:13px;">Reply directly to this email to respond.</p>`
    ),
    text: `Message from ${name} <${email}>\n\n${message}`,
  };
}

export function welcomeEmail() {
  return {
    subject: "You're on the list — Parkolyn Amsterdam",
    html: layout(
      "You're on the list",
      `<p>Thank you for joining Parkolyn Amsterdam. We'll send you production updates and early access as soon as the debut fragrance collection ships.</p>
       <p style="color:#888;font-size:13px;">Didn't sign up? Just ignore this email — you won't hear from us again.</p>`
    ),
    text: "Thank you for joining Parkolyn Amsterdam. We'll send you production updates and early access as soon as the debut fragrance collection ships.\n\nDidn't sign up? Just ignore this email — you won't hear from us again.",
  };
}
