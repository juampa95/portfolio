import { useEffect, useRef } from 'react'
import { animate, stagger, createTimeline, onScroll, utils } from 'animejs'
import Chatbot from './components/Chatbot.jsx'
import Guestbook from './components/Guestbook.jsx'
import GitHubDashboard from './components/GitHubDashboard.jsx'
import VisitCounter from './components/VisitCounter.jsx'
import './App.css'
import './components/components.css'

const PROJECTS = [
  { title: 'Proyecto Uno', tag: 'Web · WebGL', desc: 'Experimento visual con shaders y scroll.' },
  { title: 'Proyecto Dos', tag: 'API · Cloud Run', desc: 'Backend serverless escalando a cero.' },
  { title: 'Proyecto Tres', tag: 'UI · Motion', desc: 'Microinteracciones con anime.js v4.' },
  { title: 'Proyecto Cuatro', tag: 'Data · Viz', desc: 'Dashboard animado en tiempo real.' },
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

  useEffect(() => {
    // Respetar usuarios que prefieren menos movimiento
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

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
            <SplitText text="Hola, soy JP" className="line" />
          </h1>
          <p className="subtitle">
            Desarrollador · construyo cosas raras y animadas en la web.
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
          Experimento con motion, WebGL y arquitecturas serverless. Este sitio
          corre en Cloud Run y escala a cero cuando nadie lo mira.
        </p>
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
        <p className="section-lead">Stats y repos en vivo desde la GitHub API.</p>
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

      <Chatbot />
    </main>
  )
}
