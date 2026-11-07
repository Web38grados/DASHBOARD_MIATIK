import { Link } from 'react-router-dom'

export type Perfil = 'ejecutivo' | 'seguimiento' | 'detalle'
export type Tablero = Perfil

const NIVEL: Record<Perfil, number> = { ejecutivo: 0, seguimiento: 1, detalle: 2 }

const PESTANAS: Array<{ tablero: Tablero; rotulo: string; ruta: (perfil: Perfil) => string }> = [
  { tablero: 'ejecutivo', rotulo: 'Ejecutivo', ruta: () => '/' },
  {
    tablero: 'seguimiento',
    rotulo: 'Seguimiento',
    // Con perfil detalle, Seguimiento muestra la pestaña Detalle y el enlace de P05.
    ruta: (perfil) => (perfil === 'detalle' ? '/seguimiento?vista=perfil-detalle' : '/seguimiento'),
  },
  { tablero: 'detalle', rotulo: 'Detalle', ruta: () => '/detalle' },
]

/** Pestañas por perfil (C-13): los perfiles son acumulativos y nadie ve una pestaña que le responda 403. */
export function Pestanas({ actual, perfil }: { actual: Tablero; perfil: Perfil }) {
  return (
    <nav className="pestanas" aria-label="Tableros">
      {PESTANAS.filter((p) => NIVEL[p.tablero] <= NIVEL[perfil]).map((p) =>
        p.tablero === actual ? (
          <a key={p.tablero} href="#" aria-current="page" onClick={(e) => e.preventDefault()}>
            {p.rotulo}
          </a>
        ) : (
          <Link key={p.tablero} to={p.ruta(perfil)}>
            {p.rotulo}
          </Link>
        ),
      )}
    </nav>
  )
}
