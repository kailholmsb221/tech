import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Icon } from './Icons.jsx'

// На компьютере: просим открыть на телефоне (QR-код), но даём посмотреть и здесь.
export default function DesktopGate({ onOpen }) {
  const [qr, setQr] = useState('')

  useEffect(() => {
    QRCode.toDataURL(window.location.href, {
      margin: 1,
      width: 440,
      errorCorrectionLevel: 'M',
      color: { dark: '#1F3B34', light: '#F7F3E8' },
    })
      .then(setQr)
      .catch(() => setQr(''))
  }, [])

  return (
    <main className="gate">
      <div className="gate-inner">
        <h1 className="gate-title chalk">
          Бұл ашықхат<br />
          телефонға арналған
        </h1>
        <p className="gate-text">Телефон камерасын кодқа бағыттаңыз — ашықхат сонда анимациямен және жапырақ түсуімен ашылады.</p>
        <div className="qr-card">
          {qr ? <img src={qr} width="220" height="220" alt="Ашықхатқа сілтемесі бар QR-код" /> : <div className="qr-ph" />}
        </div>
        <button type="button" className="btn ghost" onClick={onOpen}>
          <Icon name="phone" />
          Осы жерден көру
        </button>
      </div>
    </main>
  )
}
