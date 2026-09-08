import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ResultsTable } from './ResultsTable'
import type { ProcedureResult } from '@/lib/lucre/types'

function result(status: ProcedureResult['status']): ProcedureResult {
  return {
    procedure: {
      id: 'a',
      name: 'Implante unitário',
      specialty: 'Implantodontia',
      timeMin: 90,
      material: 350,
      lab: 0,
      implants: 800,
      other: 50,
    },
    allocatedFixedCost: 0,
    totalDirectCost: 0,
    minPrice: 2674.41,
    recommendedPrice: 7011.3,
    profit: 2103.39,
    realMargin: 0.3,
    status,
  }
}

describe('ResultsTable', () => {
  it('renders currency and percent values with pt-BR formatting', () => {
    render(<ResultsTable results={[result('Saudável')]} />)
    expect(screen.getByText('R$ 2.674,41')).toBeInTheDocument()
    expect(screen.getByText('R$ 7.011,30')).toBeInTheDocument()
    expect(screen.getByText('R$ 2.103,39')).toBeInTheDocument()
    expect(screen.getByText('30,0%')).toBeInTheDocument()
  })

  it('renders the Saudável status label', () => {
    render(<ResultsTable results={[result('Saudável')]} />)
    expect(screen.getByText('Saudável')).toBeInTheDocument()
  })

  it('renders the Em atenção status label', () => {
    render(<ResultsTable results={[result('Em atenção')]} />)
    expect(screen.getByText('Em atenção')).toBeInTheDocument()
  })

  it('renders the Abaixo da meta status label', () => {
    render(<ResultsTable results={[result('Abaixo da meta')]} />)
    expect(screen.getByText('Abaixo da meta')).toBeInTheDocument()
  })
})
