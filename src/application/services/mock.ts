/* Cliente del mock (json-server sobre db.json, `npm run api`). Vite lo publica en /api (vite.config.ts).
   Cada colección de db.json es un endpoint de LLD-15 §6 y cada registro, una variante de datos. */
import { useEffect, useState } from 'react'

export const API = '/api'

export type Corte = { corte_id: number; fecha_corte: string }

export class ErrorMock extends Error {
  constructor(readonly estado: number, recurso: string, readonly cuerpo: { id_solicitud?: string } | null = null) {
    super(`El mock respondió ${estado} en ${recurso}`)
  }
}

/** Cuerpo JSON de una respuesta de error (contrato de errores: `error`, `id_solicitud`…), si lo trae. */
async function cuerpoDeError(respuesta: Response) {
  try {
    return (await respuesta.json()) as { id_solicitud?: string }
  } catch {
    return null
  }
}

const enCurso = new Map<string, Promise<unknown>>()

export function obtener<T>(recurso: string, id: string): Promise<T> {
  const ruta = `${API}/${recurso}/${encodeURIComponent(id)}`
  const pendiente = enCurso.get(ruta)
  if (pendiente) return pendiente as Promise<T>

  const peticion = fetch(ruta, { headers: { Accept: 'application/json' } })
    .then(async (respuesta) => {
      if (!respuesta.ok) throw new ErrorMock(respuesta.status, ruta, await cuerpoDeError(respuesta))
      const { id: _variante, ...cuerpo } = (await respuesta.json()) as T & { id: string }
      return cuerpo as T
    })
    .finally(() => enCurso.delete(ruta))
  enCurso.set(ruta, peticion)
  return peticion
}

/** Lista de cortes para el selector de la cabecera (E-01, C-12). */
export async function obtenerCortes(fuente: 'base' | 'vacio') {
  const { cortes } = await obtener<{ cortes: Corte[] }>('cortes', fuente)
  return cortes
}

/** Código de soporte que se muestra en el panel de error (C-02). */
export async function obtenerCodigoError() {
  try {
    const cuerpo = await obtener<{ id_solicitud?: string }>('errores', '500')
    return cuerpo.id_solicitud ?? 'sin-codigo'
  } catch (error) {
    // /errores/500 responde HTTP 500 (vite.config.ts): el código viene en el cuerpo de la respuesta de error.
    if (error instanceof ErrorMock && error.cuerpo?.id_solicitud) return error.cuerpo.id_solicitud
    return 'mock-no-disponible'
  }
}

export type Carga<T> =
  | { estado: 'cargando'; datos: T | null; codigoError: null }
  | { estado: 'listo'; datos: T; codigoError: null }
  | { estado: 'error'; datos: T | null; codigoError: string }

export function useCargaMock<T>(clave: string, cargar: () => Promise<T>): Carga<T> {
  const [carga, setCarga] = useState<Carga<T>>({ estado: 'cargando', datos: null, codigoError: null })

  useEffect(() => {
    let vigente = true
    setCarga((previa) => ({ estado: 'cargando', datos: previa.datos, codigoError: null }))
    cargar()
      .then((datos) => {
        if (vigente) setCarga({ estado: 'listo', datos, codigoError: null })
      })
      .catch(async () => {
        const codigoError = await obtenerCodigoError()
        if (vigente) setCarga((previa) => ({ estado: 'error', datos: previa.datos, codigoError }))
      })
    return () => {
      vigente = false
    }
  }, [clave])

  return carga
}

export type EstadoPantalla = 'cargando' | 'error' | '403'

/** Estado de pantalla (C-02): el forzado por la variante de la maqueta manda; si no, el de la carga del mock. */
export function estadoDePantalla(forzado: EstadoPantalla | undefined, carga: Carga<unknown>['estado']): EstadoPantalla | null {
  if (forzado) return forzado
  if (carga === 'cargando') return 'cargando'
  if (carga === 'error') return 'error'
  return null
}
