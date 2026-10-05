import { useEffect, useRef, useState } from 'react'
import { Icon } from './Icons.jsx'
import { DEFAULTS, LIMITS, buildLink } from '../config.js'

// Нижняя «тетрадная» шторка: собрать личную ссылку на открытку.
export default function CreateSheet({ open, onClose, onSend }) {
  const [to, setTo] = useState('')
  const [from, setFrom] = useState('')
  const [msg, setMsg] = useState('')
  const firstRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const id = setTimeout(() => firstRef.current?.focus({ preventScroll: true }), 380)
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(id)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  const link = () => buildLink({ to, from, msg })

  return (
    <div className={`sheet-wrap${open ? ' open' : ''}`}>
      <div className="sheet-backdrop" onClick={onClose} />
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
        <div className="sheet-grip" />
        <button type="button" className="sheet-close" onClick={onClose} aria-label="Жабу">
          <Icon name="close" />
        </button>
        <h2 id="sheet-title">Өз ашықхатым</h2>
        <p className="sheet-sub">Кімге арналғанын жазыңыз — жеке сілтеме шығады. Бос өрістер осы ашықхаттағыдай қалады.</p>

        <label className="field">
          <span>Кімге</span>
          <input
            ref={firstRef}
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="Құрметті Сымбат апай"
            maxLength={LIMITS.to}
            autoComplete="off"
            enterKeyHint="next"
          />
        </label>
        <label className="field">
          <span>Кімнен</span>
          <input
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="11 «А» сынып оқушылары"
            maxLength={LIMITS.from}
            autoComplete="off"
            enterKeyHint="next"
          />
        </label>
        <label className="field">
          <span>
            Құттықтау мәтіні <em>— өзгертпесеңіз де болады</em>
          </span>
          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder={DEFAULTS.msg}
            maxLength={LIMITS.msg}
            rows={4}
          />
        </label>

        <div className="sheet-actions">
          <button type="button" className="btn primary grow" onClick={() => onSend(link())}>
            <Icon name="share" />
            Сілтемені жіберу
          </button>
          <a className="btn ghost" href={open ? link() : undefined}>
            Ашу
          </a>
        </div>
      </div>
    </div>
  )
}
