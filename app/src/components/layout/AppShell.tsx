import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { IconSidebar, type CategoryKey } from './IconSidebar'
import { SecondarySidebar } from './SecondarySidebar'
import { TopBar } from './TopBar'

export function AppShell() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>(null)

  const sidebarOpen = activeCategory !== null

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface">
      <IconSidebar activeCategory={activeCategory} onCategoryToggle={setActiveCategory} />
      <SecondarySidebar activeCategory={activeCategory} />
      <TopBar sidebarOpen={sidebarOpen} />
      <main
        className={`pt-16 min-h-screen transition-[margin] duration-300 ${
          sidebarOpen ? 'ml-[304px]' : 'ml-16'
        }`}
      >
        <Outlet />
      </main>
    </div>
  )
}
