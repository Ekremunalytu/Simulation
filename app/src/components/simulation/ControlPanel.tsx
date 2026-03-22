import { motion } from 'framer-motion'
import { SlidersHorizontal } from 'lucide-react'
import type { ControlDefinition, PresetConfig } from '../../types/simulation'

interface ControlPanelProps {
  controls: ControlDefinition[]
  params: Record<string, any>
  presets?: PresetConfig[]
  onParamChange: (key: string, value: any) => void
  onReset: () => void
  onApplyPreset?: (preset: Record<string, any>) => void
}

export function ControlPanel({ controls, params, presets, onParamChange, onReset, onApplyPreset }: ControlPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="glass p-8 rounded-2xl border border-outline-variant/10 sticky top-20"
    >
      <header className="mb-8 flex items-center justify-between">
        <h3 className="font-headline text-lg font-bold tracking-tight">Parameters</h3>
        <SlidersHorizontal className="w-4 h-4 text-outline" strokeWidth={1.5} />
      </header>

      {/* Presets */}
      {presets && presets.length > 0 && onApplyPreset && (
        <div className="mb-6">
          <p className="text-[10px] font-mono text-outline uppercase tracking-widest mb-3">Presets</p>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => onApplyPreset(preset.params)}
                className="px-3 py-1.5 rounded-lg bg-surface-container text-[10px] font-mono text-on-surface-variant uppercase tracking-wider hover:bg-surface-container-high transition-colors"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="space-y-6">
        {controls.map((control) => (
          <div key={control.key} className="space-y-3">
            {control.type === 'slider' && (
              <>
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium text-on-surface-variant uppercase tracking-widest">
                    {control.label}
                  </label>
                  <span className="font-mono text-xs text-secondary bg-secondary/10 px-2 py-0.5 rounded">
                    {params[control.key]}
                  </span>
                </div>
                <input
                  type="range"
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={params[control.key] as number}
                  onChange={(e) => onParamChange(control.key, parseFloat(e.target.value))}
                  className="w-full h-1 bg-surface-container-high rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer"
                />
              </>
            )}

            {control.type === 'toggle' && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-on-surface-variant uppercase tracking-widest">
                  {control.label}
                </span>
                <button
                  onClick={() => onParamChange(control.key, !params[control.key])}
                  className={`w-10 h-5 rounded-full p-1 flex transition-all ${
                    params[control.key]
                      ? 'bg-secondary justify-end'
                      : 'bg-surface-container-high justify-start'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${params[control.key] ? 'bg-on-secondary' : 'bg-outline'}`} />
                </button>
              </div>
            )}

            {control.type === 'select' && (
              <>
                <label className="text-xs font-medium text-on-surface-variant uppercase tracking-widest block">
                  {control.label}
                </label>
                <select
                  value={params[control.key] as string}
                  onChange={(e) => onParamChange(control.key, e.target.value)}
                  className="w-full bg-surface-container-low text-on-surface text-sm rounded-lg px-3 py-2 border-none focus:outline-none focus:ring-1 focus:ring-secondary/50"
                >
                  {control.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-8">
        <button
          onClick={() => {}}
          className="w-full bg-gradient-to-r from-primary to-primary-container py-3 rounded-xl font-bold text-on-primary-container text-sm uppercase tracking-widest hover:shadow-[0_0_20px_#d0bcff33] transition-all active:scale-[0.98]"
        >
          Run Simulation
        </button>
        <button
          onClick={onReset}
          className="w-full bg-surface-variant/20 backdrop-blur-md py-3 rounded-xl font-bold text-on-surface text-sm uppercase tracking-widest border border-outline/20 hover:bg-surface-variant/40 transition-all"
        >
          Reset
        </button>
      </div>
    </motion.div>
  )
}
