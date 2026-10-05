// Ашықхаттың барлық мәтіні осында. Кімге/кімнен/мәтінді сілтемеде көрсетуге болады:
//   https://site.kz/?to=Құрметті Сымбат апай&from=Шәкіртіңіз Айгерим&msg=Өз мәтініңіз
// (сілтемені ашықхаттың ішіндегі «Өзімдікін жасау» түймесімен жинауға болады).

export const TITLE_LINES = ['Ұстаздар', 'күніңізбен!']
export const KZ = 'Ұстаздар күні құтты болсын!'
export const SIGN_PREFIX = 'Құрметпен,'

export const DEFAULTS = {
  to: 'Құрметті Сымбат апай',
  from: 'Шәкіртіңіз Айгерим',
  msg:
    'Сізді Ұстаздар күнімен шын жүректен құттықтаймын! ' +
    'Маған ғылыми жобамды дайындау барысында бағыт-бағдар беріп, қолдау көрсетіп, біліміңізбен бөліскеніңіз үшін үлкен рақмет! ' +
    'Сіздің еңбегіңіз бен әрбір кеңесіңіз мен үшін өте құнды. ' +
    'Сізге мықты денсаулық, мол бақыт, шығармашылық шабыт және еңбегіңіздің жемісін көре беруді тілеймін! ' +
    'Әр шәкіртіңіздің жетістігі сізге қуаныш сыйласын. ' +
    'Ұстаздық жолыңыз әрдайым абырой мен биік белестерге толы болсын! ' +
    'Ұстаздар күні құтты болсын, Сымбат апай!',
}

export const LIMITS = { to: 60, from: 60, msg: 700 }

const clean = (v, max) => (v ?? '').replace(/\s+/g, ' ').trim().slice(0, max)

export function readParams() {
  const p = new URLSearchParams(window.location.search)
  return {
    to: clean(p.get('to'), LIMITS.to) || DEFAULTS.to,
    from: clean(p.get('from'), LIMITS.from) || DEFAULTS.from,
    msg: clean(p.get('msg'), LIMITS.msg) || DEFAULTS.msg,
  }
}

export function buildLink({ to, from, msg }) {
  const u = new URL(window.location.href)
  u.search = ''
  u.hash = ''
  const set = (k, v) => {
    const t = clean(v, LIMITS[k])
    if (t) u.searchParams.set(k, t)
  }
  set('to', to)
  set('from', from)
  set('msg', msg)
  return u.toString()
}

export function formatGreeting(to) {
  return `${to.trim().replace(/[\s,.!]+$/u, '')}!`
}

export function todayLabel() {
  try {
    return new Intl.DateTimeFormat('kk-KZ', { day: 'numeric', month: 'long' }).format(new Date())
  } catch {
    return ''
  }
}
