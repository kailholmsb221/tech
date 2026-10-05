import ChalkText from './ChalkText.jsx'

export default function EnvelopeScene({ opening, onOpen }) {
  return (
    <div className={`env-scene${opening ? ' is-opening' : ''}`}>
      <p className="env-kicker chalk">
        <ChalkText text="Сізге хат" start={250} step={75} />
      </p>

      <button type="button" className={`envelope${opening ? ' open' : ''}`} onClick={onOpen} aria-label="Конвертті ашу">
        <span className="env-body">
          <span className="env-back" />
          <span className="env-letter">
            <span className="env-letter-text">Ұстаздар күні!</span>
          </span>
          <svg className="env-front" viewBox="0 0 280 180" preserveAspectRatio="none" aria-hidden="true">
            <path className="pocket" d="M0 0 L140 98 L280 0 V180 H0 Z" />
            <path className="fold" d="M0 180 L122 86 M280 180 L158 86" />
          </svg>
          <svg className="env-flap" viewBox="0 0 280 110" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 0 H280 L140 104 Z" />
          </svg>
          <span className="env-seal">
            <span>5</span>
          </span>
        </span>
      </button>

      <p className="env-hint">Конвертті басыңыз</p>
    </div>
  )
}
