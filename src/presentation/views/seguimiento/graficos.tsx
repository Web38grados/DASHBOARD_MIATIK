/* Gráficos SVG del tablero de seguimiento (P01–P14). Solo geometría: los valores vienen de la API
   y el formato de formato.ts. Colores siempre por variables de tokens.css. */
import type { CSSProperties, ReactNode } from 'react'
import { aFecha, aIso, diasEntre } from '../../../domain/fechas'
import type { Critico, FrenteAvance, GrupoHitos } from './datos'
import { diaMes, fechaCorte, mesAnioCorto, mesAnioLargo, num, pctTexto, pp } from './formato'

const f1 = (v: number) => v.toFixed(1)
const f2 = (v: number) => v.toFixed(2)
const TAU = Math.PI * 2

type Escala = (iso: string) => number

function escalaFechas(desde: string, hasta: string, x0: number, x1: number): Escala {
  const total = Math.max(1, diasEntre(desde, hasta))
  return (iso) => x0 + (diasEntre(desde, iso) / total) * (x1 - x0)
}

/** Inicios de mes dentro de [desde, hasta]. */
function iniciosDeMes(desde: string, hasta: string) {
  const inicio = aFecha(desde)
  const meses: string[] = []
  let cursor = new Date(Date.UTC(inicio.getUTCFullYear(), inicio.getUTCMonth(), 1))
  if (aIso(cursor) < desde) cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1))
  while (aIso(cursor) <= hasta) {
    meses.push(aIso(cursor))
    cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1))
  }
  return meses
}

const mesDe = (iso: string) => Number(iso.slice(5, 7))
const minIso = (...v: string[]) => v.reduce((a, b) => (a < b ? a : b))
const maxIso = (...v: string[]) => v.reduce((a, b) => (a > b ? a : b))

function Texto({ x, y, ancla = 'middle', estilo, children }: { x: number; y: number; ancla?: 'start' | 'middle' | 'end'; estilo: CSSProperties; children: ReactNode }) {
  return (
    <text x={f1(x)} y={f1(y)} textAnchor={ancla} style={estilo}>
      {children}
    </text>
  )
}

const T_EJE: CSSProperties = { fill: 'var(--cm-tinta-2)', fontSize: 11 }
const T_EJE_10: CSSProperties = { fill: 'var(--cm-tinta-2)', fontSize: 10 }

/** Arco de un anillo: segmento que empieza en `desde` y mide `largo` (en unidades de trazo), con 2 de separación. */
function Arco({ c, r, ancho, color, desde, largo, titulo }: { c: number; r: number; ancho: number; color: string; desde: number; largo: number; titulo: string }) {
  const circ = TAU * r
  const visible = largo - 2
  if (visible <= 0) return null
  return (
    <circle
      cx={f1(c)} cy={f1(c)} r={f2(r)} transform={`rotate(-90 ${f1(c)} ${f1(c)})`}
      style={{ fill: 'none', stroke: color, strokeWidth: ancho, strokeDasharray: `${f2(visible)} ${f2(circ)}`, strokeDashoffset: f2(-desde) }}
    >
      <title>{titulo}</title>
    </circle>
  )
}

/* ---------- P01 · anillo del contador ---------- */

export type AnilloContadorProps = {
  rotulo: string
  consumido: number
  diasBase: number
  diasObjetivo: number
  /** Días calendario totales que caben en la vuelta completa (consumido + el mayor de los objetivos). */
  escala: number
  colorRestante: string
  tituloRestante: string
  corrimientoHabiles: number | null
}

export function AnilloContador({ rotulo, consumido, diasBase, diasObjetivo, escala, colorRestante, tituloRestante, corrimientoHabiles }: AnilloContadorProps) {
  const c = 75, r = 67, ancho = 14
  const circ = TAU * r
  const k = circ / escala
  const restante = Math.min(diasBase, diasObjetivo)
  const extra = diasObjetivo - diasBase
  const posBase = (consumido + diasBase) * k
  const angulo = (posBase / circ) * TAU
  const marca = (radio: number) => ({ x: c + radio * Math.sin(angulo), y: c - radio * Math.cos(angulo) })
  const m1 = marca(r - 10), m2 = marca(r + 10)

  return (
    <svg viewBox="0 0 150 150" width="150" height="150" role="img" aria-label={`${rotulo}: ${diasObjetivo} días calendario desde el corte`} className="svg-seg">
      <circle cx={c} cy={c} r={r} style={{ fill: 'none', stroke: 'var(--pista)', strokeWidth: ancho }} />
      <Arco c={c} r={r} ancho={ancho} color="var(--serie-consumido)" desde={0} largo={consumido * k} titulo={`Tiempo consumido: ${consumido} días`} />
      <Arco c={c} r={r} ancho={ancho} color={colorRestante} desde={consumido * k} largo={restante * k} titulo={tituloRestante} />
      {corrimientoHabiles != null && extra > 0 && (
        <Arco c={c} r={r} ancho={ancho} color="var(--estado-critico)" desde={(consumido + diasBase) * k} largo={extra * k} titulo={`Corrimiento: ${corrimientoHabiles} días hábiles`} />
      )}
      {corrimientoHabiles != null && extra < 0 && (
        <Arco c={c} r={r} ancho={ancho} color="var(--estado-verde)" desde={(consumido + restante) * k} largo={-extra * k} titulo={`Ahorro: ${Math.abs(corrimientoHabiles)} días hábiles`} />
      )}
      <line x1={f1(m1.x)} y1={f1(m1.y)} x2={f1(m2.x)} y2={f1(m2.y)} style={{ stroke: 'var(--cm-tinta)', strokeWidth: 3 }}>
        <title>Fecha de la línea base</title>
      </line>
      <Texto x={c} y={76} estilo={{ fill: 'var(--cm-tinta)', fontSize: 30, fontWeight: 700 }}>{diasObjetivo}</Texto>
      <Texto x={c} y={88} estilo={{ fill: 'var(--cm-tinta-2)', fontSize: 12 }}>días</Texto>
    </svg>
  )
}

/* ---------- P03 · línea de fechas ---------- */

function colorDesvio(desvio: number) {
  if (desvio > 0) return 'var(--estado-critico-texto)'
  if (desvio < 0) return 'var(--estado-verde-texto)'
  return 'var(--cm-tinta)'
}

export function LineaFechas({ base, proyectada, simulada }: { base: string; proyectada: string; simulada: string }) {
  const ancho = 760, x0 = 20, x1 = 740
  const desde = minIso(base, proyectada, simulada)
  const hasta = maxIso(base, proyectada, simulada)
  const d0 = aIso(new Date(aFecha(desde).getTime() - 21 * 86_400_000))
  const d1 = aIso(new Date(aFecha(hasta).getTime() + 21 * 86_400_000))
  const x = escalaFechas(d0, d1, x0, x1)
  const xb = x(base)

  const flecha = (fecha: string, y: number, color: string, titulo: string) => {
    const punta = x(fecha)
    if (Math.abs(punta - xb) < 1) return null
    const dir = punta > xb ? 1 : -1
    return (
      <>
        <line x1={f1(xb)} y1={y} x2={f1(punta - 6 * dir)} y2={y} style={{ stroke: color, strokeWidth: 2.5 }}>
          <title>{titulo}</title>
        </line>
        <path d={`M${f1(punta)} ${y} l${-8 * dir} -5 v10 z`} style={{ fill: color }} />
      </>
    )
  }

  const rotulo = (fecha: string, y: number, color: string, texto: string) => {
    const px = x(fecha)
    const medio = texto.length * 3.4
    const ancla = px + medio > x1 ? 'end' : px - medio < x0 ? 'start' : 'middle'
    return <Texto x={px} y={y} ancla={ancla} estilo={{ fill: color, fontSize: 12, fontWeight: 700 }}>{texto}</Texto>
  }

  const tProy = `Proyectada · ${fechaCorte(proyectada)}`
  const tSim = `Escenario simulado · ${fechaCorte(simulada)}`
  const tBase = `Línea base · ${fechaCorte(base)}`

  return (
    <svg viewBox={`0 0 ${ancho} 92`} width={ancho} height="92" role="img" aria-label="Línea de fechas: base, proyectada y simulada" className="svg-seg">
      <line x1={x0} y1="40" x2={x1} y2="40" style={{ stroke: 'var(--borde-fuerte)', strokeWidth: 1 }} />
      {iniciosDeMes(d0, d1).map((mes) => (
        <g key={mes}>
          <line x1={f1(x(mes))} y1="36" x2={f1(x(mes))} y2="44" style={{ stroke: 'var(--borde-fuerte)' }} />
          <Texto x={x(mes)} y={60} estilo={T_EJE}>{mesAnioLargo(mes)}</Texto>
        </g>
      ))}
      {flecha(proyectada, 30, 'var(--estado-critico)', tProy)}
      {flecha(simulada, 50, 'var(--serie-simulada)', tSim)}
      <path d={`M${f1(xb)} 31 l9 9 -9 9 -9 -9 z`} style={{ fill: 'var(--cm-tinta)' }}>
        <title>{tBase}</title>
      </path>
      <Texto x={xb - 12} y={22} ancla="end" estilo={{ fill: 'var(--cm-tinta)', fontSize: 12, fontWeight: 700 }}>{tBase}</Texto>
      {rotulo(proyectada, 14, colorDesvio(diasEntre(base, proyectada)), tProy)}
      {rotulo(simulada, 82, 'var(--cm-tinta)', tSim)}
    </svg>
  )
}

/* ---------- P05 · anillo de impacto ---------- */

export function AnilloImpacto({ actividad }: { actividad: Critico }) {
  const c = 38, r = 32.5, ancho = 9
  const circ = TAU * r
  const { atraso_dias: atraso, holgura_total: holgura, impacto } = actividad
  const k = atraso > 0 ? circ / atraso : 0
  const absorbe = Math.min(holgura, atraso)

  return (
    <svg viewBox="0 0 76 76" width="76" height="76" role="img" aria-label={`Impacto ${num(impacto)} días hábiles`} className="svg-seg">
      <circle cx={c} cy={c} r={r} style={{ fill: 'none', stroke: 'var(--pista)', strokeWidth: ancho }} />
      {absorbe > 0 && (
        <Arco c={c} r={r} ancho={ancho} color="var(--estado-ambar)" desde={0} largo={absorbe * k} titulo={`Absorbe la holgura: ${num(absorbe)} días hábiles`} />
      )}
      <Arco c={c} r={r} ancho={ancho} color="var(--estado-critico)" desde={absorbe * k} largo={impacto * k} titulo={`Impacto sobre la fecha final: ${num(impacto)} días hábiles`} />
      <Texto x={c} y={34.3} estilo={{ fill: 'var(--cm-tinta)', fontSize: 16, fontWeight: 700 }}>{num(impacto)}</Texto>
      <Texto x={c} y={50.3} estilo={{ fill: 'var(--cm-tinta-2)', fontSize: 10 }}>hábiles</Texto>
    </svg>
  )
}

/* ---------- P06 · medidor SPI ---------- */

const SPI_MAX = 1.2

export function MedidorSpi({ spi, rotulo, verde, ambar }: { spi: number; rotulo: string; verde: number; ambar: number }) {
  const cx = 110, cy = 108, r = 88, hueco = 0.012
  const ang = (v: number) => Math.PI * (1 - Math.min(Math.max(v, 0), SPI_MAX) / SPI_MAX)
  const punto = (a: number, radio: number) => ({ x: cx + radio * Math.cos(a), y: cy - radio * Math.sin(a) })
  const arco = (v0: number, v1: number) => {
    const a0 = ang(v0) - (v0 > 0 ? hueco : 0)
    const a1 = ang(v1) + (v1 < SPI_MAX ? hueco : 0)
    const p0 = punto(a0, r), p1 = punto(a1, r)
    return `M${f1(p0.x)} ${f1(p0.y)} A${r} ${r} 0 0 1 ${f1(p1.x)} ${f1(p1.y)}`
  }
  const aguja = punto(ang(spi), 70)
  const etiqueta = (v: number) => {
    const p = punto(ang(v), 101)
    return <Texto x={p.x} y={p.y + 4} estilo={T_EJE_10}>{num(v)}</Texto>
  }

  return (
    <svg viewBox="0 0 220 124" width="220" height="124" role="img" aria-label={`SPI ${num(spi, 2)}, ${rotulo}`} className="svg-seg">
      <path d={arco(0, ambar)} style={{ fill: 'none', stroke: 'var(--estado-critico)', strokeWidth: 12 }}>
        <title>Crítico: por debajo de {num(ambar, 2)}</title>
      </path>
      <path d={arco(ambar, verde)} style={{ fill: 'none', stroke: 'var(--estado-ambar)', strokeWidth: 12 }}>
        <title>En observación: desde {num(ambar, 2)}</title>
      </path>
      <path d={arco(verde, SPI_MAX)} style={{ fill: 'none', stroke: 'var(--estado-verde)', strokeWidth: 12 }}>
        <title>En plan: desde {num(verde, 2)}</title>
      </path>
      <line x1={cx} y1={cy} x2={f1(aguja.x)} y2={f1(aguja.y)} style={{ stroke: 'var(--cm-tinta)', strokeWidth: 3, strokeLinecap: 'round' }}>
        <title>SPI {num(spi, 2)}</title>
      </line>
      <circle cx={cx} cy={cy} r="6" style={{ fill: 'var(--cm-tinta)' }} />
      {etiqueta(0)}
      {etiqueta(SPI_MAX / 2)}
      {etiqueta(SPI_MAX)}
    </svg>
  )
}

/* ---------- P07 · anillos de avance ---------- */

export function AnillosAvance({ planeado, real }: { planeado: number; real: number }) {
  const anillo = (r: number, valor: number, color: string, titulo: string) => {
    const circ = TAU * r
    return (
      <>
        <circle cx="60" cy="60" r={r} style={{ fill: 'none', stroke: 'var(--pista)', strokeWidth: 10 }} />
        <circle cx="60" cy="60" r={r} transform="rotate(-90 60 60)" style={{ fill: 'none', stroke: color, strokeWidth: 10, strokeDasharray: `${f2((Math.min(valor, 100) / 100) * circ)} ${f2(circ)}` }}>
          <title>{titulo}</title>
        </circle>
      </>
    )
  }
  return (
    <svg viewBox="0 0 120 120" width="120" height="120" role="img" aria-label={`Avance real ${pctTexto(real)} de ${pctTexto(planeado)} planeado`} className="svg-seg">
      {anillo(52, planeado, 'var(--serie-plan)', `Planeado ${pctTexto(planeado)}`)}
      {anillo(38, real, 'var(--serie-real)', `Real ${pctTexto(real)}`)}
    </svg>
  )
}

/* ---------- P10 · cómo se mueve la fecha proyectada ---------- */

export function HistorialProyectada({ serie, sinAvance, base }: {
  serie: Array<{ fecha_corte: string; fecha_proyectada: string }>
  sinAvance: Array<{ fecha_eje: string; fecha_proyectada: string }>
  base: string
}) {
  const cortes = serie.map((c) => ({ fecha_corte: c.fecha_corte, proyectada: c.fecha_proyectada }))
  const ancho = 1180, alto = 230, x0 = 70, x1 = 1160, yAbajo = 200, yArriba = 12
  const fechasX = [...cortes.map((c) => c.fecha_corte), ...sinAvance.map((s) => s.fecha_eje)]
  const dx0 = aIso(new Date(aFecha(minIso(...fechasX)).getTime() - 7 * 86_400_000))
  const dx1 = aIso(new Date(aFecha(maxIso(...fechasX)).getTime() + 7 * 86_400_000))
  const fechasY = [base, ...cortes.map((c) => c.proyectada), ...sinAvance.map((s) => s.fecha_proyectada)]
  const dy0 = aIso(new Date(aFecha(minIso(...fechasY)).getTime() - 30 * 86_400_000))
  const dy1 = aIso(new Date(aFecha(maxIso(...fechasY)).getTime() + 30 * 86_400_000))
  const x = escalaFechas(dx0, dx1, x0, x1)
  const y = escalaFechas(dy0, dy1, yAbajo, yArriba)
  const puntos = (lista: Array<[string, string]>) => lista.map(([fx, fy]) => `${f1(x(fx))},${f1(y(fy))}`).join(' ')
  const ultimo = cortes.at(-1)
  const finSin = sinAvance.at(-1)

  return (
    <svg viewBox={`0 0 ${ancho} ${alto}`} width={ancho} height={alto} role="img" aria-label="Fecha proyectada en cada corte" className="svg-seg">
      {iniciosDeMes(dy0, dy1).filter((m) => mesDe(m) % 3 === 1).map((m) => (
        <g key={m}>
          <line x1={x0} y1={f1(y(m))} x2={x1} y2={f1(y(m))} style={{ stroke: 'var(--borde)', strokeWidth: 1 }} />
          <Texto x={x0 - 8} y={y(m) + 4} ancla="end" estilo={T_EJE}>{mesAnioLargo(m)}</Texto>
        </g>
      ))}
      {iniciosDeMes(dx0, dx1).map((m) => (
        <Texto key={m} x={x(m)} y={220} estilo={T_EJE}>{mesAnioLargo(m)}</Texto>
      ))}
      <line x1={x0} y1={f1(y(base))} x2={x1} y2={f1(y(base))} style={{ stroke: 'var(--cm-tinta)', strokeWidth: 1.5, strokeDasharray: '6 4' }}>
        <title>Línea base · {fechaCorte(base)}</title>
      </line>
      <Texto x={x1} y={y(base) - 6} ancla="end" estilo={{ fill: 'var(--cm-tinta)', fontSize: 11 }}>Línea base · {fechaCorte(base)}</Texto>
      {finSin && (
        <>
          <polyline points={puntos(sinAvance.map((s) => [s.fecha_eje, s.fecha_proyectada]))} style={{ fill: 'none', stroke: 'var(--estado-critico)', strokeWidth: 2, strokeDasharray: '2 4' }}>
            <title>Si no se reporta más avance</title>
          </polyline>
          <Texto x={x(finSin.fecha_eje) - 6} y={y(finSin.fecha_proyectada) - 10} ancla="end" estilo={{ fill: 'var(--estado-critico-texto)', fontSize: 11 }}>
            Sin más avance · {fechaCorte(finSin.fecha_proyectada)}
          </Texto>
        </>
      )}
      <polyline points={puntos(cortes.map((c) => [c.fecha_corte, c.proyectada]))} style={{ fill: 'none', stroke: 'var(--serie-real)', strokeWidth: 2 }} />
      {cortes.map((c) => (
        <circle key={c.fecha_corte} cx={f1(x(c.fecha_corte))} cy={f1(y(c.proyectada))} r="5" style={{ fill: 'var(--serie-real)', stroke: 'var(--sup-tarjeta)', strokeWidth: 2 }}>
          <title>Corte {fechaCorte(c.fecha_corte)} · proyectada {fechaCorte(c.proyectada)}</title>
        </circle>
      ))}
      {ultimo && (
        <Texto x={x(ultimo.fecha_corte)} y={y(ultimo.proyectada) - 10} estilo={{ fill: 'var(--cm-tinta)', fontSize: 11, fontWeight: 700 }}>
          {fechaCorte(ultimo.proyectada)}
        </Texto>
      )}
    </svg>
  )
}

/* ---------- P11 · curva S ---------- */

function interpolar(serie: Array<{ semana: string; plan_acum_pct: number }>, fecha: string) {
  if (serie.length === 0) return 0
  if (fecha <= serie[0].semana) return serie[0].plan_acum_pct
  for (let i = 1; i < serie.length; i += 1) {
    if (fecha <= serie[i].semana) {
      const a = serie[i - 1], b = serie[i]
      const t = diasEntre(a.semana, fecha) / Math.max(1, diasEntre(a.semana, b.semana))
      return a.plan_acum_pct + (b.plan_acum_pct - a.plan_acum_pct) * t
    }
  }
  return serie[serie.length - 1].plan_acum_pct
}

export function CurvaS({ planeado, cortes, corte }: {
  planeado: Array<{ semana: string; plan_acum_pct: number }>
  cortes: Array<{ fecha_corte: string; real_pct: number; plan_pct: number }>
  corte: string
}) {
  const ancho = 584, alto = 230, x0 = 40, x1 = 570, yAbajo = 202, yArriba = 12
  const d0 = planeado[0]?.semana ?? corte
  const d1 = planeado.at(-1)?.semana ?? corte
  const x = escalaFechas(d0, d1, x0, x1)
  const y = (v: number) => yAbajo - (v / 100) * (yAbajo - yArriba)
  const xc = x(corte)
  const actual = cortes.find((c) => c.fecha_corte === corte) ?? cortes.at(-1)
  const planAlCorte = actual ? actual.plan_pct : interpolar(planeado, corte)
  const brecha = actual ? actual.real_pct - planAlCorte : 0
  const yPlan = y(planAlCorte), yReal = actual ? y(actual.real_pct) : yPlan
  const colorBrecha = brecha < 0 ? 'var(--estado-critico)' : 'var(--estado-verde)'

  return (
    <svg viewBox={`0 0 ${ancho} ${alto}`} width={ancho} height={alto} role="img" aria-label="Curva S planeado contra real" className="svg-seg">
      {[0, 25, 50, 75, 100].map((v) => (
        <g key={v}>
          <line x1={x0} y1={f1(y(v))} x2={x1} y2={f1(y(v))} style={{ stroke: 'var(--borde)' }} />
          <Texto x={x0 - 6} y={y(v) + 4} ancla="end" estilo={T_EJE_10}>{v} %</Texto>
        </g>
      ))}
      {iniciosDeMes(d0, d1).filter((m) => mesDe(m) % 3 === 2).map((m) => (
        <Texto key={m} x={x(m)} y={222} estilo={T_EJE_10}>{mesAnioCorto(m)}</Texto>
      ))}
      {actual && Math.abs(yReal - yPlan) > 0.5 && (
        <rect x={f1(xc - 5)} y={f1(Math.min(yPlan, yReal))} width="10" height={f1(Math.abs(yReal - yPlan))} style={{ fill: colorBrecha, opacity: 0.85 }}>
          <title>Brecha al corte: {pp(brecha)}</title>
        </rect>
      )}
      <line x1={f1(xc)} y1={yArriba} x2={f1(xc)} y2={yAbajo} style={{ stroke: 'var(--cm-tinta)', strokeWidth: 1, strokeDasharray: '3 3' }} />
      <Texto x={xc + 4} y={22} ancla="start" estilo={{ fill: 'var(--cm-tinta)', fontSize: 10 }}>Corte {diaMes(corte)}</Texto>
      {actual && (
        <Texto x={xc + 9} y={(yPlan + yReal) / 2 + 4} ancla="start" estilo={{ fill: brecha < 0 ? 'var(--estado-critico-texto)' : 'var(--estado-verde-texto)', fontSize: 12, fontWeight: 700 }}>
          {pp(brecha)}
        </Texto>
      )}
      <polyline points={planeado.map((p) => `${f1(x(p.semana))},${f1(y(p.plan_acum_pct))}`).join(' ')} style={{ fill: 'none', stroke: 'var(--serie-plan)', strokeWidth: 2 }}>
        <title>Planeado acumulado</title>
      </polyline>
      {cortes.map((c) => (
        <circle key={c.fecha_corte} cx={f1(x(c.fecha_corte))} cy={f1(y(c.real_pct))} r="4.5" style={{ fill: 'var(--serie-real)', stroke: 'var(--sup-tarjeta)', strokeWidth: 2 }}>
          <title>Corte {fechaCorte(c.fecha_corte)} · real {pctTexto(c.real_pct)} · planeado {pctTexto(c.plan_pct)}</title>
        </circle>
      ))}
    </svg>
  )
}

/* ---------- P13 · línea de tiempo de hitos ---------- */

type Carril = { y: number; tallo: [number, number] }
const CARRILES: Carril[] = [
  { y: 80, tallo: [89, 84] },
  { y: 124, tallo: [107, 113] },
  { y: 65, tallo: [89, 69] },
  { y: 139, tallo: [107, 128] },
  { y: 50, tallo: [89, 54] },
  { y: 154, tallo: [107, 143] },
]

const COLOR_HITO: Record<GrupoHitos['estado'], string> = {
  cumplido: 'var(--estado-verde)',
  vencido: 'var(--estado-critico)',
  por_venir: 'var(--serie-real)',
}

/** «Hito · Entrega del frente 1» → «Entrega del frente 1» para el rótulo visible; el título conserva el nombre completo. */
const sinTipo = (nombre: string) => nombre.replace(/^[^·]+·\s*/, '')

export function LineaHitos({ grupos, inicio, fin, corte }: { grupos: GrupoHitos[]; inicio: string; fin: string; corte: string }) {
  const ancho = 1180, x0 = 24, x1 = 1156
  const d0 = minIso(inicio, ...grupos.map((g) => g.fecha))
  const d1 = maxIso(fin, ...grupos.map((g) => g.fecha))
  const x = escalaFechas(d0, d1, x0, x1)

  const ocupados: Array<Array<[number, number]>> = CARRILES.map(() => [])
  const marcas = [...grupos].sort((a, b) => a.fecha.localeCompare(b.fecha)).map((grupo) => {
    const { fecha } = grupo
    const px = x(fecha)
    const texto = grupo.hitos === 1 ? `${sinTipo(grupo.nombres[0])} · ${diaMes(fecha)}` : `${grupo.hitos} hitos · ${diaMes(fecha)}`
    const w = texto.length * 6
    const ancla: 'start' | 'middle' | 'end' = px - w / 2 < x0 ? 'start' : px + w / 2 > ancho - 4 ? 'end' : 'middle'
    const tramo: [number, number] = ancla === 'start' ? [px, px + w] : ancla === 'end' ? [px - w, px] : [px - w / 2, px + w / 2]
    let carril = CARRILES.findIndex((_, i) => ocupados[i].every(([a, b]) => tramo[0] > b + 8 || tramo[1] < a - 8))
    if (carril < 0) carril = 0
    ocupados[carril].push(tramo)
    const color = COLOR_HITO[grupo.estado]
    const titulo = `${diaMes(fecha)} · ${grupo.nombres.join('; ')}`
    return { fecha, px, texto, ancla, carril: CARRILES[carril], color, titulo }
  })

  return (
    <svg viewBox={`0 0 ${ancho} 200`} width={ancho} height="200" role="img" aria-label="Línea de tiempo de hitos" className="svg-seg">
      <line x1={x0} y1="98" x2={x1} y2="98" style={{ stroke: 'var(--borde-fuerte)', strokeWidth: 2 }} />
      {iniciosDeMes(d0, d1).map((m) => (
        <g key={m}>
          <line x1={f1(x(m))} y1="94" x2={f1(x(m))} y2="102" style={{ stroke: 'var(--borde-fuerte)' }} />
          <Texto x={x(m)} y={194} estilo={T_EJE_10}>{mesAnioCorto(m)}</Texto>
        </g>
      ))}
      <line x1={f1(x(corte))} y1="12" x2={f1(x(corte))} y2="178" style={{ stroke: 'var(--cm-tinta)', strokeDasharray: '3 3' }} />
      <Texto x={x(corte) + 4} y={14} ancla="start" estilo={{ fill: 'var(--cm-tinta)', fontSize: 10 }}>Corte {diaMes(corte)}</Texto>
      {marcas.map((m) => (
        <g key={m.fecha}>
          <line x1={f1(m.px)} y1={m.carril.tallo[0]} x2={f1(m.px)} y2={m.carril.tallo[1]} style={{ stroke: 'var(--borde-fuerte)' }} />
          <path d={`M${f1(m.px)} 90 l8 8 -8 8 -8 -8 z`} style={{ fill: m.color, stroke: 'var(--sup-tarjeta)', strokeWidth: 2 }}>
            <title>{m.titulo}</title>
          </path>
          <Texto x={m.px} y={m.carril.y} ancla={m.ancla} estilo={{ fill: 'var(--cm-tinta)', fontSize: 11 }}>{m.texto}</Texto>
        </g>
      ))}
    </svg>
  )
}

/* ---------- P14 · avance por frente ---------- */

export function tituloFrente(frente: FrenteAvance) {
  return `${frente.frente}: real ${pctTexto(frente.real_pct)}, planeado ${pctTexto(frente.plan_pct)}, desviación ${pp(frente.desviacion_pp)}`
}

export function AvanceFrentes({ frentes, inicio, fin, corte, umbralAtraso }: { frentes: FrenteAvance[]; inicio: string; fin: string; corte: string; umbralAtraso: number }) {
  const ancho = 1180, x0 = 300, x1 = 1010
  const alto = 30 + frentes.length * 30
  const d0 = minIso(inicio, ...frentes.map((f) => f.ventana_inicio))
  const d1 = maxIso(fin, ...frentes.map((f) => f.ventana_fin))
  const x = escalaFechas(d0, d1, x0, x1)

  return (
    <svg viewBox={`0 0 ${ancho} ${alto}`} width={ancho} height={alto} role="img" aria-label="Avance por frente de trabajo" className="svg-seg">
      {iniciosDeMes(d0, d1).map((m) => (
        <g key={m}>
          <line x1={f1(x(m))} y1="18" x2={f1(x(m))} y2={alto} style={{ stroke: 'var(--borde)', strokeWidth: 1 }} />
          <Texto x={x(m) + 3} y={12} ancla="start" estilo={T_EJE_10}>{mesAnioCorto(m)}</Texto>
        </g>
      ))}
      {frentes.map((frente, i) => {
        const y = 30 + i * 30
        const xi = x(frente.ventana_inicio)
        const w = x(frente.ventana_fin) - xi
        const atraso = frente.desviacion_pp < -umbralAtraso
        const titulo = <title>{tituloFrente(frente)}</title>
        return (
          <g key={frente.frente}>
            <Texto x={290} y={y + 9} ancla="end" estilo={{ fill: 'var(--cm-tinta)', fontSize: 12 }}>{frente.frente}</Texto>
            <rect x={f1(xi)} y={y} width={f1(w)} height="14" rx="3" style={{ fill: 'var(--serie-consumido)', opacity: 0.45 }}>{titulo}</rect>
            {frente.real_pct > 0 && (
              <rect x={f1(xi)} y={y} width={f1((w * Math.min(frente.real_pct, 100)) / 100)} height="14" rx="3" style={{ fill: atraso ? 'var(--estado-critico)' : 'var(--serie-real)' }}>{titulo}</rect>
            )}
            {frente.plan_pct > 0 && (
              <line x1={f1(xi + (w * frente.plan_pct) / 100)} y1={y - 4} x2={f1(xi + (w * frente.plan_pct) / 100)} y2={y + 18} style={{ stroke: 'var(--serie-plan)', strokeWidth: 3 }}>{titulo}</line>
            )}
            <Texto x={1020} y={y + 11} ancla="start" estilo={{ fill: 'var(--cm-tinta-2)', fontSize: 11 }}>
              {pctTexto(frente.real_pct)} de {pctTexto(frente.plan_pct)}
            </Texto>
            {atraso && (
              <Texto x={1176} y={y + 11} ancla="end" estilo={{ fill: 'var(--estado-critico-texto)', fontSize: 11, fontWeight: 700 }}>Atraso</Texto>
            )}
          </g>
        )
      })}
      <line x1={f1(x(corte))} y1="16" x2={f1(x(corte))} y2={alto} style={{ stroke: 'var(--cm-tinta)', strokeWidth: 1, strokeDasharray: '3 3' }}>
        <title>Corte {fechaCorte(corte)}</title>
      </line>
    </svg>
  )
}
