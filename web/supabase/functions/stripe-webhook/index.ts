// VANTCALL — Webhook de Stripe → activa planes en Supabase
// Eventos: checkout.session.completed, checkout.session.async_payment_succeeded, charge.refunded
// La firma se verifica con el secreto guardado en Supabase Vault (nombre: stripe_webhook_secret).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});

let cachedSecret: string | null = null;
async function webhookSecret(): Promise<string> {
  if (cachedSecret) return cachedSecret;
  const { data, error } = await admin.rpc("get_stripe_webhook_secret");
  if (error || !data) throw new Error("webhook secret not configured");
  cachedSecret = data as string;
  return cachedSecret;
}

const enc = new TextEncoder();
function hex(buf: ArrayBuffer) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
async function verify(body: string, header: string | null, secret: string) {
  if (!header) return false;
  const parts = header.split(",").map((p) => p.split("="));
  const t = parts.find(([k]) => k === "t")?.[1];
  const sigs = parts.filter(([k]) => k === "v1").map(([, v]) => v);
  if (!t || !sigs.length) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false;
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const expected = hex(await crypto.subtle.sign("HMAC", key, enc.encode(`${t}.${body}`)));
  return sigs.some((s) => safeEqual(s, expected));
}

const json = (status: number, obj: unknown) =>
  new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method !== "POST") return json(405, { error: "method not allowed" });
  const body = await req.text();
  let secret: string;
  try { secret = await webhookSecret(); } catch (e) { console.error(e); return json(500, { error: "not configured" }); }
  if (!(await verify(body, req.headers.get("stripe-signature"), secret))) return json(400, { error: "invalid signature" });

  const event = JSON.parse(body);
  const handled = ["checkout.session.completed", "checkout.session.async_payment_succeeded", "charge.refunded"];
  if (!handled.includes(event.type)) return json(200, { received: true, ignored: event.type });

  const { data, error } = await admin.rpc("process_stripe_event", { evt: event });
  if (error) {
    console.error("process_stripe_event", error);
    return json(500, { error: "processing failed" }); // Stripe reintentará
  }
  return json(200, { received: true, result: data });
});
