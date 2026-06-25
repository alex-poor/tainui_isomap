import { Source, Layer } from '@vis.gl/react-maplibre'
import type { RegionsData } from '../../data/types.ts'
import { metricPaint, type MetricDef } from '../../lib/metrics.ts'

interface RegionsLayerProps {
  data: RegionsData
  metric: MetricDef
  selectedCode: string | null
}

export function RegionsLayer({ data, metric, selectedCode }: RegionsLayerProps) {
  return (
    <Source id="regions" type="geojson" data={data} promoteId="sa3_code">
      <Layer
        id="regions-fill"
        type="fill"
        paint={{
          'fill-color': metricPaint(metric),
          'fill-opacity': 0.62,
        }}
      />
      <Layer
        id="regions-outline"
        type="line"
        paint={{ 'line-color': '#6b7280', 'line-width': 0.4 }}
      />
      {/* Selected region — bold rohe-red outline */}
      <Layer
        id="regions-selected"
        type="line"
        filter={['==', ['get', 'sa3_code'], selectedCode ?? '__none__']}
        paint={{ 'line-color': '#A6192E', 'line-width': 3 }}
      />
    </Source>
  )
}
