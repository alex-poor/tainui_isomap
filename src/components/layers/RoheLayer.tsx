import { Source, Layer } from '@vis.gl/react-maplibre'
import type { RoheData } from '../../data/types.ts'

interface RoheLayerProps {
  data: RoheData
  visible: boolean
}

/** Iwi rohe boundary overlay (Tainui waka). Outline + label, no fill. */
export function RoheLayer({ data, visible }: RoheLayerProps) {
  const visibility = visible ? 'visible' : 'none'
  return (
    <Source id="rohe" type="geojson" data={data}>
      <Layer
        id="rohe-outline"
        type="line"
        layout={{ visibility, 'line-join': 'round' }}
        paint={{
          'line-color': '#1A1A1A',
          'line-width': 2.5,
          'line-dasharray': [2, 1.5],
          'line-opacity': 0.85,
        }}
      />
      <Layer
        id="rohe-label"
        type="symbol"
        layout={{
          visibility,
          'symbol-placement': 'line',
          'text-field': ['get', 'name'],
          'text-size': 13,
          'text-letter-spacing': 0.1,
        }}
        paint={{
          'text-color': '#1A1A1A',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.5,
        }}
      />
    </Source>
  )
}
