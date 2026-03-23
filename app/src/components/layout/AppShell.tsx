import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { IconSidebar, type CategoryKey } from './IconSidebar'
import { SecondarySidebar } from './SecondarySidebar'
import { TopBar } from './TopBar'

export function AppShell() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>(null)

  const secondarySidebarOpen = activeCategory !== null
  const contentOffset = secondarySidebarOpen ? 'ml-[324px]' : 'ml-[84px]'

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface">
      <IconSidebar activeCategory={activeCategory} onCategoryToggle={setActiveCategory} />
      <SecondarySidebar activeCategory={activeCategory} />
      <TopBar leftOffset={secondarySidebarOpen ? 324 : 84} />
      <main
        className={`pt-16 min-h-screen transition-[margin] duration-300 ${contentOffset}`}
      >
        <Outlet />
      </main>
    </div>
  )
}
