import { Component, useMemo } from 'react'
import { A2uiSurface } from '@a2ui/react/v0_9'
import { MessageProcessor } from '@a2ui/web_core/v0_9'
import { catalog } from '../a2ui-setup.js'

// Si el surface generado por la LLM es inválido, no rompemos el chat: caemos al texto.
class A2UIBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    if (this.state.failed) return this.props.fallback ?? null
    return this.props.children
  }
}

/**
 * Renderiza una surface A2UI v0.9 a partir de la lista de mensajes que devuelve
 * el servidor: [{createSurface}, {updateComponents}]. La procesamos con un
 * MessageProcessor (con nuestro catálogo) y montamos el SurfaceModel resultante.
 */
export default function A2UISurface({ messages, fallback = null }) {
  const surface = useMemo(() => {
    if (!Array.isArray(messages) || messages.length === 0) return null
    try {
      const proc = new MessageProcessor([catalog])
      proc.processMessages(messages)
      const created = messages.find((m) => m && m.createSurface)
      const id = created?.createSurface?.surfaceId
      return id ? proc.model.getSurface(id) : null
    } catch (e) {
      console.error('[A2UISurface]', e.message)
      return null
    }
  }, [messages])

  if (!surface) return fallback

  return (
    <A2UIBoundary fallback={fallback}>
      <div className="a2ui-surface">
        <A2uiSurface surface={surface} />
      </div>
    </A2UIBoundary>
  )
}
