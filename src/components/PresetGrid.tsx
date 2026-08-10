import type { Preset } from '../lib/types'

interface PresetGridProps {
  presets: Preset[]
  onLog: (preset: Preset) => void
  onCustom: () => void
  onManage: () => void
}

export function PresetGrid({ presets, onLog, onCustom, onManage }: PresetGridProps) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onLog(preset)}
            style={{ borderColor: preset.color }}
            className="flex min-h-[96px] flex-col items-center justify-center gap-1 rounded-2xl border-2 bg-slate-800/80 px-2 py-3 text-center active:scale-95 active:bg-slate-700 transition-transform"
        >
            <span className="text-base font-semibold leading-tight text-white">
              {preset.label}
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-sm font-bold"
              style={{ backgroundColor: preset.color, color: '#0b0f14' }}
            >
              {preset.carbs}g carbs
            </span>
          </button>
        ))}

        <button
          type="button"
          onClick={onCustom}
          className="flex min-h-[96px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-slate-500 px-2 py-3 text-center text-slate-300 active:scale-95 active:bg-slate-800 transition-transform"
        >
          <span className="text-2xl leading-none">+</span>
          <span className="text-sm font-semibold">Custom Entry</span>
        </button>
      </div>

      <button
        type="button"
        onClick={onManage}
        className="mt-3 w-full rounded-xl py-2 text-sm font-medium text-slate-400 active:text-slate-200"
      >
        ⚙️ Manage preset buttons
      </button>
    </div>
  )
}
