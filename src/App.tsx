import { RouterProvider } from 'react-router-dom'
import { webRouter } from './webRoutes'

function App() {
  return <RouterProvider router={webRouter} />
}

export default App
