# FlowDesk — инструкция по установке

Полное руководство по запуску проекта на своём сервере.

---

## Что нужно

1. **Аккаунт Supabase** (бесплатно) — https://supabase.com
2. **Node.js** версии 18 или выше — https://nodejs.org
3. **GitHub** — для хранения кода
4. **Vercel** (или Netlify) — для бесплатного хостинга сайта

---

## Шаг 1. Создать проект на Supabase

1. Зайдите на https://supabase.com и зарегистрируйтесь
2. Нажмите **New Project**
3. Заполните:
   - **Name** — `flowdesk` (или любое)
   - **Database Password** — придумайте пароль и сохраните
   - **Region** — выберите ближайший к вам
4. Нажмите **Create new project**
5. **Подождите 2-3 минуты** — проект создаётся

---

## Шаг 2. Создать таблицы в базе

1. В вашем проекте Supabase слева нажмите **SQL Editor**
2. Нажмите **New query**
3. Откройте файл `supabase/schema.sql` из этого проекта
4. Скопируйте **всё содержимое** и вставьте в SQL Editor
5. Нажмите **Run** (зелёная кнопка)
6. Дождитесь сообщения `Success`

После этого в базе появятся все таблицы: profiles, clients, services, appointments, subscriptions.

---

## Шаг 3. Получить ключи Supabase

1. Слева нажмите **Settings** (шестерёнка внизу)
2. Выберите **API**
3. Скопируйте два значения:

| Поле | Куда вставить в .env |
|---|---|
| **Project URL** | `VITE_SUPABASE_URL` |
| **anon public** | `VITE_SUPABASE_ANON_KEY` |

---

## Шаг 4. Настроить приложение

1. Скопируйте `.env.example` в `.env`:
   ```
   cp .env.example .env
   ```

2. Откройте `.env` и вставьте ваши значения:
   ```
   VITE_SUPABASE_URL=https://ваш-проект.supabase.co
   VITE_SUPABASE_ANON_KEY=ваш_anon_ключ
   ```

3. Установите зависимости:
   ```
   npm install
   ```

4. Запустите локально:
   ```
   npm run dev
   ```

5. Откройте http://localhost:5173 — приложение должно работать.

---

## Шаг 5. Развернуть Edge Functions

Edge Functions — это серверные функции (регистрация, AI-ассистент, платежи).

### 5.1. Установить Supabase CLI

```
npm install -g supabase
```

### 5.2. Войти в аккаунт

```
supabase login
```

### 5.3. Привязать проект

```
supabase link --project-ref ваш_project_ref
```

`project_ref` — это ID проекта. Найти: Supabase Dashboard → Settings → General → Reference ID.

### 5.4. Развернуть все функции

```
supabase functions deploy register
supabase functions deploy ai-chat
supabase functions deploy create-payment
supabase functions deploy payment-webhook
supabase functions deploy check-subscription
```

### 5.5. Добавить секреты (для AI и платежей)

Если хотите включить AI-ассистент и платежи:

```
supabase secrets set GROQ_API_KEY=ваш_ключ_groq
supabase secrets set YOOKASSA_SHOP_ID=ваш_shop_id
supabase secrets set YOOKASSA_SECRET_KEY=ваш_secret_key
```

Без этих ключей AI и платежи не работают, но остальное приложение работает нормально.

---

## Шаг 6. Деплой на Vercel

1. Залейте код на GitHub
2. Зайдите на https://vercel.com и зарегистрируйтесь
3. Нажмите **New Project** → выберите ваш репозиторий
4. В разделе **Environment Variables** добавьте:
   - `VITE_SUPABASE_URL` = ваш URL
   - `VITE_SUPABASE_ANON_KEY` = ваш anon ключ
5. Нажмите **Deploy**
6. Готово! Сайт доступен по адресу вида `flowdesk.vercel.app`

---

## Шаг 7. Настроить вебхук платежей (опционально)

Если используете ЮKassa:

1. Зарегистрируйтесь на https://yookassa.ru/
2. В настройках магазина добавьте URL вебхука:
   ```
   https://ваш-проект.supabase.co/functions/v1/payment-webhook
   ```
3. Выберите событие: **payment.succeeded**

---

## Возможные проблемы

### Сайт белый / не загружается
- Проверьте, что `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY` добавлены в Vercel → Settings → Environment Variables
- После изменения переменных нужно **пересобрать** проект (Redeploy)

### Регистрация не работает
- Убедитесь, что edge function `register` задеплоена: `supabase functions list`
- Проверьте, что таблицы созданы (Шаг 2)

### AI-ассистент не отвечает
- Добавьте `GROQ_API_KEY` в секреты (Шаг 5.5)
- Получите ключ: https://console.groq.com/keys

### Платежи не работают
- Добавьте `YOOKASSA_SHOP_ID` и `YOOKASSA_SECRET_KEY` в секреты
- Настройте вебхук (Шаг 7)

---

## Структура проекта

```
├── src/                    # Код приложения (React + TypeScript)
├── supabase/
│   ├── schema.sql          # SQL для создания базы (Шаг 2)
│   ├── migrations/         # История миграций
│   └── functions/          # Edge Functions (Шаг 5)
├── .env.example            # Пример настроек
└── package.json
```

---

## Контакты

Если возникли вопросы — обратитесь к продавцу проекта.
