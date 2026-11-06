import { Fragment, useEffect, useMemo, useState, type KeyboardEvent, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Cabecera } from '../../../application/components/Cabecera'
import { PanelesEstado } from '../../../application/components/PanelesEstado'
import { Pestanas } from '../../../application/components/Pestanas'
import { diaMes, num } from '../seguimiento/formato'
import { estadoDePantalla, useCargaMock } from '../../../application/services/mock'
import {
  SIN_FILTROS,
  cargarDetalle,
  tableroEnBlanco,
  vistaDetallePorId,
  vistasDetalle,
  type ActividadImpacto,
  type EstadoActividad,
  type Filtros,
  type TableroDetalle,
  type VistaDetalle,
} from './datos'
import { filtrarActividades, ordenarProximas, paginar } from './filtros'

type Semaforo = 'critico' | 'ambar' | 'neutro' | 'verde'

const ESTADOS: Array<{ estado: EstadoActividad; singular: string; plural: string; semaforo: Semaforo }> = [
  { estado: 'vencida', singular: 'Vencida', plural: 'Vencidas', semaforo: 'critico' },
  { estado: 'atrasada', singular: 'Atrasada', plural: 'Atrasadas', semaforo: 'ambar' },
  { estado: 'en_curso', singular: 'En curso', plural: 'En curso', semaforo: 'neutro' },
  { estado: 'por_iniciar', singular: 'Por iniciar', plural: 'Por iniciar', semaforo: 'neutro' },
  { estado: 'completada', singular: 'Completada', plural: 'Completadas', semaforo: 'verde' },
]

const POR_ESTADO = new Map(ESTADOS.map((e) => [e.estado, e]))

function IconoSemaforo({ semaforo }: { semaforo: Semaforo }) {
  if (semaforo === 'critico') {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="7" fill="currentColor" />
        <path d="M5.2 5.2l5.6 5.6M10.8 5.2l-5.6 5.6" stroke="#fff" strokeWidth="1.8" />
      </svg>
    )
  }
  if (semaforo === 'ambar') {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M8 1l7 13H1z" fill="currentColor" />
        <path d="M8 6v4M8 11.6v.6" stroke="#fff" strokeWidth="1.8" />
      </svg>
    )
  }
  if (semaforo === 'verde') {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="7" fill="currentColor" />
        <path d="M4.5 8.2l2.3 2.3 4.7-4.9" fill="none" stroke="#fff" strokeWidth="1.8" />
      </svg>
    )
  }
  return null
}

function ChipEstado({ estado }: { estado: EstadoActividad }) {
  const info = POR_ESTADO.get(estado)
  if (!info) return null
  return (
    <span className="chip-estado" data-estado={info.semaforo}>
      <IconoSemaforo semaforo={info.semaforo} />
      {info.singular}
    </span>
  )
}

/** Activa un control con Enter o Espacio (§10, teclado). */
function alTeclear(accion: () => void) {
  return (evento: KeyboardEvent) => {
    if (evento.key === 'Enter' || evento.key === ' ') {
      evento.preventDefault()
      accion()
    }
  }
}

function Tarjeta(props: { id: string; titulo: string; subtitulo?: string; vacia: boolean; mensajeVacio?: string; children?: ReactNode }) {
  const area = props.id.toLowerCase()
  return (
    <section className="tarjeta" style={{ gridArea: area }} data-id={props.id} data-vacia={props.vacia ? '1' : '0'} aria-labelledby={`t-${props.id}`}>
      <header className="tarjeta__cab">
        <div>
          <h2 className="tarjeta__titulo" id={`t-${props.id}`}>{props.titulo}</h2>
          {props.subtitulo && <p className="tarjeta__subtitulo">{props.subtitulo}</p>}
        </div>
        <span className="sr">{props.id}</span>
      </header>
      <div className="tarjeta__cuerpo">{props.children}</div>
      {props.mensajeVacio && (
        <div className="tarjeta__vacio">
          <span>{props.mensajeVacio}</span>
        </div>
      )}
    </section>
  )
}

/* ---------- Paginación ---------- */

function Paginacion(props: { nombre: string; pagina: number; paginas: number; desde: number; hasta: number; total: number; alCambiar: (pagina: number) => void }) {
  const { pagina, paginas, alCambiar } = props
  const boton = (destino: number, rotulo: ReactNode, opciones: { actual?: boolean; deshabilitado?: boolean; etiqueta: string }) => (
    <span
      className="pag__boton"
      role="button"
      tabIndex={opciones.deshabilitado ? -1 : 0}
      aria-label={opciones.etiqueta}
      aria-current={opciones.actual ? 'page' : undefined}
      aria-disabled={opciones.deshabilitado ? 'true' : undefined}
      onClick={() => !opciones.deshabilitado && alCambiar(destino)}
      onKeyDown={alTeclear(() => !opciones.deshabilitado && alCambiar(destino))}
    >
      {rotulo}
    </span>
  )

  return (
    <nav className="pag" aria-label={`Páginas de ${props.nombre}`}>
      <span className="pag__rotulo">
        {props.total === 0 ? '0 de 0' : `${props.desde}–${props.hasta} de ${props.total}`}
      </span>
      <span className="pag__botones">
        {boton(pagina - 1, '‹ Anterior', { deshabilitado: pagina <= 1, etiqueta: 'Página anterior' })}
        {Array.from({ length: paginas }, (_, i) => i + 1).map((n) => (
          <Fragment key={n}>{boton(n, n, { actual: n === pagina, etiqueta: `Página ${n}` })}</Fragment>
        ))}
        {boton(pagina + 1, 'Siguiente ›', { deshabilitado: pagina >= paginas, etiqueta: 'Página siguiente' })}
      </span>
    </nav>
  )
}

/* ---------- M01 · Estado de actividades al corte (D-01) ---------- */

function EstadosM01(props: { datos: TableroDetalle; seleccionado: EstadoActividad | ''; alElegir: (estado: EstadoActividad) => void }) {
  const sinCorte = props.datos.detalle.corte == null
  const conteo = new Map(props.datos.detalle.estados.map((e) => [e.estado, e.actividades]))

  return (
    <Tarjeta
      id="M01"
      titulo="Estado de actividades al corte"
      subtitulo={`Haz clic en un estado para filtrar la tabla. Atrasada: más de ${props.datos.umbralAtrasoPp == null ? '—' : num(props.datos.umbralAtrasoPp, 0)} puntos por debajo del plan; vencida: fecha fin superada sin 100 %`}
      vacia={false}
    >
      <div className="estados-m01" role="group" aria-label="Filtrar por estado">
        {ESTADOS.map((e) => {
          const cifra = conteo.get(e.estado) ?? 0
          const presionado = props.seleccionado === e.estado
          return (
            <span
              key={e.estado}
              className="boton-estado"
              role="button"
              tabIndex={sinCorte ? -1 : 0}
              data-estado={e.semaforo}
              aria-pressed={presionado}
              aria-disabled={sinCorte ? 'true' : undefined}
              title={`${e.plural}: ${cifra} actividades. Clic para filtrar la tabla; otro clic quita el filtro`}
              onClick={() => !sinCorte && props.alElegir(e.estado)}
              onKeyDown={alTeclear(() => !sinCorte && props.alElegir(e.estado))}
            >
              {presionado && (
                <svg className="boton-estado__check" width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M3 8.5l3.2 3.2L13 4.8" fill="none" stroke="currentColor" strokeWidth="2.2" />
                </svg>
              )}
              <span className="boton-estado__cifra">{cifra}</span>
              <span className="boton-estado__rotulo">
                <IconoSemaforo semaforo={e.semaforo} />
                {e.plural}
              </span>
            </span>
          )
        })}
      </div>
    </Tarjeta>
  )
}

/* ---------- M02 · Filtros (D-02) ---------- */

function IconoLupa() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M15.5 15.5L21 21" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

function LimpiarFiltros({ deshabilitado, alLimpiar }: { deshabilitado: boolean; alLimpiar: () => void }) {
  if (deshabilitado) {
    return <span className="filtro__limpiar" aria-disabled="true">Limpiar filtros</span>
  }
  return (
    <a
      className="filtro__limpiar"
      href="#"
      onClick={(evento) => {
        evento.preventDefault()
        alLimpiar()
      }}
    >
      Limpiar filtros
    </a>
  )
}

function FiltrosM02(props: { datos: TableroDetalle; filtros: Filtros; alCambiar: (cambio: Partial<Filtros>) => void; alLimpiar: () => void }) {
  const { filtros, alCambiar } = props
  const sinCorte = props.datos.detalle.corte == null

  return (
    <Tarjeta id="M02" titulo="Filtros" vacia={false}>
      <form className="filtros" role="search" action="#" onSubmit={(evento) => evento.preventDefault()}>
        <label className="filtro">
          <span>Frente</span>
          <select value={filtros.frente} disabled={sinCorte} onChange={(evento) => alCambiar({ frente: evento.target.value })}>
            <option value="">Todos los frentes</option>
            {props.datos.detalle.frentes.map((frente) => (
              <option key={frente} value={frente}>{frente}</option>
            ))}
          </select>
        </label>
        <label className="filtro">
          <span>Estado</span>
          <select
            value={filtros.estado}
            disabled={sinCorte}
            onChange={(evento) => alCambiar({ estado: evento.target.value as EstadoActividad | '' })}
          >
            <option value="">Todos</option>
            {ESTADOS.map((e) => (
              <option key={e.estado} value={e.estado}>{e.singular}</option>
            ))}
          </select>
        </label>
        <label className="filtro filtro--casilla">
          <input
            type="checkbox"
            checked={filtros.soloRutaCritica}
            disabled={sinCorte}
            onChange={(evento) => alCambiar({ soloRutaCritica: evento.target.checked })}
          />
          <span>Solo ruta crítica</span>
        </label>
        <label className="filtro filtro--buscar">
          <span className="sr">Buscar actividad</span>
          <IconoLupa />
          <input
            type="search"
            placeholder="Buscar actividad…"
            value={filtros.busqueda}
            disabled={sinCorte}
            onChange={(evento) => alCambiar({ busqueda: evento.target.value })}
          />
        </label>
        <LimpiarFiltros deshabilitado={sinCorte} alLimpiar={props.alLimpiar} />
      </form>
    </Tarjeta>
  )
}

/* ---------- Celdas ---------- */

function CeldaActividad({ edt, nombre }: { edt: string; nombre: string }) {
  return (
    <span className="celda-act">
      <span className="celda-act__edt">{edt}</span>
      {nombre}
    </span>
  )
}

function Impacto({ valor }: { valor: number }) {
  return valor > 0 ? <strong>{num(valor)}</strong> : <>{num(valor)}</>
}

/* ---------- M03 · Actividades que mueven la fecha (D-03) ---------- */

function MuevenFecha({ filas }: { filas: ActividadImpacto[] }) {
  const [pagina, setPagina] = useState(1)
  const vista = paginar(filas, pagina)
  const vacia = filas.length === 0

  return (
    <Tarjeta
      id="M03"
      titulo="Actividades que mueven la fecha"
      subtitulo="Impacto = atraso − holgura total, en días hábiles. Recuperar estas actividades es lo que adelanta la fecha meta"
      vacia={vacia}
      mensajeVacio="Ninguna actividad corre la fecha en este corte"
    >
      <div className="tabla-marco">
        <table className="tabla">
          <caption className="sr">Actividades que mueven la fecha, de mayor a menor impacto</caption>
          <thead>
            <tr>
              <th scope="col" className="izq">Actividad</th>
              <th scope="col" className="izq">Estado</th>
              <th scope="col" className="der">Atraso (hábiles)</th>
              <th scope="col" className="der">Holgura (hábiles)</th>
              <th scope="col" className="der">Impacto (hábiles)</th>
            </tr>
          </thead>
          <tbody>
            {vista.filas.map((a) => (
              <tr key={a.edt}>
                <td className="izq"><CeldaActividad edt={a.edt} nombre={a.nombre} /></td>
                <td className="izq"><ChipEstado estado={a.estado} /></td>
                <td className="der">{num(a.atraso_dias)}</td>
                <td className="der">{num(a.holgura_total)}</td>
                <td className="der"><Impacto valor={a.impacto} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!vacia && <Paginacion nombre="M03" {...vista} total={filas.length} alCambiar={setPagina} />}
    </Tarjeta>
  )
}

/* ---------- M04 · Próximas semanas (D-04) ---------- */

function Proximas({ datos }: { datos: TableroDetalle }) {
  const { corte, proximas, ventana_proximas: ventana } = datos.detalle
  const filas = corte ? ordenarProximas(proximas, corte.fecha_corte, ventana) : []
  const semanas = ventana / 7
  const vacia = filas.length === 0

  return (
    <Tarjeta
      id="M04"
      titulo={`Próximas ${num(semanas, Number.isInteger(semanas) ? 0 : 1)} semanas`}
      subtitulo={`Actividades no terminadas que inician o terminan en los ${ventana} días siguientes al corte`}
      vacia={vacia}
      mensajeVacio={`Nada inicia ni termina en los próximos ${ventana} días`}
    >
      <div className="tabla-marco">
        <table className="tabla">
          <caption className="sr">Actividades que inician o terminan en los {ventana} días siguientes al corte</caption>
          <thead>
            <tr>
              <th scope="col" className="izq">Actividad</th>
              <th scope="col" className="izq">Inicio</th>
              <th scope="col" className="izq">Fin</th>
              <th scope="col" className="der">Holgura (hábiles)</th>
              <th scope="col" className="izq">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((a) => (
              <tr key={a.edt}>
                <td className="izq"><CeldaActividad edt={a.edt} nombre={a.nombre} /></td>
                <td className="izq">{diaMes(a.inicio_base)}</td>
                <td className="izq">{diaMes(a.fin_base)}</td>
                <td className="der">{num(a.holgura_total)}</td>
                <td className="izq"><ChipEstado estado={a.estado} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Tarjeta>
  )
}

/* ---------- M05 · Lista completa de actividades (D-02) ---------- */

function ListaCompleta(props: { datos: TableroDetalle; filtros: Filtros; pagina: number; alPaginar: (pagina: number) => void; alLimpiar: () => void }) {
  const { actividades } = props.datos.detalle
  const filtradas = useMemo(() => filtrarActividades(actividades, props.filtros), [actividades, props.filtros])
  const vista = paginar(filtradas, props.pagina)
  const sinActividades = actividades.length === 0

  return (
    <Tarjeta id="M05" titulo="Lista completa de actividades" vacia={sinActividades} mensajeVacio="Sin actividades en este corte">
      {!sinActividades && filtradas.length === 0 && (
        <div className="sin-resultados">
          <p>Ninguna actividad cumple los filtros</p>
          <LimpiarFiltros deshabilitado={false} alLimpiar={props.alLimpiar} />
        </div>
      )}
      {filtradas.length > 0 && (
        <>
          <div className="tabla-marco">
            <table className="tabla">
              <caption className="sr">Lista completa de actividades</caption>
              <thead>
                <tr>
                  <th scope="col" className="izq">EDT</th>
                  <th scope="col" className="izq">Actividad</th>
                  <th scope="col" className="izq">Frente</th>
                  <th scope="col" className="izq">Estado</th>
                  <th scope="col" className="der">Atraso (hábiles)</th>
                  <th scope="col" className="der">Holgura (hábiles)</th>
                  <th scope="col" className="der">Impacto (hábiles)</th>
                  <th scope="col" className="centro">Ruta crítica</th>
                </tr>
              </thead>
              <tbody>
                {vista.filas.map((a) => (
                  <tr key={a.edt}>
                    <td className="izq"><span className="celda-act__edt">{a.edt}</span></td>
                    <td className="izq">
                      {a.nombre}
                      {a.hito && <> <span className="marca-hito">Hito</span></>}
                    </td>
                    <td className="izq">{a.frente}</td>
                    <td className="izq"><ChipEstado estado={a.estado} /></td>
                    <td className="der">{num(a.atraso_dias)}</td>
                    <td className="der">{num(a.holgura_total)}</td>
                    <td className="der"><Impacto valor={a.impacto} /></td>
                    <td className="centro">
                      {a.ruta_critica ? <span className="rc rc--si">Sí</span> : <span className="rc">No</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Paginacion nombre="M05" {...vista} total={filtradas.length} alCambiar={props.alPaginar} />
        </>
      )}
    </Tarjeta>
  )
}

/* ---------- Vista ---------- */

function Tablero({ vista, datos }: { vista: VistaDetalle; datos: TableroDetalle }) {
  const [filtros, setFiltros] = useState<Filtros>(vista.filtros)
  const [pagina, setPagina] = useState(vista.pagina)

  const cambiar = (cambio: Partial<Filtros>) => {
    setFiltros((previos) => ({ ...previos, ...cambio }))
    setPagina(1)
  }
  const limpiar = () => cambiar(SIN_FILTROS)
  // M01: un clic filtra y sincroniza «Estado» de M02; otro clic sobre el mismo botón quita el filtro.
  const elegirEstado = (estado: EstadoActividad) => cambiar({ estado: filtros.estado === estado ? '' : estado })

  return (
    <div className="grilla-detalle">
      <EstadosM01 datos={datos} seleccionado={filtros.estado} alElegir={elegirEstado} />
      <FiltrosM02 datos={datos} filtros={filtros} alCambiar={cambiar} alLimpiar={limpiar} />
      <MuevenFecha filas={datos.detalle.mueven_fecha} />
      <Proximas datos={datos} />
      <ListaCompleta datos={datos} filtros={filtros} pagina={pagina} alPaginar={setPagina} alLimpiar={limpiar} />
    </div>
  )
}

export function DetalleView() {
  const [params, setParams] = useSearchParams()
  const vista = vistaDetallePorId(params.get('vista'))
  const [intento, setIntento] = useState(0)
  const carga = useCargaMock(`${vista.id}:${intento}`, () => cargarDetalle(vista))
  const datos = carga.datos?.tablero ?? tableroEnBlanco
  const estado = estadoDePantalla(vista.estado, carga.estado)
  const codigoError = carga.codigoError ?? carga.datos?.codigoError ?? ''

  useEffect(() => {
    document.title = 'Detalle de actividades · maqueta'
  }, [])

  useEffect(() => {
    if (estado) document.body.dataset.estado = estado
    else delete document.body.dataset.estado
    return () => {
      delete document.body.dataset.estado
    }
  }, [estado])

  return (
    <>
      <Cabecera
        datos={carga.datos ? { corte: datos.detalle.corte, cabecera: datos.cabecera, cortes: carga.datos.cortes } : null}
        rotulo="Detalle de actividades"
      />
      <Pestanas actual="detalle" perfil="detalle" />
      <main className="lienzo">
        {estado === 'cargando' && <span className="aviso-carga sr">Cargando el tablero</span>}
        <Tablero key={vista.id} vista={vista} datos={datos} />
        <PanelesEstado codigoError={codigoError} onReintentar={() => (vista.estado ? setParams({}) : setIntento((n) => n + 1))} />
      </main>
      <p className="sello solo-maqueta">{vista.sello}</p>
      <details className="solo-maqueta barra" open>
        <summary>Vistas de la maqueta</summary>
        <fieldset>
          <legend>Estado</legend>
          {vistasDetalle.map((opcion) => (
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
