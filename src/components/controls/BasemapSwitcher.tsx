import { Map as MapIcon } from 'lucide-react'
import { BASEMAPS, type BasemapId } from '../../config/map.ts'

interface BasemapSwitcherProps {
  current: BasemapId
  onChange: (id: BasemapId) => void
}

export function BasemapSwitcher({ current, onChange }: BasemapSwitcherProps) {
  return (
    <div className="flex items-center gap-2">
      <MapIcon className="h-4 w-4 shrink-0 text-ti-onyx/60" />
      <select
        value={current}
        onChange={(e) => onChange(e.target.value as BasemapId)}
        className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-xs text-ti-onyx focus:border-ti-red focus:outline-none focus:ring-1 focus:ring-ti-red"
      >
        {(Object.keys(BASEMAPS) as BasemapId[]).map((id) => (
          <option key={id} value={id}>
            {BASEMAPS[id].label}
          </option>
        ))}
      </select>
    </div>
  )
}
