/**
 * build-rohe.ts — merge + simplify ALL iwi rohe boundaries into one overlay.
 *
 * Reads every per-iwi TPK rohe GeoJSON in data-src/rohe/ (from iwimap) and
 * writes a single simplified collection: public/data/iwi_rohe.geojson, tagged
 * with iwi name + TPK code. The app shows/hides individual iwi by filtering on
 * tpk_code; the default selection (Tainui waka) lives in src/config/rohe.ts.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import simplify from '@turf/simplify'
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson'
import { DATA_SRC, PUBLIC_DATA } from './paths.ts'

type RoheGeom = Polygon | MultiPolygon

interface RoheProps {
  name: string
  tpk_code: string
}

/** Round every coordinate to 4 dp (~11 m) — big size win for an overlay. */
function roundCoords(geom: RoheGeom): void {
  const r = (n: number) => Math.round(n * 1e4) / 1e4
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const walk = (a: any): void => {
    if (typeof a[0] === 'number') {
      a[0] = r(a[0])
      a[1] = r(a[1])
    } else {
      for (const c of a) walk(c)
    }
  }
  walk(geom.coordinates)
}

const dir = resolve(DATA_SRC, 'rohe')
const files = readdirSync(dir).filter((f) => f.endsWith('.geojson'))

const out: Feature<RoheGeom, RoheProps>[] = []

for (const file of files) {
  const fc = JSON.parse(readFileSync(resolve(dir, file), 'utf8')) as FeatureCollection
  for (const f of fc.features) {
    if (!f.geometry) continue
    const code = String(f.properties?.TPK_Code ?? file.replace('.geojson', ''))
    // Simplify to trim coordinate count for a lightweight overlay (~0.002° ≈ 200m).
    const simplified = simplify(f as Feature<RoheGeom>, {
      tolerance: 0.003,
      highQuality: false,
      mutate: true,
    })
    roundCoords(simplified.geometry)
    out.push({
      type: 'Feature',
      geometry: simplified.geometry,
      properties: {
        name: String(f.properties?.Name ?? `Rohe ${code}`),
        tpk_code: code,
      },
    })
  }
}

// Stable order by iwi name for predictable rendering/labels.
out.sort((a, b) => a.properties.name.localeCompare(b.properties.name))

const collection: FeatureCollection<RoheGeom, RoheProps> = {
  type: 'FeatureCollection',
  features: out,
}

const json = JSON.stringify(collection)
writeFileSync(resolve(PUBLIC_DATA, 'iwi_rohe.geojson'), json)
console.log(
  `✓ iwi_rohe.geojson — ${out.length} iwi rohe, ${(json.length / 1024 / 1024).toFixed(2)} MB`,
)
