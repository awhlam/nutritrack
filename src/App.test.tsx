/// <reference types="node" />
import { readFileSync } from 'fs'
import { join } from 'path'
import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import App from './App'

beforeEach(() => {
  localStorage.clear()
})

describe('App startup', () => {
  it('shows a start screen and does not begin tracking on its own', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Start' })).toBeTruthy())
    expect(screen.queryByText('End')).toBeNull()

    const sessions = JSON.parse(localStorage.getItem('nutritrack:sessions') ?? '[]')
    expect(sessions).toHaveLength(0)
  })

  it('begins tracking only once Start is tapped', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Start' })).toBeTruthy())
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    await waitFor(() => expect(screen.getByText('End')).toBeTruthy())
  })

  it('shows a live "session active" indicator once tracking begins', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Start' })).toBeTruthy())
    expect(screen.queryByRole('status', { name: 'Session active' })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    await waitFor(() => expect(screen.getByRole('status', { name: 'Session active' })).toBeTruthy())
  })

  it('resumes an existing active session instead of showing the start screen again', async () => {
    const { unmount } = render(<App />)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Start' })).toBeTruthy())
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    await waitFor(() => expect(screen.getByText('End')).toBeTruthy())
    unmount()

    const sessions = JSON.parse(localStorage.getItem('nutritrack:sessions') ?? '[]')
    expect(sessions).toHaveLength(1)

    render(<App />)
    await waitFor(() => expect(screen.getByText('End')).toBeTruthy())
    const sessionsAfterRemount = JSON.parse(localStorage.getItem('nutritrack:sessions') ?? '[]')
    expect(sessionsAfterRemount).toHaveLength(1)
  })
})

describe('App shell', () => {
  it('carries the safe-area class, so standalone/home-screen installs stay clear of the notch', () => {
    const { container } = render(<App />)
    expect(container.firstElementChild?.className).toContain('app-shell')
  })

  it('defines safe-area padding for that class, using env() with a zero fallback', () => {
    const css = readFileSync(join(process.cwd(), 'src/index.css'), 'utf8')
    const rule = css.match(/\.app-shell\s*{([^}]*)}/)
    expect(rule, '.app-shell rule should exist in index.css').not.toBeNull()
    const body = rule![1]
    expect(body).toMatch(/padding-top:\s*env\(safe-area-inset-top,\s*0px\)/)
    expect(body).toMatch(/padding-bottom:\s*env\(safe-area-inset-bottom,\s*0px\)/)
  })
})
