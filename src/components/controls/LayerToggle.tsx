import { SERVICES, type ServiceId } from '../../config/services.ts'

interface LayerToggleProps {
  serviceVisibility: Record<ServiceId, boolean>
  onToggleService: (id: ServiceId) => void
  roheVisible: boolean
  onToggleRohe: () => void
}

export function LayerToggle({
  serviceVisibility,
  onToggleService,
  roheVisible,
  onToggleRohe,
}: LayerToggleProps) {
  return (
    <div>
      <h2 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ti-onyx/60">
        Services &amp; boundaries
      </h2>
      <div className="space-y-1.5">
        {SERVICES.map((s) => (
          <label
            key={s.id}
            className="flex cursor-pointer items-center gap-2 text-sm text-ti-onyx"
          >
            <input
              type="checkbox"
              checked={serviceVisibility[s.id]}
              onChange={() => onToggleService(s.id)}
              className="h-4 w-4 accent-ti-red"
            />
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            {s.label}
          </label>
        ))}
        <label className="flex cursor-pointer items-center gap-2 border-t border-gray-100 pt-1.5 text-sm text-ti-onyx">
          <input
            type="checkbox"
            checked={roheVisible}
            onChange={onToggleRohe}
            className="h-4 w-4 accent-ti-red"
          />
          <span className="h-0 w-3 shrink-0 border-t-2 border-dashed border-ti-onyx" />
          Iwi rohe boundary
        </label>
      </div>
    </div>
  )
}
