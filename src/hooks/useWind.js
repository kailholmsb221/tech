import { useEffect, useRef } from 'react'

// Наклон телефона превращается в «ветер» для падающих листьев.
// На Android работает сразу; на iOS без разрешения просто дует лёгкий бриз.
export function useWind() {
  const wind = useRef(0)
  useEffect(() => {
    const onTilt = (e) => {
      if (typeof e.gamma === 'number') wind.current = Math.max(-1.6, Math.min(1.6, e.gamma / 22))
    }
    window.addEventListener('deviceorientation', onTilt)
    return () => window.removeEventListener('deviceorientation', onTilt)
  }, [])
  return wind
}
