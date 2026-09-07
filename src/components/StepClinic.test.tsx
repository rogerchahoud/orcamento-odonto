import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StepClinic, type ClinicStrings } from './StepClinic'

const base: ClinicStrings = {
  hoursPerDay: '10',
  workingDays: '22',
  chairs: '2',
  cardFee: '3,5',
  tax: '8',
  commission: '40',
  targetMargin: '30',
}

describe('StepClinic', () => {
  it('renders all clinic input fields', () => {
    render(<StepClinic value={base} onChange={vi.fn()} errors={[]} />)
    expect(screen.getByLabelText('Horas por dia')).toBeInTheDocument()
    expect(screen.getByLabelText('Dias úteis')).toBeInTheDocument()
    expect(screen.getByLabelText('Cadeiras')).toBeInTheDocument()
    expect(screen.getByLabelText('Taxa cartão')).toBeInTheDocument()
    expect(screen.getByLabelText('Imposto')).toBeInTheDocument()
    expect(screen.getByLabelText('Comissão')).toBeInTheDocument()
    expect(screen.getByLabelText('Margem alvo')).toBeInTheDocument()
  })

  it('displays the monthly capacity in minutes from the current inputs', () => {
    render(<StepClinic value={base} onChange={vi.fn()} errors={[]} />)
    expect(screen.getByText('26.400 minutos')).toBeInTheDocument()
  })

  it('surfaces the capacity-zero validation message on the offending field', () => {
    render(
      <StepClinic
        value={{ ...base, hoursPerDay: '0' }}
        onChange={vi.fn()}
        errors={[{ field: 'hoursPerDay', message: 'Informe as horas por dia para calcular a capacidade.' }]}
      />
    )
    expect(
      screen.getByText('Informe as horas por dia para calcular a capacidade.')
    ).toBeInTheDocument()
  })
})
