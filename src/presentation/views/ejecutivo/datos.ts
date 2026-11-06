/* Datos del tablero ejecutivo. Se consumen del mock (json-server sobre db.json, endpoint
   `ejecutivo` = /v1/tablero/ejecutivo de LLD-15 §6). db.json se genera con `npm run mock:db`
   a partir de los JSON del paquete tableros-maquetas-v1, sin modificarlos. */
import { obtener, obtenerCodigoError, obtenerCortes, type Corte } from '../../../application/services/mock'

export type TarjetaItem = {
  orden: number
  titulo: string
  detalle: string | null
  etiqueta: string | null
  mes: string | null
  valor: number | null
}

export type Cabecera = {
  nombre_tablero: string
  meta_fecha: string
}

export type TableroEjecutivo = {
  corte: { corte_id: number; fecha_corte: string } | null
  cabecera: Cabecera
  madurez_componentes: Array<{
    componente: string
    orden: number
    filas: number
    con_dato: number
    proyectadas: number
    pendientes: number
    brechas: number
    /** Cualquier otro estado vigente: cuenta en el total, no en la madurez (PC E-02). */
    otros: number
    madurez_pct: number
  }>
  preparacion: { preparacion_pct: number; componentes: number } | null
  confianza: TarjetaItem | null
  base_informacion: {
    total: number
    clases: Array<{ clase: string; insumos: number }>
  } | null
  brechas_criticas: { items: TarjetaItem[] }
  prioridades: { items: TarjetaItem[] }
  capacidades: { items: TarjetaItem[]; aceleracion: TarjetaItem | null }
  flujo: { items: TarjetaItem[] }
}

export type EstadoPantalla = 'cargando' | 'error' | '403'

export type VistaEjecutivo = {
  id: string
  rotulo: string
  sello: string
  /** Registro de la colección `ejecutivo` del mock. */
  registro: string
  /** Variante de E-04: solo cambia la tarjeta de confianza sobre la vista base (como en las maquetas). */
  confianza?: string
  estado?: EstadoPantalla
}

export type DatosEjecutivo = { tablero: TableroEjecutivo; cortes: Corte[]; codigoError: string | null }

const BASE = 'con-aceleracion'

export const vistasEjecutivo: VistaEjecutivo[] = [
  { id: 'con-aceleracion', rotulo: 'Base', sello: 'Maqueta estática · datos sintéticos · vista base: confianza Baja, con aceleración', registro: BASE },
  { id: 'sin-aceleracion', rotulo: 'Sin aceleración', sello: 'Maqueta estática · datos sintéticos · variante E-08 sin tarjeta de aceleración', registro: 'sin-aceleracion' },
  { id: 'confianza-media', rotulo: 'Confianza media', sello: 'Maqueta estática · datos sintéticos · variante E-04 Media', registro: BASE, confianza: 'confianza-media' },
  { id: 'confianza-alta', rotulo: 'Confianza alta', sello: 'Maqueta estática · datos sintéticos · variante E-04 Alta', registro: BASE, confianza: 'confianza-alta' },
  { id: 'vacio', rotulo: 'Vacío', sello: 'Maqueta estática · datos sintéticos · estado vacío: sin corte publicado', registro: 'vacio' },
  { id: 'cargando', rotulo: 'Cargando', sello: 'Maqueta estática · datos sintéticos · estado cargando', registro: BASE, estado: 'cargando' },
  { id: 'error', rotulo: 'Error', sello: 'Maqueta estática · datos sintéticos · estado error', registro: BASE, estado: 'error' },
  { id: '403', rotulo: 'Sin acceso', sello: 'Maqueta estática · datos sintéticos · estado sin permiso (403)', registro: BASE, estado: '403' },
]

export function vistaPorId(id: string | null): VistaEjecutivo {
  return vistasEjecutivo.find((vista) => vista.id === id) ?? vistasEjecutivo[0]
}

/** GET /api/ejecutivo/{registro} y /api/cortes; con variante de E-04, también la tarjeta de confianza. */
export async function cargarEjecutivo(vista: VistaEjecutivo): Promise<DatosEjecutivo> {
  const [tablero, cortes, variante, codigoError] = await Promise.all([
    obtener<TableroEjecutivo>('ejecutivo', vista.registro),
    obtenerCortes(vista.registro === 'vacio' ? 'vacio' : 'base'),
    vista.confianza ? obtener<TableroEjecutivo>('ejecutivo', vista.confianza) : null,
    obtenerCodigoError(), // código de soporte del panel de error (C-02), desde errores/500
  ])
  return { tablero: variante ? { ...tablero, confianza: variante.confianza } : tablero, cortes, codigoError }
}

/** Estructura vacía mientras llega la primera respuesta del mock. */
export const tableroEnBlanco: TableroEjecutivo = {
  corte: null,
  cabecera: { nombre_tablero: '', meta_fecha: '' },
  madurez_componentes: [],
  preparacion: null,
  confianza: null,
  base_informacion: null,
  brechas_criticas: { items: [] },
  prioridades: { items: [] },
  capacidades: { items: [], aceleracion: null },
  flujo: { items: [] },
}
