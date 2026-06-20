import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { animate, stagger, onScroll, utils } from 'animejs'
import { TRACKS, TRAYECTORIA } from '../../content/trayectoria.js'

// Trayectoria sobre un EJE DE AÑOS compartido: todas las pistas (carriles) se alinean
// al mismo año. Cada card es un botón; al tocarla, el panel de la derecha muestra el detalle.
export default function Trajectory() {
  const [selectedId, setSelectedId] = useState(TRAYECTORIA[0].id)
  const gridRef = useRef(null)
  const detailRef = useRef(null)

  // Años presentes, del más reciente al más antiguo → filas del eje.
  const years = useMemo(
    () =>
      [...new Set(TRAYECTORIA.map((e) => e.start.slice(0, 4)))].sort((a, b) =>
        a < b ? 1 : -1,
      ),
    [],
  )

  // Encabezados agrupados: pistas consecutivas con el mismo `group` se unen bajo un
  // título grande (ej. "Market One" sobre sus dos ramas). Las pistas sin grupo van solas.
  const groups = useMemo(() => {
    const out = []
    for (const t of TRACKS) {
      const last = out[out.length - 1]
      if (t.group && last && last.group === t.group) {
        last.span += 1
      } else {
        out.push({
          key: t.group || t.id,
          group: t.group || null,
          label: t.group || t.label,
          accent: t.group ? null : t.accent,
          span: 1,
        })
      }
    }
    return out
  }, [])

  // Items de una (año, pista), ordenados dentro del año del más reciente al más antiguo.
  const itemsFor = (year, trackId) =>
    TRAYECTORIA.filter(
      (e) => e.start.slice(0, 4) === year && e.track === trackId,
    ).sort((a, b) => (a.start < b.start ? 1 : -1))

  const selected = TRAYECTORIA.find((e) => e.id === selectedId)

  function select(id) {
    setSelectedId(id)
    if (window.innerWidth < 980 && detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }

  // --- Animaciones de entrada (al scrollear) ---
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const grid = gridRef.current
    if (reduce || !grid) {
      utils.$('.tj-node').forEach((el) => (el.style.opacity = 1))
      utils.$('.tj-rail, .tj-axis').forEach((el) => (el.style.transform = 'scaleY(1)'))
      return
    }
    const enter = 'bottom-=80 top'
    animate(grid.querySelectorAll('.tj-rail, .tj-axis'), {
      scaleY: [0, 1],
      duration: 1000,
      ease: 'inOutQuad',
      autoplay: onScroll({ target: grid, enter }),
    })
    animate(grid.querySelectorAll('.tj-node'), {
      opacity: [0, 1],
      y: [26, 0],
      duration: 600,
      delay: stagger(55),
      ease: 'outExpo',
      autoplay: onScroll({ target: grid, enter }),
    })
  }, [])

  // --- Fade del panel al cambiar de selección ---
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || !detailRef.current) return
    animate(detailRef.current.querySelector('.tj-detail-inner'), {
      opacity: [0, 1],
      y: [12, 0],
      duration: 420,
      ease: 'outExpo',
    })
  }, [selectedId])

  // Columnas: gutter de años + una por pista.
  const cols = `clamp(54px, 7vw, 88px) repeat(${TRACKS.length}, minmax(0, 1fr))`

  return (
    <div className="trajectory">
      <div className="tj-main">
        {/* Encabezados: título grande por grupo + sublabel por pista, alineados a las columnas */}
        <div className="tj-heads" style={{ gridTemplateColumns: cols }}>
          <span className="tj-heads-spacer" aria-hidden="true" />
          {groups.map((g) => (
            <span
              className={`tj-group-head${g.group ? ' is-group' : ''}`}
              key={g.key}
              style={{
                gridColumn: `span ${g.span}`,
                '--track-accent': g.accent || 'var(--text, #e8e8f0)',
              }}
            >
              {g.label}
            </span>
          ))}
          <span className="tj-heads-spacer" aria-hidden="true" />
          {TRACKS.map((t) => (
            <span
              className="tj-sub-head"
              key={t.id}
              style={{ '--track-accent': t.accent }}
            >
              {t.group ? t.label : ''}
            </span>
          ))}
        </div>

        <div className="tj-grid" ref={gridRef} style={{ gridTemplateColumns: cols }}>
          {/* Eje temporal (gutter de años) + rieles de cada pista, detrás de las cards */}
          <span className="tj-axis" aria-hidden="true" style={{ gridColumn: 1, gridRow: '1 / -1' }} />
          {TRACKS.map((t, j) => (
            <span
              key={'rail-' + t.id}
              className="tj-rail"
              aria-hidden="true"
              style={{ gridColumn: j + 2, gridRow: '1 / -1', '--track-accent': t.accent }}
            />
          ))}

          {years.map((year, i) => (
            <Fragment key={year}>
              <div className="tj-year" style={{ gridColumn: 1, gridRow: i + 1 }}>
                <span className="tj-year-num">{year}</span>
              </div>
              {TRACKS.map((t, j) => (
                <div
                  className="tj-cell"
                  key={t.id}
                  style={{ gridColumn: j + 2, gridRow: i + 1, '--track-accent': t.accent }}
                >
                  {itemsFor(year, t.id).map((e) => (
                    <button
                      type="button"
                      key={e.id}
                      className={`tj-node${selectedId === e.id ? ' is-active' : ''}`}
                      onClick={() => select(e.id)}
                      aria-pressed={selectedId === e.id}
                    >
                      <span className="tj-dot" aria-hidden="true" />
                      <span className="tj-period">
                        {e.period}
                        {e.current && <span className="tj-live" aria-hidden="true" />}
                      </span>
                      <span className="tj-node-title">{e.title}</span>
                      <span className="tj-node-org">{e.org}</span>
                    </button>
                  ))}
                </div>
              ))}
            </Fragment>
          ))}
        </div>
      </div>

      <aside className="tj-detail" ref={detailRef} aria-live="polite">
        {selected && (
          <div className="tj-detail-inner">
            <span className="tj-detail-period">
              {selected.period}
              {selected.note && <em> · {selected.note}</em>}
            </span>
            <h3 className="tj-detail-title">{selected.title}</h3>
            <span className="tj-detail-org">{selected.org}</span>
            <p className="tj-detail-desc">{selected.detail}</p>
            {selected.stack.length > 0 && (
              <div className="tj-detail-stack">
                {selected.stack.map((s) => (
                  <span className="tj-chip" key={s}>
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  )
}
