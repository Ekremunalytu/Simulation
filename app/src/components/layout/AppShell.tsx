import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { IconSidebar, type CategoryKey } from './IconSidebar'
import { SecondarySidebar } from './SecondarySidebar'
import { TopBar } from './TopBar'

export function AppShell() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>(null)

  const secondarySidebarOpen = activeCategory !== null
  const collapsedOffset = 96
  const expandedOffset = 304
  const contentOffset = secondarySidebarOpen ? 'ml-[304px]' : 'ml-[96px]'

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface">
      <div className="pointer-events-none fixed inset-y-0 left-0 z-0 w-[304px] bg-[linear-gradient(180deg,rgba(11,11,13,0.97),rgba(7,7,8,0.86))]" />
      <div className="pointer-events-none fixed left-[88px] top-8 bottom-8 z-0 w-px tonal-rule opacity-60" />
      <IconSidebar activeCategory={activeCategory} onCategoryToggle={setActiveCategory} />
      <SecondarySidebar activeCategory={activeCategory} />
      <TopBar leftOffset={secondarySidebarOpen ? expandedOffset : collapsedOffset} />
      <main className={`relative min-h-screen pt-[4.5rem] transition-[margin] duration-300 ${contentOffset}`}>
        <Outlet />
      </main>
    </div>
  )
}
