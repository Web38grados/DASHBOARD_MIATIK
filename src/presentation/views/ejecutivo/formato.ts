const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

function partes(iso: string) {
  const [anio, mes, dia] = iso.slice(0, 10).split('-').map(Number)
  return { anio, mes, dia }
}

export function fechaCorte(iso: string) {
  const { anio, mes, dia } = partes(iso)
  return `${dia} ${MESES[mes - 1]} ${anio}`
}

export function mesAnio(iso: string) {
  const { anio, mes } = partes(iso)
  return `${MESES_CORTOS[mes - 1]} ${anio}`
}

const porcentaje = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const entero = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 })

export function participacion(parte: number, total: number) {
  const valor = total > 0 ? (parte / total) * 100 : 0
  return `${porcentaje.format(valor)}\u00A0%`
}

export function cifraEntera(valor: number) {
  return entero.format(valor)
}

/** E-04: solo «Baja», «Media» o «Alta» ponen el marcador; con otro texto el medidor queda sin marcador (PC E-04, CA 2). */
export function nivelConfianza(etiqueta: string | null): 'baja' | 'media' | 'alta' | null {
  const nivel = (etiqueta ?? '').trim().toLowerCase()
  if (nivel === 'baja' || nivel === 'media' || nivel === 'alta') return nivel
  return null
}
