/* Datos quemados del tablero de seguimiento (paquete PX fase 3).
   Los JSON se usan tal como vienen del paquete: un archivo por endpoint de LLD-15 §6.
   No hay llamadas a API; la vista solo lee estos objetos. */
import type { EstadoPantalla, TableroEjecutivo } from '../ejecutivo/datos'
import ejecutivoBase from '../../../static/datos/ejecutivo.json'
import ejecutivoVacio from '../../../static/datos/vacio/ejecutivo.json'
import errores from '../../../static/datos/errores.json'
import contadorBase from '../../../static/datos/seguimiento-contador.json'
import indicadoresBase from '../../../static/datos/seguimiento-indicadores.json'
import fechaBase from '../../../static/datos/seguimiento-fecha.json'
import curvaBase from '../../../static/datos/seguimiento-curva-s.json'
import frentesBase from '../../../static/datos/seguimiento-frentes.json'
import hitosBase from '../../../static/datos/seguimiento-hitos.json'
import contadorVacio from '../../../static/datos/vacio/seguimiento-contador.json'
import indicadoresVacio from '../../../static/datos/vacio/seguimiento-indicadores.json'
import fechaVacio from '../../../static/datos/vacio/seguimiento-fecha.json'
import curvaVacio from '../../../static/datos/vacio/seguimiento-curva-s.json'
import frentesVacio from '../../../static/datos/vacio/seguimiento-frentes.json'
import hitosVacio from '../../../static/datos/vacio/seguimiento-hitos.json'

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

const tableroBase: TableroSeguimiento = {
  cabecera: (ejecutivoBase as TableroEjecutivo).cabecera,
  corte: contadorBase.corte,
  contador: contadorBase as SeguimientoContador,
  indicadores: indicadoresBase as SeguimientoIndicadores,
  fecha: fechaBase as SeguimientoFecha,
  curva: curvaBase as SeguimientoCurvaS,
  frentes: frentesBase as SeguimientoFrentes,
  hitos: hitosBase as SeguimientoHitos,
}

const tableroVacio: TableroSeguimiento = {
  cabecera: (ejecutivoVacio as TableroEjecutivo).cabecera,
  corte: null,
  contador: contadorVacio as SeguimientoContador,
  indicadores: indicadoresVacio as SeguimientoIndicadores,
  fecha: fechaVacio as SeguimientoFecha,
  curva: curvaVacio as SeguimientoCurvaS,
  frentes: frentesVacio as SeguimientoFrentes,
  hitos: hitosVacio as SeguimientoHitos,
}

export const codigoErrorInterno = errores['500'].id_solicitud

export type Perfil = 'seguimiento' | 'detalle'

/** r: recuperación del atraso actual (0 a 1); d: optimización (−) o retraso adicional (+) en días hábiles. */
export type Escenario = { r: number; d: number }

export type VistaSeguimiento = {
  id: string
  rotulo: string
  sello: string
  datos: TableroSeguimiento
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
    datos: tableroBase,
    perfil: 'seguimiento',
    escenario: SIN_ESCENARIO,
  },
  {
    id: 'escenario',
    rotulo: 'Escenario',
    sello: 'Maqueta estática · datos sintéticos · escenario simulado: recuperación 50 % y d = 0',
    datos: tableroBase,
    perfil: 'seguimiento',
    escenario: { r: 0.5, d: 0 },
  },
  {
    id: 'escenario-ahorro',
    rotulo: 'Escenario con ahorro',
    sello: 'Maqueta estática · datos sintéticos · escenario simulado con ahorro: recuperación 100 % y d = −5',
    datos: tableroBase,
    perfil: 'seguimiento',
    escenario: { r: 1, d: -5 },
  },
  {
    id: 'perfil-detalle',
    rotulo: 'Perfil detalle',
    sello: 'Maqueta estática · datos sintéticos · perfil detalle: tres pestañas y enlace en P05',
    datos: tableroBase,
    perfil: 'detalle',
    escenario: SIN_ESCENARIO,
  },
  {
    id: 'vacio',
    rotulo: 'Vacío',
    sello: 'Maqueta estática · datos sintéticos · estado vacío: sin corte publicado',
    datos: tableroVacio,
    perfil: 'seguimiento',
    escenario: SIN_ESCENARIO,
  },
  {
    id: 'cargando',
    rotulo: 'Cargando',
    sello: 'Maqueta estática · datos sintéticos · estado cargando',
    datos: tableroBase,
    perfil: 'seguimiento',
    escenario: SIN_ESCENARIO,
    estado: 'cargando',
  },
  {
    id: 'error',
    rotulo: 'Error',
    sello: 'Maqueta estática · datos sintéticos · estado error',
    datos: tableroBase,
    perfil: 'seguimiento',
    escenario: SIN_ESCENARIO,
    estado: 'error',
  },
  {
    id: '403',
    rotulo: 'Sin acceso',
    sello: 'Maqueta estática · datos sintéticos · estado sin permiso (403)',
    datos: tableroBase,
    perfil: 'seguimiento',
    escenario: SIN_ESCENARIO,
    estado: '403',
  },
]

export function vistaSeguimientoPorId(id: string | null): VistaSeguimiento {
  return vistasSeguimiento.find((vista) => vista.id === id) ?? vistasSeguimiento[0]
}
