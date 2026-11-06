/** Paneles de error y sin permiso (C-02). Se muestran según body[data-estado]. */
export function PanelesEstado({ codigoError, onReintentar }: { codigoError: string; onReintentar: () => void }) {
  return (
    <>
      <section className="panel-estado" id="panel-error" role="alert">
        <svg width="44" height="44" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="10" fill="none" stroke="var(--estado-critico)" strokeWidth="1.8" />
          <path d="M12 7v6M12 16.5v.5" stroke="var(--estado-critico)" strokeWidth="2" />
        </svg>
        <h2>No se pudo cargar el tablero</h2>
        <p>Intenta de nuevo en unos minutos. Si el problema sigue, informa este código:</p>
        <p><code>{codigoError}</code></p>
        <button type="button" className="boton" onClick={onReintentar}>Reintentar</button>
      </section>
      <section className="panel-estado" id="panel-403" role="alert">
        <svg width="44" height="44" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="5" y="10" width="14" height="10" rx="2" fill="none" stroke="var(--cm-tinta-2)" strokeWidth="1.8" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="var(--cm-tinta-2)" strokeWidth="1.8" />
        </svg>
        <h2>No tienes acceso a este tablero</h2>
        <p>Tu perfil no incluye esta vista. Si la necesitas, pídela a quien administra los accesos.</p>
      </section>
    </>
  )
}
