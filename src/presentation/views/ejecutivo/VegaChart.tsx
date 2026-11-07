import { useEffect, useRef, type CSSProperties } from 'react'
import embed, { type Result, type VisualizationSpec } from 'vega-embed'
import locale from '../../../static/locale-es-CO.json'

type VegaChartProps = {
  spec: VisualizationSpec
  datasets: Record<string, unknown[]>
  className?: string
  style?: CSSProperties
  title?: string
}

export function VegaChart({ spec, datasets, className, style, title }: VegaChartProps) {
  const host = useRef<HTMLDivElement>(null)
  const datos = JSON.stringify(datasets)

  useEffect(() => {
    const node = host.current
    if (!node) return

    let result: Result | undefined
    let activo = true
    const specConDatos = spec as VisualizationSpec & { datasets?: Record<string, unknown[]> }
    const siguiente = {
      ...specConDatos,
      datasets: {
        ...(specConDatos.datasets ?? {}),
        ...(JSON.parse(datos) as Record<string, unknown[]>),
      },
    } as VisualizationSpec

    embed(node, siguiente, {
      actions: false,
      renderer: 'svg',
      formatLocale: locale.format as Record<string, unknown>,
      timeFormatLocale: locale.time as Record<string, unknown>,
    })
      .then((valor) => {
        if (!activo) {
          valor.finalize()
          return
        }
        result = valor
      })
      .catch((error: unknown) => {
        if (activo) console.error(error)
      })

    return () => {
      activo = false
      result?.finalize()
    }
  }, [spec, datos])

  return <div ref={host} className={className} style={style} title={title} />
}
