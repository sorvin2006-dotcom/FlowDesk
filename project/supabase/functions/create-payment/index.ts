import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const AMOUNT = "490.00";
const CURRENCY = "RUB";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const ok = (data: unknown) =>
    new Response(JSON.stringify(data), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  const err = (msg: string, status = 400) =>
    new Response(JSON.stringify({ error: msg }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return err("Unauthorized", 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return err("Unauthorized", 401);

    const body = await req.json();
    const userId = body.user_id || user.id;
    const returnUrl = body.return_url || `${req.headers.get("origin") || ""}/subscription?payment=success`;

    const shopId = Deno.env.get("YOOKASSA_SHOP_ID");
    const secretKey = Deno.env.get("YOOKASSA_SECRET_KEY");

    if (!shopId || !secretKey) {
      return err("YooKassa not configured", 500);
    }

    // Unique payment number
    const paymentNo = `FD-${userId.replace(/-/g, "").slice(0, 10)}-${Date.now()}`;

    // Save pending record
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    await adminClient.from("subscriptions").insert({
      user_id: userId,
      payment_id: paymentNo,
      amount: 490,
      status: "pending",
    });
    await adminClient.from("profiles").update({ payment_id: paymentNo }).eq("user_id", userId);

    // Create YooKassa payment
    const yooResponse = await fetch("https://api.yookassa.ru/v3/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic " + btoa(`${shopId}:${secretKey}`),
        "Idempotence-Key": paymentNo,
      },
      body: JSON.stringify({
        amount: { value: AMOUNT, currency: CURRENCY },
        capture: true,
        confirmation: {
          type: "redirect",
          return_url: returnUrl,
        },
        description: "FlowDesk Pro — 1 месяц",
        metadata: {
          user_id: userId,
          payment_no: paymentNo,
        },
      }),
    });

    if (!yooResponse.ok) {
      const errorBody = await yooResponse.text();
      console.error("YooKassa error:", errorBody);
      return err("Ошибка создания платежа", 500);
    }

    const yooData = await yooResponse.json();

    return ok({
      payment_url: yooData.confirmation?.confirmation_url,
      payment_id: yooData.id,
    });
  } catch (e) {
    console.error(e);
    return err(String(e), 500);
  }
});
