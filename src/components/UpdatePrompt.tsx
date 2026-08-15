import { useRegisterSW } from 'virtual:pwa-register/react'

// Browsers only byte-compare the service worker file on navigation, and cap
// that check at a 24h staleness limit regardless of server cache headers —
// so without an explicit poll, a reopened tab can sit on a stale version for
// a long time. Checking every 30 minutes while the app is open catches new
// deploys quickly without hammering the network.
const UPDATE_CHECK_INTERVAL_MS = 30 * 60 * 1000

export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return
      window.setInterval(() => {
        registration.update()
      }, UPDATE_CHECK_INTERVAL_MS)
    },
  })

  if (!needRefresh) return null

  return (
    <div
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-between gap-3 bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950"
      style={{ paddingTop: 'max(0.625rem, env(safe-area-inset-top, 0px))' }}
    >
      <span>A new version of NutriTrack is available</span>
      <button
        type="button"
        onClick={() => updateServiceWorker(true)}
        className="shrink-0 rounded-full bg-slate-950 px-3 py-1 text-white active:bg-slate-800"
      >
        Refresh
      </button>
    </div>
  )
}
