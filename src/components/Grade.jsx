import { forwardRef } from 'react'

// Пятёрка в кружке, нарисованная мелом (анимация обводки SVG).
const Grade = forwardRef(function Grade(_, ref) {
  return (
    <div className="grade" ref={ref} role="img" aria-label="Баға: бес, өте жақсы">
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <g filter="url(#chalk-rough)">
          <path className="five" pathLength="1" d="M76 30 L49 31 L45 58 C53 51 73 51 77 67 C81 85 62 95 43 86" />
          <path
            className="ring"
            pathLength="1"
            d="M90 24 C76 8 36 8 20 33 C6 57 17 96 55 104 C91 111 112 82 105 51 C102 37 94 27 80 20"
          />
        </g>
      </svg>
      <span className="grade-note" aria-hidden="true">
        өте жақсы!
      </span>
    </div>
  )
})

export default Grade
