import { useEffect, useMemo, useRef, useState } from 'react'
import ChalkText, { unitsOf } from './ChalkText.jsx'
import Grade from './Grade.jsx'
import { Icon } from './Icons.jsx'
import { KZ, SIGN_PREFIX, TITLE_LINES, formatGreeting, todayLabel } from '../config.js'
import { sfx } from '../lib/sound.js'

// Расписание «письма мелом»: каждая строка начинается, когда закончилась предыдущая.
function buildSchedule(parts) {
  let t = 250
  const out = {}
  for (const [key, text, step, mode, pause] of parts) {
    out[key] = { start: t, step, mode }
    t += unitsOf(text, mode) * step + pause
  }
  out.total = t
  return out
}

function Divider({ start, skip }) {
  return (
    <svg className={`divider chalk-mask${skip ? ' done' : ''}`} viewBox="0 0 360 14" preserveAspectRatio="none" aria-hidden="true">
      <path pathLength="1" style={{ '--d': `${start}ms` }} d="M4 8 C60 3 118 13 180 7 S300 3 356 9" />
    </svg>
  )
}

export default function Board({ data, sound, onBurst, onShare, onCreate, onReplay }) {
  const greeting = formatGreeting(data.to)
  const date = useMemo(todayLabel, [])
  const s = useMemo(
    () =>
      buildSchedule([
        ['date', date, 35, 'char', 60],
        ['head', 'Сынып жұмысы', 28, 'char', 180],
        ['t1', TITLE_LINES[0], 80, 'char', 60],
        ['t2', TITLE_LINES[1], 80, 'char', 280],
        ['kz', KZ, 30, 'char', 300],
        ['div', '', 0, 'char', 420],
        ['greet', greeting, 38, 'char', 240],
        ['msg', data.msg, 62, 'word', 280],
        ['sign0', SIGN_PREFIX, 24, 'char', 80],
        ['sign', data.from, 48, 'char', 150],
      ]),
    [date, greeting, data.msg, data.from],
  )

  const [skip, setSkip] = useState(false)
  const [phase, setPhase] = useState('writing') // writing → ready → graded
  const [shake, setShake] = useState(false)
  const gradeRef = useRef(null)
  const scrollRef = useRef(null)
  const timers = useRef([])
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms))

  useEffect(() => {
    const id = setTimeout(() => setPhase((p) => (p === 'writing' ? 'ready' : p)), s.total)
    return () => clearTimeout(id)
  }, [s.total])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  // После оценки прокручиваем к пятёрке (когда кнопки уже перестроились)
  useEffect(() => {
    if (phase !== 'graded') return
    const sc = scrollRef.current
    const id = requestAnimationFrame(() => sc?.scrollTo({ top: sc.scrollHeight, behavior: 'smooth' }))
    return () => cancelAnimationFrame(id)
  }, [phase])

  const p = (key) => ({ ...s[key], skip })

  // Касание доски: листья из-под пальца + «дописать сразу»
  const onBoardTap = (e) => {
    if (e.target.closest('button, a, input, textarea')) return
    onBurst(e.clientX, e.clientY, 5)
    if (phase === 'writing') {
      setSkip(true)
      setPhase('ready')
    }
  }

  const grade = () => {
    if (phase === 'graded') return
    setSkip(true)
    setPhase('graded')
    navigator.vibrate?.(15)
    later(() => {
      setShake(true)
      later(() => setShake(false), 480)
      if (sound) sfx.chime()
      navigator.vibrate?.([30, 50, 30])
      const r = gradeRef.current?.getBoundingClientRect()
      if (r) {
        const x = r.left + r.width / 2
        const y = r.top + r.width / 2
        onBurst(x, y, 16, 'leaf')
        onBurst(x, y, 28, 'dust')
      }
    }, 1050)
  }

  return (
    <div className={`board${shake ? ' shake' : ''}`} onClick={onBoardTap}>
      <div className="board-scroll" ref={scrollRef}>
        <header className="board-head chalk">
          <ChalkText text={date} {...p('date')} className="head-date" />
          <ChalkText text="Сынып жұмысы" {...p('head')} className="head-sub" />
        </header>

        <h1 className="title chalk">
          <ChalkText text={TITLE_LINES[0]} {...p('t1')} />
          <br />
          <ChalkText text={TITLE_LINES[1]} {...p('t2')} />
        </h1>

        <p className="kz chalk" lang="kk">
          <ChalkText text={KZ} {...p('kz')} />
        </p>

        <Divider start={s.div.start} skip={skip} />

        <p className="greeting chalk">
          <ChalkText text={greeting} {...p('greet')} />
        </p>
        <p className="message chalk">
          <ChalkText text={data.msg} {...p('msg')} />
        </p>

        <div className="sign-row">
          <div className="grade-slot">{phase === 'graded' && <Grade ref={gradeRef} />}</div>
          <p className="signature chalk">
            <small>
              <ChalkText text={SIGN_PREFIX} {...p('sign0')} />
            </small>
            <ChalkText text={data.from} {...p('sign')} />
          </p>
        </div>
      </div>

      <div className="actions">
        {phase === 'writing' && <p className="hint">Тақтаға тиіңіз — мәтін бірден жазылады</p>}

        {phase === 'ready' && (
          <button type="button" className="btn primary wide appear glow" onClick={grade}>
            <Icon name="chalk" />
            Бестік қою
          </button>
        )}

        {phase === 'graded' && (
          <div className="final-actions">
            <button type="button" className="btn primary wide appear" style={{ animationDelay: '1.3s' }} onClick={onShare}>
              <Icon name="share" />
              Ашықхатты жіберу
            </button>
            <div className="row">
              <button type="button" className="btn ghost grow appear" style={{ animationDelay: '1.4s' }} onClick={onCreate}>
                <Icon name="plus" size={20} />
                Өзімдікін жасау
              </button>
              <button
                type="button"
                className="btn ghost icon appear"
                style={{ animationDelay: '1.5s' }}
                onClick={onReplay}
                aria-label="Ашықхатты қайта ашу"
              >
                <Icon name="replay" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
