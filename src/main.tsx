import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import './static/tokens.css'
import './static/tablero.css'
import './static/ajustes-maqueta.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('No se encontró el elemento raíz de la aplicación.')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
