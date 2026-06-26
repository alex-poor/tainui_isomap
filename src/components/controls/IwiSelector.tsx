import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { DEFAULT_ROHE_LABEL } from '../../config/rohe.ts'

export interface IwiItem {
  tpk_code: string
  name: string
}

interface IwiSelectorProps {
  iwi: IwiItem[]
  selected: string[]
  onToggle: (code: string) => void
  onSetDefault: () => void
  onClear: () => void
}

/** Searchable add/remove list of iwi rohe boundaries to display. */
export function IwiSelector({
  iwi,
  selected,
  onToggle,
  onSetDefault,
  onClear,
}: IwiSelectorProps) {
  const [query, setQuery] = useState('')
  const selectedSet = useMemo(() => new Set(selected), [selected])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return iwi
    return iwi.filter((i) => i.name.toLowerCase().includes(q))
  }, [iwi, query])

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ti-onyx/60">
          Iwi rohe boundaries
        </h2>
        <span className="text-[10px] text-ti-onyx/50">{selected.length} shown</span>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ti-onyx/40" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${iwi.length} iwi…`}
          className="w-full rounded border border-gray-200 bg-white py-1 pl-7 pr-2 text-xs text-ti-onyx focus:border-ti-red focus:outline-none focus:ring-1 focus:ring-ti-red"
        />
      </div>

      <div className="mt-1 flex gap-1.5">
        <button
          onClick={onSetDefault}
          className="rounded border border-ti-red/30 px-2 py-0.5 text-[10px] font-medium text-ti-red hover:bg-ti-dusk/40"
        >
          {DEFAULT_ROHE_LABEL} only
        </button>
        <button
          onClick={onClear}
          className="rounded border border-gray-200 px-2 py-0.5 text-[10px] font-medium text-ti-onyx/60 hover:bg-ti-nimbus"
        >
          Clear all
        </button>
      </div>

      <div className="mt-1.5 max-h-44 overflow-y-auto rounded border border-gray-100 bg-white/60">
        {filtered.length === 0 ? (
          <p className="px-2 py-3 text-center text-[11px] text-ti-onyx/40">
            No iwi match “{query}”.
          </p>
        ) : (
          filtered.map((i) => (
            <label
              key={i.tpk_code}
              className="flex cursor-pointer items-center gap-2 px-2 py-1 text-xs text-ti-onyx hover:bg-ti-nimbus/60"
            >
              <input
                type="checkbox"
                checked={selectedSet.has(i.tpk_code)}
                onChange={() => onToggle(i.tpk_code)}
                className="h-3.5 w-3.5 accent-ti-red"
              />
              {i.name}
            </label>
          ))
        )}
      </div>
    </div>
  )
}
