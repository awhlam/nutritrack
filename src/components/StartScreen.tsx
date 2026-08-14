interface StartScreenProps {
  onStart: () => void
  onManagePresets: () => void
  onHistory: () => void
}

export function StartScreen({ onStart, onManagePresets, onHistory }: StartScreenProps) {
  return (
    <div className="flex flex-1 flex-col justify-between px-4 pb-6 pt-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onHistory}
          className="rounded-full bg-slate-800 px-4 py-1.5 text-sm font-semibold text-slate-300 active:bg-slate-700"
        >
          History
        </button>
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold text-white">NutriTrack</h1>
        <p className="text-sm text-slate-400">
          Set up your presets, then tap Start when the race begins.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onManagePresets}
          className="w-full rounded-xl bg-slate-800 py-2.5 text-sm font-semibold text-slate-200 active:bg-slate-700"
        >
          ⚙️ Edit Presets
        </button>
        <button
          type="button"
          onClick={onStart}
          className="w-full rounded-2xl bg-emerald-500 py-4 text-lg font-bold text-slate-950 active:bg-emerald-400"
        >
          Start
        </button>
      </div>
    </div>
  )
}
