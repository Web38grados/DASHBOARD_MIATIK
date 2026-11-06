/* Datos del tablero de seguimiento. Se consumen del mock (json-server sobre db.json): un recurso por
   endpoint de LLD-15 §6 (seguimiento-contador, -indicadores, -fecha, -curva-s, -frentes y -hitos).
   db.json se genera con `npm run mock:db` a partir de los JSON del paquete, sin modificarlos. */
import type { EstadoPantalla, TableroEjecutivo } from '../ejecutivo/datos'
import { obtener, obtenerCodigoError, obtenerCortes, type Corte as CortePublicado } from '../../../application/services/mock'

export type Corte = { corte_id: number; fecha_corte: string } | null

export type EstadoActividad = 'vencida' | 'atrasada' | 'en_curso' | 'por_iniciar' | 'completada'

export type Critico = {
  puesto: number
  edt: string
  nombre: string
  frente: string
  estado: EstadoActividad
  atraso_dias: number
  holgura_total: number
  impacto: number
  fin_base: string
}

export type SeguimientoContador = {
  corte: Corte
  contador: {
    inicio_proyecto: string
    fecha_base: string
    fecha_proyectada: string
    impacto_max: number
    causa_principal: string
    dias_a_base: number
    dias_a_proyectada: number
    corrimiento_habiles: number
    calendario: string
  } | null
  criticos: Critico[]
  simulador: {
    r_min: number
    r_max: number
    d_min: number
    d_max: number
    habiles_desde_base: Array<{ k: number; fecha: string }>
  } | null
}

export type EstadoSpi = 'verde' | 'ambar' | 'critico'

export type SeguimientoIndicadores = {
  corte: Corte
  spi: { valor: number; estado: EstadoSpi; spi_verde: number; spi_ambar: number } | null
  avance: { real_pct: number; plan_pct: number; desviacion_pp: number } | null
  tiempo: { tiempo_consumido_pct: number; plan_pct: number; real_pct: number } | null
  actividades: {
    total: number
    vencidas: number
    atrasadas: number
    en_curso: number
    completadas: number
    por_iniciar: number
    retraso_ruta_critica: number
    umbral_atraso_pp: number
  } | null
}

export type SeguimientoFecha = {
  corte: Corte
  serie: Array<{ corte_id: number; fecha_corte: string; fecha_base: string; fecha_proyectada: string }>
  extrapolacion_sin_avance: Array<{ fecha_eje: string; fecha_proyectada: string }>
}

export type SeguimientoCurvaS = {
  corte: Corte
  plan: Array<{ semana: string; plan_acum_pct: number }>
  real: Array<{ corte_id: number; fecha_corte: string; real_pct: number; plan_pct: number }>
}

export type FrenteAvance = {
  frente: string
  ventana_inicio: string
  ventana_fin: string
  real_pct: number
  plan_pct: number
  desviacion_pp: number
}

export type SeguimientoFrentes = {
  corte: Corte
  umbrales: { umbral_atraso_pp: number; umbral_ambar_pp: number } | null
  atraso_por_frente: FrenteAvance[]
  avance_por_frente: FrenteAvance[]
}

export type EstadoHito = 'cumplido' | 'vencido' | 'por_venir'

export type GrupoHitos = { fecha: string; hitos: number; nombres: string[]; estado: EstadoHito }

export type SeguimientoHitos = { corte: Corte; hitos: GrupoHitos[] }

export type TableroSeguimiento = {
  cabecera: TableroEjecutivo['cabecera']
  corte: Corte
  contador: SeguimientoContador
  indicadores: SeguimientoIndicadores
  fecha: SeguimientoFecha
  curva: SeguimientoCurvaS
  frentes: SeguimientoFrentes
  hitos: SeguimientoHitos
}

export type Fuente = 'base' | 'vacio'

export type DatosSeguimiento = { tablero: TableroSeguimiento; cortes: CortePublicado[]; codigoError: string | null }

/** GET de los seis endpoints de seguimiento, la cabecera (ejecutivo) y los cortes, en paralelo. */
export async function cargarSeguimiento(vista: VistaSeguimiento): Promise<DatosSeguimiento> {
  const f = vista.fuente
  const [ejecutivo, contador, indicadores, fecha, curva, frentes, hitos, cortes, codigoError] = await Promise.all([
    obtener<TableroEjecutivo>('ejecutivo', f === 'vacio' ? 'vacio' : 'sin-aceleracion'),
    obtener<SeguimientoContador>('seguimiento-contador', f),
    obtener<SeguimientoIndicadores>('seguimiento-indicadores', f),
    obtener<SeguimientoFecha>('seguimiento-fecha', f),
    obtener<SeguimientoCurvaS>('seguimiento-curva-s', f),
    obtener<SeguimientoFrentes>('seguimiento-frentes', f),
    obtener<SeguimientoHitos>('seguimiento-hitos', f),
    obtenerCortes(f),
    obtenerCodigoError(), // código de soporte del panel de error (C-02), desde errores/500
  ])
  return {
    tablero: { cabecera: ejecutivo.cabecera, corte: contador.corte, contador, indicadores, fecha, curva, frentes, hitos },
    cortes,
    codigoError,
  }
}

/** Estructura vacía mientras llega la primera respuesta del mock. */
export const tableroEnBlanco: TableroSeguimiento = {
  cabecera: { nombre_tablero: '', meta_fecha: '' },
  corte: null,
  contador: { corte: null, contador: null, criticos: [], simulador: null },
  indicadores: { corte: null, spi: null, avance: null, tiempo: null, actividades: null },
  fecha: { corte: null, serie: [], extrapolacion_sin_avance: [] },
  curva: { corte: null, plan: [], real: [] },
  frentes: { corte: null, umbrales: null, atraso_por_frente: [], avance_por_frente: [] },
  hitos: { corte: null, hitos: [] },
}

export type Perfil = 'seguimiento' | 'detalle'

/** r: recuperación del atraso actual (0 a 1); d: optimización (−) o retraso adicional (+) en días hábiles. */
export type Escenario = { r: number; d: number }

export type VistaSeguimiento = {
  id: string
  rotulo: string
  sello: string
  fuente: Fuente
  perfil: Perfil
  escenario: Escenario
  estado?: EstadoPantalla
}

const SIN_ESCENARIO: Escenario = { r: 0, d: 0 }

export const vistasSeguimiento: VistaSeguimiento[] = [
  {
    id: 'base',
    rotulo: 'Base',
    sello: 'Maqueta estática · datos sintéticos · perfil seguimiento: sin pestaña Detalle ni enlace en P05; simulador en r = 0 y d = 0',
    fuente: 'base',
    perfil: 'seguimiento',
    escenario: SIN_ESCENARIO,
  },
  {
    id: 'escenario',
    rotulo: 'Escenario',
    sello: 'Maqueta estática · datos sintéticos · escenario simulado: recuperación 50 % y d = 0',
    fuente: 'base',
    perfil: 'seguimiento',
    escenario: { r: 0.5, d: 0 },
  },
  {
    id: 'escenario-ahorro',
    rotulo: 'Escenario con ahorro',
    sello: 'Maqueta estática · datos sintéticos · escenario simulado con ahorro: recuperación 100 % y d = −5',
    fuente: 'base',
    perfil: 'seguimiento',
    escenario: { r: 1, d: -5 },
  },
  {
    id: 'perfil-detalle',
    rotulo: 'Perfil detalle',
    sello: 'Maqueta estática · datos sintéticos · perfil detalle: tres pestañas y enlace en P05',
    fuente: 'base',
    perfil: 'detalle',
    escenario: SIN_ESCENARIO,
  },
  {
    id: 'vacio',
    rotulo: 'Vacío',
    sello: 'Maqueta estática · datos sintéticos · estado vacío: sin corte publicado',
    fuente: 'vacio',
    perfil: 'seguimiento',
    escenario: SIN_ESCENARIO,
  },
  {
    id: 'cargando',
    rotulo: 'Cargando',
    sello: 'Maqueta estática · datos sintéticos · estado cargando',
    fuente: 'base',
    perfil: 'seguimiento',
    escenario: SIN_ESCENARIO,
    estado: 'cargando',
  },
  {
    id: 'error',
    rotulo: 'Error',
    sello: 'Maqueta estática · datos sintéticos · estado error',
    fuente: 'base',
    perfil: 'seguimiento',
    escenario: SIN_ESCENARIO,
    estado: 'error',
  },
  {
    id: '403',
    rotulo: 'Sin acceso',
    sello: 'Maqueta estática · datos sintéticos · estado sin permiso (403)',
    fuente: 'base',
    perfil: 'seguimiento',
    escenario: SIN_ESCENARIO,
    estado: '403',
  },
]

export function vistaSeguimientoPorId(id: string | null): VistaSeguimiento {
  return vistasSeguimiento.find((vista) => vista.id === id) ?? vistasSeguimiento[0]
}
