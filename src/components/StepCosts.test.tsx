import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StepCosts, type CostStrings, COST_LABELS } from './StepCosts'

const emptyCosts: CostStrings = Object.fromEntries(
  Object.keys(COST_LABELS).map((category) => [category, '0'])
) as CostStrings

describe('StepCosts', () => {
  it('renders an editable field for each of the 14 fixed-cost categories', () => {
    render(<StepCosts value={emptyCosts} onChange={vi.fn()} capacityMinutes={1000} errors={[]} />)
    for (const label of Object.values(COST_LABELS)) {
      expect(screen.getByLabelText(label)).toBeInTheDocument()
    }
  })

  it('displays the live total of all categories', () => {
    render(
      <StepCosts
        value={{ ...emptyCosts, aluguel: '500' }}
        onChange={vi.fn()}
        capacityMinutes={1000}
        errors={[]}
      />
    )
    expect(screen.getByText('R$ 500,00')).toBeInTheDocument()
  })

  it('displays the fixed cost per minute from total and capacity', () => {
    render(
      <StepCosts
        value={{ ...emptyCosts, aluguel: '500' }}
        onChange={vi.fn()}
        capacityMinutes={1000}
        errors={[]}
      />
    )
    expect(screen.getByText('R$ 0,50')).toBeInTheDocument()
  })
})