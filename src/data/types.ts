import type { FeatureCollection, Polygon, MultiPolygon, Point } from 'geojson'
import type { ServiceId } from '../config/services.ts'

/** SA3 region with derived Māori-access metrics (built by scripts/build-regions.ts). */
export interface RegionProperties {
  sa3_code: string
  sa3_name: string
  rc: string
  tot_pop: number
  mao_pop: number
  nz_dep: number | null
  maori_pct: number | null
  dep_decile: number | null
  in_rohe: boolean
  [key: string]: unknown
}

/** A service point (built by scripts/build-facilities.ts). */
export interface FacilityProperties {
  name: string
  category: ServiceId
  type: string
  detail: string
  region: string
  [key: string]: unknown
}

/** Rohe boundary overlay (built by scripts/build-rohe.ts). */
export interface RoheProperties {
  name: string
  tpk_code: string
  [key: string]: unknown
}

/** Precomputed access (built by scripts/build-access.ts). */
export interface AccessMetric {
  dist_km: number | null
  travel_min: number | null
  bin: 'good' | 'poor' | null
  nearest: string | null
}
export interface RegionAccess {
  centroid: [number, number]
  services: Record<ServiceId, AccessMetric>
}
export type AccessData = Record<string, RegionAccess>

export type RegionsData = FeatureCollection<Polygon | MultiPolygon, RegionProperties>
export type FacilitiesData = FeatureCollection<Point, FacilityProperties>
export type RoheData = FeatureCollection<Polygon | MultiPolygon, RoheProperties>
