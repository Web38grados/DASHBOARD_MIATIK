export const API_BASE = 'http://localhost:3001'

export type TarjetaItem = {
  orden: number
  titulo: string
  detalle: string | null
  etiqueta: string | null
  mes: string | null
  valor: number | null
}

export type TableroEjecutivo = {
  id?: string
  corte: { corte_id: number; fecha_corte: string } | null
  cabecera: {
    nombre_tablero: string
    nombre_proyecto: string
    meta_fecha: string
  }
  madurez_componentes: Array<{
    componente: string
    orden: number
    filas: number
    con_dato: number
    proyectadas: number
    pendientes: number
    brechas: number
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

export type ErrorApi = {
  id: string
  error: string
  id_solicitud?: string
  perfil_requerido?: string
  perfil_actual?: string
  permitido?: string
}

export type EstadoPantalla = 'cargando' | 'error' | '403'

export type VistaEjecutivo = {
  id: string
  rotulo: string
  sello: string
  ruta: string | null
  estado?: EstadoPantalla
}

const rutaTablero = (id: string) => `${API_BASE}/ejecutivo/${id}`

export const vistasEjecutivo: VistaEjecutivo[] = [
  {
    id: 'con-aceleracion',
    rotulo: 'Con aceleración',
    sello: 'Maqueta estática · datos sintéticos · vista base: confianza Baja, con aceleración',
    ruta: rutaTablero('con-aceleracion'),
  },
  {
    id: 'sin-aceleracion',
    rotulo: 'Sin aceleración',
    sello: 'Maqueta estática · datos sintéticos · variante E-08 sin tarjeta de aceleración',
    ruta: rutaTablero('sin-aceleracion'),
  },
  {
    id: 'confianza-media',
    rotulo: 'Confianza media',
    sello: 'Maqueta estática · datos sintéticos · variante E-04 Media',
    ruta: rutaTablero('confianza-media'),
  },
  {
    id: 'confianza-alta',
    rotulo: 'Confianza alta',
    sello: 'Maqueta estática · datos sintéticos · variante E-04 Alta',
    ruta: rutaTablero('confianza-alta'),
  },
  {
    id: 'vacio',
    rotulo: 'Vacío',
    sello: 'Maqueta estática · datos sintéticos · estado vacío: sin corte publicado',
    ruta: rutaTablero('vacio'),
  },
  {
    id: 'cargando',
    rotulo: 'Cargando',
    sello: 'Maqueta estática · datos sintéticos · estado cargando',
    ruta: rutaTablero('con-aceleracion'),
    estado: 'cargando',
  },
  {
    id: 'error',
    rotulo: 'Error',
    sello: 'Maqueta estática · datos sintéticos · estado error',
    ruta: null,
    estado: 'error',
  },
  {
    id: '403',
    rotulo: 'Sin acceso',
    sello: 'Maqueta estática · datos sintéticos · estado sin permiso (403)',
    ruta: null,
    estado: '403',
  },
]

export const rutaErrorInterno = `${API_BASE}/errores/500`

export const tableroEnBlanco: TableroEjecutivo = {
  corte: null,
  cabecera: {
    nombre_tablero: 'Tablero de preparación del documento técnico',
    nombre_proyecto: '',
    meta_fecha: '',
  },
  madurez_componentes: [],
  preparacion: null,
  confianza: null,
  base_informacion: null,
  brechas_criticas: { items: [] },
  prioridades: { items: [] },
  capacidades: { items: [], aceleracion: null },
  flujo: { items: [] },
}

export function vistaPorId(id: string | null): VistaEjecutivo {
  return vistasEjecutivo.find((vista) => vista.id === id) ?? vistasEjecutivo[0]
}
