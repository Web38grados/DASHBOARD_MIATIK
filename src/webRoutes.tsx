import { createBrowserRouter } from 'react-router-dom'
import { EjecutivoView } from './presentation/views/ejecutivo/EjecutivoView'
import { SeguimientoView } from './presentation/views/seguimiento/SeguimientoView'
import { DetalleView } from './presentation/views/detalle/DetalleView'

export const webRouter = createBrowserRouter([
  {
    path: '/',
    element: <EjecutivoView />,
  },
  {
    path: '/seguimiento',
    element: <SeguimientoView />,
  },
  {
    path: '/detalle',
    element: <DetalleView />,
  },
  {
    path: '*',
    element: <main className="not-found"><h1>Página no encontrada</h1></main>,
  },
])
