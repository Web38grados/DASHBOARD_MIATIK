import { useEffect, useState, type MouseEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import logoCliente from '../../../static/marca/logo-cliente.png'
import {
  rutaErrorInterno,
  tableroEnBlanco,
  vistaPorId,
  vistasEjecutivo,
  type EstadoPantalla,
  type TableroEjecutivo,
  type TarjetaItem,
} from './datos'
import { cifraEntera, fechaCorte, mesAnio, nivelConfianza, participacion } from './formato'
import { specBase, specConfianza, specMadurez, specPreparacion } from './specs'
import { VegaChart } from './VegaChart'

const SUBTITULO =
  'Preparación del documento técnico con inteligencia artificial: insumos, brechas y prioridades'

const CLASES = [
  { clase: 'primaria', nombre: 'Fuentes primarias', color: 'var(--serie-real)' },
  { clase: 'secundaria', nombre: 'Fuentes secundarias (proyectos comparables)', color: 'var(--serie-secundaria)' },
  { clase: 'brecha', nombre: 'Brechas (información por desarrollar)', color: 'var(--serie-brecha)' },
] as const

function vacia(condicion: boolean) {
  return condicion ? '1' : '0'
}

function IconoMeta() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 21V3m0 1h11l-2 4 2 4H5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}

function IconoListo() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4.5 8.2l2.3 2.3 4.7-4.9" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

function IconoMes() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="1.5" y="2.5" width="13" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M1.5 6.5h13M5 1v3M11 1v3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function IconoInsumos() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 4h10l4 4v12H4z M14 4v4h4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  )
}

function IconoAnalisis() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  )
}

function IconoBrechas() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

function IconoValidacion() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z M8.5 12l2.4 2.4 4.6-4.8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  )
}

const ICONOS_FLUJO = [IconoInsumos, IconoAnalisis, IconoBrechas, IconoValidacion]

function Cabecera({ datos }: { datos: TableroEjecutivo | null }) {
  const fecha = datos?.corte ? fechaCorte(datos.corte.fecha_corte) : null
  const meta = datos?.cabecera.meta_fecha ? fechaCorte(datos.cabecera.meta_fecha) : null

  return (
    <header className="cabecera" data-id="E-01">
      <img className="cabecera__logo" src={logoCliente} alt="Logo del cliente" />
      <span className="cabecera__sep" aria-hidden="true" />
      <div className="cabecera__titulos">
        <p className="cabecera__tablero">{datos?.cabecera.nombre_tablero || 'Tablero de preparación del documento técnico'}</p>
        <p className="cabecera__proyecto">Panel ejecutivo</p>
        <p className="cabecera__subtitulo">{SUBTITULO}</p>
      </div>
      <div className="cabecera__corte">
        {fecha ? (
          <>
            <span>
              Datos al corte del <strong>{fecha}</strong>
            </span>
            <select className="selector-corte" aria-label="Corte" defaultValue={fecha}>
              <option>{fecha}</option>
            </select>
          </>
        ) : (
          <span>
            <strong>Aún no hay un corte publicado</strong>
          </span>
        )}
      </div>
      <div className="meta">
        <IconoMeta />
        <div>
          <p className="meta__rotulo">Fecha meta</p>
          <p className="meta__fecha">{meta}</p>
        </div>
      </div>
    </header>
  )
}

function Preparacion({ datos }: { datos: TableroEjecutivo }) {
  const sinDatos = datos.preparacion == null

  return (
    <section className="tarjeta" style={{ gridArea: 'e03' }} data-id="E-03" data-vacia={vacia(sinDatos)} aria-labelledby="t-E-03">
      <header className="tarjeta__cab">
        <div>
          <h2 className="tarjeta__titulo" id="t-E-03">Preparación del documento técnico</h2>
        </div>
        <span className="sr">E-03</span>
      </header>
      <div className="tarjeta__cuerpo">
        <div className="k-prep">
          {!sinDatos && (
            <VegaChart
              spec={specPreparacion}
              datasets={{ preparacion: [datos.preparacion] }}
              className="grafico"
              style={{ width: 112, flex: 'none' }}
              title="Promedio de la madurez de los 5 componentes clave"
            />
          )}
          <div className="k-prep__texto">
            <span className="apoyo">Madurez técnica estimada para la fecha meta</span>
          </div>
        </div>
      </div>
      <div className="tarjeta__vacio">
        <span className="vacio-anillo" aria-hidden="true" />
        <span>Sin datos de madurez en este corte</span>
      </div>
    </section>
  )
}

function Aceleracion({ datos }: { datos: TableroEjecutivo }) {
  const items = datos.capacidades.items
  const aceleracion = datos.capacidades.aceleracion
  const sinDatos = items.length === 0

  return (
    <section className="tarjeta" style={{ gridArea: 'e08' }} data-id="E-08" data-vacia={vacia(sinDatos)} aria-labelledby="t-E-08">
      <header className="tarjeta__cab">
        <div>
          <h2 className="tarjeta__titulo" id="t-E-08">Aceleración con IA</h2>
        </div>
        <span className="sr">E-08</span>
      </header>
      <div className="tarjeta__cuerpo">
        <div className="k-acel" style={{ flex: 1 }}>
          {aceleracion?.valor != null && (
            <div className="k-acel__cifra">
              <span className="cifra">
                {cifraEntera(aceleracion.valor)}
                <small>{'\u00A0%'}</small>
              </span>
              <span className="apoyo">{aceleracion.titulo}</span>
              {aceleracion.detalle && <span className="apoyo">{aceleracion.detalle}</span>}
            </div>
          )}
          <ul className="capacidades">
            {items.map((item) => (
              <li key={item.orden}>
                <IconoListo />
                <span>{item.titulo}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="tarjeta__vacio">
        <span>Sin información publicada en este corte</span>
      </div>
    </section>
  )
}

function Confianza({ datos }: { datos: TableroEjecutivo }) {
  const confianza = datos.confianza
  const sinDatos = confianza == null
  const nivel = confianza ? nivelConfianza(confianza.etiqueta ?? '') : 'baja'

  return (
    <section className="tarjeta" style={{ gridArea: 'e04' }} data-id="E-04" data-vacia={vacia(sinDatos)} aria-labelledby="t-E-04">
      <header className="tarjeta__cab">
        <div>
          <h2 className="tarjeta__titulo" id="t-E-04">Confianza en la fecha</h2>
        </div>
        <span className="sr">E-04</span>
      </header>
      <div className="tarjeta__cuerpo">
        {confianza && (
          <div className="e04">
            <div className="e04__fila">
              <span className="nivel" data-nivel={nivel}>{confianza.etiqueta}</span>
              <VegaChart
                spec={specConfianza}
                datasets={{ confianza: [{ k: 1, nivel }] }}
                className="grafico e04__grafico"
              />
            </div>
            {confianza.detalle && <p className="sustento">{confianza.detalle}</p>}
          </div>
        )}
      </div>
      <div className="tarjeta__vacio">
        <span className="vacio-medidor" aria-hidden="true" />
        <span>Sin tarjeta de confianza publicada en este corte</span>
      </div>
    </section>
  )
}

function BaseInformacion({ datos }: { datos: TableroEjecutivo }) {
  const base = datos.base_informacion
  const sinDatos = base == null
  const porClase = new Map(base?.clases.map((clase) => [clase.clase, clase.insumos]) ?? [])

  return (
    <section className="tarjeta" style={{ gridArea: 'e05' }} data-id="E-05" data-vacia={vacia(sinDatos)} aria-labelledby="t-E-05">
      <header className="tarjeta__cab">
        <div>
          <h2 className="tarjeta__titulo" id="t-E-05">Base de información</h2>
          <p className="tarjeta__subtitulo">Origen de los insumos</p>
        </div>
        <span className="sr">E-05</span>
      </header>
      <div className="tarjeta__cuerpo">
        {base && (
          <div className="e05">
            <VegaChart
              spec={specBase}
              datasets={{ clases: base.clases }}
              className="grafico"
              style={{ width: 136, flex: 'none' }}
            />
            <ul className="leyenda">
              {CLASES.map((clase) => {
                const insumos = porClase.get(clase.clase) ?? 0
                return (
                  <li key={clase.clase}>
                    <i style={{ background: clase.color }} />
                    <span>{clase.nombre}</span>
                    <span className="valor">
                      {insumos} · {participacion(insumos, base.total)}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
      <div className="tarjeta__vacio">
        <span>Sin inventario de insumos en este corte</span>
      </div>
    </section>
  )
}

function Madurez({ datos }: { datos: TableroEjecutivo }) {
  const sinDatos = datos.madurez_componentes.length === 0

  return (
    <section className="tarjeta" style={{ gridArea: 'e02' }} data-id="E-02" data-vacia={vacia(sinDatos)} aria-labelledby="t-E-02">
      <header className="tarjeta__cab">
        <div>
          <h2 className="tarjeta__titulo" id="t-E-02">Madurez por componente clave</h2>
          <p className="tarjeta__subtitulo">Requisitos del documento técnico con información disponible, por componente</p>
        </div>
        <span className="sr">E-02</span>
      </header>
      <div className="tarjeta__cuerpo">
        {!sinDatos && (
          <VegaChart
            spec={specMadurez}
            datasets={{ componentes: datos.madurez_componentes }}
            className="grafico k-mad"
          />
        )}
      </div>
      <div className="tarjeta__vacio">
        <span>Sin datos de madurez en este corte</span>
      </div>
    </section>
  )
}

function Brechas({ datos }: { datos: TableroEjecutivo }) {
  const items = datos.brechas_criticas.items
  const sinDatos = items.length === 0

  return (
    <section className="tarjeta" style={{ gridArea: 'e06' }} data-id="E-06" data-vacia={vacia(sinDatos)} aria-labelledby="t-E-06">
      <header className="tarjeta__cab">
        <div>
          <h2 className="tarjeta__titulo" id="t-E-06">Brechas críticas</h2>
          <p className="tarjeta__subtitulo">Asuntos que pueden afectar la calidad o el cronograma</p>
        </div>
        <span className="sr">E-06</span>
      </header>
      <div className="tarjeta__cuerpo">
        <ol className="lista">
          {items.map((item) => (
            <li key={item.orden}>
              <span className="lista__n">{item.orden}</span>
              <div>
                <p className="lista__titulo">{item.titulo}</p>
                {item.detalle && <p className="lista__detalle">{item.detalle}</p>}
              </div>
              {item.etiqueta && (
                <span className="etiqueta" data-prioridad={item.etiqueta.toLowerCase()}>{item.etiqueta}</span>
              )}
            </li>
          ))}
        </ol>
      </div>
      <div className="tarjeta__vacio">
        <span>Sin brechas críticas publicadas en este corte</span>
      </div>
    </section>
  )
}

function Flujo({ datos }: { datos: TableroEjecutivo }) {
  const items = datos.flujo.items
  const sinDatos = items.length === 0

  return (
    <section className="tarjeta" style={{ gridArea: 'e09' }} data-id="E-09" data-vacia={vacia(sinDatos)} aria-labelledby="t-E-09">
      <header className="tarjeta__cab">
        <div>
          <h2 className="tarjeta__titulo" id="t-E-09">Flujo de trabajo con IA</h2>
        </div>
        <span className="sr">E-09</span>
      </header>
      <div className="tarjeta__cuerpo">
        <ol className="flujo">
          {items.map((item, indice) => {
            const Icono = ICONOS_FLUJO[indice] ?? IconoInsumos
            return (
              <li key={item.orden}>
                <span className="flujo__icono">
                  <Icono />
                </span>
                <span className="flujo__paso">{item.etiqueta}</span>
                <b className="flujo__titulo">{item.titulo}</b>
                {item.detalle && <span className="flujo__detalle">{item.detalle}</span>}
              </li>
            )
          })}
        </ol>
      </div>
      <div className="tarjeta__vacio">
        <span>Sin flujo publicado en este corte</span>
      </div>
    </section>
  )
}

function Prioridad({ item }: { item: TarjetaItem }) {
  return (
    <li>
      <span className="lista__n">{item.orden}</span>
      <p className="lista__titulo">{item.titulo}</p>
      {item.mes && (
        <span className="mes">
          <IconoMes />
          {mesAnio(item.mes)}
        </span>
      )}
    </li>
  )
}

function Prioridades({ datos }: { datos: TableroEjecutivo }) {
  const items = datos.prioridades.items
  const sinDatos = items.length === 0

  return (
    <section className="tarjeta" style={{ gridArea: 'e07' }} data-id="E-07" data-vacia={vacia(sinDatos)} aria-labelledby="t-E-07">
      <header className="tarjeta__cab">
        <div>
          <h2 className="tarjeta__titulo" id="t-E-07">Prioridades inmediatas (próx. 60–90 días)</h2>
        </div>
        <span className="sr">E-07</span>
      </header>
      <div className="tarjeta__cuerpo">
        <ol className="lista compacta">
          {items.map((item) => (
            <Prioridad key={item.orden} item={item} />
          ))}
        </ol>
      </div>
      <div className="tarjeta__vacio">
        <span>Sin prioridades publicadas en este corte</span>
      </div>
    </section>
  )
}

function pestanaPendiente(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault()
}

function aplicarEstado(estado: EstadoPantalla | null) {
  if (estado) document.body.dataset.estado = estado
  else delete document.body.dataset.estado
}

export function EjecutivoView() {
  const [params, setParams] = useSearchParams()
  const vista = vistaPorId(params.get('vista'))
  const [datos, setDatos] = useState<TableroEjecutivo | null>(null)
  const [estado, setEstado] = useState<EstadoPantalla | null>('cargando')
  const [codigoError, setCodigoError] = useState('sint-0000-0000')
  const tablero = datos ?? tableroEnBlanco

  useEffect(() => {
    const ctrl = new AbortController()

    const rutaCabecera = vistasEjecutivo[0].ruta

    if (vista.estado === 'error' || vista.estado === '403') {
      setEstado(vista.estado)
      if (rutaCabecera) {
        fetch(rutaCabecera, { signal: ctrl.signal })
          .then(async (respuesta) => {
            if (!respuesta.ok) throw new Error(String(respuesta.status))
            return respuesta.json() as Promise<TableroEjecutivo>
          })
          .then((cuerpo) => {
            if (!ctrl.signal.aborted) setDatos(cuerpo)
          })
          .catch((error: unknown) => {
            if (error instanceof DOMException && error.name === 'AbortError') return
          })
      }
    }

    if (vista.estado === 'error') {
      fetch(rutaErrorInterno, { signal: ctrl.signal })
        .then(async (respuesta) => {
          if (!respuesta.ok) throw new Error(String(respuesta.status))
          return respuesta.json() as Promise<{ id_solicitud?: string }>
        })
        .then((cuerpo) => {
          if (!ctrl.signal.aborted && cuerpo.id_solicitud) setCodigoError(cuerpo.id_solicitud)
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === 'AbortError') return
        })
      return () => ctrl.abort()
    }

    if (vista.estado === '403' || !vista.ruta) return () => ctrl.abort()

    setEstado('cargando')
    fetch(vista.ruta, { signal: ctrl.signal })
      .then(async (respuesta) => {
        if (!respuesta.ok) throw new Error(String(respuesta.status))
        return respuesta.json() as Promise<TableroEjecutivo>
      })
      .then((cuerpo) => {
        if (ctrl.signal.aborted) return
        setDatos(cuerpo)
        setEstado(vista.estado === 'cargando' ? 'cargando' : null)
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        if (!ctrl.signal.aborted) setEstado('error')
      })

    return () => ctrl.abort()
  }, [vista])

  useEffect(() => {
    aplicarEstado(estado)
    return () => {
      delete document.body.dataset.estado
    }
  }, [estado])

  return (
    <>
      <Cabecera datos={datos} />
      <nav className="pestanas" aria-label="Tableros">
        <a href="/" aria-current="page">Ejecutivo</a>
        <a href="#seguimiento" aria-disabled="true" onClick={pestanaPendiente}>Seguimiento</a>
        <a href="#detalle" aria-disabled="true" onClick={pestanaPendiente}>Detalle</a>
      </nav>
      <main className="lienzo">
        <span className="aviso-carga sr">Cargando el tablero</span>
        <div className="grilla-ejecutivo">
          <Preparacion datos={tablero} />
          <Aceleracion datos={tablero} />
          <Confianza datos={tablero} />
          <BaseInformacion datos={tablero} />
          <Madurez datos={tablero} />
          <Brechas datos={tablero} />
          <Flujo datos={tablero} />
          <Prioridades datos={tablero} />
        </div>
        <section className="panel-estado" id="panel-error" role="alert">
          <svg width="44" height="44" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="10" fill="none" stroke="var(--estado-critico)" strokeWidth="1.8" />
            <path d="M12 7v6M12 16.5v.5" stroke="var(--estado-critico)" strokeWidth="2" />
          </svg>
          <h2>No se pudo cargar el tablero</h2>
          <p>Intenta de nuevo en unos minutos. Si el problema sigue, informa este código:</p>
          <p><code>{codigoError}</code></p>
          <button type="button" className="boton" onClick={() => setParams({})}>Reintentar</button>
        </section>
        <section className="panel-estado" id="panel-403" role="alert">
          <svg width="44" height="44" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="5" y="10" width="14" height="10" rx="2" fill="none" stroke="var(--cm-tinta-2)" strokeWidth="1.8" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="var(--cm-tinta-2)" strokeWidth="1.8" />
          </svg>
          <h2>No tienes acceso a este tablero</h2>
          <p>Tu perfil no incluye esta vista. Si la necesitas, pídela a quien administra los accesos.</p>
        </section>
      </main>
      <p className="sello solo-maqueta">{vista.sello}</p>
      <details className="solo-maqueta barra" open>
        <summary>Vistas de la maqueta</summary>
        <fieldset>
          <legend>Estado</legend>
          {vistasEjecutivo.map((opcion) => (
            <button
              key={opcion.id}
              type="button"
              aria-pressed={opcion.id === vista.id}
              onClick={() => setParams(opcion.id === 'con-aceleracion' ? {} : { vista: opcion.id })}
            >
              {opcion.rotulo}
            </button>
          ))}
        </fieldset>
      </details>
    </>
  )
}
