import { useEffect, useState } from 'react'
import { animate, stagger } from 'animejs'

export default function Guestbook() {
  const [entries, setEntries] = useState([])
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  async function load() {
    try {
      const r = await fetch('/api/guestbook')
      const data = await r.json()
      setEntries(data.entries || [])
    } catch {
      /* noop */
    }
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (entries.length) {
      animate('.gb-entry', {
        opacity: [0, 1],
        x: [-20, 0],
        duration: 500,
        delay: stagger(60),
        ease: 'outExpo',
      })
    }
  }, [entries])

  async function submit(e) {
    e.preventDefault()
    if (!name.trim() || !message.trim() || sending) return
    setSending(true)
    try {
      const r = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, message }),
      })
      if (r.ok) {
        setName('')
        setMessage('')
        await load()
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="guestbook">
      <form className="gb-form" onSubmit={submit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
          maxLength={40}
        />
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Dejá un mensaje…"
          maxLength={280}
        />
        <button type="submit" disabled={sending}>
          {sending ? 'Enviando…' : 'Firmar'}
        </button>
      </form>

      <ul className="gb-list">
        {entries.length === 0 && <li className="gb-empty">Sé el primero en firmar 👋</li>}
        {entries.map((e, i) => (
          <li className="gb-entry" key={i}>
            <strong>{e.name}</strong>
            <span>{e.message}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
