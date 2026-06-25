import { Source, Layer } from '@vis.gl/react-maplibre'
import type { ExpressionSpecification } from 'maplibre-gl'
import type { FacilitiesData } from '../../data/types.ts'
import { SERVICES, type ServiceId } from '../../config/services.ts'

interface FacilitiesLayerProps {
  data: FacilitiesData
  enabled: ServiceId[]
  /** Facilities inside the active access zone — drawn emphasised on top. */
  inZone: FacilitiesData | null
}

// match expression: category → service colour
const colorByCategory: ExpressionSpecification = [
  'match',
  ['get', 'category'],
  ...SERVICES.flatMap((s) => [s.id, s.color]),
  '#888888',
] as unknown as ExpressionSpecification

export function FacilitiesLayer({ data, enabled, inZone }: FacilitiesLayerProps) {
  const enabledFilter = [
    'in',
    ['get', 'category'],
    ['literal', enabled],
  ] as unknown as ExpressionSpecification

  return (
    <>
      <Source id="facilities" type="geojson" data={data}>
        <Layer
          id="facility-points"
          type="circle"
          filter={enabledFilter}
          paint={{
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, 2.5, 12, 6],
            'circle-color': colorByCategory,
            'circle-opacity': 0.55,
            'circle-stroke-width': 0.5,
            'circle-stroke-color': '#ffffff',
          }}
        />
      </Source>

      {inZone && (
        <Source id="facilities-inzone" type="geojson" data={inZone}>
          <Layer
            id="facility-inzone-points"
            type="circle"
            filter={enabledFilter}
            paint={{
              'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, 4, 12, 9],
              'circle-color': colorByCategory,
              'circle-opacity': 0.95,
              'circle-stroke-width': 1.5,
              'circle-stroke-color': '#ffffff',
            }}
          />
        </Source>
      )}
    </>
  )
}
