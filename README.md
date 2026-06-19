# Portfolio

Portfolio personal — Vite 7 + React 18 + [anime.js](https://animejs.com/) v4 en el frontend,
y un backend Node/Express con APIs reales, todo en un solo contenedor desplegado en
**GCP Cloud Run** (free tier, escala a cero).

## Features (lo que aprovecha tener un servidor real)

- 🤖 **Chatbot IA con UI generativa (A2UI)** (`/api/chat`) — usa **Gemini** (free tier) y, vía el
  protocolo open-source [A2UI](https://a2ui.org/) de Google, la LLM **genera UI nativa** (tarjetas y
  un mini bar chart `SparkBars`) en vez de solo texto. La API key vive solo en el backend.
- 🐙 **Dashboard de métricas de GitHub** (`/api/metrics`) — los datos los genera una **GitHub Action
  diaria** que lee GitHub (incl. repos privados/orgs), **anonimiza** lo privado y guarda un snapshot en
  **Firestore**. El runtime NUNCA toca la API de GitHub ni expone tokens. Heatmap, totales, donut de
  lenguajes y actividad por organización, en SVG animado. Ver [`docs/metrics-pipeline.md`](docs/metrics-pipeline.md).
- 📒 **Libro de visitas** (`/api/guestbook`) — mensajes persistidos en **Firestore**.
- 👁️ **Contador de visitas** (`/api/views`) — counter persistente en Firestore, animado.

> Sin credenciales (ej: Docker local), las visitas y el guestbook usan un **fallback en memoria**
> así el contenedor corre igual. En Cloud Run detecta el entorno (`K_SERVICE`) y usa Firestore solo.

## Requisitos

- Node 22 LTS (vía `nvm use 22`)
- Docker (para build de la imagen)
- gcloud CLI (para deploy)

## Variables de entorno

Copiá `.env.example` y completá lo que uses:

| Variable | Para qué | Default |
|---|---|---|
| `GEMINI_API_KEY` | Chatbot. Key gratis en [AI Studio](https://aistudio.google.com/apikey) | — (chatbot degrada) |
| `GEMINI_MODEL` | Modelo de Gemini | `gemini-2.5-flash` |
| `FIRESTORE_ENABLED` | Forzar Firestore en local | auto en Cloud Run |

> Las métricas de GitHub NO se configuran acá: las genera la GitHub Action.
> Ver [`docs/metrics-pipeline.md`](docs/metrics-pipeline.md).

## Desarrollo local

Frontend (hot-reload) y backend en dos terminales:

```bash
npm install
npm run dev:server   # backend Node en :8080
npm run dev          # frontend Vite en :5173 (proxya /api → :8080)
```

## Docker (mismo artefacto que producción)

Imagen multi-stage: compila el frontend con Node 22 y un Node/Express sirve el estático + las APIs en el puerto **8080**.

```bash
docker build -t portfolio .
docker run --rm -p 8080:8080 \
  -e GEMINI_API_KEY=tu_key \
  portfolio                              # http://localhost:8080

# Sin Firestore, las métricas usan el fixture de ejemplo (server/sample-metrics.js).
```

## Deploy a Cloud Run

> Requiere `gcloud auth login`, un proyecto con billing (Blaze) activo, y la API de Firestore habilitada.

```bash
export PROJECT_ID=tu-proyecto
export REGION=us-central1            # región con free tier (us-central1/us-east1/us-west1)
export SERVICE=portfolio

gcloud config set project $PROJECT_ID

# Habilitar APIs necesarias (una vez)
gcloud services enable run.googleapis.com firestore.googleapis.com

# Crear la base Firestore (una vez, modo nativo)
gcloud firestore databases create --location=$REGION

# Deploy: Cloud Build compila el Dockerfile en la nube
gcloud run deploy $SERVICE \
  --source . \
  --region $REGION \
  --allow-unauthenticated \
  --min-instances=0 \
  --max-instances=2 \
  --memory=512Mi \
  --port=8080 \
  --set-env-vars="GEMINI_API_KEY=tu_key"
```

`--min-instances=0` → escala a cero cuando no hay tráfico → costo ~$0 dentro del free tier.

El service account de Cloud Run necesita rol **Cloud Datastore User** para leer/escribir en Firestore
(suele venir por defecto; si falla, agregalo en IAM).

Para que el dashboard tenga datos reales, configurá el pipeline de métricas:
[`docs/metrics-pipeline.md`](docs/metrics-pipeline.md).
