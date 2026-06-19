# ---------- Stage 1: build del frontend ----------
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Stage 2: runtime (Node sirve estático + API) ----------
FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

# Solo dependencias de producción (sin vite ni plugins de build)
COPY package*.json ./
RUN npm ci --omit=dev

# Server, contenido (perfil del chatbot) y build estático
COPY server ./server
COPY content ./content
COPY --from=build /app/dist ./dist

EXPOSE 8080

CMD ["node", "server/index.js"]
