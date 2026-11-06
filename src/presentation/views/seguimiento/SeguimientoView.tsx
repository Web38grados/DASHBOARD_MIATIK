import { useEffect, type MouseEvent, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Cabecera } from '../../../application/components/Cabecera'
import { PanelesEstado } from '../../../application/components/PanelesEstado'
import { diasEntre } from '../../../domain/fechas'
import {
  codigoErrorInterno,
  vistaSeguimientoPorId,
  vistasSeguimiento,
  type Critico,
  type Escenario,
  type EstadoSpi,
  type Perfil,
  type TableroSeguimiento,
} from './datos'
import { simular, type Simulacion } from './escenario'
import { conSigno, fechaCorte, num, pct, pp } from './formato'
import {
  AnilloContador,
  AnilloImpacto,
  AnillosAvance,
  AvanceFrentes,
  CurvaS,
  HistorialProyectada,
  LineaFechas,
  LineaHitos,
  MedidorSpi,
  tituloFrente,
} from './graficos'

const MAX_CRITICOS = 8
const NBSP = ' '
const MENOS = '−'

type Chip = 'critico' | 'ambar' | 'verde'

function IconoEstado({ estado }: { estado: Chip }) {
  if (estado === 'ambar') {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M8 1l7 13H1z" fill="currentColor" />
        <path d="M8 6v4M8 11.6v.6" stroke="#fff" strokeWidth="1.8" />
      </svg>
    )
  }
  if (estado === 'verde') {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="7" fill="currentColor" />
        <path d="M4.6 8.2l2.3 2.3 4.5-4.7" fill="none" stroke="#fff" strokeWidth="1.8" />
      </svg>
    )
  }
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="currentColor" />
      <path d="M5.2 5.2l5.6 5.6M10.8 5.2l-5.6 5.6" stroke="#fff" strokeWidth="1.8" />
    </svg>
  )
}

function ChipEstado({ estado, children }: { estado: Chip; children: ReactNode }) {
  return (
    <span className="chip-estado" data-estado={estado}>
      <IconoEstado estado={estado} />
      {children}
    </span>
  )
}

type TarjetaProps = {
  id: string
  titulo: string
  subtitulo?: string
  vacia: boolean
  mensajeVacio: string
  pie?: ReactNode
  children?: ReactNode
}

function Tarjeta({ id, titulo, subtitulo, vacia, mensajeVacio, pie, children }: TarjetaProps) {
  return (
    <section className="tarjeta" style={{ gridArea: id.toLowerCase() }} data-id={id} data-vacia={vacia ? '1' : '0'} aria-labelledby={`t-${id}`}>
      <header className="tarjeta__cab">
        <div>
          <h2 className="tarjeta__titulo" id={`t-${id}`}>{titulo}</h2>
          {subtitulo && <p className="tarjeta__subtitulo">{subtitulo}</p>}
        </div>
        <span className="sr">{id}</span>
      </header>
      <div className="tarjeta__cuerpo">{!vacia && children}</div>
      <div className="tarjeta__vacio">
        <span>{mensajeVacio}</span>
      </div>
      {pie && !vacia && <div className="tarjeta__pie">{pie}</div>}
    </section>
  )
}

function textoCorrimiento(habiles: number) {
  if (habiles > 0) return { texto: `+${habiles} días hábiles frente a la línea base`, color: 'var(--estado-critico-texto)' }
  if (habiles < 0) return { texto: `${MENOS}${Math.abs(habiles)} días hábiles frente a la línea base (ahorro)`, color: 'var(--estado-verde-texto)' }
  return { texto: '0 días hábiles frente a la línea base', color: 'var(--cm-tinta-2)' }
}

/* ---------- P01–P04: contador, simulador, fechas y causa (endpoint seguimiento-contador) ---------- */

function Contador({ datos, simulacion }: { datos: TableroSeguimiento; simulacion: Simulacion | null }) {
  const { contador } = datos.contador
  const corte = datos.corte
  const vacia = contador == null || corte == null || simulacion == null

  let contenido: ReactNode = null
  if (!vacia) {
    const consumido = diasEntre(contador.inicio_proyecto, corte.fecha_corte)
    const diasSim = diasEntre(corte.fecha_corte, simulacion.fecha)
    const escala = consumido + Math.max(contador.dias_a_base, contador.dias_a_proyectada, diasSim)
    const tituloBase = `Días que faltan para la base: ${contador.dias_a_base}`

    const anillos = [
      { rotulo: 'Línea base', dias: contador.dias_a_base, fecha: contador.fecha_base, corr: 0, color: 'var(--serie-real)', titulo: tituloBase, conCorr: false },
      { rotulo: 'Proyectada con el avance actual', dias: contador.dias_a_proyectada, fecha: contador.fecha_proyectada, corr: contador.corrimiento_habiles, color: 'var(--serie-real)', titulo: tituloBase, conCorr: true },
      { rotulo: 'Escenario simulado', dias: diasSim, fecha: simulacion.fecha, corr: simulacion.corrimiento, color: 'var(--serie-simulada)', titulo: `Días que faltan para la simulada: ${diasSim}`, conCorr: true },
    ]

    contenido = (
      <div className="contador">
        <div className="contador__anillos">
          {anillos.map((a) => {
            const corr = textoCorrimiento(a.corr)
            return (
              <figure className="contador__item" key={a.rotulo}>
                <figcaption className="contador__rot">{a.rotulo}</figcaption>
                <AnilloContador
                  rotulo={a.rotulo}
                  consumido={consumido}
                  diasBase={contador.dias_a_base}
                  diasObjetivo={a.dias}
                  escala={escala}
                  colorRestante={a.color}
                  tituloRestante={a.titulo}
                  corrimientoHabiles={a.conCorr ? a.corr : null}
                />
                <p className="contador__fecha">{fechaCorte(a.fecha)}</p>
                <p className="contador__corr" style={{ color: corr.color }}>{corr.texto}</p>
              </figure>
            )
          })}
        </div>
        <ul className="leyenda-h">
          <li><i style={{ background: 'var(--serie-consumido)' }} />Tiempo consumido</li>
          <li><i style={{ background: 'var(--serie-real)' }} />Días que faltan para la base</li>
          <li><i style={{ background: 'var(--serie-simulada)' }} />Días que faltan para la simulada</li>
          <li><i style={{ background: 'var(--estado-critico)' }} />Corrimiento</li>
          <li><i style={{ background: 'var(--estado-verde)' }} />Ahorro</li>
          <li><i className="marca-negra" />Fecha de la línea base</li>
        </ul>
      </div>
    )
  }

  return (
    <Tarjeta
      id="P01"
      titulo="Contador de la fecha meta"
      subtitulo="Días calendario desde el corte. La fecha proyectada suma a la línea base el mayor atraso que supera la holgura de su actividad, en días hábiles"
      vacia={vacia}
      mensajeVacio="Aún no hay un corte publicado"
    >
      {contenido}
    </Tarjeta>
  )
}

/** P02 · En la maqueta los deslizadores son estáticos (no recalculan): muestran el escenario de la vista. */
function Simulador({ datos, escenario, simulacion, claveVista }: {
  datos: TableroSeguimiento
  escenario: Escenario
  simulacion: Simulacion | null
  claveVista: string
}) {
  const sim = datos.contador.simulador
  const vacia = simulacion == null || sim == null || datos.contador.criticos.length === 0
  const rPct = Math.round(escenario.r * 100)

  return (
    <Tarjeta
      id="P02"
      titulo="Simulador"
      vacia={vacia}
      mensajeVacio="No hay actividades que corran la fecha"
      pie={<span className="solo-maqueta">En la maqueta los deslizadores son estáticos; la vista «escenario» muestra 50{NBSP}%.</span>}
    >
      {simulacion && sim && (
        <div className="simulador" key={claveVista}>
          <label className="simulador__ctl">
            <span>Recuperación del atraso actual <b>{rPct}{NBSP}%</b></span>
            <input type="range" min={sim.r_min * 100} max={sim.r_max * 100} step="5" defaultValue={rPct} aria-label="Recuperación del atraso actual" />
            <span className="simulador__ext"><span>{sim.r_min * 100}{NBSP}%</span><span>{sim.r_max * 100}{NBSP}%</span></span>
          </label>
          <label className="simulador__ctl">
            <span>Optimización ({MENOS}) o retraso adicional (+) <b>{conSigno(escenario.d)} días hábiles</b></span>
            <input type="range" min={sim.d_min} max={sim.d_max} step="1" defaultValue={escenario.d} aria-label="Optimización o retraso adicional" />
            <span className="simulador__ext"><span>{num(sim.d_min, 0)}</span><span>0</span><span>{conSigno(sim.d_max)}</span></span>
          </label>
          <span className="boton boton--sec">Quitar escenario</span>
          <p className="simulador__res">
            Escenario simulado: <b>{fechaCorte(simulacion.fecha)}</b> · {conSigno(simulacion.corrimiento)} días hábiles frente a la línea base
          </p>
        </div>
      )}
    </Tarjeta>
  )
}

function Fechas({ datos, simulacion }: { datos: TableroSeguimiento; simulacion: Simulacion | null }) {
  const { contador } = datos.contador
  return (
    <Tarjeta id="P03" titulo="Línea de fechas" vacia={contador == null || simulacion == null} mensajeVacio="Aún no hay un corte publicado">
      {contador && simulacion && (
        <div className="grafico">
          <LineaFechas base={contador.fecha_base} proyectada={contador.fecha_proyectada} simulada={simulacion.fecha} />
        </div>
      )}
    </Tarjeta>
  )
}

function Causa({ datos }: { datos: TableroSeguimiento }) {
  const { contador, criticos } = datos.contador
  const causa = contador?.causa_principal ?? null
  const actividad = criticos.find((c) => c.nombre === causa) ?? criticos[0]
  const vacia = causa == null || criticos.length === 0
  return (
    <Tarjeta id="P04" titulo="Causa principal del corrimiento" vacia={vacia} mensajeVacio="Ninguna actividad corre la fecha en este corte">
      {causa && (
        <>
          <p className="causa">Principal causa del corrimiento: <b>{causa}</b></p>
          {actividad && <p className="apoyo">EDT {actividad.edt} · {actividad.frente}</p>}
        </>
      )}
    </Tarjeta>
  )
}

/* ---------- P05: puntos críticos ---------- */

function CriticoItem({ actividad }: { actividad: Critico }) {
  const vencida = actividad.estado === 'vencida'
  return (
    <li className="critico">
      <div className="critico__cab">
        <span className="lista__n">{actividad.puesto}</span>
        <span className="critico__edt">EDT {actividad.edt}</span>
        <ChipEstado estado={vencida ? 'critico' : 'ambar'}>{vencida ? 'Vencida' : 'Atrasada'}</ChipEstado>
      </div>
      <div className="critico__cuerpo">
        <AnilloImpacto actividad={actividad} />
        <div>
          <p className="critico__nombre">{actividad.nombre}</p>
          <p className="critico__frente">{actividad.frente}</p>
        </div>
      </div>
      <p className="critico__dato">Atraso {num(actividad.atraso_dias)} hábiles · Holgura {num(actividad.holgura_total)} hábiles</p>
      <p className="critico__dato">Fin programado {fechaCorte(actividad.fin_base)}</p>
    </li>
  )
}

function Criticos({ datos, perfil }: { datos: TableroSeguimiento; perfil: Perfil }) {
  const todos = datos.contador.criticos
  const visibles = todos.slice(0, MAX_CRITICOS)
  const resto = todos.length - visibles.length

  return (
    <Tarjeta
      id="P05"
      titulo="Puntos críticos que llevan al desfase"
      subtitulo="Actividades cuyo atraso supera su holgura total y por eso corren la fecha meta. En el anillo, ámbar es la parte del atraso que absorbe la holgura y rojo el impacto sobre la fecha final"
      vacia={todos.length === 0}
      mensajeVacio="Ninguna actividad corre la fecha en este corte"
    >
      <ol className="criticos">
        {visibles.map((actividad) => (
          <CriticoItem key={actividad.puesto} actividad={actividad} />
        ))}
        {resto > 0 && (
          <li className="critico critico--resto">
            <p>y {resto} {resto === 1 ? 'actividad más' : 'actividades más'} con impacto</p>
            {perfil === 'detalle' && <a href="#detalle" onClick={pestanaPendiente}>Ver la lista completa en el tablero de detalle</a>}
          </li>
        )}
      </ol>
    </Tarjeta>
  )
}

/* ---------- P06–P09: indicadores (endpoint seguimiento-indicadores) ---------- */

const ROTULO_SPI: Record<EstadoSpi, string> = { verde: 'En plan', ambar: 'En observación', critico: 'Crítico' }

function EstadoGeneral({ datos }: { datos: TableroSeguimiento }) {
  const spi = datos.indicadores.spi
  return (
    <Tarjeta
      id="P06"
      titulo="Estado general del cronograma"
      subtitulo={spi ? `Índice de desempeño del cronograma (SPI = avance real ÷ avance planeado). Verde desde ${num(spi.spi_verde, 2)} · ámbar desde ${num(spi.spi_ambar, 2)}` : undefined}
      vacia={spi == null}
      mensajeVacio="Aún no hay avance planeado al corte"
    >
      {spi && (
        <div className="spi">
          <MedidorSpi spi={spi.valor} rotulo={ROTULO_SPI[spi.estado]} verde={spi.spi_verde} ambar={spi.spi_ambar} />
          <div className="spi__dato">
            <span className="cifra">{num(spi.valor, 2)}</span>
            <ChipEstado estado={spi.estado}>{ROTULO_SPI[spi.estado]}</ChipEstado>
          </div>
        </div>
      )}
    </Tarjeta>
  )
}

function AvanceDocumento({ datos }: { datos: TableroSeguimiento }) {
  const avance = datos.indicadores.avance
  const vacia = avance == null || avance.plan_pct <= 0
  return (
    <Tarjeta
      id="P07"
      titulo="Avance del documento técnico"
      vacia={vacia}
      mensajeVacio="Aún no hay avance planeado al corte"
      pie={avance && <>Desviación <b>{num(avance.desviacion_pp)}</b> puntos porcentuales</>}
    >
      {avance && (
        <div className="avance">
          <AnillosAvance planeado={avance.plan_pct} real={avance.real_pct} />
          <div>
            <span className="cifra">{num(avance.real_pct)}<small>{NBSP}%</small></span>
            <p className="apoyo">{pct(avance.real_pct)} de {pct(avance.plan_pct)}</p>
            <ul className="leyenda-h">
              <li><i style={{ background: 'var(--serie-plan)' }} />Planeado (exterior)</li>
              <li><i style={{ background: 'var(--serie-real)' }} />Real (interior)</li>
            </ul>
          </div>
        </div>
      )}
    </Tarjeta>
  )
}

function TiempoContraAvance({ datos }: { datos: TableroSeguimiento }) {
  const tiempo = datos.indicadores.tiempo
  const barras = tiempo
    ? [
        { rotulo: 'Tiempo transcurrido', valor: tiempo.tiempo_consumido_pct, color: 'var(--serie-consumido)' },
        { rotulo: 'Avance planeado', valor: tiempo.plan_pct, color: 'var(--serie-plan)' },
        { rotulo: 'Avance real', valor: tiempo.real_pct, color: 'var(--serie-real)' },
      ]
    : []
  return (
    <Tarjeta
      id="P08"
      titulo="Tiempo consumido contra avance"
      subtitulo="Si el avance va por debajo del tiempo consumido, el plazo se está agotando más rápido que el trabajo"
      vacia={tiempo == null}
      mensajeVacio="Sin corte publicado"
    >
      <ul className="barras">
        {barras.map((b) => (
          <li key={b.rotulo}>
            <span className="barras__rot">{b.rotulo}</span>
            <span className="barras__valor">{pct(b.valor)}</span>
            <span className="barras__pista" title={`${b.rotulo}: ${num(b.valor)} %`}>
              <span style={{ width: `${Math.min(b.valor, 100).toFixed(2)}%`, background: b.color }} />
            </span>
          </li>
        ))}
      </ul>
    </Tarjeta>
  )
}

function ActividadesRetraso({ datos }: { datos: TableroSeguimiento }) {
  const act = datos.indicadores.actividades
  const definicion = act
    ? `Atrasada: más de ${num(act.umbral_atraso_pp, 0)} puntos por debajo del plan. Vencida: pasó su fecha fin sin llegar al 100 %`
    : ''
  const segmentos = act
    ? [
        { nombre: 'Completada', valor: act.completadas, color: 'var(--estado-verde)' },
        { nombre: 'Vencida', valor: act.vencidas, color: 'var(--estado-critico)' },
        { nombre: 'Atrasada', valor: act.atrasadas, color: 'var(--estado-ambar)' },
        { nombre: 'En curso', valor: act.en_curso, color: 'var(--serie-real)' },
        { nombre: 'Por iniciar', valor: act.por_iniciar, color: 'var(--serie-consumido)' },
      ]
    : []
  return (
    <Tarjeta id="P09" titulo="Actividades en retraso" vacia={act == null || act.total === 0} mensajeVacio="Sin actividades en este corte">
      {act && (
        <div className="retraso">
          <p><span className="cifra">{act.vencidas + act.atrasadas}</span> <span className="apoyo">de {act.total} actividades</span></p>
          <p className="apoyo">{act.retraso_ruta_critica} en ruta crítica (holgura 0 o menos)</p>
          <div className="apilada" title={definicion}>
            {segmentos.filter((s) => s.valor > 0).map((s) => (
              <span key={s.nombre} style={{ flex: s.valor, background: s.color }} title={`${s.nombre}: ${s.valor}. ${definicion}`} />
            ))}
          </div>
          <ul className="leyenda-h compacta">
            {segmentos.map((s) => (
              <li key={s.nombre}><i style={{ background: s.color }} />{s.nombre} <b>{s.valor}</b></li>
            ))}
          </ul>
        </div>
      )}
    </Tarjeta>
  )
}

/* ---------- P10–P14: fecha, curva S, frentes e hitos ---------- */

function MovimientoProyectada({ datos }: { datos: TableroSeguimiento }) {
  const { serie, extrapolacion_sin_avance: sinAvance } = datos.fecha
  const base = serie.at(-1)?.fecha_base
  return (
    <Tarjeta
      id="P10"
      titulo="Cómo se mueve la fecha proyectada"
      subtitulo="Fecha proyectada en cada corte. Trazo punteado: lo que pasaría si no se reporta más avance"
      vacia={serie.length === 0 || base == null}
      mensajeVacio="Se necesita al menos un corte"
    >
      {base && (
        <>
          <div className="grafico">
            <HistorialProyectada serie={serie} sinAvance={sinAvance} base={base} />
          </div>
          <ul className="leyenda-h">
            <li><i style={{ background: 'var(--serie-real)' }} />Fecha proyectada en cada corte</li>
            <li><i className="trazo-punteado" />Sin más avance reportado</li>
            <li><i className="trazo-base" />Línea base</li>
          </ul>
        </>
      )}
    </Tarjeta>
  )
}

function CurvaSTarjeta({ datos }: { datos: TableroSeguimiento }) {
  const { corte, plan, real } = datos.curva
  return (
    <Tarjeta
      id="P11"
      titulo="Curva S: planeado contra real"
      subtitulo="Toda la duración del proyecto. La franja roja es la brecha a la fecha de corte"
      vacia={corte == null || plan.length === 0}
      mensajeVacio="Sin corte publicado"
    >
      {corte && (
        <>
          <div className="grafico">
            <CurvaS planeado={plan} cortes={real} corte={corte.fecha_corte} />
          </div>
          <ul className="leyenda-h">
            <li><i style={{ background: 'var(--serie-plan)' }} />Planeado acumulado</li>
            <li><i style={{ background: 'var(--serie-real)', borderRadius: '50%' }} />Real en cada corte</li>
            <li><i style={{ background: 'var(--estado-critico)' }} />Brecha al corte</li>
          </ul>
        </>
      )}
    </Tarjeta>
  )
}

function DondeAtraso({ datos }: { datos: TableroSeguimiento }) {
  const { umbrales, atraso_por_frente: frentes } = datos.frentes
  const maximo = Math.max(...frentes.map((f) => Math.abs(f.desviacion_pp)), 0.0001)
  return (
    <Tarjeta
      id="P12"
      titulo="¿Dónde está el atraso?"
      subtitulo={`Desviación real ${MENOS} planeado por frente al corte, en puntos porcentuales. Solo frentes que ya debían avanzar`}
      vacia={frentes.length === 0 || umbrales == null}
      mensajeVacio="Ningún frente debía avanzar a este corte"
    >
      {umbrales && (
        <>
          <ul className="frentes">
            {frentes.map((f) => {
              const nivel = f.desviacion_pp < -umbrales.umbral_atraso_pp
                ? { color: 'var(--estado-critico)', texto: 'Atraso mayor al umbral' }
                : f.desviacion_pp < -umbrales.umbral_ambar_pp
                  ? { color: 'var(--estado-ambar)', texto: 'En observación' }
                  : { color: 'var(--serie-real)', texto: 'Dentro de tolerancia' }
              return (
                <li key={f.frente}>
                  <span className="frente__nombre">{f.frente}</span>
                  <span className="barras__pista" title={tituloFrente(f)}>
                    <span style={{ width: `${((Math.abs(f.desviacion_pp) / maximo) * 100).toFixed(1)}%`, background: nivel.color }} />
                  </span>
                  <span className="frente__valor">{pp(f.desviacion_pp)}</span>
                  <span className="frente__estado">{nivel.texto}</span>
                </li>
              )
            })}
          </ul>
          <ul className="leyenda-h">
            <li><i style={{ background: 'var(--estado-critico)' }} />Más de {num(umbrales.umbral_atraso_pp, 0)} pp de atraso</li>
            <li><i style={{ background: 'var(--estado-ambar)' }} />Más de {num(umbrales.umbral_ambar_pp, 0)} y hasta {num(umbrales.umbral_atraso_pp, 0)} pp</li>
            <li><i style={{ background: 'var(--serie-real)' }} />Dentro de tolerancia</li>
          </ul>
        </>
      )}
    </Tarjeta>
  )
}

function Hitos({ datos }: { datos: TableroSeguimiento }) {
  const { contador } = datos.contador
  const { corte, hitos } = datos.hitos
  const listo = contador != null && corte != null && hitos.length > 0
  return (
    <Tarjeta id="P13" titulo="Línea de tiempo de hitos" vacia={!listo} mensajeVacio="No hay hitos en el cronograma de este corte">
      {listo && (
        <>
          <div className="grafico">
            <LineaHitos grupos={hitos} inicio={contador.inicio_proyecto} fin={contador.fecha_base} corte={corte.fecha_corte} />
          </div>
          <ul className="leyenda-h">
            <li><i style={{ background: 'var(--estado-verde)' }} />Cumplido</li>
            <li><i style={{ background: 'var(--estado-critico)' }} />Vencido</li>
            <li><i style={{ background: 'var(--serie-real)' }} />Por venir</li>
            <li>Los hitos de una misma fecha se agrupan; sus nombres se ven al pasar el cursor</li>
          </ul>
        </>
      )}
    </Tarjeta>
  )
}

function AvancePorFrente({ datos }: { datos: TableroSeguimiento }) {
  const { contador } = datos.contador
  const { corte, umbrales, avance_por_frente: frentes } = datos.frentes
  const listo = contador != null && corte != null && umbrales != null && frentes.length > 0
  const umbral = umbrales ? num(umbrales.umbral_atraso_pp, 0) : ''
  return (
    <Tarjeta
      id="P14"
      titulo="Avance por frente de trabajo"
      subtitulo={listo ? `Barra: ventana programada del frente; relleno: avance real; trazo vertical: avance planeado al corte. En rojo, frentes con más de ${umbral} puntos de atraso` : undefined}
      vacia={!listo}
      mensajeVacio="Sin frentes en este corte"
    >
      {listo && (
        <>
          <div className="grafico">
            <AvanceFrentes frentes={frentes} inicio={contador.inicio_proyecto} fin={contador.fecha_base} corte={corte.fecha_corte} umbralAtraso={umbrales.umbral_atraso_pp} />
          </div>
          <ul className="leyenda-h">
            <li><i style={{ background: 'var(--serie-consumido)', opacity: 0.45 }} />Ventana programada</li>
            <li><i style={{ background: 'var(--serie-real)' }} />Avance real</li>
            <li><i style={{ background: 'var(--estado-critico)' }} />Avance real con más de {umbral} pp de atraso</li>
            <li><i className="trazo-plan" />Avance planeado al corte (trazo grueso)</li>
            <li><i className="trazo-corte" />Fecha de corte (trazo fino punteado)</li>
          </ul>
        </>
      )}
    </Tarjeta>
  )
}

/* ---------- Vista ---------- */

function pestanaPendiente(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault()
}

export function SeguimientoView() {
  const [params, setParams] = useSearchParams()
  const vista = vistaSeguimientoPorId(params.get('vista'))
  const tablero = vista.datos
  const simulacion = simular(tablero.contador, vista.escenario)
  const estado = vista.estado ?? null

  useEffect(() => {
    if (estado) document.body.dataset.estado = estado
    else delete document.body.dataset.estado
    return () => {
      delete document.body.dataset.estado
    }
  }, [estado])

  return (
    <>
      <Cabecera datos={{ corte: tablero.corte, cabecera: tablero.cabecera }} rotulo="Seguimiento del cronograma" />
      <nav className="pestanas" aria-label="Tableros">
        <Link to="/">Ejecutivo</Link>
        <a href="#" aria-current="page" onClick={pestanaPendiente}>Seguimiento</a>
        {vista.perfil === 'detalle' && <a href="#detalle" aria-disabled="true" onClick={pestanaPendiente}>Detalle</a>}
      </nav>
      <main className="lienzo">
        <span className="aviso-carga sr">Cargando el tablero</span>
        <div className="grilla-seguimiento">
          <Contador datos={tablero} simulacion={simulacion} />
          <Simulador datos={tablero} escenario={vista.escenario} simulacion={simulacion} claveVista={vista.id} />
          <Fechas datos={tablero} simulacion={simulacion} />
          <Causa datos={tablero} />
          <Criticos datos={tablero} perfil={vista.perfil} />
          <EstadoGeneral datos={tablero} />
          <AvanceDocumento datos={tablero} />
          <TiempoContraAvance datos={tablero} />
          <ActividadesRetraso datos={tablero} />
          <MovimientoProyectada datos={tablero} />
          <CurvaSTarjeta datos={tablero} />
          <DondeAtraso datos={tablero} />
          <Hitos datos={tablero} />
          <AvancePorFrente datos={tablero} />
        </div>
        <PanelesEstado codigoError={codigoErrorInterno} onReintentar={() => setParams({})} />
      </main>
      <p className="sello solo-maqueta">{vista.sello}</p>
      <details className="solo-maqueta barra" open>
        <summary>Vistas de la maqueta</summary>
        <fieldset>
          <legend>Estado</legend>
          {vistasSeguimiento.map((opcion) => (
            <button
              key={opcion.id}
              type="button"
              aria-pressed={opcion.id === vista.id}
              onClick={() => setParams(opcion.id === 'base' ? {} : { vista: opcion.id })}
            >
              {opcion.rotulo}
            </button>
          ))}
        </fieldset>
      </details>
    </>
  )
}
