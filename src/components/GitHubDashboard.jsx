import { useEffect, useState } from 'react'
import { animate, stagger, onScroll } from 'animejs'
import AnimatedNumber from './AnimatedNumber.jsx'

// ---------- Heatmap de contribuciones (SVG) ----------
const CELL = 11
const GAP = 3
const LEVEL_COLORS = ['#1c1c26', '#0e4429', '#006d32', '#26a641', '#39d353']

function Heatmap({ heatmap }) {
  useEffect(() => {
    animate('.hm-cell', {
      opacity: [0, 1],
      scale: [0.3, 1],
      duration: 500,
      delay: stagger(4, { grid: [heatmap.weeks.length, 7], from: 'first' }),
      ease: 'outExpo',
      autoplay: onScroll({ target: '.hm-svg', enter: 'bottom-=40 top' }),
    })
  }, [heatmap])

  const width = heatmap.weeks.length * (CELL + GAP)
  const height = 7 * (CELL + GAP)

  return (
    <div className="gh-block">
      <div className="gh-block-head">
        <h4>Contribuciones</h4>
        <span className="gh-block-total">
          <AnimatedNumber value={heatmap.total} /> en el último año
        </span>
      </div>
      <div className="hm-scroll">
        <svg className="hm-svg" width={width} height={height} role="img" aria-label="Heatmap de contribuciones">
          {heatmap.weeks.map((week, wi) =>
            week.days.map((day, di) => (
              <rect
                key={`${wi}-${di}`}
                className="hm-cell"
                x={wi * (CELL + GAP)}
                y={di * (CELL + GAP)}
                width={CELL}
                height={CELL}
                rx={2}
                fill={LEVEL_COLORS[day.level]}
              >
                <title>{`${day.date}: ${day.count} contribuciones`}</title>
              </rect>
            )),
          )}
        </svg>
      </div>
    </div>
  )
}

// ---------- Donut de lenguajes (SVG) ----------
const R = 56
const CIRC = 2 * Math.PI * R

function LanguageDonut({ languages }) {
  useEffect(() => {
    animate('.donut-seg', {
      strokeDashoffset: [CIRC, (el) => el.getAttribute('data-offset')],
      opacity: [0, 1],
      duration: 1100,
      delay: stagger(120),
      ease: 'outExpo',
      autoplay: onScroll({ target: '.donut', enter: 'bottom-=40 top' }),
    })
    animate('.lang-row', {
      opacity: [0, 1],
      x: [-15, 0],
      duration: 500,
      delay: stagger(80),
      autoplay: onScroll({ target: '.lang-legend', enter: 'bottom-=40 top' }),
    })
  }, [languages])

  let acc = 0
  const segments = languages.map((l) => {
    const len = (l.percentage / 100) * CIRC
    const seg = { ...l, len, rotate: (acc / 100) * 360 - 90 }
    acc += l.percentage
    return seg
  })

  return (
    <div className="gh-block">
      <div className="gh-block-head">
        <h4>Lenguajes</h4>
      </div>
      <div className="donut-wrap">
        <svg className="donut" width={150} height={150} viewBox="0 0 150 150">
          <g>
            {segments.map((s) => (
              <circle
                key={s.language}
                className="donut-seg"
                cx={75}
                cy={75}
                r={R}
                fill="none"
                stroke={s.color || '#888'}
                strokeWidth={16}
                strokeDasharray={`${s.len} ${CIRC}`}
                strokeDashoffset={0}
                data-offset={0}
                transform={`rotate(${s.rotate} 75 75)`}
              />
            ))}
          </g>
        </svg>
        <ul className="lang-legend">
          {languages.map((l) => (
            <li className="lang-row" key={l.language}>
              <span className="lang-dot" style={{ background: l.color || '#888' }} />
              {l.language} <em>{l.percentage}%</em>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ---------- Stat cards ----------
function StatCards({ summary }) {
  const items = [
    { label: 'Commits', value: summary.commits },
    { label: 'Pull requests', value: summary.prs },
    { label: 'Reviews', value: summary.reviews },
    { label: 'Issues', value: summary.issues },
    { label: 'Repos', value: summary.repositories },
    { label: 'Orgs', value: summary.organizations },
  ]
  return (
    <div className="stat-cards">
      {items.map((it) => (
        <div className="stat-card" key={it.label}>
          <strong><AnimatedNumber value={it.value} /></strong>
          <span>{it.label}</span>
        </div>
      ))}
    </div>
  )
}

// ---------- Actividad por organización ----------
function Organizations({ organizations }) {
  const max = Math.max(...organizations.map((o) => o.commits), 1)
  useEffect(() => {
    animate('.org-bar-fill', {
      width: [(el) => '0px', (el) => el.getAttribute('data-w')],
      duration: 1000,
      delay: stagger(100),
      ease: 'outExpo',
      autoplay: onScroll({ target: '.org-list', enter: 'bottom-=40 top' }),
    })
  }, [organizations])

  return (
    <div className="gh-block">
      <div className="gh-block-head">
        <h4>Actividad por organización</h4>
      </div>
      <ul className="org-list">
        {organizations.map((o) => (
          <li className="org-row" key={o.name}>
            <span className="org-name">{o.name}</span>
            <span className="org-bar">
              <span className="org-bar-fill" data-w={`${(o.commits / max) * 100}%`} />
            </span>
            <span className="org-count">{o.commits}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ---------- Repos públicos destacados ----------
function TopRepos({ repositories }) {
  const repos = repositories.filter((r) => !r.private).slice(0, 6)
  const privateCount = repositories.filter((r) => r.private).length

  useEffect(() => {
    animate('.gh-card', {
      opacity: [0, 1],
      y: [40, 0],
      duration: 700,
      delay: stagger(80),
      ease: 'outExpo',
      autoplay: onScroll({ target: '.gh-grid', enter: 'bottom-=80 top' }),
    })
  }, [repositories])

  return (
    <div className="gh-block">
      <div className="gh-block-head">
        <h4>Repos públicos destacados</h4>
        {privateCount > 0 && (
          <span className="gh-block-total">+{privateCount} privados (anónimos)</span>
        )}
      </div>
      <div className="gh-grid">
        {repos.map((r) => (
          <div className="gh-card" key={r.name}>
            <h4>{r.name}</h4>
            <div className="gh-meta">
              <span>{r.commits} commits</span>
              <span>{r.prs} PRs</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------- Dashboard ----------
export default function GitHubDashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/metrics')
      .then((r) => r.json())
      .then((d) => (d.error ? setError(true) : setData(d)))
      .catch(() => setError(true))
  }, [])

  if (error) return <p className="gh-error">No se pudieron cargar las métricas.</p>
  if (!data) return <p className="gh-error">Cargando…</p>

  return (
    <div className="gh-dashboard">
      {data.sample && (
        <p className="gh-sample-note">⚠️ Datos de ejemplo — la GitHub Action todavía no generó métricas reales.</p>
      )}
      <StatCards summary={data.summary} />
      <div className="gh-row">
        <Heatmap heatmap={data.heatmap} />
        <LanguageDonut languages={data.languages} />
      </div>
      <div className="gh-row gh-row-even">
        <Organizations organizations={data.organizations} />
        <TopRepos repositories={data.repositories} />
      </div>
    </div>
  )
}
