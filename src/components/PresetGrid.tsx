import { useState } from 'react'
import { PresetSlotModal } from './PresetSlotModal'
import type { Preset } from '../lib/types'

interface PresetGridProps {
  presets: Preset[]
  onLog: (preset: Preset) => void
  onCreate: (data: { label: string; carbs: number; caffeine: number; color: string }) => void
  onManage: () => void
}

/** Always show at least this many cells, so new users see empty slots to fill rather than a bare grid. */
const MIN_SLOTS = 4

export function PresetGrid({ presets, onLog, onCreate, onManage }: PresetGridProps) {
  const [creatingSlot, setCreatingSlot] = useState(false)
  const emptySlotCount = Math.max(0, MIN_SLOTS - presets.length)

  return (
    <div>
      <div className="grid grid-cols-2 gap-2.5">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onLog(preset)}
            style={{ borderColor: preset.color }}
            className="flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-2xl border-2 bg-slate-800/80 px-2 py-2 text-center active:scale-95 active:bg-slate-700 transition-transform"
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
            {preset.caffeine > 0 && (
              <span className="text-[10px] font-medium text-slate-400">
                +{preset.caffeine}mg caffeine
              </span>
            )}
          </button>
        ))}

        {Array.from({ length: emptySlotCount }).map((_, i) => (
          <button
            key={`empty-${i}`}
            type="button"
            onClick={() => setCreatingSlot(true)}
            className="flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-slate-600 px-2 py-2 text-center text-slate-400 active:scale-95 active:bg-slate-800 transition-transform"
          >
            <span className="text-xl leading-none">+</span>
            <span className="text-sm font-semibold">Tap to add</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onManage}
        className="mt-2 w-full rounded-xl py-1.5 text-sm font-medium text-slate-400 active:text-slate-200"
      >
        ⚙️ Manage preset buttons
      </button>

      {creatingSlot && (
        <PresetSlotModal
          onClose={() => setCreatingSlot(false)}
          onSave={(data) => {
            onCreate(data)
            setCreatingSlot(false)
          }}
        />
      )}
    </div>
  )
}
