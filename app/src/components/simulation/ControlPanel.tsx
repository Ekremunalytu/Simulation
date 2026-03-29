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
      ? 'bg-secondary/12 text-secondary shadow-[inset_0_0_0_1px_rgba(76,215,246,0.16)]'
      : 'bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(208,188,255,0.16)]'

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
      transition={{ duration: 0.32 }}
      className="glass h-full overflow-y-auto rounded-[24px] p-6 no-scrollbar"
    >
      <div className="space-y-6">
        <header className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="eyebrow">Kontroller</p>
            <div>
              <h3 className="font-headline text-[1.4rem] leading-none font-semibold tracking-tight">
                Parametreler
              </h3>
              <p className="mt-2 text-sm text-on-surface-variant">
                Her değişiklik kısa bir gecikmeyle simülasyona yansır.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div aria-live="polite" className={`rounded-full px-3 py-1.5 text-xs font-medium ${syncTone}`}>
              {syncLabel}
            </div>
            <SlidersHorizontal aria-hidden="true" className="w-4 h-4 text-outline" strokeWidth={1.5} />
          </div>
        </header>

        {presets.length > 0 ? (
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="eyebrow">Hazır Ayarlar</p>
              {selectedPresetName ? (
                <span className="rounded-full bg-surface-container-high/80 px-3 py-1 text-xs text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(125,118,136,0.14)]">
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
                    type="button"
                    onClick={() => onApplyPreset(preset.name)}
                    className={`focus-ring rounded-full px-3.5 py-2 text-xs font-medium transition-[background-color,color,box-shadow] duration-200 ${
                      active
                        ? 'bg-primary/15 text-primary shadow-[inset_0_0_0_1px_rgba(208,188,255,0.16)]'
                        : 'bg-surface-container-low text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(125,118,136,0.14)] hover:bg-surface-container-high hover:text-on-surface'
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
            const controlId = `control-${String(control.key)}`

            return (
              <div key={String(control.key)} className="surface-panel rounded-[20px] p-4 space-y-3">
                {control.type === 'slider' ? (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <label htmlFor={controlId} className="text-sm font-medium text-on-surface">
                        {control.label}
                      </label>
                      <span className="rounded-full bg-secondary/10 px-2.5 py-1 font-mono text-sm text-secondary shadow-[inset_0_0_0_1px_rgba(76,215,246,0.16)]">
                        {value}
                      </span>
                    </div>
                    <input
                      id={controlId}
                      type="range"
                      min={control.min}
                      max={control.max}
                      step={control.step}
                      value={value as number}
                      onChange={(event) =>
                        onParamChange(control.key, Number(event.target.value) as TParams[keyof TParams])
                      }
                      className="w-full cursor-pointer appearance-none rounded-full bg-surface-container-high h-1.5 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-on-surface [&::-webkit-slider-thumb]:shadow-[0_0_18px_rgba(236,231,242,0.25)]"
                    />
                  </>
                ) : null}

                {control.type === 'toggle' ? (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-on-surface">{control.label}</span>
                    <button
                      type="button"
                      aria-label={control.label}
                      aria-pressed={Boolean(value)}
                      onClick={() => onParamChange(control.key, (!value) as TParams[keyof TParams])}
                      className={`focus-ring flex h-6 w-11 items-center rounded-full p-1 transition-[background-color,justify-content] duration-200 ${
                        value
                          ? 'justify-end bg-secondary/80'
                          : 'justify-start bg-surface-container-high'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`h-4 w-4 rounded-full ${value ? 'bg-on-secondary' : 'bg-outline'}`}
                      />
                    </button>
                  </div>
                ) : null}

                {control.type === 'select' ? (
                  <>
                    <label htmlFor={controlId} className="block text-sm font-medium text-on-surface">
                      {control.label}
                    </label>
                    <select
                      id={controlId}
                      value={value as string}
                      onChange={(event) =>
                        onParamChange(control.key, event.target.value as TParams[keyof TParams])
                      }
                      className="focus-ring w-full rounded-xl bg-surface-container-low px-3.5 py-3 text-sm text-on-surface shadow-[inset_0_0_0_1px_rgba(125,118,136,0.14)]"
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

        <button
          type="button"
          onClick={onReset}
          className="focus-ring w-full rounded-2xl bg-surface-container-low py-3.5 text-sm font-medium text-on-surface shadow-[inset_0_0_0_1px_rgba(125,118,136,0.14)] hover:bg-surface-container-high"
        >
          Sıfırla
        </button>
      </div>
    </motion.div>
  )
}
