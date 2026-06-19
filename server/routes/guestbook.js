import { Router } from 'express'
import { addGuestbookEntry, getGuestbookEntries } from '../store.js'

const router = Router()

router.get('/', async (req, res) => {
  try {
    res.json({ entries: await getGuestbookEntries() })
  } catch (e) {
    console.error('[guestbook:get]', e.message)
    res.status(500).json({ error: 'No pude leer el libro de visitas.' })
  }
})

router.post('/', async (req, res) => {
  const { name, message } = req.body || {}

  if (!name || !message) {
    return res.status(400).json({ error: 'Faltan "name" y/o "message".' })
  }

  const clean = {
    name: String(name).trim().slice(0, 40),
    message: String(message).trim().slice(0, 280),
  }
  if (!clean.name || !clean.message) {
    return res.status(400).json({ error: 'Nombre y mensaje no pueden estar vacíos.' })
  }

  try {
    const entry = await addGuestbookEntry(clean)
    res.status(201).json({ entry })
  } catch (e) {
    console.error('[guestbook:post]', e.message)
    res.status(500).json({ error: 'No pude guardar tu mensaje.' })
  }
})

export default router
