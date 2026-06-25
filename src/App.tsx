import { useState, useCallback, useMemo, useRef } from 'react'
import { X } from 'lucide-react'
import type { MapLayerMouseEvent } from 'maplibre-gl'
import type { Feature, Point } from 'geojson'

import { MapContainer, type MapContainerHandle } from './components/Map/MapContainer.tsx'
import {
  RegionsLayer,
  RoheLayer,
  FacilitiesLayer,
  AccessZoneLayer,
} from './components/layers/index.ts'
import { Sidebar } from './components/panels/Sidebar.tsx'
import { RegionAccessPanel } from './components/panels/RegionAccessPanel.tsx'
import { MetricSelector } from './components/controls/MetricSelector.tsx'
import { LayerToggle } from './components/controls/LayerToggle.tsx'
import { Legend } from './components/controls/Legend.tsx'
import { BasemapSwitcher } from './components/controls/BasemapSwitcher.tsx'

import { useDataLoader } from './hooks/useDataLoader.ts'
import { haversineKm } from './lib/geo.ts'
import { METRIC_BY_ID, DEFAULT_METRIC, type MetricId } from './lib/metrics.ts'
import { SERVICES, SERVICE_IDS, type ServiceId } from './config/services.ts'
import { DEFAULT_BASEMAP, type BasemapId, TAINUI_BOUNDS } from './config/map.ts'
import type {
  RegionsData,
  FacilitiesData,
  RoheData,
  AccessData,
  RegionProperties,
  FacilityProperties,
} from './data/types.ts'

const allVisible = Object.fromEntries(SERVICE_IDS.map((id) => [id, true])) as Record<
  ServiceId,
  boolean
>
const zeroCounts = Object.fromEntries(SERVICE_IDS.map((id) => [id, 0])) as Record<
  ServiceId,
  number
>

export default function App() {
  const mapRef = useRef<MapContainerHandle>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [basemap, setBasemap] = useState<BasemapId>(DEFAULT_BASEMAP)
  const [metric, setMetric] = useState<MetricId>(DEFAULT_METRIC)
  const [serviceVisibility, setServiceVisibility] = useState(allVisible)
  const [roheVisible, setRoheVisible] = useState(true)
  const [zoneKm, setZoneKm] = useState(20)
  const [selected, setSelected] = useState<RegionProperties | null>(null)

  const regions = useDataLoader<RegionsData>('/data/regions.geojson')
  const facilities = useDataLoader<FacilitiesData>('/data/facilities.geojson')
  const rohe = useDataLoader<RoheData>('/data/tainui_rohe.geojson')
  const access = useDataLoader<AccessData>('/data/sa3_access.json')

  const selectedAccess = selected ? access.data?.[selected.sa3_code] : undefined
  const zoneCenter = selectedAccess?.centroid ?? null

  const enabledServices = useMemo(
    () => SERVICE_IDS.filter((id) => serviceVisibility[id]),
    [serviceVisibility],
  )

  // Facilities falling inside the active access zone — drives in-zone highlight + counts.
  const { inZone, inZoneCounts } = useMemo(() => {
    if (!zoneCenter || !facilities.data) {
      return { inZone: null, inZoneCounts: zeroCounts }
    }
    const counts = { ...zeroCounts }
    const feats: Feature<Point, FacilityProperties>[] = []
    for (const f of facilities.data.features) {
      const d = haversineKm(zoneCenter, f.geometry.coordinates as [number, number])
      if (d <= zoneKm) {
        feats.push(f)
        counts[f.properties.category]++
      }
    }
    return {
      inZone: { type: 'FeatureCollection', features: feats } as FacilitiesData,
      inZoneCounts: counts,
    }
  }, [zoneCenter, facilities.data, zoneKm])

  const handleMapClick = useCallback(
    (e: MapLayerMouseEvent) => {
      const feature = e.features?.[0]
      if (!feature) {
        setSelected(null)
        return
      }
      if (feature.layer?.id === 'regions-fill') {
        const props = feature.properties as unknown as RegionProperties
        setSelected(props)
        const c = access.data?.[props.sa3_code]?.centroid
        if (c) mapRef.current?.flyTo(c, zoneKm * 1.4)
      }
      // Clicks on facility points keep the current region selection.
    },
    [access.data, zoneKm],
  )

  const toggleService = useCallback((id: ServiceId) => {
    setServiceVisibility((prev) => ({ ...prev, [id]: !prev[id] }))
  }, [])

  return (
    <div className="relative h-full w-full">
      <MapContainer ref={mapRef} basemap={basemap} onClickLayer={handleMapClick}>
        {regions.data && (
          <RegionsLayer
            data={regions.data}
            metric={METRIC_BY_ID[metric]}
            selectedCode={selected?.sa3_code ?? null}
          />
        )}
        {rohe.data && <RoheLayer data={rohe.data} visible={roheVisible} />}
        <AccessZoneLayer center={zoneCenter} radiusKm={zoneKm} />
        {facilities.data && (
          <FacilitiesLayer
            data={facilities.data}
            enabled={enabledServices}
            inZone={inZone}
          />
        )}
      </MapContainer>

      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)}>
        <MetricSelector metric={metric} onChange={setMetric} />
        <Legend metric={METRIC_BY_ID[metric]} />
        <LayerToggle
          serviceVisibility={serviceVisibility}
          onToggleService={toggleService}
          roheVisible={roheVisible}
          onToggleRohe={() => setRoheVisible((v) => !v)}
        />

        <div>
          <label className="flex items-center justify-between text-sm text-ti-onyx/70">
            <span>Access zone radius</span>
            <span className="font-semibold text-ti-onyx">{zoneKm} km</span>
          </label>
          <input
            type="range"
            min={5}
            max={60}
            step={5}
            value={zoneKm}
            onChange={(e) => setZoneKm(Number(e.target.value))}
            className="mt-1 w-full accent-ti-red"
          />
          <p className="text-[10px] text-ti-onyx/50">
            Select a region to draw its access zone and count nearby services.
          </p>
        </div>

        {selected ? (
          <div className="relative">
            <button
              onClick={() => setSelected(null)}
              className="absolute -top-1 right-0 z-10 rounded p-1 text-ti-onyx/50 hover:bg-ti-nimbus hover:text-ti-onyx"
              aria-label="Clear selection"
            >
              <X className="h-4 w-4" />
            </button>
            <RegionAccessPanel
              region={selected}
              access={selectedAccess}
              inZoneCounts={inZoneCounts}
              zoneKm={zoneKm}
            />
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-gray-300 px-3 py-4 text-center text-xs text-ti-onyx/50">
            Click an SA3 region to see its Māori access profile.
          </p>
        )}

        <div className="mt-auto space-y-2 border-t border-gray-200 pt-3">
          <button
            onClick={() => {
              setSelected(null)
              mapRef.current?.fitTo(TAINUI_BOUNDS)
            }}
            className="w-full rounded-md border border-ti-red/30 bg-white px-3 py-1.5 text-xs font-medium text-ti-onyx hover:bg-ti-dusk/40"
          >
            Reset to rohe view
          </button>
          <BasemapSwitcher current={basemap} onChange={setBasemap} />
          <p className="text-[10px] leading-snug text-ti-onyx/40">
            Regions: SA3 (census) · Services: HPI register + mārae ·{' '}
            {SERVICES.length} categories
          </p>
        </div>
      </Sidebar>
    </div>
  )
}
