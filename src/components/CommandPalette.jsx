import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import A2UISurface from './A2UISurface.jsx'

const SUGGESTIONS = [
  '¿Qué lenguajes usás?',
  'Mostrame tu actividad en GitHub',
  '¿Cuál es tu stack de backend?',
  '¿Cómo te contacto?',
]

// Frases que van rotando mientras el modelo arma la respuesta + los gráficos.
const LOADING_MSGS = [
  'Analizando los datos…',
  'Dibujando los gráficos…',
  'Armando la respuesta…',
  'Ya casi…',
]

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [sel, setSel] = useState(0)
  const [loadMsg, setLoadMsg] = useState(0)

  const panelRef = useRef(null)
  const inputRef = useRef(null)
  const resultsRef = useRef(null)

  // Abrir/cerrar con ⌘K (o Ctrl+K) y cerrar con Esc.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      } else if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Al abrir: animar entrada + foco en el input.
  useEffect(() => {
    if (open) {
      setSel(0)
      requestAnimationFrame(() => {
        inputRef.current?.focus()
        if (panelRef.current) {
          animate(panelRef.current, {
            opacity: [0, 1],
            y: [-12, 0],
            scale: [0.97, 1],
            duration: 280,
            ease: 'outExpo',
          })
        }
      })
    }
  }, [open])

  // Autoscroll de resultados.
  useEffect(() => {
    if (resultsRef.current) resultsRef.current.scrollTop = resultsRef.current.scrollHeight
  }, [messages, loading])

  // Mientras carga, vamos rotando la frase del loader.
  useEffect(() => {
    if (!loading) {
      setLoadMsg(0)
      return
    }
    const id = setInterval(() => setLoadMsg((i) => (i + 1) % LOADING_MSGS.length), 1500)
    return () => clearInterval(id)
  }, [loading])

  const showSuggestions = input.trim() === ''

  async function send(text) {
    const q = (text ?? input).trim()
    if (!q || loading) return

    const history = messages.map((m) => ({ role: m.role, text: m.text }))
    setMessages((m) => [...m, { role: 'user', text: q }])
    setInput('')
    setLoading(true)

    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q, history }),
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

  function onInputKeyDown(e) {
    if (e.key === 'ArrowDown' && showSuggestions) {
      e.preventDefault()
      setSel((s) => (s + 1) % SUGGESTIONS.length)
    } else if (e.key === 'ArrowUp' && showSuggestions) {
      e.preventDefault()
      setSel((s) => (s - 1 + SUGGESTIONS.length) % SUGGESTIONS.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (showSuggestions) send(SUGGESTIONS[sel])
      else send()
    }
  }

  return (
    <>
      {/* Trigger persistente (⌘K no es descubrible solo) */}
      <button className="cmdk-trigger" onClick={() => setOpen(true)} aria-label="Abrir asistente">
        <span className="cmdk-spark">✦</span>
        Preguntame algo
        <kbd className="cmdk-kbd">⌘K</kbd>
      </button>

      {open && (
        <div className="cmdk-overlay" onMouseDown={() => setOpen(false)}>
          <div
            className="cmdk-panel"
            ref={panelRef}
            role="dialog"
            aria-label="Asistente IA"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="cmdk-inputrow">
              <span className="cmdk-prompt">✦</span>
              <input
                ref={inputRef}
                className="cmdk-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder="Preguntame sobre JP, su stack, proyectos…"
                maxLength={1000}
              />
              <kbd className="cmdk-esc">esc</kbd>
            </div>

            {(messages.length > 0 || loading) && (
              <div className="cmdk-results" ref={resultsRef}>
                {messages.map((m, i) => (
                  <div key={i} className={`cmdk-msg ${m.role}`}>
                    {m.role === 'user' ? (
                      <span className="cmdk-q">› {m.text}</span>
                    ) : (
                      <div className="cmdk-a">
                        <p>{m.text}</p>
                        {m.ui && <A2UISurface messages={m.ui} />}
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="cmdk-msg model">
                    <div className="cmdk-loader">
                      <div className="cmdk-loader-bars" aria-hidden="true">
                        <span /><span /><span /><span /><span />
                      </div>
                      <span className="cmdk-loader-text" key={loadMsg}>
                        {LOADING_MSGS[loadMsg]}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {showSuggestions && (
              <ul className="cmdk-suggestions">
                <li className="cmdk-hint">Sugerencias</li>
                {SUGGESTIONS.map((s, i) => (
                  <li
                    key={s}
                    className={`cmdk-sg ${i === sel ? 'active' : ''}`}
                    onMouseEnter={() => setSel(i)}
                    onClick={() => send(s)}
                  >
                    <span className="cmdk-sg-arrow">›</span> {s}
                  </li>
                ))}
              </ul>
            )}

            <div className="cmdk-foot">
              <span><kbd>↑</kbd><kbd>↓</kbd> navegar</span>
              <span><kbd>⏎</kbd> preguntar</span>
              <span><kbd>esc</kbd> cerrar</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
