import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Cabecera } from '../../../application/components/Cabecera'
import { PanelesEstado } from '../../../application/components/PanelesEstado'
import { Pestanas } from '../../../application/components/Pestanas'
import { estadoDePantalla, useCargaMock } from '../../../application/services/mock'
import {
  cargarEjecutivo,
  tableroEnBlanco,
  vistaPorId,
  vistasEjecutivo,
  type TableroEjecutivo,
  type TarjetaItem,
} from './datos'
import { cifraEntera, mesAnio, nivelConfianza, participacion } from './formato'
import { specBase, specConfianza, specMadurez, specPreparacion } from './specs'
import { VegaChart } from './VegaChart'

const CLASES = [
  { clase: 'primaria', nombre: 'Fuentes primarias', color: 'var(--serie-real)' },
  { clase: 'secundaria', nombre: 'Fuentes secundarias (proyectos comparables)', color: 'var(--serie-secundaria)' },
  { clase: 'brecha', nombre: 'Brechas (información por desarrollar)', color: 'var(--serie-brecha)' },
] as const

function vacia(condicion: boolean) {
  return condicion ? '1' : '0'
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
              title={`Promedio de la madurez de los ${datos.preparacion?.componentes ?? 0} componentes clave`}
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
          {aceleracion == null && !sinDatos && (
            <div className="k-acel__cifra">
              <span className="apoyo">Sin información publicada en este corte</span>
            </div>
          )}
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
  const nivel = confianza ? nivelConfianza(confianza.etiqueta) : null

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
              <span className="nivel" data-nivel={nivel ?? undefined}>{confianza.etiqueta}</span>
              <VegaChart
                spec={specConfianza}
                datasets={{ confianza: [{ k: 1, nivel: nivel ?? '' }] }}
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

export function EjecutivoView() {
  const [params, setParams] = useSearchParams()
  const vista = vistaPorId(params.get('vista'))
  const [intento, setIntento] = useState(0)
  const carga = useCargaMock(`${vista.id}:${intento}`, () => cargarEjecutivo(vista))
  const tablero = carga.datos?.tablero ?? tableroEnBlanco
  const estado = estadoDePantalla(vista.estado, carga.estado)
  const codigoError = carga.codigoError ?? carga.datos?.codigoError ?? ''

  useEffect(() => {
    document.title = 'Panel ejecutivo · maqueta'
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
      <Cabecera datos={carga.datos ? { ...tablero, cortes: carga.datos.cortes } : null} rotulo="Panel ejecutivo" />
      <Pestanas actual="ejecutivo" perfil="detalle" />
      <main className="lienzo">
        {estado === 'cargando' && <span className="aviso-carga sr">Cargando el tablero</span>}
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
        <PanelesEstado codigoError={codigoError} onReintentar={() => (vista.estado ? setParams({}) : setIntento((n) => n + 1))} />
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
