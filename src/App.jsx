import { useEffect, useRef } from 'react'
import { animate, stagger, createTimeline, onScroll, utils } from 'animejs'
import CommandPalette from './components/CommandPalette.jsx'
import Guestbook from './components/Guestbook.jsx'
import GitHubDashboard from './components/GitHubDashboard.jsx'
import VisitCounter from './components/VisitCounter.jsx'
import './App.css'
import './components/components.css'

const PROJECTS = [
  {
    title: 'Data Warehouse (Medallion)',
    tag: 'Data · BigQuery · GCP',
    desc: 'DWH en BigQuery con arquitectura medallion (bronze/silver/gold), orquestado con GCP Workflows, Cloud Run Jobs y Cloud Scheduler.',
  },
  {
    title: 'MCPs para consultar datos con IA',
    tag: 'AI · FastMCP · OAuth',
    desc: 'Servidores MCP que dejan consultar datos en tiempo real (COR, Finnegans, Notion, Bitrix, BigQuery) desde Claude/ChatGPT.',
  },
  {
    title: 'Simulador de Go-to-Market',
    tag: 'Full-stack · React · FastAPI',
    desc: 'Webapp data-driven que simula escenarios según datos del cliente. React+TS, FastAPI, Redis, Postgres, observabilidad y CI/CD, en VM con Docker Compose.',
  },
  {
    title: 'Scoring de colaboradores',
    tag: 'Data · Apache Airflow',
    desc: 'Pipeline orquestado con Airflow sobre fuentes heterogéneas. −80% en tiempos de ejecución; resultados en BigQuery y Power BI.',
  },
]

const TIMELINE = [
  {
    date: '2026',
    title: 'Desarrollador IA · Nodo de IA',
    org: 'Empresa de call-centers (BPO) — en paralelo a Market One',
    desc: 'IA aplicada al proceso productivo: detección de insights y generación de recomendaciones. Lidero algunas iniciativas.',
    tags: ['Python', 'GCP', 'BigQuery', 'Airflow'],
  },
  {
    date: '2026',
    title: 'Data Warehouse + MCPs',
    org: 'Market One',
    desc: 'DWH medallion en BigQuery y servidores MCP para consultar datos desde IA en tiempo real.',
    tags: ['BigQuery', 'Medallion', 'FastMCP', 'Workflows'],
  },
  {
    date: '2025',
    title: 'Data Engineer',
    org: 'Market One',
    desc: 'Pipelines, automatización y apps data-driven: scoring (Airflow), agentes RAG y webapps full-stack para Road To Market.',
    tags: ['Airflow', 'FastAPI', 'Docker', 'React'],
  },
  {
    date: '2024',
    title: 'Data Analyst',
    org: 'Market One',
    desc: 'Análisis para segmentación, pricing y go-to-market. Insights y tableros en Power BI.',
    tags: ['Python', 'Power BI', 'SQL'],
  },
  {
    date: '2023',
    title: 'Data Scientist & Machine Learning',
    org: 'CoderHouse · UTN',
    desc: 'Carrera de Data Scientist y Diplomatura en Machine Learning.',
    tags: ['ML', 'Python'],
  },
  {
    date: '2022',
    title: 'Ingeniero Industrial',
    org: 'UTN — promedio 8.80',
    desc: 'Título de grado e inicio de la transición hacia la ingeniería de datos.',
    tags: [],
  },
]

// Divide un texto en <span> por caracter para animarlos con stagger
function SplitText({ text, className }) {
  return (
    <span className={className} aria-label={text}>
      {text.split('').map((ch, i) => (
        <span className="char" key={i} aria-hidden="true">
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </span>
  )
}

export default function App() {
  const heroRef = useRef(null)
  const blobsRef = useRef(null)
  const timelineRef = useRef(null)

  useEffect(() => {
    // Respetar usuarios que prefieren menos movimiento
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      // Sin animación: mostramos todo en su estado final (si no, quedaría invisible).
      utils.$('.reveal, .card, .tl-item').forEach((el) => (el.style.opacity = 1))
      utils.$('.tl-dot').forEach((el) => (el.style.transform = 'scale(1)'))
      utils.$('.tl-line').forEach((el) => (el.style.transform = 'scaleY(1)'))
      return
    }

    // --- Timeline de entrada del hero ---
    const tl = createTimeline({ defaults: { ease: 'outExpo' } })
    tl.add('.hero .char', {
      y: [80, 0],
      opacity: [0, 1],
      rotateZ: [10, 0],
      duration: 900,
      delay: stagger(35),
    })
      .add(
        '.hero .subtitle',
        { opacity: [0, 1], y: [20, 0], duration: 800 },
        '-=400',
      )
      .add(
        '.hero .cta',
        { opacity: [0, 1], scale: [0.8, 1], duration: 600 },
        '-=500',
      )

    // --- Blobs de fondo flotando en loop infinito ---
    const blobs = blobsRef.current.querySelectorAll('.blob')
    blobs.forEach((blob, i) => {
      animate(blob, {
        x: () => utils.random(-120, 120),
        y: () => utils.random(-120, 120),
        scale: () => utils.random(0.8, 1.4),
        duration: () => utils.random(4000, 8000),
        delay: i * 300,
        ease: 'inOutSine',
        loop: true,
        alternate: true,
      })
    })

    // --- Parallax del hero siguiendo el mouse ---
    const onMove = (e) => {
      const cx = (e.clientX / window.innerWidth - 0.5) * 2
      const cy = (e.clientY / window.innerHeight - 0.5) * 2
      animate('.hero-inner', {
        x: cx * 18,
        y: cy * 18,
        duration: 1200,
        ease: 'out(3)',
      })
      animate(blobs, {
        x: cx * 60,
        y: cy * 60,
        duration: 1600,
        ease: 'out(2)',
      })
    }
    window.addEventListener('mousemove', onMove)

    // --- Reveals al hacer scroll (onScroll de anime.js v4) ---
    utils.$('.reveal').forEach((el) => {
      animate(el, {
        y: [60, 0],
        opacity: [0, 1],
        duration: 1000,
        ease: 'outExpo',
        autoplay: onScroll({ target: el, enter: 'bottom-=100 top' }),
      })
    })

    // Cards de proyectos con stagger al entrar en viewport
    animate('.card', {
      y: [80, 0],
      opacity: [0, 1],
      duration: 900,
      delay: stagger(120),
      ease: 'outExpo',
      autoplay: onScroll({ target: '.cards', enter: 'bottom-=120 top' }),
    })

    // --- Timeline (Trayectoria): la línea se "dibuja" y los items+dots entran al scrollear ---
    const tlEl = timelineRef.current
    if (tlEl) {
      const enter = 'bottom-=80 top'
      animate(tlEl.querySelector('.tl-line'), {
        scaleY: [0, 1],
        duration: 1000,
        ease: 'inOutQuad',
        autoplay: onScroll({ target: tlEl, enter }),
      })
      animate(tlEl.querySelectorAll('.tl-item'), {
        opacity: [0, 1],
        x: [40, 0],
        duration: 700,
        delay: stagger(110),
        ease: 'outExpo',
        autoplay: onScroll({ target: tlEl, enter }),
      })
      animate(tlEl.querySelectorAll('.tl-dot'), {
        scale: [0, 1],
        duration: 480,
        delay: stagger(110, { start: 150 }),
        ease: 'outBack',
        autoplay: onScroll({ target: tlEl, enter }),
      })
    }

    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <main>
      <section className="hero" ref={heroRef}>
        <div className="blobs" ref={blobsRef} aria-hidden="true">
          <span className="blob b1" />
          <span className="blob b2" />
          <span className="blob b3" />
        </div>

        <div className="hero-inner">
          <h1>
            <SplitText text="Hola, soy Juan Pablo" className="line" />
          </h1>
          <p className="subtitle">
            Ingeniero Industrial &amp; Data Engineer · convierto datos en pipelines,
            automatizaciones y decisiones.
          </p>
          <a className="cta" href="#proyectos">
            Ver proyectos ↓
          </a>
        </div>
        <div className="scroll-hint" aria-hidden="true">scroll</div>
      </section>

      <section className="about reveal">
        <h2>Sobre mí</h2>
        <p>
          Soy Juan Pablo Manzano. Transformo datos en soluciones estratégicas: diseño
          pipelines escalables (Python, SQL, Apache Airflow, N8N), automatizo y orquesto
          procesos, y los despliego en GCP. Me muevo entre la ingeniería industrial y la de
          datos, con foco en eficiencia y decisiones basadas en datos.
        </p>
        <p>
          Detalle nerd: este mismo sitio corre en Cloud Run y escala a cero cuando nadie lo mira.
        </p>
      </section>

      <section id="trayectoria" className="timeline-section">
        <h2 className="reveal">Trayectoria</h2>
        <div className="timeline" ref={timelineRef}>
          <span className="tl-line" aria-hidden="true" />
          {TIMELINE.map((t, i) => (
            <div className="tl-item" key={i}>
              <span className="tl-dot" aria-hidden="true" />
              <div className="tl-card">
                <span className="tl-date">{t.date}</span>
                <h3 className="tl-title">{t.title}</h3>
                <span className="tl-org">{t.org}</span>
                <p className="tl-desc">{t.desc}</p>
                {t.tags.length > 0 && (
                  <div className="tl-tags">
                    {t.tags.map((tag) => (
                      <span className="tl-tag" key={tag}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="proyectos" className="projects">
        <h2 className="reveal">Proyectos</h2>
        <div className="cards">
          {PROJECTS.map((p) => (
            <article className="card" key={p.title}>
              <span className="card-tag">{p.tag}</span>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="github reveal">
        <h2>Actividad en GitHub</h2>
        <p className="section-lead">Snapshot diario de mi actividad real en GitHub.</p>
        <GitHubDashboard />
      </section>

      <section className="guestbook-section reveal">
        <h2>Libro de visitas</h2>
        <p className="section-lead">Dejá tu firma — se guarda en Firestore.</p>
        <Guestbook />
      </section>

      <footer className="reveal">
        <p>Hecho con React + anime.js v4 · desplegado en GCP Cloud Run</p>
        <p className="footer-stats">
          <VisitCounter />
        </p>
      </footer>

      <CommandPalette />
    </main>
  )
}
