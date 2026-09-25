import "server-only";
import { headers } from "next/headers";

// The client's IP for rate limiting — from a header the visitor can't forge.
//
// Any header a browser or script sends can be faked, so which one we believe
// depends on who sets it in front of us:
//   * Vercel (process.env.VERCEL): the platform overwrites x-vercel-forwarded-for
//     and x-real-ip with the real client address, discarding whatever the client
//     sent. x-forwarded-for is NOT trusted here.
//   * Anywhere else: x-real-ip if your reverse proxy sets it, otherwise the LAST
//     x-forwarded-for entry — the one appended by the proxy closest to us. The
//     leading entries are whatever the client claimed and are ignored.
//     (Running with no proxy at all, every header is client-controlled; that is
//     only acceptable for local development.)
export async function getClientIp() {
  const h = await headers();
  let ip;
  if (process.env.VERCEL) {
    ip = h.get("x-vercel-forwarded-for") || h.get("x-real-ip");
  } else {
    const forwarded = h.get("x-forwarded-for");
    ip = h.get("x-real-ip") || (forwarded ? forwarded.split(",").pop() : null);
  }
  return (ip || "unknown").trim().slice(0, 64);
}
