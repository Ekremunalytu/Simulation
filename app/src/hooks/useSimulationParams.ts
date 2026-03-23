import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { PresetConfig, SimulationParamsBase, SimulationParamValue } from '../types/simulation'

interface PersistedSimulationState<TParams extends SimulationParamsBase> {
  committedParams: TParams
  selectedPresetName: string | null
  panelOpen: boolean
}

interface UseSimulationParamsOptions<TParams extends SimulationParamsBase> {
  moduleId: string
  defaults: TParams
  presets: PresetConfig<TParams>[]
}

interface UseSimulationParamsResult<TParams extends SimulationParamsBase> {
  draftParams: TParams
  committedParams: TParams
  syncState: 'idle' | 'updating' | 'synced'
  selectedPresetName: string | null
  panelOpen: boolean
  committedQuery: string
  setDraftParam: <K extends keyof TParams>(key: K, value: TParams[K]) => void
  setPanelOpen: (open: boolean) => void
  applyPreset: (presetName: string) => void
  reset: () => void
}

function parseParamValue(rawValue: string, fallback: SimulationParamValue): SimulationParamValue {
  if (typeof fallback === 'number') {
    const parsed = Number(rawValue)
    return Number.isFinite(parsed) ? parsed : fallback
  }

  if (typeof fallback === 'boolean') {
    if (rawValue === 'true') {
      return true
    }

    if (rawValue === 'false') {
      return false
    }

    return fallback
  }

  return rawValue
}

function readParamsFromSearch<TParams extends SimulationParamsBase>(
  searchParams: URLSearchParams,
  defaults: TParams,
): Partial<TParams> {
  const parsedParams: Partial<TParams> = {}

  for (const key of Object.keys(defaults) as Array<keyof TParams>) {
    const rawValue = searchParams.get(String(key))
    if (rawValue === null) {
      continue
    }

    parsedParams[key] = parseParamValue(rawValue, defaults[key]) as TParams[keyof TParams]
  }

  return parsedParams
}

function buildParams<TParams extends SimulationParamsBase>(
  defaults: TParams,
  overrides?: Partial<TParams>,
): TParams {
  return {
    ...defaults,
    ...overrides,
  }
}

function areParamsEqual<TParams extends SimulationParamsBase>(left: TParams, right: TParams): boolean {
  const keys = Object.keys(left) as Array<keyof TParams>

  return keys.every((key) => left[key] === right[key])
}

function getStorageKey(moduleId: string) {
  return `obsidian-lab:${moduleId}`
}

function readPersistedState<TParams extends SimulationParamsBase>(
  moduleId: string,
  defaults: TParams,
  presets: PresetConfig<TParams>[],
): PersistedSimulationState<TParams> | null {
  if (typeof window === 'undefined') {
    return null
  }

  const storedValue = window.localStorage.getItem(getStorageKey(moduleId))
  if (!storedValue) {
    return null
  }

  try {
    const parsed = JSON.parse(storedValue) as Partial<PersistedSimulationState<TParams>>
    const presetName = parsed.selectedPresetName ?? null
    const presetExists = presetName === null || presets.some((preset) => preset.name === presetName)

    return {
      committedParams: buildParams(defaults, parsed.committedParams),
      selectedPresetName: presetExists ? presetName : null,
      panelOpen: parsed.panelOpen ?? true,
    }
  } catch {
    return null
  }
}

function serializeParams<TParams extends SimulationParamsBase>(params: TParams): string {
  const nextSearchParams = new URLSearchParams()

  for (const key of Object.keys(params) as Array<keyof TParams>) {
    nextSearchParams.set(String(key), String(params[key]))
  }

  return nextSearchParams.toString()
}

function getResetTarget<TParams extends SimulationParamsBase>(
  defaults: TParams,
  presets: PresetConfig<TParams>[],
  selectedPresetName: string | null,
): TParams {
  const preset = presets.find((item) => item.name === selectedPresetName)
  return preset ? preset.params : defaults
}

export function useSimulationParams<TParams extends SimulationParamsBase>({
  moduleId,
  defaults,
  presets,
}: UseSimulationParamsOptions<TParams>): UseSimulationParamsResult<TParams> {
  const [searchParams, setSearchParams] = useSearchParams()

  const initialHydration = useMemo(() => {
    const paramsFromQuery = readParamsFromSearch(searchParams, defaults)
    const hasQueryParams = Object.keys(paramsFromQuery).length > 0

    if (hasQueryParams) {
      return {
        committedParams: buildParams(defaults, paramsFromQuery),
        selectedPresetName: null,
        panelOpen: true,
      }
    }

    return (
      readPersistedState(moduleId, defaults, presets) ?? {
        committedParams: defaults,
        selectedPresetName: null,
        panelOpen: true,
      }
    )
  }, [defaults, moduleId, presets, searchParams])

  const [draftParams, setDraftParams] = useState<TParams>(initialHydration.committedParams)
  const [committedParams, setCommittedParams] = useState<TParams>(initialHydration.committedParams)
  const [selectedPresetName, setSelectedPresetName] = useState<string | null>(initialHydration.selectedPresetName)
  const [panelOpen, setPanelOpen] = useState<boolean>(initialHydration.panelOpen)
  const [syncState, setSyncState] = useState<'idle' | 'updating' | 'synced'>('idle')

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const payload: PersistedSimulationState<TParams> = {
      committedParams,
      selectedPresetName,
      panelOpen,
    }

    window.localStorage.setItem(getStorageKey(moduleId), JSON.stringify(payload))
  }, [committedParams, moduleId, panelOpen, selectedPresetName])

  const committedQuery = useMemo(() => serializeParams(committedParams), [committedParams])

  const syncSearchParams = useCallback(
    (params: TParams) => {
      setSearchParams(new URLSearchParams(serializeParams(params)), { replace: true })
    },
    [setSearchParams],
  )

  const setDraftParam = useCallback(
    <K extends keyof TParams>(key: K, value: TParams[K]) => {
      setSyncState('updating')
      setDraftParams((current) => ({
        ...current,
        [key]: value,
      }))
    },
    [],
  )

  useEffect(() => {
    if (areParamsEqual(draftParams, committedParams)) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setCommittedParams(draftParams)
      syncSearchParams(draftParams)
      setSyncState('synced')
    }, 300)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [committedParams, draftParams, syncSearchParams])

  const applyPreset = useCallback(
    (presetName: string) => {
      const preset = presets.find((item) => item.name === presetName)
      if (!preset) {
        return
      }

      setSyncState('updating')
      setDraftParams(preset.params)
      setSelectedPresetName(presetName)
    },
    [presets],
  )

  const reset = useCallback(() => {
    const resetTarget = getResetTarget(defaults, presets, selectedPresetName)

    setDraftParams(resetTarget)
    setCommittedParams(resetTarget)
    syncSearchParams(resetTarget)
    setSyncState('synced')
  }, [defaults, presets, selectedPresetName, syncSearchParams])

  return {
    draftParams,
    committedParams,
    syncState,
    selectedPresetName,
    panelOpen,
    committedQuery,
    setDraftParam,
    setPanelOpen,
    applyPreset,
    reset,
  }
}
