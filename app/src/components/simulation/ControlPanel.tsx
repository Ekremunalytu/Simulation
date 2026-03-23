import { motion } from 'framer-motion'
import { SlidersHorizontal } from 'lucide-react'
import type {
  ControlDefinition,
  PresetConfig,
  SimulationParamsBase,
} from '../../types/simulation'

interface ControlPanelProps<TParams extends SimulationParamsBase> {
  controls: ControlDefinition<TParams>[]
  params: TParams
  presets: PresetConfig<TParams>[]
  syncState: 'idle' | 'updating' | 'synced'
  selectedPresetName: string | null
  onParamChange: <K extends keyof TParams>(key: K, value: TParams[K]) => void
  onReset: () => void
  onApplyPreset: (presetName: string) => void
}

export function ControlPanel<TParams extends SimulationParamsBase>({
  controls,
  params,
  presets,
  syncState,
  selectedPresetName,
  onParamChange,
  onReset,
  onApplyPreset,
}: ControlPanelProps<TParams>) {
  const syncTone =
    syncState === 'updating'
      ? 'bg-secondary/12 text-secondary'
      : 'bg-primary/10 text-primary'

  const syncLabel =
    syncState === 'updating'
      ? 'Parametreler güncelleniyor'
      : syncState === 'synced'
        ? 'Değişiklikler senkron'
        : 'Hazır'

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="glass p-7 rounded-[28px] border border-white/[0.06] sticky top-20 space-y-7"
    >
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="eyebrow">Kontroller</p>
          <div>
            <h3 className="font-headline text-[1.4rem] leading-none font-semibold tracking-tight">
              Parametreler
            </h3>
            <p className="text-sm text-on-surface-variant mt-2">
              Her değişiklik kısa bir gecikmeyle simülasyona yansır.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className={`rounded-full px-3 py-1.5 text-xs font-medium ${syncTone}`}>
            {syncLabel}
          </div>
          <SlidersHorizontal className="w-4 h-4 text-outline" strokeWidth={1.5} />
        </div>
      </header>

      {presets.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="eyebrow">Hazır Ayarlar</p>
            {selectedPresetName ? (
              <span className="rounded-full bg-surface-container-high/80 px-3 py-1 text-xs text-on-surface-variant">
                {selectedPresetName}
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2.5">
            {presets.map((preset) => {
              const active = selectedPresetName === preset.name

              return (
                <button
                  key={preset.name}
                  onClick={() => onApplyPreset(preset.name)}
                  className={`px-3.5 py-2 rounded-full text-xs font-medium transition-colors ${
                    active
                      ? 'bg-primary/15 text-primary ring-1 ring-primary/20'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  {preset.name}
                </button>
              )
            })}
          </div>
        </section>
      ) : null}

      <section className="space-y-6">
        <p className="eyebrow">Parametre Akışı</p>
        {controls.map((control) => {
          const value = params[control.key]

          return (
            <div
              key={String(control.key)}
              className="surface-panel rounded-2xl border border-white/[0.04] p-4 space-y-3"
            >
              {control.type === 'slider' ? (
                <>
                  <div className="flex justify-between items-center gap-3">
                    <label className="text-sm font-medium text-on-surface">
                      {control.label}
                    </label>
                    <span className="font-mono text-sm text-secondary bg-secondary/10 px-2.5 py-1 rounded-full">
                      {value}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    value={value as number}
                    onChange={(event) =>
                      onParamChange(control.key, Number(event.target.value) as TParams[keyof TParams])
                    }
                    className="w-full h-1.5 bg-surface-container-high rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-on-surface [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_20px_rgba(236,231,242,0.25)] [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </>
              ) : null}

              {control.type === 'toggle' ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface">
                    {control.label}
                  </span>
                  <button
                    onClick={() => onParamChange(control.key, (!value) as TParams[keyof TParams])}
                    className={`w-11 h-6 rounded-full p-1 flex transition-all ${
                      value
                        ? 'bg-secondary/80 justify-end'
                        : 'bg-surface-container-high justify-start'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full ${value ? 'bg-on-secondary' : 'bg-outline'}`} />
                  </button>
                </div>
              ) : null}

              {control.type === 'select' ? (
                <>
                  <label className="text-sm font-medium text-on-surface block">
                    {control.label}
                  </label>
                  <select
                    value={value as string}
                    onChange={(event) =>
                      onParamChange(control.key, event.target.value as TParams[keyof TParams])
                    }
                    className="w-full bg-surface-container-low text-on-surface text-sm rounded-xl px-3.5 py-3 border border-white/[0.04] focus:outline-none focus:ring-1 focus:ring-secondary/50"
                  >
                    {control.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </>
              ) : null}
            </div>
          )
        })}
      </section>

      <div className="space-y-3">
        <button
          onClick={onReset}
          className="w-full bg-surface-container-low py-3.5 rounded-2xl font-medium text-on-surface text-sm border border-white/[0.05] hover:bg-surface-container-high transition-all"
        >
          Sıfırla
        </button>
      </div>
    </motion.div>
  )
}
