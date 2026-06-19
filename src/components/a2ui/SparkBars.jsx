import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'
import { z } from 'zod'

/**
 * Componente A2UI custom (protocolo v0.9): mini bar chart en SVG/divs,
 * animado con anime.js. Se registra en el catálogo vía
 * createComponentImplementation(SparkBarsApi, SparkBars).
 *
 * En v0.9 el componente recibe { props, buildChild, context } con las props
 * YA resueltas a literales por el GenericBinder, según este schema:
 */
export const SparkBarsApi = {
  name: 'SparkBars',
  schema: z.object({
    weight: z.number().optional(),
    values: z.array(z.number()).describe('Valores de cada barra (p.ej. porcentajes o conteos).'),
    labels: z.array(z.string()).optional().describe('Etiqueta debajo de cada barra.'),
    color: z.string().optional().describe('Color de las barras (hex).'),
    caption: z.string().optional().describe('Título corto arriba del chart.'),
  }),
}

export default function SparkBars({ props }) {
  const ref = useRef(null)

  const values = Array.isArray(props?.values) ? props.values.map(Number) : []
  const labels = Array.isArray(props?.labels) ? props.labels.map(String) : []
  const color = props?.color || '#6d5dfc'
  const caption = props?.caption || ''

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
            <div className="spark-val">{v}</div>
            <div className="spark-track">
              <div
                className="spark-bar"
                style={{ height: `${(v / max) * 100}%`, background: color }}
                title={`${labels[i] ?? ''}: ${v}`}
              />
            </div>
            {labels[i] && <span className="spark-label">{labels[i]}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
