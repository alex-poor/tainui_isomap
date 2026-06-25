/**
 * Service categories shown as access metrics.
 *
 * Single source of truth shared by the data pipeline (scripts/) and the app.
 * `facilityTypes` lists the exact `Facility Type Name` values from the NZ HPI
 * facilities register that roll up into each category. Mārae come from a
 * separate dataset, so that category has no facilityTypes (matched by `source`).
 */
export type ServiceId = 'hospital' | 'gp' | 'mental_health' | 'marae'

export interface ServiceDef {
  id: ServiceId
  label: string
  /** Short label for compact UI (legend, chips). */
  short: string
  /** Source dataset: HPI facilities register, or the mārae dataset. */
  source: 'hpi' | 'marae'
  /** Exact `Facility Type Name` values that map into this category (hpi only). */
  facilityTypes: string[]
  /** Marker colour on the map / legend. */
  color: string
  /**
   * Default "good access" threshold in km (straight-line). At or under this
   * distance to the nearest facility = good; beyond = poor. User-adjustable.
   * Urban services get a tighter threshold than destination services.
   */
  goodKm: number
}

export const SERVICES: ServiceDef[] = [
  {
    id: 'hospital',
    label: 'Hospital',
    short: 'Hospital',
    source: 'hpi',
    facilityTypes: ['DHB Hospital Unit', 'Private Hospital'],
    color: '#A6192E',
    goodKm: 25,
  },
  {
    id: 'gp',
    label: 'GP / Primary care',
    short: 'GP',
    source: 'hpi',
    facilityTypes: ['Enrolling GP Practice', 'General Medical Services'],
    color: '#1f6feb',
    goodKm: 10,
  },
  {
    id: 'mental_health',
    label: 'Counselling / Mental health',
    short: 'MH',
    source: 'hpi',
    facilityTypes: [
      'Non Hospital Mental health',
      'Community Counselling',
      'Community Psychology',
      'Psychiatry',
      'Alcohol & Drug',
      'DHB Mental Health Unit',
    ],
    color: '#8957e5',
    goodKm: 15,
  },
  {
    id: 'marae',
    label: 'Marae',
    short: 'Marae',
    source: 'marae',
    facilityTypes: [],
    color: '#1a7f37',
    goodKm: 10,
  },
]

export const SERVICE_IDS = SERVICES.map((s) => s.id)

export const SERVICE_BY_ID: Record<ServiceId, ServiceDef> = Object.fromEntries(
  SERVICES.map((s) => [s.id, s]),
) as Record<ServiceId, ServiceDef>

/** Reverse lookup: HPI facility-type name → service id (lowercased, trimmed). */
export const FACILITY_TYPE_TO_SERVICE: Record<string, ServiceId> = (() => {
  const m: Record<string, ServiceId> = {}
  for (const s of SERVICES) {
    for (const t of s.facilityTypes) m[t.trim().toLowerCase()] = s.id
  }
  return m
})()
