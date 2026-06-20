import { useEffect } from 'react'
import { animate, onScroll, utils } from 'animejs'
import CommandPalette from './components/CommandPalette.jsx'
import Guestbook from './components/Guestbook.jsx'
import GitHubDashboard from './components/GitHubDashboard.jsx'
import VisitCounter from './components/VisitCounter.jsx'
import Trajectory from './components/Trajectory.jsx'
import Hero from './components/Hero.jsx'
import './App.css'
import './components/components.css'

export default function App() {
  useEffect(() => {
    // Respetar usuarios que prefieren menos movimiento
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      // Sin animación: mostramos todo en su estado final (si no, quedaría invisible).
      utils.$('.reveal').forEach((el) => (el.style.opacity = 1))
      return
    }

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
  }, [])

  return (
    <main>
      <Hero />

      <section className="about reveal">
        <h2>Sobre mí</h2>
        <p>
          Ingeniero Industrial y Data Engineer enfocado en transformar datos en soluciones
          estratégicas. Optimizo, automatizo y orquesto procesos con Python, SQL, Apache Airflow
          y N8N, y diseño pipelines de datos escalables que mejoran la eficiencia operativa y
          habilitan decisiones basadas en datos.
        </p>
        <p>
          Me destaco por mi <strong>enfoque autodidacta</strong>, la proactividad y la capacidad
          de adaptarme a entornos dinámicos: identifico y resuelvo problemas complejos de forma
          creativa, y disfruto los desafíos que me empujan a seguir aprendiendo y aplicando
          tecnologías de vanguardia.
        </p>
        <p>
          Detalle nerd: este mismo sitio corre en Cloud Run y escala a cero cuando nadie lo mira.
        </p>
      </section>

      <section id="trayectoria" className="trajectory-section">
        <h2 className="reveal">Trayectoria</h2>
        <p className="section-lead reveal">
          Roles y proyectos en paralelo. Tocá una card para ver el detalle.
        </p>
        <Trajectory />
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
