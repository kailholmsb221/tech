import { Icon } from './Icons.jsx'

// Показывается только на телефоне в горизонтальной ориентации (чистый CSS).
export default function RotateHint() {
  return (
    <div className="rotate-hint" aria-hidden="true">
      <span className="rotate-icon">
        <Icon name="phone" size={44} />
      </span>
      <p>Телефонды тігінен бұрыңыз</p>
    </div>
  )
}
