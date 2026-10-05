import { useEffect, useState } from 'react'
import Card from './components/Card.jsx'
import DesktopGate from './components/DesktopGate.jsx'
import RotateHint from './components/RotateHint.jsx'
import { Icon } from './components/Icons.jsx'

// Компьютер = есть мышь и широкий экран. Планшеты и телефоны сразу видят открытку.
const DESKTOP = '(hover: hover) and (pointer: fine) and (min-width: 700px)'

export default function App() {
  const [desktop, setDesktop] = useState(() => window.matchMedia(DESKTOP).matches)
  const [peek, setPeek] = useState(false)

  useEffect(() => {
    const m = window.matchMedia(DESKTOP)
    const on = () => setDesktop(m.matches)
    m.addEventListener?.('change', on)
    return () => m.removeEventListener?.('change', on)
  }, [])

  if (!desktop) {
    return (
      <>
        <Card />
        <RotateHint />
      </>
    )
  }

  if (!peek) return <DesktopGate onOpen={() => setPeek(true)} />

  return (
    <div className="phone-stage">
      <div className="phone">
        <Card />
      </div>
      <button type="button" className="btn ghost" onClick={() => setPeek(false)}>
        <Icon name="phone" />
        Телефоннан ашу
      </button>
    </div>
  )
}
