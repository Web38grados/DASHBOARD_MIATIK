/* Servidor para compartir el build: sirve dist/ (SPA) y el mock /api desde db.json en un solo puerto.
   Sin dependencias, solo Node 18 o superior. Uso: node servidor.mjs   (PORT=8080 por defecto)
   /api/{coleccion}/{id} responde igual que json-server; /api/errores/{código} responde con ese código HTTP. */
import { createServer } from 'node:http'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { join, extname, normalize, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const base = dirname(fileURLToPath(import.meta.url))
const puerto = Number(process.env.PORT ?? 8080)
const dist = join(base, 'dist')
const db = JSON.parse(readFileSync(join(base, 'db.json'), 'utf8'))

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.otf': 'font/otf',
}

function json(res, estado, cuerpo) {
  const texto = JSON.stringify(cuerpo, null, 2)
  res.writeHead(estado, { 'Content-Type': TIPOS['.json'], 'Content-Length': Buffer.byteLength(texto) })
  res.end(texto)
}

function api(res, ruta) {
  const [coleccion, id, ...resto] = ruta.split('/').filter(Boolean).map(decodeURIComponent)
  const registros = db[coleccion]
  if (!Array.isArray(registros) || resto.length) return json(res, 404, {})
  if (id === undefined) return json(res, 200, registros)
  const registro = registros.find((r) => String(r.id) === id)
  if (!registro) return json(res, 404, {})
  return json(res, coleccion === 'errores' && /^\d{3}$/.test(id) ? Number(id) : 200, registro)
}

function estatico(res, ruta) {
  const archivo = normalize(join(dist, ruta))
  const valido = archivo.startsWith(dist) && existsSync(archivo) && statSync(archivo).isFile()
  // Rutas del router (/seguimiento, /detalle…) devuelven index.html.
  const destino = valido ? archivo : join(dist, 'index.html')
  const cache = destino.includes(`${join('dist', 'assets')}`) ? 'public, max-age=31536000, immutable' : 'no-cache'
  res.writeHead(200, { 'Content-Type': TIPOS[extname(destino)] ?? 'application/octet-stream', 'Cache-Control': cache })
  res.end(readFileSync(destino))
}

createServer((req, res) => {
  const { pathname } = new URL(req.url ?? '/', 'http://local')
  if (req.method !== 'GET' && req.method !== 'HEAD') return json(res, 405, { error: 'metodo_no_permitido', permitido: 'GET' })
  if (pathname === '/healthz') return json(res, 200, { estado: 'ok' })
  if (pathname.startsWith('/api/')) return api(res, pathname.slice(4))
  return estatico(res, pathname)
}).listen(puerto, () => {
  console.log(`Dashboard Miatik en http://localhost:${puerto}`)
  console.log(`  Ejecutivo:   http://localhost:${puerto}/`)
  console.log(`  Seguimiento: http://localhost:${puerto}/seguimiento`)
  console.log(`  Detalle:     http://localhost:${puerto}/detalle`)
})
