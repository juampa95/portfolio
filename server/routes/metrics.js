import { Router } from 'express'
import { getMetrics } from '../store.js'

const router = Router()

// Cache en memoria: las métricas cambian 1 vez al día, no hace falta pegarle
// a Firestore en cada request.
const TTL = 5 * 60 * 1000
let cache = { data: null, ts: 0 }

router.get('/', async (req, res) => {
  if (cache.data && Date.now() - cache.ts < TTL) return res.json(cache.data)
  try {
    const data = await getMetrics()
    cache = { data, ts: Date.now() }
    res.json(data)
  } catch (e) {
    console.error('[metrics]', e.message)
    if (cache.data) return res.json(cache.data)
    res.status(502).json({ error: 'No pude leer las métricas.' })
  }
})

export default router
