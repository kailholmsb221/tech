import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
// Шрифты лежат внутри сборки — открытка не зависит от Google Fonts
import '@fontsource/caveat/500.css'
import '@fontsource/caveat/700.css'
import '@fontsource/manrope/600.css'
import '@fontsource/manrope/700.css'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
