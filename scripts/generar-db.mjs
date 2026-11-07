/* Genera db.json (mock de json-server) a partir de los JSON del paquete en src/static/datos.
   Los JSON del paquete no se modifican: cada uno se copia tal cual como un registro con su `id` de variante.
   Uso: npm run mock:db */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const datos = join(raiz, 'src', 'static', 'datos')
const leer = (ruta) => JSON.parse(readFileSync(join(datos, ruta), 'utf8'))
const registro = (id, ruta) => ({ id, ...leer(ruta) })

/** Un recurso por endpoint de LLD-15 §6, con la variante base y la vacía (sin corte publicado). */
const porEndpoint = (archivo) => [registro('base', `${archivo}.json`), registro('vacio', `vacio/${archivo}.json`)]

const errores = leer('errores.json')

const db = {
  cortes: porEndpoint('cortes'),
  ejecutivo: [
    registro('con-aceleracion', 'variantes/ejecutivo-con-aceleracion.json'),
    registro('sin-aceleracion', 'ejecutivo.json'),
    registro('confianza-media', 'variantes/ejecutivo-confianza-media.json'),
    registro('confianza-alta', 'variantes/ejecutivo-confianza-alta.json'),
    registro('vacio', 'vacio/ejecutivo.json'),
  ],
  'seguimiento-contador': porEndpoint('seguimiento-contador'),
  'seguimiento-indicadores': porEndpoint('seguimiento-indicadores'),
  'seguimiento-fecha': porEndpoint('seguimiento-fecha'),
  'seguimiento-curva-s': porEndpoint('seguimiento-curva-s'),
  'seguimiento-frentes': porEndpoint('seguimiento-frentes'),
  'seguimiento-hitos': porEndpoint('seguimiento-hitos'),
  'detalle-actividades': porEndpoint('detalle-actividades'),
  errores: Object.entries(errores).map(([id, cuerpo]) => ({ id, ...cuerpo })),
}

writeFileSync(join(raiz, 'db.json'), `${JSON.stringify(db, null, 2)}\n`, 'utf8')
console.log(`db.json generado: ${Object.entries(db).map(([k, v]) => `${k} (${v.length})`).join(', ')}`)
