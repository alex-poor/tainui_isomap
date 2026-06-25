import { type ReactNode } from 'react'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'

interface SidebarProps {
  open: boolean
  onToggle: () => void
  children: ReactNode
}

export function Sidebar({ open, onToggle, children }: SidebarProps) {
  return (
    <div
      className={`absolute left-0 top-0 z-10 flex h-full transition-transform duration-200 ${
        open ? 'translate-x-0' : '-translate-x-[22rem]'
      }`}
    >
      <div className="h-full w-[22rem] bg-white shadow-xl">
        <div className="flex h-full flex-col overflow-y-auto">
          <header className="border-b border-ti-red/30 bg-ti-onyx px-4 py-3">
            <h1 className="font-heading text-lg font-bold leading-tight text-white">
              Tainui Isomap
            </h1>
            <p className="text-xs text-white/70">
              Māori access &amp; equity across the rohe
            </p>
          </header>
          <div className="flex flex-1 flex-col gap-4 px-4 py-4">{children}</div>
        </div>
      </div>

      <button
        onClick={onToggle}
        className="mt-2 h-fit rounded-r-md bg-white p-1.5 shadow-md hover:bg-ti-dusk"
        aria-label={open ? 'Close sidebar' : 'Open sidebar'}
      >
        {open ? (
          <PanelLeftClose className="h-5 w-5 text-ti-onyx" />
        ) : (
          <PanelLeftOpen className="h-5 w-5 text-ti-onyx" />
        )}
      </button>
    </div>
  )
}
