
# Uberclone Platform Starter (Expo RN + Supabase + Next.js Dashboard + Render)

Kant-en-klaar. Vul je `.env` files, installeer dependencies en start.
- `mobile/` – Expo React Native app (rider + driver in 1 app).
- `dashboard/` – Next.js 14 ops-dashboard.
- `supabase/` – SQL schema/policies/views/functions.
- `worker/` – (optioneel) Cloudflare/Render worker voor matching.
- `render.yaml` – blueprint om `dashboard` als webservice te deployen op Render.

## Snelstart
1) Maak een Supabase project. Kopieer je URL + anon/service keys.
2) Run SQL:
   - Open Supabase SQL editor en voer **schema.sql**, **policies.sql**, **views.sql**, **functions.sql** uit (die volgorde).
3) Mobile app
   ```bash
   cd mobile
   npm install
   npx expo start
   ```
4) Dashboard (lokaal)
   ```bash
   cd dashboard
   npm install
   npm run dev
   ```
5) Render deploy (dashboard)
   - Koppel repo of upload zip, zorg dat `render.yaml` in de root staat.
   - Zet env vars zoals in `dashboard/.env.example`.

## Env variabelen
- `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_MAPBOX_TOKEN` (of gebruik MapLibre zonder token)
- Dashboard: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE`, `NEXT_PUBLIC_MAPBOX_TOKEN`

## Opmerking
Deze starter gebruikt Mapbox richting-API hooks **optioneel**. Voor volledig open-source kun je MapLibre (default) + eigen OSRM/tileserver gebruiken; zie comments in code.
