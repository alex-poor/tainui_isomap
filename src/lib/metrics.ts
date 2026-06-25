import type { ExpressionSpecification } from 'maplibre-gl'

/** A choropleth metric the SA3 regions can be coloured by. */
export interface MetricDef {
  id: MetricId
  label: string
  /** Region property the colour is driven by. */
  prop: string
  /** Ascending breakpoints; paired 1:1 with `colors`. */
  stops: number[]
  colors: string[]
  /** Format a raw value for display in legend/popup/panel. */
  format: (v: number | null) => string
  /** One-line description of the scale for the legend. */
  hint: string
}

export type MetricId = 'maori_pct' | 'mao_pop' | 'dep_decile'

const pct = (v: number | null) => (v == null ? '—' : `${v}%`)
const num = (v: number | null) => (v == null ? '—' : v.toLocaleString())
const dep = (v: number | null) => (v == null ? '—' : `decile ${v}`)

export const METRICS: MetricDef[] = [
  {
    id: 'maori_pct',
    label: '% Māori',
    prop: 'maori_pct',
    stops: [0, 10, 20, 35, 50],
    colors: ['#edf8e9', '#bae4b3', '#74c476', '#31a354', '#006d2c'],
    format: pct,
    hint: 'Māori as a share of the SA3 total population',
  },
  {
    id: 'mao_pop',
    label: 'Māori population',
    prop: 'mao_pop',
    stops: [0, 500, 1500, 3000, 6000],
    colors: ['#eff3ff', '#bdd7e7', '#6baed6', '#3182bd', '#08519c'],
    format: num,
    hint: 'Count of Māori usual residents (census)',
  },
  {
    id: 'dep_decile',
    label: 'NZDep deprivation',
    prop: 'dep_decile',
    stops: [1, 3, 5, 7, 9, 10],
    colors: ['#fee5d9', '#fcae91', '#fb6a4a', '#de2d26', '#a50f15', '#67000d'],
    format: dep,
    hint: 'NZDep decile — 10 = most deprived',
  },
]

export const METRIC_BY_ID: Record<MetricId, MetricDef> = Object.fromEntries(
  METRICS.map((m) => [m.id, m]),
) as Record<MetricId, MetricDef>

export const DEFAULT_METRIC: MetricId = 'maori_pct'

const NO_DATA_COLOR = '#e5e7eb'

/**
 * MapLibre fill-color expression for a metric. Null/non-numeric values fall
 * back to a "no data" grey (via a -1 sentinel that sits below every stop).
 */
export function metricPaint(metric: MetricDef): ExpressionSpecification {
  const expr: unknown[] = [
    'interpolate',
    ['linear'],
    ['to-number', ['get', metric.prop], -1],
    -1,
    NO_DATA_COLOR,
  ]
  for (let i = 0; i < metric.stops.length; i++) {
    expr.push(metric.stops[i], metric.colors[i])
  }
  return expr as unknown as ExpressionSpecification
}
