import { Router } from 'express'
import { incrementViews, getViews } from '../store.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    res.json({ count: await getViews() })
  } catch (e) {
    console.error('[views:get]', e.message)
    res.status(500).json({ error: 'No pude leer las visitas.' })
  }
})

router.post('/', async (req, res) => {
  try {
    res.json({ count: await incrementViews() })
  } catch (e) {
    console.error('[views:post]', e.message)
    res.status(500).json({ error: 'No pude registrar la visita.' })
  }
})

export default router
