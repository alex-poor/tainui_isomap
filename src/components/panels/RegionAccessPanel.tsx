import { MapPin } from 'lucide-react'
import type { RegionProperties, RegionAccess } from '../../data/types.ts'
import { SERVICES, type ServiceId } from '../../config/services.ts'
import { formatDistance } from '../../lib/geo.ts'

interface RegionAccessPanelProps {
  region: RegionProperties
  access: RegionAccess | undefined
  inZoneCounts: Record<ServiceId, number>
  zoneKm: number
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 rounded-md bg-ti-nimbus px-2 py-1.5 text-center">
      <div className="text-sm font-bold text-ti-onyx">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-ti-onyx/55">
        {label}
      </div>
    </div>
  )
}

function BinChip({ bin }: { bin: 'good' | 'poor' | null }) {
  if (!bin) return <span className="text-xs text-ti-onyx/40">no data</span>
  const good = bin === 'good'
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        good ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}
    >
      {good ? 'Good' : 'Poor'}
    </span>
  )
}

export function RegionAccessPanel({
  region,
  access,
  inZoneCounts,
  zoneKm,
}: RegionAccessPanelProps) {
  return (
    <div className="rounded-lg border border-ti-red/20 bg-ti-dusk/40 p-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-heading text-base font-bold leading-tight text-ti-onyx">
            {region.sa3_name}
          </h3>
          <p className="text-xs text-ti-onyx/60">{region.rc}</p>
        </div>
        {region.in_rohe && (
          <span className="shrink-0 rounded-full bg-ti-onyx px-2 py-0.5 text-[10px] font-semibold text-white">
            In rohe
          </span>
        )}
      </div>

      <div className="mb-3 flex gap-1.5">
        <Stat label="Māori" value={region.mao_pop.toLocaleString()} />
        <Stat
          label="% Māori"
          value={region.maori_pct == null ? '—' : `${region.maori_pct}%`}
        />
        <Stat
          label="NZDep"
          value={region.dep_decile == null ? '—' : `${region.dep_decile}`}
        />
      </div>

      <div className="mb-1 flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-ti-onyx/60">
          Access to services
        </h4>
        <span className="text-[10px] text-ti-onyx/50">
          counts within {zoneKm} km
        </span>
      </div>

      <div className="space-y-1.5">
        {SERVICES.map((s) => {
          const m = access?.services[s.id]
          return (
            <div
              key={s.id}
              className="flex items-center gap-2 rounded-md bg-white/70 px-2 py-1.5"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="flex-1 text-sm text-ti-onyx">{s.label}</span>
              <span className="flex items-center gap-1 text-xs text-ti-onyx/70">
                <MapPin className="h-3 w-3" />
                {formatDistance(m?.dist_km ?? null)}
              </span>
              <span className="w-10 text-right text-xs font-medium text-ti-onyx">
                {inZoneCounts[s.id] ?? 0} in
              </span>
              <BinChip bin={m?.bin ?? null} />
            </div>
          )
        })}
      </div>

      <p className="mt-2 text-[10px] leading-snug text-ti-onyx/45">
        Distance is straight-line from the region centroid to the nearest
        service. Drive-time routing can replace this later.
      </p>
    </div>
  )
}
