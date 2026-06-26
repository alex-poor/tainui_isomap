/**
 * build-facilities.ts — categorised service-point layer.
 *
 * Sources:
 *   data-src/facilities.csv  (NZ HPI facilities register, pipe-delimited)
 *   data-src/marae.geojson   (mārae point locations)
 *
 * Output: public/data/facilities.geojson — one Point per facility, tagged with
 * the service category (hospital | gp | mental_health | marae) it belongs to.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Feature, FeatureCollection, Point } from 'geojson'
import { DATA_SRC, PUBLIC_DATA, ROOT } from './paths.ts'
import {
  FACILITY_TYPE_TO_SERVICE,
  type ServiceId,
} from '../src/config/services.ts'

export interface FacilityProps {
  name: string
  category: ServiceId
  /** Facility-type name (HPI) or "Marae". */
  type: string
  /** Address (HPI) or hapū (mārae). */
  detail: string
  /** DHB (HPI) or district (mārae). */
  region: string
  [key: string]: unknown
}

// Rough NZ bounding box to discard junk coordinates.
const inNZ = (lon: number, lat: number) =>
  Number.isFinite(lon) &&
  Number.isFinite(lat) &&
  lon > 165 &&
  lon < 180 &&
  lat > -48 &&
  lat < -33

const features: Feature<Point, FacilityProps>[] = []
const counts: Record<string, number> = {}
const tally = (c: ServiceId) => (counts[c] = (counts[c] ?? 0) + 1)

// --- HPI facilities register (pipe-delimited) ---------------------------------
const csv = readFileSync(resolve(DATA_SRC, 'facilities.csv'), 'utf8')
const lines = csv.split(/\r?\n/)
for (let i = 1; i < lines.length; i++) {
  const line = lines[i]
  if (!line) continue
  const c = line.split('|')
  if (c.length < 11) continue
  const typeName = (c[6] ?? '').trim()
  const category = FACILITY_TYPE_TO_SERVICE[typeName.toLowerCase()]
  if (!category) continue
  const lon = parseFloat(c[9])
  const lat = parseFloat(c[10])
  if (!inNZ(lon, lat)) continue
  features.push({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [lon, lat] },
    properties: {
      name: (c[0] ?? '').trim(),
      category,
      type: typeName,
      detail: (c[2] ?? '').trim(),
      region: (c[4] ?? '').trim(),
    },
  })
  tally(category)
}

// --- Mārae --------------------------------------------------------------------
const marae = JSON.parse(
  readFileSync(resolve(DATA_SRC, 'marae.geojson'), 'utf8'),
) as FeatureCollection<Point>
for (const f of marae.features) {
  const coords = f.geometry?.coordinates as [number, number] | undefined
  if (!coords || !inNZ(coords[0], coords[1])) continue
  features.push({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [coords[0], coords[1]] },
    properties: {
      name: String(f.properties?.title ?? 'Marae'),
      category: 'marae',
      type: 'Marae',
      detail: String(f.properties?.hapus ?? ''),
      region: String(f.properties?.district ?? ''),
    },
  })
  tally('marae')
}

// --- Pikonga (Tainui's own iwi health providers; geocoded from their list) ---
interface PikongaRecord {
  name: string
  address: string
  town: string
  notes: string
  lon: number | null
  lat: number | null
}
const pikonga = JSON.parse(
  readFileSync(resolve(ROOT, 'scripts', 'pikonga.json'), 'utf8'),
) as PikongaRecord[]
for (const p of pikonga) {
  if (p.lon == null || p.lat == null || !inNZ(p.lon, p.lat)) continue
  const detail = [`${p.address}, ${p.town}`, p.notes].filter(Boolean).join(' — ')
  features.push({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [p.lon, p.lat] },
    properties: {
      name: p.name,
      category: 'pikonga',
      type: 'Pikonga — Tainui iwi health provider',
      detail,
      region: 'Waikato-Tainui',
    },
  })
  tally('pikonga')
}

const collection: FeatureCollection<Point, FacilityProps> = {
  type: 'FeatureCollection',
  features,
}
writeFileSync(resolve(PUBLIC_DATA, 'facilities.geojson'), JSON.stringify(collection))
const kb = (JSON.stringify(collection).length / 1024).toFixed(0)
console.log(`✓ facilities.geojson — ${features.length} points, ${kb} KB`)
console.log('  by category:', counts)
