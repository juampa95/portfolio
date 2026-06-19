// Inicializa el catálogo de A2UI una vez al arrancar la app.
// Registra los componentes estándar + nuestros componentes custom (charts).
import { initializeDefaultCatalog, ComponentRegistry } from '@a2ui/react'
import { injectStyles } from '@a2ui/react/styles'
import SparkBars from './components/a2ui/SparkBars.jsx'

let done = false

export function setupA2UI() {
  if (done) return
  done = true
  injectStyles() // estilos estructurales de A2UI (inyecta un <style> en el head)
  initializeDefaultCatalog()
  ComponentRegistry.getInstance().register('SparkBars', { component: SparkBars })
}
