import { useEffect, useRef } from 'react'
import { animate, onScroll } from 'animejs'

// Cuenta desde 0 hasta `value` cuando entra en viewport.
export default function AnimatedNumber({ value = 0, duration = 1400, format = true }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    const obj = { v: 0 }
    animate(obj, {
      v: value,
      duration,
      ease: 'outExpo',
      modifier: Math.round,
      autoplay: onScroll({ target: ref.current, enter: 'bottom-=40 top' }),
      onUpdate: () => {
        if (ref.current) {
          const n = Math.round(obj.v)
          ref.current.textContent = format ? n.toLocaleString('es') : String(n)
        }
      },
    })
  }, [value, duration, format])

  return <span ref={ref}>0</span>
}
