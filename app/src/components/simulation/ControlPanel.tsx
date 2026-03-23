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
  dirty: boolean
  selectedPresetName: string | null
  onParamChange: <K extends keyof TParams>(key: K, value: TParams[K]) => void
  onRun: () => void
  onReset: () => void
  onApplyPreset: (presetName: string) => void
}

export function ControlPanel<TParams extends SimulationParamsBase>({
  controls,
  params,
  presets,
  dirty,
  selectedPresetName,
  onParamChange,
  onRun,
  onReset,
  onApplyPreset,
}: ControlPanelProps<TParams>) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="glass p-8 rounded-2xl border border-outline-variant/10 sticky top-20"
    >
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h3 className="font-headline text-lg font-bold tracking-tight">Parametreler</h3>
          <p className="text-[10px] font-mono uppercase tracking-widest text-outline mt-1">
            {dirty ? 'Taslakta bekleyen değişiklikler var' : 'Çalıştırılmış durum güncel'}
          </p>
        </div>
        <SlidersHorizontal className="w-4 h-4 text-outline" strokeWidth={1.5} />
      </header>

      {presets.length > 0 ? (
        <div className="mb-6">
          <p className="text-[10px] font-mono text-outline uppercase tracking-widest mb-3">
            Hazır Ayarlar
          </p>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => {
              const active = selectedPresetName === preset.name

              return (
                <button
                  key={preset.name}
                  onClick={() => onApplyPreset(preset.name)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-colors ${
                    active
                      ? 'bg-primary/15 text-primary'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  {preset.name}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      <div className="space-y-6">
        {controls.map((control) => {
          const value = params[control.key]

          return (
            <div key={String(control.key)} className="space-y-3">
              {control.type === 'slider' ? (
                <>
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-medium text-on-surface-variant uppercase tracking-widest">
                      {control.label}
                    </label>
                    <span className="font-mono text-xs text-secondary bg-secondary/10 px-2 py-0.5 rounded">
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
                    className="w-full h-1 bg-surface-container-high rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                </>
              ) : null}

              {control.type === 'toggle' ? (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-on-surface-variant uppercase tracking-widest">
                    {control.label}
                  </span>
                  <button
                    onClick={() => onParamChange(control.key, (!value) as TParams[keyof TParams])}
                    className={`w-10 h-5 rounded-full p-1 flex transition-all ${
                      value
                        ? 'bg-secondary justify-end'
                        : 'bg-surface-container-high justify-start'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${value ? 'bg-on-secondary' : 'bg-outline'}`} />
                  </button>
                </div>
              ) : null}

              {control.type === 'select' ? (
                <>
                  <label className="text-xs font-medium text-on-surface-variant uppercase tracking-widest block">
                    {control.label}
                  </label>
                  <select
                    value={value as string}
                    onChange={(event) =>
                      onParamChange(control.key, event.target.value as TParams[keyof TParams])
                    }
                    className="w-full bg-surface-container-low text-on-surface text-sm rounded-lg px-3 py-2 border-none focus:outline-none focus:ring-1 focus:ring-secondary/50"
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
      </div>

      <div className="space-y-3 pt-8">
        <button
          onClick={onRun}
          disabled={!dirty}
          className={`w-full py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${
            dirty
              ? 'bg-gradient-to-r from-primary to-primary-container text-on-primary-container hover:shadow-[0_0_20px_#d0bcff33] active:scale-[0.98]'
              : 'bg-surface-container-high text-outline cursor-not-allowed'
          }`}
        >
          Simülasyonu Çalıştır
        </button>
        <button
          onClick={onReset}
          className="w-full bg-surface-variant/20 backdrop-blur-md py-3 rounded-xl font-bold text-on-surface text-sm uppercase tracking-widest border border-outline/20 hover:bg-surface-variant/40 transition-all"
        >
          Sıfırla
        </button>
      </div>
    </motion.div>
  )
}
