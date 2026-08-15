import { createContext, useContext } from 'react'

export type UpdateCheckStatus = 'idle' | 'checking' | 'up-to-date'

export interface AppUpdateContextValue {
  needRefresh: boolean
  applyUpdate: () => void
  checkForUpdate: () => void
  checkStatus: UpdateCheckStatus
}

export const AppUpdateContext = createContext<AppUpdateContextValue | null>(null)

export function useAppUpdate() {
  const ctx = useContext(AppUpdateContext)
  if (!ctx) throw new Error('useAppUpdate must be used within AppUpdateProvider')
  return ctx
}
