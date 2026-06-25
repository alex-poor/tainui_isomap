/**
 * build-rohe.ts — merge + simplify the Tainui-waka iwi rohe boundaries.
 *
 * Reads the per-iwi TPK rohe GeoJSON files (from iwimap) for the configured
 * ROHE_CODES and writes a single simplified overlay: public/data/tainui_rohe.geojson
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import simplify from '@turf/simplify'
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson'
import { DATA_SRC, PUBLIC_DATA, ROHE_CODES } from './paths.ts'

type RoheGeom = Polygon | MultiPolygon

interface RoheProps {
  name: string
  tpk_code: string
}

const out: Feature<RoheGeom, RoheProps>[] = []

for (const code of ROHE_CODES) {
  const path = resolve(DATA_SRC, 'rohe', `${code}.geojson`)
  const fc = JSON.parse(readFileSync(path, 'utf8')) as FeatureCollection
  for (const f of fc.features) {
    if (!f.geometry) continue
    // Simplify to trim coordinate count for a lightweight overlay (~0.002° ≈ 200m).
    const simplified = simplify(f as Feature<RoheGeom>, {
      tolerance: 0.002,
      highQuality: false,
      mutate: true,
    })
    out.push({
      type: 'Feature',
      geometry: simplified.geometry,
      properties: {
        name: String(f.properties?.Name ?? `Rohe ${code}`),
        tpk_code: String(f.properties?.TPK_Code ?? code),
      },
    })
  }
}

const collection: FeatureCollection<RoheGeom, RoheProps> = {
  type: 'FeatureCollection',
  features: out,
}

const dest = resolve(PUBLIC_DATA, 'tainui_rohe.geojson')
writeFileSync(dest, JSON.stringify(collection))
const kb = (JSON.stringify(collection).length / 1024).toFixed(0)
console.log(
  `✓ tainui_rohe.geojson — ${out.length} rohe (${out
    .map((f) => f.properties.name)
    .join(', ')}), ${kb} KB`,
)
