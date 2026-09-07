import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NumberInput } from './NumberInput'

describe('NumberInput', () => {
  it('renders a label and a numeric input', () => {
    render(<NumberInput label="Horas por dia" value="10" onChange={() => {}} />)
    expect(screen.getByLabelText('Horas por dia')).toBeInTheDocument()
  })

  it('displays the inline validation message when error is provided', () => {
    render(
      <NumberInput label="Horas por dia" value="" onChange={() => {}} error="Informe as horas por dia." />
    )
    expect(screen.getByText('Informe as horas por dia.')).toBeInTheDocument()
  })

  it('parses a pt-BR comma input and reports the parsed number', () => {
    const onChange = vi.fn()
    render(<NumberInput label="Taxa cartão" value="" onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Taxa cartão'), { target: { value: '1,5' } })
    expect(onChange).toHaveBeenCalledWith(1.5)
  })
})
