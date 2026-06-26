/**
 * build-access.ts — precomputed access metrics per SA3.
 *
 * For each SA3 region centroid, finds the nearest facility of each service
 * category (straight-line) and bins access good/poor against the service's
 * default threshold.
 *
 * Output: public/data/sa3_access.json
 *   { [sa3_code]: { centroid:[lon,lat], services:{ [svc]: AccessMetric } } }
 *
 * Routing-ready: each metric carries `dist_km` now and a null `travel_min`
 * slot, so a future OSRM pass can populate drive-times without schema change.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import centroid from '@turf/centroid'
import type { Feature, FeatureCollection, Point, Polygon, MultiPolygon } from 'geojson'
import { PUBLIC_DATA } from './paths.ts'
import { SERVICES, type ServiceId } from '../src/config/services.ts'
import type { FacilityProps } from './build-facilities.ts'
import type { RegionProps } from './build-regions.ts'

type Geom = Polygon | MultiPolygon

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

const R = 6371 // km
const toRad = (d: number) => (d * Math.PI) / 180
function haversineKm(a: [number, number], b: [number, number]): number {
  const dLat = toRad(b[1] - a[1])
  const dLon = toRad(b[0] - a[0])
  const lat1 = toRad(a[1])
  const lat2 = toRad(b[1])
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

const regions = JSON.parse(
  readFileSync(resolve(PUBLIC_DATA, 'regions.geojson'), 'utf8'),
) as FeatureCollection<Geom, RegionProps>

const facilities = JSON.parse(
  readFileSync(resolve(PUBLIC_DATA, 'facilities.geojson'), 'utf8'),
) as FeatureCollection<Point, FacilityProps>

// Bucket facilities by category once (keys derived from SERVICES).
const byCategory = Object.fromEntries(
  SERVICES.map((s) => [s.id, [] as Feature<Point, FacilityProps>[]]),
) as Record<ServiceId, Feature<Point, FacilityProps>[]>
for (const f of facilities.features) byCategory[f.properties.category]?.push(f)

const out: Record<string, RegionAccess> = {}

for (const region of regions.features) {
  let c: [number, number]
  try {
    c = centroid(region as Feature<Geom>).geometry.coordinates as [number, number]
  } catch {
    continue // empty/invalid geometry — no usable centroid
  }
  const services = {} as Record<ServiceId, AccessMetric>

  for (const svc of SERVICES) {
    const pool = byCategory[svc.id]
    let best = Infinity
    let nearest: string | null = null
    for (const f of pool) {
      const d = haversineKm(c, f.geometry.coordinates as [number, number])
      if (d < best) {
        best = d
        nearest = f.properties.name
      }
    }
    services[svc.id] = Number.isFinite(best)
      ? {
          dist_km: Math.round(best * 10) / 10,
          travel_min: null,
          bin: best <= svc.goodKm ? 'good' : 'poor',
          nearest,
        }
      : { dist_km: null, travel_min: null, bin: null, nearest: null }
  }

  out[region.properties.sa3_code] = { centroid: c, services }
}

writeFileSync(resolve(PUBLIC_DATA, 'sa3_access.json'), JSON.stringify(out))
const kb = (JSON.stringify(out).length / 1024).toFixed(0)
console.log(`✓ sa3_access.json — ${Object.keys(out).length} regions, ${kb} KB`)
