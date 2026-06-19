import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import A2UISurface from './A2UISurface.jsx'

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'model', text: '¡Hola! Soy el asistente de JP. Preguntame lo que quieras sobre su trabajo 🤖' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const panelRef = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    if (open && panelRef.current) {
      animate(panelRef.current, {
        opacity: [0, 1],
        y: [20, 0],
        scale: [0.96, 1],
        duration: 350,
        ease: 'outExpo',
      })
    }
  }, [open])

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, loading])

  async function send(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    const history = messages.map((m) => ({ role: m.role, text: m.text }))
    setMessages((m) => [...m, { role: 'user', text }])
    setInput('')
    setLoading(true)

    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      })
      const data = await r.json()
      setMessages((m) => [
        ...m,
        { role: 'model', text: data.reply || data.error || 'Error.', ui: data.ui || null },
      ])
    } catch {
      setMessages((m) => [...m, { role: 'model', text: 'No pude conectar. Probá de nuevo.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chatbot">
      {open && (
        <div className="chat-panel" ref={panelRef}>
          <header className="chat-head">
            <span>Asistente IA</span>
            <button onClick={() => setOpen(false)} aria-label="Cerrar">×</button>
          </header>
          <div className="chat-list" ref={listRef}>
            {messages.map((m, i) => (
              <div key={i} className={`bubble ${m.role}`}>
                {m.text}
                {m.ui && <A2UISurface ui={m.ui} />}
              </div>
            ))}
            {loading && <div className="bubble model typing">···</div>}
          </div>
          <form className="chat-form" onSubmit={send}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribí un mensaje…"
              maxLength={1000}
            />
            <button type="submit" disabled={loading}>➤</button>
          </form>
        </div>
      )}
      <button className="chat-fab" onClick={() => setOpen((o) => !o)} aria-label="Abrir chat">
        {open ? '×' : '💬'}
      </button>
    </div>
  )
}
