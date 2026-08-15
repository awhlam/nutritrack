import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { OptionalNutrientFields } from './OptionalNutrientFields'

function Harness({ initialCaffeine = '', initialSodium = '' }: { initialCaffeine?: string; initialSodium?: string }) {
  const [caffeine, setCaffeine] = useState(initialCaffeine)
  const [sodium, setSodium] = useState(initialSodium)
  return (
    <OptionalNutrientFields
      caffeine={caffeine}
      onCaffeineChange={setCaffeine}
      caffeineLabel="Caffeine (mg)"
      sodium={sodium}
      onSodiumChange={setSodium}
      sodiumLabel="Sodium (mg)"
    />
  )
}

describe('OptionalNutrientFields', () => {
  it('starts collapsed behind a single toggle when both values are empty', () => {
    render(<Harness />)
    expect(screen.getByText('+ Add caffeine / sodium (optional)')).toBeTruthy()
    expect(screen.queryByLabelText('Caffeine (mg)')).toBeNull()
    expect(screen.queryByLabelText('Sodium (mg)')).toBeNull()
  })

  it('expands to reveal both fields on tap', () => {
    render(<Harness />)
    fireEvent.click(screen.getByText('+ Add caffeine / sodium (optional)'))
    expect(screen.getByLabelText('Caffeine (mg)')).toBeTruthy()
    expect(screen.getByLabelText('Sodium (mg)')).toBeTruthy()
  })

  it('starts expanded when a caffeine value is already set', () => {
    render(<Harness initialCaffeine="25" />)
    expect(screen.queryByText('+ Add caffeine / sodium (optional)')).toBeNull()
    expect(screen.getByLabelText('Caffeine (mg)')).toBeTruthy()
  })

  it('starts expanded when a sodium value is already set', () => {
    render(<Harness initialSodium="300" />)
    expect(screen.queryByText('+ Add caffeine / sodium (optional)')).toBeNull()
    expect(screen.getByLabelText('Sodium (mg)')).toBeTruthy()
  })

  it('reports edits to each field independently', () => {
    const onCaffeineChange = vi.fn()
    const onSodiumChange = vi.fn()
    render(
      <OptionalNutrientFields
        caffeine="10"
        onCaffeineChange={onCaffeineChange}
        caffeineLabel="Caffeine (mg)"
        sodium="20"
        onSodiumChange={onSodiumChange}
        sodiumLabel="Sodium (mg)"
      />,
    )
    fireEvent.change(screen.getByLabelText('Caffeine (mg)'), { target: { value: '15' } })
    expect(onCaffeineChange).toHaveBeenCalledWith('15')
    fireEvent.change(screen.getByLabelText('Sodium (mg)'), { target: { value: '250' } })
    expect(onSodiumChange).toHaveBeenCalledWith('250')
  })
})
