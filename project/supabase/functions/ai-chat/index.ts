import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SYSTEM_PROMPT = `Ты — AI-ассистент FlowDesk, умный помощник для мастеров красоты и владельцев салонов. Ты помогаешь пользователям с:

- Управлением записями и клиентами в приложении FlowDesk
- Советами по развитию бизнеса в сфере красоты
- Вопросами о расписании, ценообразовании, услугах
- Работой с аналитикой и отчётами
- Общими вопросами о маркетинге и продвижении салона
- Советами по работе с клиентами и улучшению сервиса

FlowDesk имеет следующие разделы:
- Дашборд: общая статистика и ближайшие записи
- Клиенты: база клиентов с историей посещений
- Запись на приём: управление расписанием
- Услуги: прайс-лист и длительность процедур
- Аналитика: выручка, лучшие клиенты, популярные услуги
- Профиль: личные данные и настройки
- Подписка: управление тарифом

Отвечай на русском языке, кратко и по делу. Будь дружелюбным и профессиональным. Если вопрос не связан с красотой или бизнесом — мягко переведи тему.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const ok = (data: unknown) =>
    new Response(JSON.stringify(data), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  const err = (msg: string, status = 400) =>
    new Response(JSON.stringify({ error: msg }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) return err("messages required");

    const apiKey = Deno.env.get("GROQ_API_KEY");
    if (!apiKey) return err("AI не настроен. Добавьте GROQ_API_KEY в настройки.", 500);

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        max_tokens: 1024,
        temperature: 0.7,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          })),
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error("Groq error:", body);
      return err("Ошибка AI-сервиса", 500);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "";
    return ok({ reply });
  } catch (e) {
    console.error(e);
    return err(String(e), 500);
  }
});
