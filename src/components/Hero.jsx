import { useEffect, useRef } from 'react'
import { stagger, createTimeline } from 'animejs'

// Cualidades de cada faceta (se revelan al scrollear).
const ENG_TRAITS = [
  'Pipelines escalables',
  'Automatización & orquestación',
  'Arquitectura de datos',
  'Cloud · GCP',
  'Rigor & eficiencia',
]
const CRE_TRAITS = [
  'Resolución creativa',
  'Enfoque autodidacta',
  'Adaptabilidad',
  'Visión de negocio',
  'Curiosidad incansable',
]

// Divide un texto en <span> por caracter para animarlos con stagger.
function SplitText({ text }) {
  return (
    <span aria-label={text}>
      {text.split('').map((ch, i) => (
        <span className="char" key={i} aria-hidden="true">
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </span>
  )
}

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
// Progreso local dentro de un tramo [a,b] del progreso global p.
const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1)
const lerp = (a, b, t) => a + (b - a) * t
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export default function Hero() {
  const wrapRef = useRef(null)
  const stageRef = useRef(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const small = window.innerWidth < 760
    const wrap = wrapRef.current
    const stage = stageRef.current

    const els = {
      text: stage.querySelector('.hero-text'),
      face: stage.querySelector('.hero-face'),
      eng: stage.querySelector('.face-eng'),
      cre: stage.querySelector('.face-cre'),
      div: stage.querySelector('.face-divider'),
      tEng: stage.querySelector('.hero-traits-eng'),
      tCre: stage.querySelector('.hero-traits-cre'),
      hint: stage.querySelector('.scroll-hint'),
      bgEng: stage.querySelector('.bg-eng'),
      bgCre: stage.querySelector('.bg-cre'),
    }

    // Coreografía ligada al scroll: p ∈ [0,1] sobre la altura de la sección.
    function apply(p) {
      const vw = window.innerWidth
      const ACT2 = 0.5 // punto donde arranca el viaje hacia la izquierda
      const a1 = easeInOut(seg(p, 0.05, 0.4)) // acto 1: se separa y se pega a la derecha (más lento)
      const tr = easeInOut(seg(p, ACT2, 0.92)) // acto 2: viaja der→izq y se transforma

      // La cara arranca a la derecha (CSS left:72%) y se mueve hasta pegar el CORTE
      // (su centro) al borde de la pantalla:
      //   acto 1 → centro a 100vw  ⇒ la mitad ingenieril (izquierda) queda flush al borde derecho
      //   acto 2 → centro a 0      ⇒ la mitad creativa (derecha) queda flush al borde izquierdo
      // En fracción de viewport respecto del 72% base: derecha = +0.28vw, izquierda = −0.72vw.
      const fx = (p < ACT2 ? lerp(0, 0.28, a1) : lerp(0.28, -0.72, tr)) * vw
      els.face.style.setProperty('--fx', `${fx}px`)
      els.face.style.setProperty('--fs', `${1 + 0.05 * a1}`)

      // Mitad creativa (derecha): se va por el borde derecho en el acto 1, reaparece en el 2.
      els.cre.style.opacity = `${p < ACT2 ? 1 - seg(p, 0.05, 0.32) : seg(p, 0.56, 0.74)}`

      // Mitad ingenieril (izquierda): visible desde el inicio, cede en el acto 2.
      els.eng.style.opacity = `${1 - seg(p, 0.58, 0.74)}`

      // Divisoria central: solo mientras el círculo está "entero".
      els.div.style.opacity = `${p < ACT2 ? 1 - seg(p, 0.05, 0.32) : 0}`

      // Cualidades: ingeniería en acto 1 (queda más rato), creatividad en acto 2.
      els.tEng.style.opacity = `${clamp(seg(p, 0.2, 0.36) - seg(p, 0.5, 0.62), 0, 1)}`
      els.tEng.style.setProperty('--tx', `${lerp(-28, 0, seg(p, 0.2, 0.36))}px`)
      els.tCre.style.opacity = `${seg(p, 0.68, 0.88)}`
      els.tCre.style.setProperty('--tx', `${lerp(28, 0, seg(p, 0.68, 0.88))}px`)

      // Texto del nombre: se retira del todo al arrancar la historia.
      els.text.style.opacity = `${1 - seg(p, 0.04, 0.22)}`
      els.text.style.setProperty('--ty', `${lerp(0, -30, seg(p, 0.04, 0.22))}px`)
      els.hint.style.opacity = `${1 - seg(p, 0, 0.08)}`

      // Fondo de 2 facetas: crossfade ingeniería→creatividad + paneo con el scroll.
      els.bgEng.style.opacity = `${1 - seg(p, 0.45, 0.72)}`
      els.bgCre.style.opacity = `${seg(p, 0.4, 0.72)}`
      els.bgEng.style.setProperty('--gx', `${p * -120}px`)
      els.bgEng.style.setProperty('--gy', `${p * 60}px`)
      els.bgEng.style.setProperty('--bx', `${p * -50}px`)
      els.bgCre.style.setProperty('--bx', `${(1 - p) * 50}px`)
    }

    // Sin movimiento (preferencia del usuario o pantalla chica): layout estático.
    if (reduce || small) {
      wrap.classList.add('is-static')
      apply(0)
      els.tEng.style.opacity = '1'
      els.tCre.style.opacity = '1'
      els.tEng.style.removeProperty('--tx')
      els.tCre.style.removeProperty('--tx')
      return
    }

    // Entrada del nombre + blobs de fondo.
    const tl = createTimeline({ defaults: { ease: 'outExpo' } })
    tl.add('.hero-name .char', {
      y: [60, 0],
      opacity: [0, 1],
      rotateZ: [8, 0],
      duration: 800,
      delay: stagger(28),
    })
      .add('.hero-eyebrow', { opacity: [0, 1], y: [12, 0], duration: 500 }, 0)
      .add('.hero-role', { opacity: [0, 1], y: [16, 0], duration: 600 }, '-=350')
      .add('.hero-phrase', { opacity: [0, 1], y: [16, 0], duration: 600 }, '-=450')
      .add('.hero-cta', { opacity: [0, 1], duration: 500 }, '-=400')

    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const total = wrap.offsetHeight - window.innerHeight
        const p = clamp(-wrap.getBoundingClientRect().top / total, 0, 1)
        apply(p)
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <section className="hero-scroll" ref={wrapRef}>
      <div className="hero-stage" ref={stageRef}>
        <div className="hero-bg" aria-hidden="true">
          <div className="bg-layer bg-eng" />
          <div className="bg-layer bg-cre" />
        </div>

        <div className="hero-text">
          <p className="hero-eyebrow">Hola, soy</p>
          <h1 className="hero-name">
            <SplitText text="Juan Pablo Manzano" />
          </h1>
          <p className="hero-role">Data Engineer · Ingeniero Industrial</p>
          <p className="hero-phrase">
            Mitad ingeniería, mitad creatividad: convierto datos en pipelines,
            automatizaciones y decisiones.
          </p>
          <a className="hero-cta" href="#trayectoria">
            Ver trayectoria ↓
          </a>
        </div>

        {/* Placeholder: círculo partido al medio (izq ingeniería / der creatividad).
            Reemplazar por la imagen de la cara dividida cuando esté. */}
        <div className="hero-face" aria-hidden="true">
          <span className="face-half face-eng" />
          <span className="face-half face-cre" />
          <span className="face-divider" />
        </div>

        <ul className="hero-traits hero-traits-eng" aria-hidden="true">
          <li className="traits-label">Ingeniería &amp; desarrollo</li>
          {ENG_TRAITS.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <ul className="hero-traits hero-traits-cre" aria-hidden="true">
          <li className="traits-label">Creatividad &amp; resolución</li>
          {CRE_TRAITS.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>

        <div className="scroll-hint" aria-hidden="true">
          scroll ↓
        </div>
      </div>
    </section>
  )
}
