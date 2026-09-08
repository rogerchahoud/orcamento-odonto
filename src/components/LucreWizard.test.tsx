import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LucreWizard } from './LucreWizard'

describe('LucreWizard', () => {
  it('navigates through the three steps with Próximo', () => {
    render(<LucreWizard initialPresets={[]} />)
    expect(screen.getByLabelText('Horas por dia')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Próximo'))
    expect(screen.getByLabelText('Aluguel')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Próximo'))
    expect(screen.getByText('Adicionar procedimento')).toBeInTheDocument()
  })

  it('preserves entered values when navigating back with Voltar', () => {
    render(<LucreWizard initialPresets={[]} />)
    fireEvent.change(screen.getByLabelText('Cadeiras'), { target: { value: '3' } })

    fireEvent.click(screen.getByText('Próximo'))
    expect(screen.getByLabelText('Aluguel')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Voltar'))
    expect(screen.getByLabelText('Cadeiras')).toHaveValue('3')
  })

  it('renders live results inside Step 3', () => {
    render(<LucreWizard initialPresets={[]} />)
    fireEvent.click(screen.getByText('Próximo'))
    fireEvent.click(screen.getByText('Próximo'))

    fireEvent.click(screen.getByText('Adicionar procedimento'))
    fireEvent.change(screen.getByLabelText('Procedimento'), {
      target: { value: 'Implante unitário' },
    })
    fireEvent.change(screen.getByLabelText('Tempo (min)'), { target: { value: '90' } })
    fireEvent.change(screen.getByLabelText('Material'), { target: { value: '350' } })
    fireEvent.change(screen.getByLabelText('Implantes'), { target: { value: '800' } })
    fireEvent.change(screen.getByLabelText('Outros'), { target: { value: '50' } })

    expect(screen.getByDisplayValue('Implante unitário')).toBeInTheDocument()
    expect(screen.getByText('Preço recomendado')).toBeInTheDocument()
    expect(screen.getByText('Preço mínimo')).toBeInTheDocument()
  })

  it('renders a validation banner when capacity is zero', () => {
    render(<LucreWizard initialPresets={[]} />)
    fireEvent.change(screen.getByLabelText('Horas por dia'), { target: { value: '0' } })

    expect(
      screen.getAllByText('Informe as horas por dia para calcular a capacidade.').length
    ).toBeGreaterThan(0)
  })
})