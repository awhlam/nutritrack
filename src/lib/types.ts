export type Activity = 'run' | 'bike'

export interface Preset {
  id: string
  label: string
  carbs: number
  color: string
}

export interface Entry {
  id: string
  timestamp: number
  mileage: number | null
  label: string
  carbs: number
  presetId: string | null
}

export interface Session {
  id: string
  activity: Activity
  startedAt: number
  endedAt: number | null
  currentMileage: number
  entries: Entry[]
}
