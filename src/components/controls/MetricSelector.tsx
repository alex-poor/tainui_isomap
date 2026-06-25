import { METRICS, type MetricId } from '../../lib/metrics.ts'

interface MetricSelectorProps {
  metric: MetricId
  onChange: (id: MetricId) => void
}

/** Choose which Māori metric colours the SA3 choropleth. */
export function MetricSelector({ metric, onChange }: MetricSelectorProps) {
  return (
    <div>
      <h2 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ti-onyx/60">
        Colour regions by
      </h2>
      <div className="grid grid-cols-3 gap-1 rounded-lg bg-ti-nimbus p-1">
        {METRICS.map((m) => (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className={`rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
              metric === m.id
                ? 'bg-white text-ti-red shadow-sm'
                : 'text-ti-onyx/70 hover:bg-white/60'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  )
}
