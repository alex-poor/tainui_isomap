import turfDistance from '@turf/distance'
import { point } from '@turf/helpers'

export function haversineKm(
  from: [number, number],
  to: [number, number],
): number {
  return turfDistance(point(from), point(to), { units: 'kilometers' })
}

export function formatDistance(km: number | null): string {
  if (km == null) return '—'
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}
