import { useMemo } from 'react'
import { Source, Layer } from '@vis.gl/react-maplibre'
import turfCircle from '@turf/circle'
import { point } from '@turf/helpers'

interface AccessZoneLayerProps {
  /** Centre of the access zone (selected region centroid), or null. */
  center: [number, number] | null
  radiusKm: number
}

/**
 * The configurable "access zone" drawn around a selected region. A straight-line
 * radius for now; swap turfCircle for an OSRM isochrone polygon to show real
 * drive-time zones without touching the rest of the app.
 */
export function AccessZoneLayer({ center, radiusKm }: AccessZoneLayerProps) {
  const zone = useMemo(() => {
    if (!center) return null
    return turfCircle(point(center), radiusKm, { steps: 96, units: 'kilometers' })
  }, [center, radiusKm])

  if (!zone) return null

  return (
    <Source id="access-zone" type="geojson" data={zone}>
      <Layer
        id="access-zone-fill"
        type="fill"
        paint={{ 'fill-color': '#A6192E', 'fill-opacity': 0.08 }}
      />
      <Layer
        id="access-zone-outline"
        type="line"
        paint={{
          'line-color': '#A6192E',
          'line-width': 2,
          'line-dasharray': [3, 2],
        }}
      />
    </Source>
  )
}
