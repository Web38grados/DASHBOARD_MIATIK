/* Utilidades de fechas calendario sobre ISO «AAAA-MM-DD» en UTC.
   Los días hábiles NO se calculan aquí: vienen resueltos en los datos (contador y simulador). */

const DIA_MS = 86_400_000

export function aFecha(iso: string): Date {
  const [anio, mes, dia] = iso.slice(0, 10).split('-').map(Number)
  return new Date(Date.UTC(anio, mes - 1, dia))
}

export function aIso(fecha: Date): string {
  return fecha.toISOString().slice(0, 10)
}

export function sumarDias(iso: string, dias: number): string {
  return aIso(new Date(aFecha(iso).getTime() + dias * DIA_MS))
}

/** Días calendario de `desde` a `hasta` (negativo si `hasta` es anterior). */
export function diasEntre(desde: string, hasta: string): number {
  return Math.round((aFecha(hasta).getTime() - aFecha(desde).getTime()) / DIA_MS)
}
