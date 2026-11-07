/* Datos quemados: los JSON sintéticos del paquete (src/static/datos) incluidos en el build.
   Mismas colecciones y variantes que db.json (scripts/generar-db.mjs): una colección por endpoint
   de LLD-15 §6 y un registro por variante. Los JSON se usan tal cual, sin modificarlos. */
import cortesBase from '../../static/datos/cortes.json'
import cortesVacio from '../../static/datos/vacio/cortes.json'
import ejecutivoSinAceleracion from '../../static/datos/ejecutivo.json'
import ejecutivoConAceleracion from '../../static/datos/variantes/ejecutivo-con-aceleracion.json'
import ejecutivoConfianzaMedia from '../../static/datos/variantes/ejecutivo-confianza-media.json'
import ejecutivoConfianzaAlta from '../../static/datos/variantes/ejecutivo-confianza-alta.json'
import ejecutivoVacio from '../../static/datos/vacio/ejecutivo.json'
import contadorBase from '../../static/datos/seguimiento-contador.json'
import contadorVacio from '../../static/datos/vacio/seguimiento-contador.json'
import indicadoresBase from '../../static/datos/seguimiento-indicadores.json'
import indicadoresVacio from '../../static/datos/vacio/seguimiento-indicadores.json'
import fechaBase from '../../static/datos/seguimiento-fecha.json'
import fechaVacio from '../../static/datos/vacio/seguimiento-fecha.json'
import curvaBase from '../../static/datos/seguimiento-curva-s.json'
import curvaVacio from '../../static/datos/vacio/seguimiento-curva-s.json'
import frentesBase from '../../static/datos/seguimiento-frentes.json'
import frentesVacio from '../../static/datos/vacio/seguimiento-frentes.json'
import hitosBase from '../../static/datos/seguimiento-hitos.json'
import hitosVacio from '../../static/datos/vacio/seguimiento-hitos.json'
import detalleBase from '../../static/datos/detalle-actividades.json'
import detalleVacio from '../../static/datos/vacio/detalle-actividades.json'
import errores from '../../static/datos/errores.json'

type Coleccion = Record<string, unknown>

/** Registro por colección y variante, equivalente a GET /{coleccion}/{id} del mock. */
export const datosQuemados: Record<string, Coleccion> = {
  cortes: { base: cortesBase, vacio: cortesVacio },
  ejecutivo: {
    'con-aceleracion': ejecutivoConAceleracion,
    'sin-aceleracion': ejecutivoSinAceleracion,
    'confianza-media': ejecutivoConfianzaMedia,
    'confianza-alta': ejecutivoConfianzaAlta,
    vacio: ejecutivoVacio,
  },
  'seguimiento-contador': { base: contadorBase, vacio: contadorVacio },
  'seguimiento-indicadores': { base: indicadoresBase, vacio: indicadoresVacio },
  'seguimiento-fecha': { base: fechaBase, vacio: fechaVacio },
  'seguimiento-curva-s': { base: curvaBase, vacio: curvaVacio },
  'seguimiento-frentes': { base: frentesBase, vacio: frentesVacio },
  'seguimiento-hitos': { base: hitosBase, vacio: hitosVacio },
  'detalle-actividades': { base: detalleBase, vacio: detalleVacio },
  errores,
}
