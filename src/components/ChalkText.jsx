// Текст «пишется мелом»: буквы (или слова) появляются по очереди.
// Для скринридеров весь текст доступен сразу.

export function unitsOf(text, mode = 'char') {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (mode === 'word') return words.length
  return words.reduce((n, w) => n + Array.from(w).length, 0)
}

export default function ChalkText({ text, start = 0, step = 50, mode = 'char', skip = false, className = '' }) {
  const parts = text.split(/(\s+)/)
  let i = 0
  return (
    <span className={`ct${skip ? ' ct-done' : ''}${className ? ' ' + className : ''}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {parts.map((w, wi) => {
          if (!w) return null
          if (/^\s+$/.test(w)) return ' '
          if (mode === 'word') {
            return (
              <span key={wi} className="ct-w ct-a" style={{ '--d': `${start + i++ * step}ms` }}>
                {w}
              </span>
            )
          }
          return (
            <span key={wi} className="ct-w">
              {Array.from(w).map((ch, ci) => (
                <span key={ci} className="ct-c ct-a" style={{ '--d': `${start + i++ * step}ms` }}>
                  {ch}
                </span>
              ))}
            </span>
          )
        })}
      </span>
    </span>
  )
}
