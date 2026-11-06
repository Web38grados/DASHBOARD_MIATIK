import type { Escenario, SeguimientoContador } from './datos'

export type Simulacion = { corrimiento: number; fecha: string }

/** Escenario simulado: k = redondeo(corrimiento × (1 − r) + d), acotado a la tabla
    `habiles_desde_base` que entrega el contrato. La fecha se lee de la tabla; no se calculan festivos aquí. */
export function simular(datos: SeguimientoContador, escenario: Escenario): Simulacion | null {
  const { contador, simulador } = datos
  if (!contador || !simulador || simulador.habiles_desde_base.length === 0) return null

  const tabla = simulador.habiles_desde_base
  const r = Math.min(Math.max(escenario.r, simulador.r_min), simulador.r_max)
  const d = Math.min(Math.max(escenario.d, simulador.d_min), simulador.d_max)
  const kMin = tabla[0].k
  const kMax = tabla[tabla.length - 1].k
  const k = Math.min(Math.max(Math.round(contador.corrimiento_habiles * (1 - r) + d), kMin), kMax)
  const fila = tabla.find((t) => t.k === k)
  return fila ? { corrimiento: k, fecha: fila.fecha } : null
}
