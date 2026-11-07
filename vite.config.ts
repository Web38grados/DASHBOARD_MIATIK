import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/** El mock (json-server, `npm run api`) responde en :3001; la app lo consume en /api, sin CORS. */
const mock = {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true,
    rewrite: (ruta: string) => ruta.replace(/^\/api/, ''),
    // json-server responde 200 a todo registro existente. Los de la colección `errores` simulan
    // respuestas de error del contrato, así que se devuelven con su código HTTP real (p. ej. 500).
    configure: (proxy: { on: (evento: 'proxyRes', fn: (res: { statusCode?: number }, req: { url?: string }) => void) => void }) => {
      proxy.on('proxyRes', (res, req) => {
        const codigo = req.url?.match(/\/errores\/(\d{3})(?:\?|$)/)?.[1]
        if (codigo) res.statusCode = Number(codigo)
      })
    },
  },
}

export default defineConfig({
  plugins: [react()],
  server: { proxy: mock },
  preview: { proxy: mock },
})
