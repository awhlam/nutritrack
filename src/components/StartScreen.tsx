interface StartScreenProps {
  onStart: () => void
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
      <div>
        <h1 className="text-3xl font-bold text-white">NutriTrack</h1>
        <p className="mt-2 text-slate-400">
          Log carbs on the go. Hit your fueling targets.
        </p>
      </div>

      <button
        type="button"
        onClick={onStart}
        className="w-full max-w-sm rounded-2xl bg-emerald-500 py-6 text-xl font-bold text-slate-950 active:scale-95 transition-transform"
      >
        Start Activity
      </button>
    </div>
  )
}
