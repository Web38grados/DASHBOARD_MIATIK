import logoCliente from '../../assets/logo-cliente.png'
import { fechaCorte } from '../../presentation/views/ejecutivo/formato'

export const SUBTITULO_TABLERO =
  'Preparación del documento técnico con inteligencia artificial: insumos, brechas y prioridades'

export type DatosCabecera = {
  corte: { corte_id: number; fecha_corte: string } | null
  cabecera: { nombre_tablero: string; meta_fecha: string }
  /** Cortes publicados (`/v1/tablero/cortes`) para el selector (C-12). */
  cortes?: Array<{ corte_id: number; fecha_corte: string }>
}

function IconoMeta() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 21V3m0 1h11l-2 4 2 4H5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}

/** E-01: cabecera común de los tableros. `rotulo` nombra la vista (Panel ejecutivo, Seguimiento del cronograma…). */
export function Cabecera({ datos, rotulo }: { datos: DatosCabecera | null; rotulo: string }) {
  const fecha = datos?.corte ? fechaCorte(datos.corte.fecha_corte) : null
  const meta = datos?.cabecera.meta_fecha ? fechaCorte(datos.cabecera.meta_fecha) : null

  return (
    <header className="cabecera" data-id="E-01">
      <img className="cabecera__logo" src={logoCliente} alt="Logo del cliente" />
      <span className="cabecera__sep" aria-hidden="true" />
      <div className="cabecera__titulos">
        <p className="cabecera__tablero">{datos?.cabecera.nombre_tablero || 'Tablero de preparación del documento técnico'}</p>
        <p className="cabecera__proyecto">{rotulo}</p>
        <p className="cabecera__subtitulo">{SUBTITULO_TABLERO}</p>
      </div>
      <div className="cabecera__corte">
        {fecha ? (
          <>
            <span>
              Datos al corte del <strong>{fecha}</strong>
            </span>
            <select className="selector-corte" aria-label="Corte" value={datos?.corte?.corte_id} onChange={() => undefined}>
              {(datos?.cortes?.length ? datos.cortes : [datos!.corte!]).map((c) => (
                // El mock solo trae cifras del último corte; los demás se listan sin poder elegirse.
                <option key={c.corte_id} value={c.corte_id} disabled={c.corte_id !== datos?.corte?.corte_id}>
                  {fechaCorte(c.fecha_corte)}
                </option>
              ))}
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
