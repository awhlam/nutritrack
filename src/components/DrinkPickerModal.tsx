import { useState } from 'react'
import { Modal } from './Modal'
import type { Preset } from '../lib/types'

interface DrinkPickerModalProps {
  title: string
  drinkPresets: Preset[]
  onSelect: (presetId: string) => void
  onCreate: (data: { label: string; carbs: number }) => void
  onClose: () => void
}

export function DrinkPickerModal({
  title,
  drinkPresets,
  onSelect,
  onCreate,
  onClose,
}: DrinkPickerModalProps) {
  const [creating, setCreating] = useState(drinkPresets.length === 0)
  const [label, setLabel] = useState('')
  const [carbs, setCarbs] = useState('')

  const carbsNum = parseFloat(carbs)
  const valid = label.trim().length > 0 && !Number.isNaN(carbsNum) && carbsNum >= 0

  return (
    <Modal title={title} onClose={onClose}>
      <div className="space-y-4">
        {drinkPresets.length > 0 && (
          <div className="flex flex-col gap-2">
            {drinkPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelect(preset.id)}
                className="flex items-center justify-between rounded-xl bg-slate-800/60 px-4 py-3 text-left active:bg-slate-800"
              >
                <span className="flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: preset.color }}
                  />
                  <span className="font-medium text-white">{preset.label}</span>
                </span>
                <span className="text-sm text-slate-400">{preset.carbs}g total</span>
              </button>
            ))}
          </div>
        )}

        {creating ? (
          <div className="flex flex-col gap-3 rounded-xl bg-slate-800/60 p-4">
            <input
              autoFocus
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Carb Drink Mix"
              className="w-full rounded-lg bg-slate-900 px-3 py-2 text-white outline-none ring-1 ring-slate-700 focus:ring-emerald-500"
            />
            <input
              type="number"
              inputMode="decimal"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
              placeholder="Total carbs in the full bottle (g)"
              className="w-full rounded-lg bg-slate-900 px-3 py-2 text-white outline-none ring-1 ring-slate-700 focus:ring-emerald-500"
            />
            <button
              type="button"
              disabled={!valid}
              onClick={() => onCreate({ label: label.trim(), carbs: carbsNum })}
              className="w-full rounded-lg bg-emerald-500 py-2 text-sm font-bold text-slate-950 disabled:opacity-40"
            >
              Create & Use
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="w-full rounded-xl border-2 border-dashed border-slate-600 py-3 text-sm font-semibold text-slate-300"
          >
            + New drink
          </button>
        )}
      </div>
    </Modal>
  )
}
