// Звуки синтезируются WebAudio — без аудиофайлов. Играют только после касания.
let ac = null

function ctx() {
  if (!ac) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ac = new AC()
  }
  if (ac.state === 'suspended') ac.resume()
  return ac
}

function noise(a, seconds) {
  const len = Math.floor(a.sampleRate * seconds)
  const buf = a.createBuffer(1, len, a.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  return buf
}

export const sfx = {
  // Колокольчик (как школьный звонок, только нежнее)
  chime(notes = [1046.5, 1318.5, 1568, 2093], vol = 0.08) {
    const a = ctx()
    if (!a) return
    const t0 = a.currentTime + 0.01
    notes.forEach((f, i) => {
      const o = a.createOscillator()
      const g = a.createGain()
      o.type = 'sine'
      o.frequency.value = f
      const t = t0 + i * 0.07
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(vol, t + 0.012)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4)
      o.connect(g).connect(a.destination)
      o.start(t)
      o.stop(t + 1.5)
    })
  },

  // Шорох бумаги при открытии конверта
  paper() {
    const a = ctx()
    if (!a) return
    const src = a.createBufferSource()
    src.buffer = noise(a, 0.45)
    const f = a.createBiquadFilter()
    f.type = 'bandpass'
    f.frequency.value = 1400
    f.Q.value = 0.7
    const g = a.createGain()
    const t = a.currentTime
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.06)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42)
    src.connect(f).connect(g).connect(a.destination)
    src.start(t)
  },
}
