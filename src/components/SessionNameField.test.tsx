import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { SessionNameField } from './SessionNameField'

function Harness({ initial = '' }: { initial?: string }) {
  const [name, setName] = useState(initial)
  return <SessionNameField name={name} onChange={setName} />
}

describe('SessionNameField', () => {
  it('shows a call-to-action placeholder when unnamed', () => {
    render(<Harness />)
    expect(screen.getByText('+ Name this event')).toBeTruthy()
  })

  it('shows the name when set', () => {
    render(<Harness initial="Boston Marathon" />)
    expect(screen.getByText('Boston Marathon')).toBeTruthy()
    expect(screen.queryByText('+ Name this event')).toBeNull()
  })

  it('tapping the placeholder opens an editable input', () => {
    render(<Harness />)
    fireEvent.click(screen.getByText('+ Name this event'))
    expect(screen.getByRole('textbox')).toBeTruthy()
  })

  it('commits the name on blur', () => {
    render(<Harness />)
    fireEvent.click(screen.getByText('+ Name this event'))
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'Boston Marathon' } })
    fireEvent.blur(input)
    expect(screen.getByText('Boston Marathon')).toBeTruthy()
  })

  it('commits the name on Enter', () => {
    render(<Harness />)
    fireEvent.click(screen.getByText('+ Name this event'))
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'Chicago Marathon' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(screen.getByText('Chicago Marathon')).toBeTruthy()
  })

  it('trims whitespace before committing', () => {
    render(<Harness />)
    fireEvent.click(screen.getByText('+ Name this event'))
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '  Boston Marathon  ' } })
    fireEvent.blur(input)
    expect(screen.getByText('Boston Marathon')).toBeTruthy()
  })

  it('clearing the text reverts to the unnamed placeholder', () => {
    render(<Harness initial="Boston Marathon" />)
    fireEvent.click(screen.getByText('Boston Marathon'))
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '' } })
    fireEvent.blur(input)
    expect(screen.getByText('+ Name this event')).toBeTruthy()
  })

  it('reports the new name to the parent', () => {
    const onChange = vi.fn()
    render(<SessionNameField name="" onChange={onChange} />)
    fireEvent.click(screen.getByText('+ Name this event'))
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'Boston Marathon' } })
    fireEvent.blur(input)
    expect(onChange).toHaveBeenCalledWith('Boston Marathon')
  })
})
