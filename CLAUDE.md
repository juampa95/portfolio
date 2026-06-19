# Portfolio — instrucciones del proyecto

## Regla crítica: TODO se ejecuta en Docker, nunca en la PC del usuario

**Nunca** corras la app, los tests, builds ni scripts directamente en la máquina del
usuario (`npm run dev`, `npm start`, `node ...`, etc. en el host). Siempre dentro de
**Docker**, porque el entorno de producción es Cloud Run (contenedor) y lo que "funciona
en mi PC" después falla en prod. El objetivo es paridad dev ↔ prod.

- Levantar / probar la app → `docker compose up` (o `docker build` + `docker run`).
- Correr scripts puntuales / tests → dentro de un contenedor (`docker run ... node ...`),
  no en el host.
- Si hace falta un navegador para verificar el frontend (render, consola), usá un
  contenedor con navegador headless (p. ej. imagen de Playwright), no el host.
- Cargá secrets vía `--env-file .env` o variables de entorno del contenedor, no asumas
  que `.env` se lee solo.

## Stack

- Frontend: React 19 + Vite, animaciones con anime.js, UI generada por IA con A2UI (`@a2ui/react`).
- Backend: Express 5 (`server/`), sirve el build de `dist` + API en `/api/*`.
- Chatbot: Gemini (`@google/genai`), genera surfaces A2UI (ver `server/routes/chat.js`).
- Persistencia: Firestore en Cloud Run; fallback en memoria + fixture de métricas en local.
- Métricas de GitHub: generadas por una GitHub Action y leídas desde Firestore (ver `docs/metrics-pipeline.md`).
