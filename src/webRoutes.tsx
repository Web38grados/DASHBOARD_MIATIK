import { createBrowserRouter } from 'react-router-dom'
import { HomeView } from './presentation/views/HomeView'

export const webRouter = createBrowserRouter([
  {
    path: '/',
    element: <HomeView />,
  },
  {
    path: '*',
    element: <main className="not-found"><h1>Página no encontrada</h1></main>,
  },
])
