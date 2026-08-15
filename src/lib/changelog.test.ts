import { describe, expect, it } from 'vitest'
import { CHANGELOG, CURRENT_VERSION } from './changelog'

function parseVersion(v: string): [number, number, number] {
  const [major, minor, patch] = v.split('.').map(Number)
  return [major, minor, patch]
}

function compareVersions(a: string, b: string): number {
  const [aMajor, aMinor, aPatch] = parseVersion(a)
  const [bMajor, bMinor, bPatch] = parseVersion(b)
  return aMajor - bMajor || aMinor - bMinor || aPatch - bPatch
}

describe('CHANGELOG', () => {
  it('is not empty', () => {
    expect(CHANGELOG.length).toBeGreaterThan(0)
  })

  it('lists versions newest first', () => {
    for (let i = 1; i < CHANGELOG.length; i++) {
      expect(compareVersions(CHANGELOG[i - 1].version, CHANGELOG[i].version)).toBeGreaterThan(0)
    }
  })

  it('has no duplicate versions', () => {
    const versions = CHANGELOG.map((e) => e.version)
    expect(new Set(versions).size).toBe(versions.length)
  })

  it('gives every entry at least one change and a date', () => {
    for (const entry of CHANGELOG) {
      expect(entry.changes.length).toBeGreaterThan(0)
      expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })
})

describe('CURRENT_VERSION', () => {
  it('matches the newest changelog entry', () => {
    expect(CURRENT_VERSION).toBe(CHANGELOG[0].version)
  })
})
