import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MileageControl } from './MileageControl'

/** Wrapper that feeds changes back in, the way Tracker does via the store. */
function Harness({ initial = 0 }: { initial?: number }) {
  const [mileage, setMileage] = useState(initial)
  return <MileageControl mileage={mileage} onChange={setMileage} />
}

const stepUp = () => fireEvent.click(screen.getByLabelText('Increase mileage'))
const stepDown = () => fireEvent.click(screen.getByLabelText('Decrease mileage'))

/** The tappable readout, whose accessible name is e.g. "3 mi". */
const shown = () => screen.getByRole('button', { name: /mi$/ }).textContent?.trim()

describe('MileageControl', () => {
  it('steps up in whole miles', () => {
    render(<Harness />)
    stepUp()
    expect(shown()).toBe('1 mi')
  })

  it('accumulates whole-mile steps', () => {
    render(<Harness />)
    stepUp()
    stepUp()
    stepUp()
    expect(shown()).toBe('3 mi')
  })

  it('steps down in whole miles', () => {
    render(<Harness initial={5} />)
    stepDown()
    expect(shown()).toBe('4 mi')
  })

  it('never goes below zero', () => {
    render(<Harness initial={0} />)
    stepDown()
    expect(shown()).toBe('0 mi')
  })

  it('snaps a fractional starting value onto whole miles when stepping', () => {
    render(<Harness initial={4.5} />)
    stepUp()
    expect(shown()).toBe('6 mi')
  })

  it('reports each step to the parent', () => {
    const onChange = vi.fn()
    render(<MileageControl mileage={7} onChange={onChange} />)
    stepUp()
    expect(onChange).toHaveBeenCalledWith(8)
    stepDown()
    expect(onChange).toHaveBeenCalledWith(6)
  })

  it('lets the rider type an exact mileage', () => {
    render(<Harness initial={3} />)
    fireEvent.click(screen.getByRole('button', { name: /mi$/ }))
    const input = screen.getByRole('spinbutton')
    fireEvent.change(input, { target: { value: '13' } })
    fireEvent.blur(input)
    expect(shown()).toBe('13 mi')
  })
})
