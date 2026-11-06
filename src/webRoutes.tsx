import { createBrowserRouter } from 'react-router-dom'
import { EjecutivoView } from './presentation/views/ejecutivo/EjecutivoView'

export const webRouter = createBrowserRouter([
  {
    path: '/',
    element: <EjecutivoView />,
  },
  {
    path: '*',
    element: <main className="not-found"><h1>Página no encontrada</h1></main>,
  },
])
