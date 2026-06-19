import { Component } from 'react'
import { A2UIViewer } from '@a2ui/react'

// Si el JSON que generó la LLM es inválido, no rompemos el chat: caemos al texto.
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
 * Renderiza una "surface" A2UI generada por el agente.
 * ui = { root, components, data }
 */
export default function A2UISurface({ ui, fallback = null }) {
  if (!ui || !ui.root || !Array.isArray(ui.components)) return fallback

  return (
    <A2UIBoundary fallback={fallback}>
      <div className="a2ui-surface">
        <A2UIViewer root={ui.root} components={ui.components} data={ui.data || {}} />
      </div>
    </A2UIBoundary>
  )
}
