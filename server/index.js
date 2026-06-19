import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import chatRouter from './routes/chat.js'
import guestbookRouter from './routes/guestbook.js'
import viewsRouter from './routes/views.js'
import metricsRouter from './routes/metrics.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

app.disable('x-powered-by')
app.use(express.json({ limit: '32kb' }))

// --- API ---
app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/chat', chatRouter)
app.use('/api/guestbook', guestbookRouter)
app.use('/api/views', viewsRouter)
app.use('/api/metrics', metricsRouter)

// --- Frontend estático (build de Vite) ---
const dist = path.join(__dirname, '..', 'dist')
app.use(express.static(dist))

// SPA fallback: cualquier ruta no-API cae en index.html
// (Express 5: no usar app.get('*'); un middleware final es lo correcto)
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Endpoint no encontrado.' })
  }
  res.sendFile(path.join(dist, 'index.html'))
})

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`[server] escuchando en http://0.0.0.0:${port}`)
})
