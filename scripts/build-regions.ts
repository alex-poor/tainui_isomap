/**
 * build-regions.ts — base SA3 region layer with derived Māori-access metrics.
 *
 * Input:  data-src/sa3_regions.geojson  (SA3 boundaries + census population)
 *         public/data/tainui_rohe.geojson  (to flag regions inside the rohe)
 * Output: public/data/regions.geojson
 *
 * Derived per region:
 *   maori_pct  — Māori % of total population
 *   dep_decile — NZDep score binned to a 1–10 decile (for choropleth)
 *   in_rohe    — centroid falls within a Tainui-waka rohe boundary
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import centroid from '@turf/centroid'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import type {
  Feature,
  FeatureCollection,
  MultiPolygon,
  Polygon,
} from 'geojson'
import { DATA_SRC, PUBLIC_DATA, ROHE_CODES } from './paths.ts'

type Geom = Polygon | MultiPolygon

export interface RegionProps {
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

const src = JSON.parse(
  readFileSync(resolve(DATA_SRC, 'sa3_regions.geojson'), 'utf8'),
) as FeatureCollection<Geom>

// `in_rohe` means "inside the Tainui-waka rohe" specifically (the app's focus),
// not any of the 100+ iwi now available, so filter to the default codes.
const tainuiCodes = new Set(ROHE_CODES.map(String))
const allRohe = JSON.parse(
  readFileSync(resolve(PUBLIC_DATA, 'iwi_rohe.geojson'), 'utf8'),
) as FeatureCollection<Geom>
const rohe = {
  ...allRohe,
  features: allRohe.features.filter((f) =>
    tainuiCodes.has(String(f.properties?.tpk_code)),
  ),
} as FeatureCollection<Geom>

const clampDecile = (v: number) => Math.min(10, Math.max(1, Math.round(v)))

let inRoheCount = 0
const features: Feature<Geom, RegionProps>[] = src.features.map((f) => {
  const p = f.properties ?? {}
  const tot = Number(p.tot_pop) || 0
  const mao = Number(p.mao_pop) || 0
  const dep = p.nz_dep == null ? null : Number(p.nz_dep)

  let inRohe = false
  try {
    const c = centroid(f as Feature<Geom>)
    inRohe = rohe.features.some((r) => booleanPointInPolygon(c, r))
  } catch {
    // Feature with empty/invalid geometry — treat as outside the rohe.
  }
  if (inRohe) inRoheCount++

  return {
    type: 'Feature',
    geometry: f.geometry,
    properties: {
      sa3_code: String(p.sa3_code),
      sa3_name: String(p.sa3_name),
      rc: String(p.rc ?? ''),
      tot_pop: tot,
      mao_pop: mao,
      nz_dep: dep,
      maori_pct: tot > 0 ? Math.round((mao / tot) * 1000) / 10 : null,
      dep_decile: dep == null ? null : clampDecile(dep),
      in_rohe: inRohe,
    },
  }
})

const collection: FeatureCollection<Geom, RegionProps> = {
  type: 'FeatureCollection',
  features,
}
writeFileSync(resolve(PUBLIC_DATA, 'regions.geojson'), JSON.stringify(collection))
const kb = (JSON.stringify(collection).length / 1024).toFixed(0)
console.log(
  `✓ regions.geojson — ${features.length} SA3 (${inRoheCount} in rohe), ${kb} KB`,
)
