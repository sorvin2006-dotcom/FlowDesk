# FlowDesk — Управление салоном

## Деплой на GitHub Pages (бесплатно, работает в РФ без VPN)

### 1. Загрузить проект на GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ТВОЙ_ЛОГИН/flowdesk.git
git push -u origin main
```

### 2. Включить GitHub Pages

1. Зайти в репозиторий → **Settings** → **Pages**
2. Source: **GitHub Actions**
3. При пуше в `main` сайт автоматически деплоится

### 3. Добавить секреты Supabase в GitHub

Repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Имя секрета | Значение |
|---|---|
| `VITE_SUPABASE_URL` | URL из Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Anon key из Supabase Dashboard → Settings → API |

После этого при каждом пуше в `main` сайт будет автоматически собираться и деплоиться на:
`https://ТВОЙ_ЛОГИН.github.io/flowdesk/`

### 4. Подключить свой домен (необязательно)

GitHub Pages поддерживает кастомные домены бесплатно:
- Settings → Pages → Custom domain → ввести домен
- У DNS-провайдера добавить A-записи на IP GitHub Pages

### Локальная разработка

```bash
npm install
cp .env.example .env  # заполнить ключами Supabase
npm run dev
```
