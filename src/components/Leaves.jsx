import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

// Осенние листья на canvas: падают, кружатся, «переворачиваются» в 3D,
// реагируют на наклон телефона и умеют разлетаться фейерверком (burst).

const SHAPES = {
  maple:
    'M50 2 L56 18 L64 14 L61 34 L76 22 L78 30 L94 28 L86 42 L92 46 L72 60 L75 68 L54 64 L52 82 L48 82 L46 64 L25 68 L28 60 L8 46 L14 42 L6 28 L22 30 L24 22 L39 34 L36 14 L44 18 Z',
  oval: 'M50 6 C78 24 80 66 50 94 C20 66 22 24 50 6 Z',
}
const VEINS = {
  maple: 'M50 99 L50 22 M50 62 L78 34 M50 62 L22 34 M50 72 L70 62 M50 72 L30 62',
  oval: 'M50 100 L50 14 M50 40 L64 30 M50 40 L36 30 M50 60 L66 48 M50 60 L34 48',
}
// [лицевая сторона, изнанка]
const PALETTE = [
  ['#E8A33D', '#C4852B'],
  ['#D9622B', '#B04D21'],
  ['#B83A26', '#8F2C1C'],
  ['#F2C14E', '#CFA03A'],
  ['#C77A2E', '#A06025'],
]

let paths = null
function getPaths() {
  if (!paths) {
    paths = {}
    for (const k of Object.keys(SHAPES)) {
      paths[k] = new Path2D(SHAPES[k])
      paths[k + 'V'] = new Path2D(VEINS[k])
    }
  }
  return paths
}

const rand = (a, b) => a + Math.random() * (b - a)
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

function makeLeaf(w, h, scatter, scale) {
  const [front, back] = pick(PALETTE)
  return {
    kind: 'leaf',
    shape: Math.random() < 0.6 ? 'maple' : 'oval',
    x: rand(-20, w + 20),
    y: scatter ? rand(-h * 0.15, h) : rand(-140, -30),
    size: rand(18, 34) * scale,
    fall: rand(26, 58),
    sway: rand(14, 34),
    swaySpeed: rand(0.6, 1.4),
    phase: rand(0, Math.PI * 2),
    rot: rand(0, Math.PI * 2),
    vr: rand(-1.2, 1.2),
    flipPhase: rand(0, Math.PI * 2),
    flipSpeed: rand(1.2, 2.8),
    front,
    back,
    burst: false,
    age: 0,
    life: Infinity,
  }
}

function makeBurstLeaf(x, y) {
  const l = makeLeaf(0, 0, false, 1)
  const a = rand(-Math.PI * 0.95, -Math.PI * 0.05)
  const sp = rand(170, 430)
  return Object.assign(l, {
    x,
    y,
    vx: Math.cos(a) * sp,
    vy: Math.sin(a) * sp,
    size: rand(16, 30),
    vr: rand(-6, 6),
    burst: true,
    life: rand(2.2, 3.2),
  })
}

function makeDust(x, y) {
  const a = rand(0, Math.PI * 2)
  const sp = rand(40, 230)
  return {
    kind: 'dust',
    x: x + rand(-14, 14),
    y: y + rand(-14, 14),
    vx: Math.cos(a) * sp,
    vy: Math.sin(a) * sp - 70,
    size: rand(1.5, 3.6),
    age: 0,
    life: rand(0.6, 1.25),
    color: Math.random() < 0.35 ? '#F2D06B' : '#F3F0E6',
  }
}

const Leaves = forwardRef(function Leaves({ density = 12, layer = 'back', wind }, ref) {
  const canvasRef = useRef(null)
  const state = useRef({ items: [], w: 0, h: 0, target: density, windNow: 0 })

  useEffect(() => {
    state.current.target = density
  }, [density])

  useImperativeHandle(ref, () => ({
    burst(x, y, n = 8, kind = 'leaf') {
      const s = state.current
      for (let i = 0; i < n; i++) s.items.push(kind === 'dust' ? makeDust(x, y) : makeBurstLeaf(x, y))
    },
  }))

  useEffect(() => {
    const canvas = canvasRef.current
    const c = canvas.getContext('2d')
    const s = state.current
    const P = getPaths()
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const scale = layer === 'front' ? 1.15 : 0.82
    const alpha = layer === 'front' ? 1 : 0.8
    const speed = reduced ? 0.45 : 1

    const resize = () => {
      const r = canvas.parentElement.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      s.w = r.width
      s.h = r.height
      canvas.width = Math.round(r.width * dpr)
      canvas.height = Math.round(r.height * dpr)
      c.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)

    if (s.items.length === 0) {
      const n = reduced ? Math.ceil(s.target * 0.35) : s.target
      for (let i = 0; i < n; i++) s.items.push(makeLeaf(s.w, s.h, true, scale))
    }

    let raf = 0
    let last = performance.now()
    let clock = 0

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000) * speed
      last = now
      clock += dt
      const { w, h } = s
      const target = reduced ? Math.ceil(s.target * 0.35) : s.target

      // ветер = наклон телефона + лёгкий бриз
      const breeze = Math.sin(clock * 0.3) * 0.35 + Math.sin(clock * 0.13) * 0.2
      s.windNow += ((wind?.current || 0) + breeze - s.windNow) * Math.min(1, dt * 2)
      const wv = s.windNow * 45

      let ambient = 0
      for (const p of s.items) if (!p.burst && p.kind === 'leaf') ambient++
      if (ambient < target && Math.random() < 0.08) s.items.push(makeLeaf(w, h, false, scale))

      c.clearRect(0, 0, w, h)
      const next = []
      for (const p of s.items) {
        p.age += dt
        if (p.kind === 'dust') {
          if (p.age >= p.life) continue
          p.vy += 380 * dt
          p.vx *= Math.pow(0.2, dt)
          p.x += p.vx * dt
          p.y += p.vy * dt
          c.globalAlpha = 1 - p.age / p.life
          c.fillStyle = p.color
          c.fillRect(p.x, p.y, p.size, p.size)
          next.push(p)
          continue
        }

        if (p.burst) {
          if (p.age >= p.life) continue
          p.vy = Math.min(p.vy + 260 * dt, p.fall * 1.8)
          p.vx *= Math.pow(0.3, dt)
          p.phase += p.swaySpeed * dt * 2
          p.x += (p.vx + Math.sin(p.phase) * p.sway + wv) * dt
          p.y += p.vy * dt
        } else {
          p.phase += p.swaySpeed * dt
          p.x += (Math.sin(p.phase) * p.sway + wv) * dt
          p.y += p.fall * dt
          if (p.y > h + 50) {
            if (ambient > target) {
              ambient--
              continue
            }
            Object.assign(p, makeLeaf(w, h, false, scale))
          }
          if (p.x < -60) p.x = w + 50
          if (p.x > w + 60) p.x = -50
        }
        p.rot += p.vr * dt
        p.flipPhase += p.flipSpeed * dt

        const flip = Math.cos(p.flipPhase)
        const fx = Math.abs(flip) < 0.1 ? 0.1 * (flip < 0 ? -1 : 1) : flip
        const fade = p.burst ? Math.min(1, (p.life - p.age) / 0.6) : 1
        const k = p.size / 100
        c.globalAlpha = alpha * fade
        c.save()
        c.translate(p.x, p.y)
        c.rotate(p.rot)
        c.scale(k * fx, k)
        c.translate(-50, -50)
        c.fillStyle = flip > 0 ? p.front : p.back
        c.fill(P[p.shape])
        c.strokeStyle = 'rgba(80,30,10,0.35)'
        c.lineWidth = 3.2
        c.lineCap = 'round'
        c.stroke(P[p.shape + 'V'])
        c.restore()
        next.push(p)
      }
      c.globalAlpha = 1
      s.items = next
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [layer, wind])

  return <canvas ref={canvasRef} className={`leaves leaves-${layer}`} aria-hidden="true" />
})

export default Leaves
