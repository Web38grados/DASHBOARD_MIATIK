/* Servidor mock de solo lectura para el contenedor (destino `mock` del Dockerfile).
   Sirve db.json con las mismas rutas GET que json-server (/{coleccion} y /{coleccion}/{id})
   y devuelve los registros de `errores` con su código HTTP real (p. ej. /errores/500 → 500),
   igual que el proxy de Vite en desarrollo. Sin dependencias: solo Node. */
import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'

const puerto = Number(process.env.PORT ?? 3001)
const db = JSON.parse(readFileSync(process.env.DB_PATH ?? new URL('../db.json', import.meta.url), 'utf8'))

function responder(res, estado, cuerpo) {
  const texto = JSON.stringify(cuerpo, null, 2)
  res.writeHead(estado, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(texto) })
  res.end(texto)
}

createServer((req, res) => {
  const { pathname } = new URL(req.url ?? '/', 'http://mock')
  if (pathname === '/healthz') return responder(res, 200, { estado: 'ok' })
  if (req.method !== 'GET' && req.method !== 'HEAD') return responder(res, 405, { error: 'metodo_no_permitido', permitido: 'GET' })

  const [coleccion, id, ...resto] = pathname.split('/').filter(Boolean).map(decodeURIComponent)
  const registros = db[coleccion]
  if (!Array.isArray(registros) || resto.length) return responder(res, 404, {})
  if (id === undefined) return responder(res, 200, registros)

  const registro = registros.find((r) => String(r.id) === id)
  if (!registro) return responder(res, 404, {})
  const estado = coleccion === 'errores' && /^\d{3}$/.test(id) ? Number(id) : 200
  return responder(res, estado, registro)
}).listen(puerto, () => console.log(`mock escuchando en :${puerto}`))
