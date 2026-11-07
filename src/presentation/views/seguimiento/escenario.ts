import type { Escenario, SeguimientoContador } from './datos'

export type Simulacion = { corrimiento: number; fecha: string }

/**
 * S-03 (PC P02): simulada = base + ceil(max_i max(0, (1 − r)·atraso_i − holgura_i)) + d hábiles,
 * sobre la lista de S-04 (`criticos`). Se calcula por actividad, no como (1 − r)·impacto_max (CA 3).
 * La fecha se lee de la tabla `habiles_desde_base` del contrato; aquí no se calculan festivos.
 */
export function simular(datos: SeguimientoContador, escenario: Escenario): Simulacion | null {
  const { contador, simulador, criticos } = datos
  if (!contador || !simulador || simulador.habiles_desde_base.length === 0) return null

  const tabla = simulador.habiles_desde_base
  const r = Math.min(Math.max(escenario.r, simulador.r_min), simulador.r_max)
  const d = Math.min(Math.max(escenario.d, simulador.d_min), simulador.d_max)
  const impacto = criticos.reduce((max, a) => Math.max(max, (1 - r) * a.atraso_dias - a.holgura_total), 0)
  // Se resta un épsilon para que errores de coma flotante (p. ej. 16,800000000000001) no suban un día.
  const k = Math.ceil(impacto - 1e-9) + d
  const kMin = tabla[0].k
  const kMax = tabla[tabla.length - 1].k
  const fila = tabla.find((t) => t.k === Math.min(Math.max(k, kMin), kMax))
  return fila ? { corrimiento: fila.k, fecha: fila.fecha } : null
}
