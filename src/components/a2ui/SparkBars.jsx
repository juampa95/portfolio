import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'

// Coerción defensiva: A2UI puede pasar valores literales o envueltos ({value}).
function num(v) {
  if (typeof v === 'number') return v
  if (v && typeof v === 'object') return Number(v.value ?? v.literalNumber ?? v.number ?? 0)
  return Number(v) || 0
}
function str(v) {
  if (typeof v === 'string') return v
  if (v && typeof v === 'object') return v.value ?? v.literalString ?? v.string ?? ''
  return v == null ? '' : String(v)
}
function arr(v) {
  if (Array.isArray(v)) return v
  if (v && typeof v === 'object' && Array.isArray(v.value)) return v.value
  return []
}

/**
 * Componente A2UI custom: mini bar chart en SVG, animado con anime.js.
 * El agente (Gemini) lo invoca así:
 *   { SparkBars: { values:[3,7,2], labels:["JS","TS","CSS"], color:"#6d5dfc", caption:"Lenguajes" } }
 */
export default function SparkBars({ node }) {
  const ref = useRef(null)

  // El nodo resuelto puede venir como node.SparkBars, node, o node.componentProperties
  const p = node?.SparkBars ?? node?.componentProperties ?? node ?? {}
  const values = arr(p.values ?? p.data).map(num)
  const labels = arr(p.labels).map(str)
  const color = str(p.color) || '#6d5dfc'
  const caption = str(p.caption)

  useEffect(() => {
    if (ref.current && values.length) {
      animate(ref.current.querySelectorAll('.spark-bar'), {
        scaleY: [0, 1],
        opacity: [0, 1],
        duration: 700,
        delay: stagger(60),
        ease: 'outExpo',
      })
    }
  }, [values.length])

  if (!values.length) return null
  const max = Math.max(...values, 1)

  return (
    <div className="sparkbars" ref={ref}>
      {caption && <div className="spark-caption">{caption}</div>}
      <div className="spark-row">
        {values.map((v, i) => (
          <div className="spark-col" key={i}>
            <div
              className="spark-bar"
              style={{ height: `${(v / max) * 100}%`, background: color }}
              title={`${labels[i] ?? ''}: ${v}`}
            />
            {labels[i] && <span className="spark-label">{labels[i]}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
