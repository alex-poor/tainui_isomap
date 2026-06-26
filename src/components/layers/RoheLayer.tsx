import { Source, Layer } from '@vis.gl/react-maplibre'
import type { ExpressionSpecification } from 'maplibre-gl'
import type { RoheData } from '../../data/types.ts'

interface RoheLayerProps {
  data: RoheData
  /** TPK codes of the iwi rohe to display. */
  selectedCodes: string[]
}

/** Iwi rohe boundary overlay. Outline + label for the selected iwi, no fill. */
export function RoheLayer({ data, selectedCodes }: RoheLayerProps) {
  const filter = [
    'in',
    ['get', 'tpk_code'],
    ['literal', selectedCodes],
  ] as unknown as ExpressionSpecification

  return (
    <Source id="rohe" type="geojson" data={data}>
      <Layer
        id="rohe-outline"
        type="line"
        filter={filter}
        layout={{ 'line-join': 'round' }}
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
        filter={filter}
        layout={{
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
