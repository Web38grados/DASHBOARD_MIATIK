import { fechaCorte } from '../ejecutivo/formato'

export { fechaCorte }

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const MENOS = '−'
const NBSP = ' '

const formateadores = new Map<number, Intl.NumberFormat>()

function formateador(decimales: number) {
  let f = formateadores.get(decimales)
  if (!f) {
    f = new Intl.NumberFormat('es-CO', { minimumFractionDigits: decimales, maximumFractionDigits: decimales })
    formateadores.set(decimales, f)
  }
  return f
}

/** Número con coma decimal y signo menos tipográfico («−9,6»). */
export function num(valor: number, decimales = 1) {
  const texto = formateador(decimales).format(Math.abs(valor))
  const redondeado = Number(Math.abs(valor).toFixed(decimales))
  return valor < 0 && redondeado !== 0 ? `${MENOS}${texto}` : texto
}

/** Número con signo explícito: «+34», «−5», «0». */
export function conSigno(valor: number, decimales = 0) {
  if (valor > 0) return `+${num(valor, decimales)}`
  return num(valor, decimales)
}

export function pct(valor: number, decimales = 1) {
  return `${num(valor, decimales)}${NBSP}%`
}

/** Variante con espacio normal, para atributos title y textos de SVG. */
export function pctTexto(valor: number, decimales = 1) {
  return `${num(valor, decimales)} %`
}

export function pp(valor: number) {
  return `${num(valor, 1)} pp`
}

export function diaMes(iso: string) {
  const [, mes, dia] = iso.slice(0, 10).split('-').map(Number)
  return `${dia} ${MESES[mes - 1]}`
}

/** «nov 2026» */
export function mesAnioLargo(iso: string) {
  const [anio, mes] = iso.slice(0, 10).split('-').map(Number)
  return `${MESES[mes - 1]} ${anio}`
}

/** «nov 26» */
export function mesAnioCorto(iso: string) {
  const [anio, mes] = iso.slice(0, 10).split('-').map(Number)
  return `${MESES[mes - 1]} ${String(anio).slice(2)}`
}
