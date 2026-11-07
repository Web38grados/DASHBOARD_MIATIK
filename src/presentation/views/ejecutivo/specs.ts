import type { VisualizationSpec } from 'vega-embed'
import e02Raw from '../../../static/specs/e02-madurez-componentes.vl.json?raw'
import e03Raw from '../../../static/specs/e03-preparacion.vl.json?raw'
import e04Raw from '../../../static/specs/e04-confianza.vl.json?raw'
import e05Raw from '../../../static/specs/e05-base-informacion.vl.json?raw'

export const specMadurez = JSON.parse(e02Raw) as VisualizationSpec
export const specPreparacion = JSON.parse(e03Raw) as VisualizationSpec
export const specConfianza = JSON.parse(e04Raw) as VisualizationSpec
export const specBase = JSON.parse(e05Raw) as VisualizationSpec
