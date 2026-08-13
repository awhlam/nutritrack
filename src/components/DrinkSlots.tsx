import { useState } from 'react'
import { DrinkPickerModal } from './DrinkPickerModal'
import { QUARTER_MARKS, drinkDeltaCarbs, slotPercent } from '../lib/drinks'
import type { Preset, Session } from '../lib/types'

interface DrinkSlotsProps {
  session: Session
  drinkPresets: Preset[]
  onAssign: (slotIndex: 0 | 1, presetId: string) => void
  onCreateAndAssign: (slotIndex: 0 | 1, data: { label: string; carbs: number }) => void
  onClear: (slotIndex: 0 | 1) => void
  onLog: (slotIndex: 0 | 1, targetPercent: number) => void
}

const MARK_LABELS: Record<(typeof QUARTER_MARKS)[number], string> = {
  25: '¼',
  50: '½',
  75: '¾',
  100: 'Empty',
}

export function DrinkSlots({
  session,
  drinkPresets,
  onAssign,
  onCreateAndAssign,
  onClear,
  onLog,
}: DrinkSlotsProps) {
  const [pickerSlot, setPickerSlot] = useState<0 | 1 | null>(null)

  return (
    <div>
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-400">
        Drinks
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {([0, 1] as const).map((slotIndex) => (
          <SlotCard
            key={slotIndex}
            slotIndex={slotIndex}
            session={session}
            preset={drinkPresets.find((p) => p.id === session.drinkSlots[slotIndex].presetId) ?? null}
            onOpenPicker={() => setPickerSlot(slotIndex)}
            onClear={() => onClear(slotIndex)}
            onLog={(pct) => onLog(slotIndex, pct)}
          />
        ))}
      </div>

      {pickerSlot !== null && (
        <DrinkPickerModal
          title={pickerSlot === 0 ? 'Bottle 1' : 'Bottle 2'}
          drinkPresets={drinkPresets}
          onClose={() => setPickerSlot(null)}
          onSelect={(presetId) => {
            onAssign(pickerSlot, presetId)
            setPickerSlot(null)
          }}
          onCreate={(data) => {
            onCreateAndAssign(pickerSlot, data)
            setPickerSlot(null)
          }}
        />
      )}
    </div>
  )
}

function SlotCard({
  slotIndex,
  session,
  preset,
  onOpenPicker,
  onClear,
  onLog,
}: {
  slotIndex: 0 | 1
  session: Session
  preset: Preset | null
  onOpenPicker: () => void
  onClear: () => void
  onLog: (targetPercent: number) => void
}) {
  const [customOpen, setCustomOpen] = useState(false)
  const [customValue, setCustomValue] = useState('')

  if (!preset) {
    return (
      <button
        type="button"
        onClick={onOpenPicker}
        className="flex min-h-[120px] flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-slate-600 px-3 py-4 text-center text-slate-300 active:bg-slate-800"
      >
        <span className="text-2xl leading-none">+</span>
        <span className="text-sm font-semibold">Add Drink to Bottle {slotIndex + 1}</span>
      </button>
    )
  }

  const percent = slotPercent(session, slotIndex)
  const carbsSoFar = drinkDeltaCarbs(preset.carbs, percent)
  const finished = percent >= 100

  const customNum = parseInt(customValue, 10)
  const customValid = !Number.isNaN(customNum) && customNum > percent && customNum <= 100

  return (
    <div className="rounded-2xl bg-slate-800/60 p-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-slate-400">
            Bottle {slotIndex + 1}
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: preset.color }} />
            <span className="font-semibold text-white">{preset.label}</span>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onOpenPicker}
            className="rounded-lg bg-slate-700 px-2 py-1 text-xs font-semibold text-slate-200"
          >
            Swap
          </button>
          <button
            type="button"
            onClick={onClear}
            className="rounded-lg bg-slate-700 px-2 py-1 text-xs font-semibold text-slate-400"
            aria-label={`Remove drink from Bottle ${slotIndex + 1}`}
          >
            ✕
          </button>
        </div>
      </div>

      <div className="mb-2">
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-900">
          <div
            className="h-full rounded-full bg-sky-400 transition-all"
            style={{ width: `${percent}%`, backgroundColor: preset.color }}
          />
        </div>
        <div className="mt-1 text-xs text-slate-400">
          {percent}% · {Math.round(carbsSoFar)}g of {preset.carbs}g
        </div>
      </div>

      {finished ? (
        <div className="rounded-lg bg-slate-900/60 py-2 text-center text-xs text-slate-400">
          Finished — tap Swap for a new bottle
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-1.5">
            {QUARTER_MARKS.map((mark) => {
              const reached = mark <= percent
              const delta = drinkDeltaCarbs(preset.carbs, mark - percent)
              return (
                <button
                  key={mark}
                  type="button"
                  disabled={reached}
                  onClick={() => onLog(mark)}
                  data-testid={`drink-mark-${slotIndex}-${mark}`}
                  className="flex flex-col items-center rounded-lg bg-slate-700 py-2 text-sm font-semibold text-white active:bg-slate-600 disabled:bg-slate-900/60 disabled:text-slate-600"
                >
                  <span>{reached ? '✓' : MARK_LABELS[mark]}</span>
                  {!reached && (
                    <span className="text-[10px] font-normal text-slate-400">
                      +{Math.round(delta)}g
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {customOpen ? (
            <div className="mt-2 flex items-center gap-2">
              <input
                autoFocus
                type="number"
                inputMode="numeric"
                min={percent + 1}
                max={100}
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                placeholder={`>${percent}`}
                className="w-16 rounded-lg bg-slate-900 px-2 py-1.5 text-center text-white outline-none ring-1 ring-slate-700 focus:ring-emerald-500"
              />
              <span className="text-sm text-slate-400">%</span>
              <button
                type="button"
                disabled={!customValid}
                onClick={() => {
                  onLog(customNum)
                  setCustomValue('')
                  setCustomOpen(false)
                }}
                className="flex-1 rounded-lg bg-emerald-500 py-1.5 text-sm font-bold text-slate-950 disabled:opacity-40"
              >
                Log
              </button>
              <button
                type="button"
                onClick={() => setCustomOpen(false)}
                className="rounded-lg bg-slate-700 px-3 py-1.5 text-sm text-slate-300"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setCustomOpen(true)}
              className="mt-1.5 w-full rounded-lg py-1 text-xs font-medium text-slate-400 active:text-slate-200"
            >
              Enter exact %
            </button>
          )}
        </>
      )}
    </div>
  )
}
