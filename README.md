# Tainui Isomap

An interactive static web map of **Māori access &amp; equity** across the
Waikato / Tainui rohe. Each SA3 region is shown with its Māori population, Māori
share of population, and NZDep deprivation. Selecting a region draws a
configurable **access zone** and reports the quality of access to key services —
hospitals, GP / primary care, counselling / mental health, and mārae.

Built as a sibling to [`phomap`](../phomap) and reusing its stack and data
sources.

## Stack

- **React 19 + TypeScript + Vite** — static build, no backend
- **MapLibre GL** (via `@vis.gl/react-maplibre`) — open-source vector/raster map
- **Tailwind CSS v4** — UI
- **Turf.js** — geometry (distance, circles, centroids, simplify)

Everything is baked into `public/data/` and served statically.

## Layers &amp; data

| Layer | File | Source |
|---|---|---|
| SA3 regions (choropleth) | `public/data/regions.geojson` | Stats NZ SA3 + census (via phomap) |
| Service points | `public/data/facilities.geojson` | NZ HPI facilities register + mārae (karo-pg) + Pikonga (`scripts/pikonga.json`) |
| Iwi rohe boundaries | `public/data/iwi_rohe.geojson` | Te Puni Kōkiri rohe (iwimap): all 109 iwi |
| Precomputed access | `public/data/sa3_access.json` | derived (nearest service per SA3) |

### Region metrics
- **Māori population** (`mao_pop`)
- **% Māori** (`maori_pct` = mao_pop / tot_pop)
- **NZDep** (`dep_decile`, 1–10; 10 = most deprived)

Switch the choropleth between these three from the sidebar.

### Service categories
Defined once in [`src/config/services.ts`](src/config/services.ts) (shared by the
data pipeline and the app):

- **Hospital** — DHB Hospital Unit, Private Hospital
- **GP / Primary care** — Enrolling GP Practice, General Medical Services
- **Counselling / Mental health** — Non Hospital Mental health, Community
  Counselling, Community Psychology, Psychiatry, Alcohol &amp; Drug, DHB Mental
  Health Unit
- **Marae** — mārae locations
- **Pikonga (Tainui health)** — Waikato-Tainui's own iwi health providers, which
  are *not* in the official HPI register. Curated from their own list and
  geocoded from street addresses (see `scripts/pikonga.json`).

Add a category, or change which HPI facility types roll into one, by editing that
single file and re-running the pipeline.

### Access zone
Selecting a region draws a radius **access zone** (slider, 5–60 km) around its
centroid, highlights the services inside it, and bins each service Good / Poor
against a per-service distance threshold.

> **Note on distance:** v1 uses straight-line (as-the-crow-flies) distance. The
> access data schema (`sa3_access.json`) already carries a null `travel_min`
> slot and `AccessZoneLayer` is a swappable component, so real road-network
> drive-times / isochrones (OSRM/Valhalla) can drop in without touching the UI.
> See "Adding routing" below.

## Develop

```bash
npm install
npm run data     # build public/data/* from data-src/ (run once)
npm run dev      # vite dev server
npm run build    # typecheck + production build to dist/
npm run preview  # serve the production build
```

The app is served under the base path `/tainui_isomap/` (see
[`vite.config.ts`](vite.config.ts)); change `base` for a different deploy path.

## Data pipeline

Raw inputs live in `data-src/` (git-ignored; copied from sibling projects). The
scripts in [`scripts/`](scripts) transform them into `public/data/`:

| Script | Output |
|---|---|
| `build-rohe.ts` | merge + simplify + round all TPK rohe → `iwi_rohe.geojson` |
| `build-facilities.ts` | categorise HPI register + mārae → `facilities.geojson` |
| `build-regions.ts` | SA3 + derived metrics + in-rohe flag → `regions.geojson` |
| `build-access.ts` | nearest service per SA3 → `sa3_access.json` |

Run all with `npm run data` (order matters: rohe → facilities → regions →
access). Config (rohe codes, source paths) is in
[`scripts/paths.ts`](scripts/paths.ts).

### Re-sourcing raw inputs
`data-src/` is populated from:
- `phomap/public/data/sa3_regions.geojson` → `data-src/sa3_regions.geojson`
- `phomap/public/data/Facilities20260116.csv` → `data-src/facilities.csv`
- `karo-pg/karopg-setup/marae.geojson` → `data-src/marae.geojson`
- `iwimap/public/geojson/*.geojson` (all 109 iwi) → `data-src/rohe/`

## Roadmap

- **SA2 base regions** — currently SA3 (no SA2 census/NZDep data was available
  locally). The region layer is data-driven, so SA2 boundaries + SA2 Māori
  counts + NZDep can replace SA3 by swapping `regions.geojson`.
- **Drive-time routing** — replace straight-line distance with OSRM/Valhalla:
  1. In `build-access.ts`, call an OSRM `/table` request per SA3 centroid to
     populate `travel_min` and bin on minutes instead of km.
  2. Swap the `turfCircle` in `AccessZoneLayer` for an OSRM `/isochrone`
     polygon to show real drive-time zones.
- **More services** — schools, pharmacy, etc. (extend `SERVICES`).
