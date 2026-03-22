import { useState, useCallback } from 'react'

export function useSimulationParams(defaults: Record<string, number | boolean | string>) {
  const [params, setParams] = useState(defaults)

  const setParam = useCallback((key: string, value: number | boolean | string) => {
    setParams((prev) => ({ ...prev, [key]: value }))
  }, [])

  const reset = useCallback(() => {
    setParams(defaults)
  }, [defaults])

  const applyPreset = useCallback((preset: Record<string, any>) => {
    setParams((prev) => ({ ...prev, ...preset }))
  }, [])

  return { params, setParam, reset, applyPreset }
}
