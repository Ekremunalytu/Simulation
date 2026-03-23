import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getModulesByCategory } from '../engine/registry'
import type { RegisteredSimulationModule } from '../types/simulation'

export function useSimulationNavigation(mod: RegisteredSimulationModule) {
  const navigate = useNavigate()

  const siblings = useMemo(() => getModulesByCategory(mod.category), [mod.category])

  const currentIndex = siblings.findIndex((candidate) => candidate.id === mod.id)
  const prev = currentIndex > 0 ? siblings[currentIndex - 1] : null
  const next = currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!event.altKey) {
        return
      }

      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      if (event.key === 'ArrowLeft' && prev) {
        event.preventDefault()
        navigate(`/sim/${prev.id}`)
      } else if (event.key === 'ArrowRight' && next) {
        event.preventDefault()
        navigate(`/sim/${next.id}`)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [navigate, next, prev])

  return {
    prev,
    next,
    currentIndex,
    total: siblings.length,
  }
}
