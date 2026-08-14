import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { SessionTimeField } from './SessionTimeField'
import { formatClockTimeShort } from '../lib/format'

const base = new Date(2026, 7, 10, 9, 15, 30).getTime()

function Harness({ initial = base }: { initial?: number }) {
  const [timestamp, setTimestamp] = useState(initial)
  return <SessionTimeField label="Started" timestamp={timestamp} onChange={setTimestamp} />
}

describe('SessionTimeField', () => {
  it('shows the label and formatted time', () => {
    render(<Harness />)
    expect(screen.getByText(`Started ${formatClockTimeShort(base)}`)).toBeTruthy()
  })

  it('tapping the value opens a time input', () => {
    render(<Harness />)
    fireEvent.click(screen.getByText(`Started ${formatClockTimeShort(base)}`))
    expect(screen.getByDisplayValue('09:15:30')).toBeTruthy()
  })

  it('commits the new time on blur, keeping the original date', () => {
    render(<Harness />)
    fireEvent.click(screen.getByText(`Started ${formatClockTimeShort(base)}`))
    const input = screen.getByDisplayValue('09:15:30')
    fireEvent.change(input, { target: { value: '11:45:00' } })
    fireEvent.blur(input)
    expect(screen.getByText(`Started ${formatClockTimeShort(new Date(2026, 7, 10, 11, 45, 0).getTime())}`)).toBeTruthy()
  })

  it('reports the new timestamp to the parent', () => {
    const onChange = vi.fn()
    render(<SessionTimeField label="Started" timestamp={base} onChange={onChange} />)
    fireEvent.click(screen.getByText(`Started ${formatClockTimeShort(base)}`))
    const input = screen.getByDisplayValue('09:15:30')
    fireEvent.change(input, { target: { value: '11:45:00' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onChange).toHaveBeenCalledWith(new Date(2026, 7, 10, 11, 45, 0).getTime())
  })
})
