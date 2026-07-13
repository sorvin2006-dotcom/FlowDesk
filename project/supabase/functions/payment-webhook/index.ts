import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const body = await req.json().catch(() => ({}));

    const event = body.event;
    const payment = body.object;
    if (!payment || event !== "payment.succeeded") {
      return new Response("OK", { status: 200 });
    }

    const paymentId = payment.id;
    const userId = payment.metadata?.user_id;
    const paymentNo = payment.metadata?.payment_no || payment.id;
    const amount = payment.amount?.value || "490";

    if (!userId) {
      return new Response("OK", { status: 200 });
    }

    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    await adminClient.from("profiles").update({
      subscription_status: "active",
      subscription_ends_at: periodEnd.toISOString(),
      payment_id: paymentId,
    }).eq("user_id", userId);

    await adminClient.from("subscriptions").upsert({
      user_id: userId,
      payment_id: paymentNo,
      amount: Math.round(parseFloat(amount)),
      status: "succeeded",
      period_start: now.toISOString(),
      period_end: periodEnd.toISOString(),
    }, { onConflict: "payment_id" });

    return new Response("OK", { status: 200 });
  } catch (e) {
    console.error(e);
    return new Response("ERROR", { status: 500 });
  }
});
