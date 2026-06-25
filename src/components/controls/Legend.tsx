import type { MetricDef } from '../../lib/metrics.ts'

interface LegendProps {
  metric: MetricDef
}

/** Colour-scale legend for the active choropleth metric. */
export function Legend({ metric }: LegendProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white/70 p-2.5">
      <div className="mb-1 text-xs font-semibold text-ti-onyx">{metric.label}</div>
      <div className="flex h-3 overflow-hidden rounded">
        {metric.colors.map((c) => (
          <div key={c} className="flex-1" style={{ backgroundColor: c }} />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-ti-onyx/60">
        <span>{metric.format(metric.stops[0])}</span>
        <span>{metric.format(metric.stops[metric.stops.length - 1])}+</span>
      </div>
      <p className="mt-1 text-[10px] leading-snug text-ti-onyx/50">{metric.hint}</p>
    </div>
  )
}
