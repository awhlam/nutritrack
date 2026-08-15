import { useAppUpdate } from '../hooks/appUpdateContext'

export function UpdatePrompt() {
  const { needRefresh, applyUpdate } = useAppUpdate()

  if (!needRefresh) return null

  return (
    <div
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-3 bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950"
      style={{ paddingTop: 'max(0.625rem, env(safe-area-inset-top, 0px))' }}
    >
      <span>A new version of NutriTrack is available</span>
      <button
        type="button"
        onClick={applyUpdate}
        className="shrink-0 rounded-full bg-slate-950 px-3 py-1 text-white active:bg-slate-800"
      >
        Refresh
      </button>
    </div>
  )
}
