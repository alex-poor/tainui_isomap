import {
  useCallback,
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  type ReactNode,
} from 'react'
import { Map, NavigationControl, Popup, type MapRef } from '@vis.gl/react-maplibre'
import type { MapLayerMouseEvent, RasterTileSource } from 'maplibre-gl'
import {
  MAP_DEFAULTS,
  BASEMAPS,
  initialStyle,
  TAINUI_BOUNDS,
  type BasemapId,
} from '../../config/map.ts'

export interface MapContainerHandle {
  fitTo: (bounds: [number, number, number, number]) => void
  flyTo: (center: [number, number], km?: number) => void
}

interface MapContainerProps {
  basemap: BasemapId
  onClickLayer?: (e: MapLayerMouseEvent) => void
  children?: ReactNode
}

interface HoverInfo {
  longitude: number
  latitude: number
  isRegion: boolean
  title: string
  line2?: string
  line3?: string
}

export const MapContainer = forwardRef<MapContainerHandle, MapContainerProps>(
  function MapContainer({ basemap, onClickLayer, children }, ref) {
    const mapRef = useRef<MapRef>(null)
    const [hover, setHover] = useState<HoverInfo | null>(null)

    useImperativeHandle(ref, () => ({
      fitTo(bounds) {
        mapRef.current?.fitBounds(bounds, { padding: 30, duration: 1000 })
      },
      flyTo(center, km = 25) {
        const dLat = km / 111
        const dLng = km / (111 * Math.cos((center[1] * Math.PI) / 180))
        mapRef.current?.fitBounds(
          [center[0] - dLng, center[1] - dLat, center[0] + dLng, center[1] + dLat],
          { padding: 60, duration: 1000 },
        )
      },
    }))

    const handleLoad = useCallback(() => {
      mapRef.current?.fitBounds(TAINUI_BOUNDS, { padding: 20, duration: 0 })
    }, [])

    // Swap basemap tiles imperatively — avoids setStyle() destroying feature layers.
    useEffect(() => {
      const map = mapRef.current?.getMap()
      if (!map || !map.isStyleLoaded()) return
      const source = map.getSource('basemap') as RasterTileSource | undefined
      source?.setTiles([...BASEMAPS[basemap].tiles])
    }, [basemap])

    // Keep the basemap raster at the bottom so features always render on top.
    useEffect(() => {
      const map = mapRef.current?.getMap()
      if (!map) return
      const ensureBasemapBelow = () => {
        if (!map.getLayer('basemap')) return
        const layers = map.getStyle()?.layers
        if (layers && layers.length > 1 && layers[0].id !== 'basemap') {
          map.moveLayer('basemap', layers[0].id)
        }
      }
      map.on('sourcedata', ensureBasemapBelow)
      return () => {
        map.off('sourcedata', ensureBasemapBelow)
      }
    }, [])

    const handleMouseMove = useCallback((e: MapLayerMouseEvent) => {
      const map = mapRef.current?.getMap()
      if (!map) return
      const features = e.features ?? []
      // A point always wins over the region beneath it, regardless of the order
      // MapLibre returns them in.
      const facility = features.find(
        (f) =>
          f.layer?.id === 'facility-points' ||
          f.layer?.id === 'facility-inzone-points',
      )
      const region = features.find((f) => f.layer?.id === 'regions-fill')
      const feature = facility ?? region
      if (!feature) {
        map.getCanvas().style.cursor = ''
        setHover(null)
        return
      }
      map.getCanvas().style.cursor = 'pointer'
      const p = feature.properties ?? {}
      if (feature.layer?.id === 'regions-fill') {
        const pct = p.maori_pct
        setHover({
          longitude: e.lngLat.lng,
          latitude: e.lngLat.lat,
          isRegion: true,
          title: String(p.sa3_name ?? ''),
          line2: p.rc ? String(p.rc) : undefined,
          line3:
            pct != null && pct !== ''
              ? `${pct}% Māori · NZDep ${p.dep_decile ?? '—'}`
              : undefined,
        })
      } else {
        setHover({
          longitude: e.lngLat.lng,
          latitude: e.lngLat.lat,
          isRegion: false,
          title: String(p.name ?? ''),
          line2: p.type ? String(p.type) : undefined,
        })
      }
    }, [])

    const handleMouseLeave = useCallback(() => {
      const map = mapRef.current?.getMap()
      if (map) map.getCanvas().style.cursor = ''
      setHover(null)
    }, [])

    return (
      <Map
        ref={mapRef}
        initialViewState={{
          bounds: TAINUI_BOUNDS,
          fitBoundsOptions: { padding: 20 },
        }}
        minZoom={MAP_DEFAULTS.minZoom}
        maxZoom={MAP_DEFAULTS.maxZoom}
        mapStyle={initialStyle}
        interactiveLayerIds={[
          'regions-fill',
          'facility-points',
          'facility-inzone-points',
        ]}
        onLoad={handleLoad}
        onClick={(e) => onClickLayer?.(e)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />
        {children}
        {hover && (
          <Popup
            longitude={hover.longitude}
            latitude={hover.latitude}
            closeButton={false}
            closeOnClick={false}
            anchor="bottom"
            offset={12}
            className="pointer-events-none"
          >
            <div className="font-body text-xs text-ti-onyx">
              <div className="font-bold">{hover.title}</div>
              {hover.line2 && <div className="text-gray-600">{hover.line2}</div>}
              {hover.line3 && <div className="text-ti-red">{hover.line3}</div>}
            </div>
          </Popup>
        )}
      </Map>
    )
  },
)
