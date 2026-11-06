/* Filtros, búsqueda, orden y paginación de detalle. Corren en el navegador, sin red (C-16). */
import { sumarDias } from '../../../domain/fechas'
import type { Actividad, ActividadProxima, Filtros } from './datos'

export const TAMANO_PAGINA = 25

/** Minúsculas y sin tildes: «energia» encuentra «Energía» (M02, CA 1). */
export function normalizar(texto: string) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

/** M05: los filtros de M01 y M02 se combinan con «y»; el resultado va en EDT natural. */
export function filtrarActividades(actividades: Actividad[], filtros: Filtros) {
  const busqueda = normalizar(filtros.busqueda)
  return actividades
    .filter(
    (a) =>
      (!filtros.frente || a.frente === filtros.frente) &&
      (!filtros.estado || a.estado === filtros.estado) &&
      (!filtros.soloRutaCritica || a.ruta_critica) &&
      (!busqueda || normalizar(a.nombre).includes(busqueda) || normalizar(a.edt).includes(busqueda)),
    )
    .sort((a, b) => compararEdt(a.edt, b.edt)) // Orden por defecto: EDT natural (M05, CA 2)
}

const coleccion = new Intl.Collator('es', { numeric: true })

/** EDT en orden natural: 1.2.9 antes que 1.2.10 (C-15). */
export function compararEdt(a: string, b: string) {
  const pa = a.split('.')
  const pb = b.split('.')
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    if (pa[i] === undefined) return -1
    if (pb[i] === undefined) return 1
    const c = coleccion.compare(pa[i], pb[i])
    if (c !== 0) return c
  }
  return 0
}

/**
 * M04: orden por la primera de sus fechas que cae en (corte, corte + ventana] y después por EDT.
 * La API entrega el conjunto ya filtrado; aquí solo se ordena para mostrar.
 */
export function ordenarProximas(proximas: ActividadProxima[], fechaCorte: string, ventana: number) {
  const fin = sumarDias(fechaCorte, ventana)
  const primeraEnVentana = (a: ActividadProxima) =>
    [a.inicio_base, a.fin_base].filter((f) => f > fechaCorte && f <= fin).sort()[0] ?? fin
  return [...proximas].sort((a, b) => {
    const fa = primeraEnVentana(a)
    const fb = primeraEnVentana(b)
    return fa === fb ? compararEdt(a.edt, b.edt) : fa < fb ? -1 : 1
  })
}

export function paginar<T>(filas: T[], pagina: number) {
  const paginas = Math.max(1, Math.ceil(filas.length / TAMANO_PAGINA))
  const actual = Math.min(Math.max(1, pagina), paginas)
  const desde = (actual - 1) * TAMANO_PAGINA
  return { filas: filas.slice(desde, desde + TAMANO_PAGINA), pagina: actual, paginas, desde: desde + 1, hasta: Math.min(desde + TAMANO_PAGINA, filas.length) }
}
