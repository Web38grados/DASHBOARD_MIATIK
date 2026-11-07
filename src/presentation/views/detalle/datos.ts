/* Datos del tablero de detalle. Se consumen del mock (json-server sobre db.json, recurso
   `detalle-actividades` = /v1/tablero/detalle/actividades de LLD-15 §6).
   Filtros, búsqueda y paginación corren en el navegador, sin red (C-16). */
import type { EstadoPantalla, TableroEjecutivo } from '../ejecutivo/datos'
import type { SeguimientoIndicadores } from '../seguimiento/datos'
import { obtener, obtenerCodigoError, obtenerCortes, type Corte } from '../../../application/services/mock'

export type EstadoActividad = 'vencida' | 'atrasada' | 'en_curso' | 'por_iniciar' | 'completada'

export type Actividad = {
  edt: string
  nombre: string
  frente: string
  estado: EstadoActividad
  inicio_base: string
  fin_base: string
  avance_real: number
  avance_plan: number
  atraso_dias: number
  holgura_total: number
  impacto: number
  ruta_critica: boolean
  hito: boolean
}

export type ActividadImpacto = Pick<Actividad, 'edt' | 'nombre' | 'frente' | 'estado' | 'atraso_dias' | 'holgura_total' | 'impacto'>

export type ActividadProxima = Pick<Actividad, 'edt' | 'nombre' | 'frente' | 'estado' | 'inicio_base' | 'fin_base' | 'holgura_total'>

export type DetalleActividades = {
  corte: { corte_id: number; fecha_corte: string } | null
  estados: Array<{ estado: EstadoActividad; actividades: number }>
  total: number
  ventana_proximas: number
  frentes: string[]
  actividades: Actividad[]
  mueven_fecha: ActividadImpacto[]
  proximas: ActividadProxima[]
}

export type TableroDetalle = {
  cabecera: TableroEjecutivo['cabecera']
  detalle: DetalleActividades
  umbralAtrasoPp: number | null
}

/** Filtros de M01 y M02. `estado` vacío significa «Todos»; `frente` vacío, «Todos los frentes». */
export type Filtros = { frente: string; estado: EstadoActividad | ''; soloRutaCritica: boolean; busqueda: string }

export const SIN_FILTROS: Filtros = { frente: '', estado: '', soloRutaCritica: false, busqueda: '' }

export type VistaDetalle = {
  id: string
  rotulo: string
  sello: string
  fuente: 'base' | 'vacio'
  filtros: Filtros
  pagina: number
  estado?: EstadoPantalla
}

export const vistasDetalle: VistaDetalle[] = [
  {
    id: 'base',
    rotulo: 'Base',
    sello: 'Maqueta estática · datos sintéticos · perfil detalle; sin filtros; página 1 de 3',
    fuente: 'base',
    filtros: SIN_FILTROS,
    pagina: 1,
  },
  {
    id: 'pagina-3',
    rotulo: 'Página 3',
    sello: 'Maqueta estática · datos sintéticos · sin filtros; página 3 de 3',
    fuente: 'base',
    filtros: SIN_FILTROS,
    pagina: 3,
  },
  {
    id: 'filtro-vencidas',
    rotulo: 'Filtro vencidas',
    sello: 'Maqueta estática · datos sintéticos · clic en «Vencidas» (M01) sincronizado con el filtro Estado (M02)',
    fuente: 'base',
    filtros: { ...SIN_FILTROS, estado: 'vencida' },
    pagina: 1,
  },
  {
    id: 'filtro-combinado',
    rotulo: 'Filtro combinado',
    sello: 'Maqueta estática · datos sintéticos · frente 8 + solo ruta crítica + búsqueda «analisis» sin tilde',
    fuente: 'base',
    filtros: {
      frente: 'Frente 8 · Consolidación y entrega del documento',
      estado: '',
      soloRutaCritica: true,
      busqueda: 'analisis',
    },
    pagina: 1,
  },
  {
    id: 'sin-resultados',
    rotulo: 'Sin resultados',
    sello: 'Maqueta estática · datos sintéticos · búsqueda «geotecnia» sin resultados',
    fuente: 'base',
    filtros: { ...SIN_FILTROS, busqueda: 'geotecnia' },
    pagina: 1,
  },
  {
    id: 'vacio',
    rotulo: 'Vacío',
    sello: 'Maqueta estática · datos sintéticos · estado vacío: sin corte publicado',
    fuente: 'vacio',
    filtros: SIN_FILTROS,
    pagina: 1,
  },
  {
    id: 'cargando',
    rotulo: 'Cargando',
    sello: 'Maqueta estática · datos sintéticos · estado cargando',
    fuente: 'base',
    filtros: SIN_FILTROS,
    pagina: 1,
    estado: 'cargando',
  },
  {
    id: 'error',
    rotulo: 'Error',
    sello: 'Maqueta estática · datos sintéticos · estado error',
    fuente: 'base',
    filtros: SIN_FILTROS,
    pagina: 1,
    estado: 'error',
  },
  {
    id: '403',
    rotulo: 'Sin acceso',
    sello: 'Maqueta estática · datos sintéticos · estado sin permiso (403)',
    fuente: 'base',
    filtros: SIN_FILTROS,
    pagina: 1,
    estado: '403',
  },
]

export function vistaDetallePorId(id: string | null): VistaDetalle {
  return vistasDetalle.find((vista) => vista.id === id) ?? vistasDetalle[0]
}

export type DatosDetalle = { tablero: TableroDetalle; cortes: Corte[]; codigoError: string | null }

export async function cargarDetalle(vista: VistaDetalle): Promise<DatosDetalle> {
  const f = vista.fuente
  const [ejecutivo, detalle, indicadores, cortes, codigoError] = await Promise.all([
    obtener<TableroEjecutivo>('ejecutivo', f === 'vacio' ? 'vacio' : 'sin-aceleracion'),
    obtener<DetalleActividades>('detalle-actividades', f),
    // El umbral es un parámetro (no depende del corte); se lee de la respuesta base de indicadores.
    obtener<SeguimientoIndicadores>('seguimiento-indicadores', 'base'),
    obtenerCortes(f),
    obtenerCodigoError(), // código de soporte del panel de error (C-02), desde errores/500
  ])
  return {
    tablero: { cabecera: ejecutivo.cabecera, detalle, umbralAtrasoPp: indicadores.actividades?.umbral_atraso_pp ?? null },
    cortes,
    codigoError,
  }
}

export const tableroEnBlanco: TableroDetalle = {
  cabecera: { nombre_tablero: '', meta_fecha: '' },
  detalle: { corte: null, estados: [], total: 0, ventana_proximas: 0, frentes: [], actividades: [], mueven_fecha: [], proximas: [] },
  umbralAtrasoPp: null,
}
