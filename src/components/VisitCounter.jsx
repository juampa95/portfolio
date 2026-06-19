import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'

export default function VisitCounter() {
  const [count, setCount] = useState(null)
  const numRef = useRef(null)

  useEffect(() => {
    // Registra esta visita (POST) y muestra el total
    fetch('/api/views', { method: 'POST' })
      .then((r) => r.json())
      .then((data) => setCount(data.count ?? 0))
      .catch(() => setCount(null))
  }, [])

  useEffect(() => {
    if (count != null && numRef.current) {
      const obj = { v: 0 }
      animate(obj, {
        v: count,
        duration: 1500,
        ease: 'outExpo',
        modifier: Math.round,
        onUpdate: () => {
          if (numRef.current) numRef.current.textContent = Math.round(obj.v).toLocaleString('es')
        },
      })
    }
  }, [count])

  if (count == null) return null

  return (
    <span className="visit-counter">
      <span ref={numRef}>0</span> visitas
    </span>
  )
}
