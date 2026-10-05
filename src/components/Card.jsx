import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Leaves from './Leaves.jsx'
import EnvelopeScene from './EnvelopeScene.jsx'
import Board from './Board.jsx'
import CreateSheet from './CreateSheet.jsx'
import { Icon } from './Icons.jsx'
import { readParams } from '../config.js'
import { useWind } from '../hooks/useWind.js'
import { sfx } from '../lib/sound.js'
import { copyText } from '../lib/copy.js'

function useFontsReady() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let alive = true
    const done = () => alive && setReady(true)
    const t = setTimeout(done, 1600)
    if (document.fonts?.load) {
      Promise.all([
        document.fonts.load('700 40px Caveat', 'Аә Ұұ'),
        document.fonts.load('500 20px Caveat', 'Аә Ұұ'),
      ])
        .then(done)
        .catch(done)
    } else done()
    return () => {
      alive = false
      clearTimeout(t)
    }
  }, [])
  return ready
}

export default function Card() {
  const data = useMemo(readParams, [])
  const ready = useFontsReady()
  const wind = useWind()
  const [scene, setScene] = useState('envelope') // envelope → board
  const [opening, setOpening] = useState(false)
  const [run, setRun] = useState(0)
  const [sound, setSound] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [toast, setToast] = useState('')
  const surfaceRef = useRef(null)
  const frontRef = useRef(null)
  const timers = useRef([])
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms))
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const openEnvelope = () => {
    if (opening) return
    setOpening(true)
    if (sound) {
      sfx.paper()
      later(() => sfx.chime([784, 1174.7], 0.06), 420)
    }
    navigator.vibrate?.(12)
    later(() => {
      setScene('board')
      setOpening(false)
    }, 1650)
  }

  const burst = (clientX, clientY, n = 6, kind = 'leaf') => {
    const r = surfaceRef.current?.getBoundingClientRect()
    if (r) frontRef.current?.burst(clientX - r.left, clientY - r.top, n, kind)
  }

  const showToast = (text) => {
    setToast(text)
    later(() => setToast(''), 2400)
  }

  const shareLink = async (url) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Ұстаздар күні құтты болсын!', text: 'Сізге Ұстаздар күніне арналған ашықхат', url })
        return
      } catch (e) {
        if (e?.name === 'AbortError') return
      }
    }
    showToast((await copyText(url)) ? 'Сілтеме көшірілді' : 'Сілтемені көшіру мүмкін болмады')
  }

  const replay = () => {
    setScene('envelope')
    setRun((r) => r + 1)
  }

  const closeSheet = useCallback(() => setSheetOpen(false), [])

  return (
    <div className="card">
      <div className="board-surface" ref={surfaceRef}>
        <Leaves layer="back" density={scene === 'board' ? 14 : 7} wind={wind} />

        {ready &&
          (scene === 'envelope' ? (
            <EnvelopeScene key={`e${run}`} opening={opening} onOpen={openEnvelope} />
          ) : (
            <Board
              key={`b${run}`}
              data={data}
              sound={sound}
              onBurst={burst}
              onShare={() => shareLink(window.location.href)}
              onCreate={() => setSheetOpen(true)}
              onReplay={replay}
            />
          ))}

        <Leaves ref={frontRef} layer="front" density={scene === 'board' ? 2 : 3} wind={wind} />

        <button
          type="button"
          className="sound-btn"
          onClick={() => setSound((v) => !v)}
          aria-label={sound ? 'Дыбысты өшіру' : 'Дыбысты қосу'}
        >
          <Icon name={sound ? 'sound' : 'mute'} />
        </button>

        <div className="toast-slot" role="status" aria-live="polite">
          {toast && (
            <span className="toast" key={toast}>
              {toast}
            </span>
          )}
        </div>
      </div>

      <div className="tray" aria-hidden="true">
        <span className="stick s1" />
        <span className="stick s2" />
        <span className="eraser" />
      </div>

      <CreateSheet open={sheetOpen} onClose={closeSheet} onSend={shareLink} />

      <svg className="defs" width="0" height="0" aria-hidden="true">
        <filter id="chalk-rough" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
    </div>
  )
}
