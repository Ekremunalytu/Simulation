import { Search } from 'lucide-react'

interface TopBarProps {
  sidebarOpen?: boolean
  tabs?: { label: string; active?: boolean; onClick?: () => void }[]
}

export function TopBar({ sidebarOpen, tabs }: TopBarProps) {
  return (
    <header
      className={`fixed top-0 right-0 z-30 flex justify-between items-center px-8 h-14 bg-black/50 backdrop-blur-xl border-b border-white/[0.04] transition-[left] duration-300 ${
        sidebarOpen ? 'left-[304px]' : 'left-16'
      }`}
    >
      {tabs && tabs.length > 0 ? (
        <nav className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={tab.onClick}
              className={`pb-4 pt-4 font-body uppercase tracking-widest text-[10px] transition-all ${
                tab.active
                  ? 'text-secondary border-b-2 border-secondary'
                  : 'text-neutral-500 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      ) : (
        <div />
      )}

      <div className="flex items-center gap-4">
        <div className="relative hidden sm:flex items-center bg-surface-container rounded-full px-4 py-1.5 border border-white/[0.06]">
          <Search className="w-3 h-3 text-outline mr-2" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="SEARCH..."
            className="bg-transparent border-none text-[10px] focus:outline-none placeholder:text-outline/40 w-32 uppercase tracking-widest font-mono text-on-surface"
          />
        </div>
      </div>
    </header>
  )
}
