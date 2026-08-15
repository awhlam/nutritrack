import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { AppUpdateContext } from './appUpdateContext'

// Browsers only byte-compare the service worker file on navigation, and cap
// that check at a 24h staleness limit regardless of server cache headers —
// so without an explicit poll, a reopened tab can sit on a stale version for
// a long time. Checking on load and every 30 minutes while the app stays
// open catches new deploys quickly without hammering the network.
const UPDATE_CHECK_INTERVAL_MS = 30 * 60 * 1000
const UP_TO_DATE_MESSAGE_MS = 2500

export function AppUpdateProvider({ children }: { children: ReactNode }) {
  const [checkStatus, setCheckStatus] = useState<'idle' | 'checking' | 'up-to-date'>('idle')
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null)
  const needRefreshRef = useRef(false)

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return
      registrationRef.current = registration
      registration.update()
      window.setInterval(() => {
        registration.update()
      }, UPDATE_CHECK_INTERVAL_MS)
    },
  })

  useEffect(() => {
    needRefreshRef.current = needRefresh
    // The banner already covers this case — don't also claim "up to date".
    if (needRefresh) setCheckStatus('idle')
  }, [needRefresh])

  const checkForUpdate = useCallback(() => {
    const registration = registrationRef.current
    if (!registration) return
    setCheckStatus('checking')
    registration.update().finally(() => {
      // registration.update() resolves once the byte-compare request lands,
      // but workbox's "waiting"/needRefresh state settles a beat later.
      window.setTimeout(() => {
        if (!needRefreshRef.current) {
          setCheckStatus('up-to-date')
          window.setTimeout(() => setCheckStatus('idle'), UP_TO_DATE_MESSAGE_MS)
        }
      }, 800)
    })
  }, [])

  return (
    <AppUpdateContext.Provider
      value={{
        needRefresh,
        applyUpdate: () => updateServiceWorker(true),
        checkForUpdate,
        checkStatus,
      }}
    >
      {children}
    </AppUpdateContext.Provider>
  )
}
