import { describe, it, expect, vi } from 'vitest'
import { useState } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { StepProcedures } from './StepProcedures'
import type { ProcedureInput } from '@/lib/lucre/types'

function filledRow(overrides: Partial<ProcedureInput> = {}): ProcedureInput {
  return {
    id: 'a',
    name: 'Implante unitário',
    specialty: 'Implantodontia',
    timeMin: 90,
    material: 350,
    lab: 0,
    implants: 800,
    other: 50,
    ...overrides,
  }
}

function emptyRow(overrides: Partial<ProcedureInput> = {}): ProcedureInput {
  return {
    id: 'b',
    name: '',
    specialty: '',
    timeMin: 0,
    material: 0,
    lab: 0,
    implants: 0,
    other: 0,
    ...overrides,
  }
}

function Harness({ initial }: { initial: ProcedureInput[] }) {
  const [rows, setRows] = useState(initial)
  return <StepProcedures value={rows} onProceduresChange={setRows} />
}

describe('StepProcedures', () => {
  it('renders an editable procedure row with all columns', () => {
    render(<StepProcedures value={[filledRow()]} onProceduresChange={vi.fn()} />)
    expect(screen.getByDisplayValue('Implante unitário')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Implantodontia')).toBeInTheDocument()
    expect(screen.getByDisplayValue(90)).toBeInTheDocument()
    expect(screen.getByDisplayValue(350)).toBeInTheDocument()
    expect(screen.getByDisplayValue(800)).toBeInTheDocument()
    expect(screen.getByDisplayValue(50)).toBeInTheDocument()
  })

  it('adds a new empty row when the add button is clicked', () => {
    render(<Harness initial={[filledRow()]} />)
    expect(screen.getAllByLabelText('Procedimento')).toHaveLength(1)
    fireEvent.click(screen.getByText('Adicionar procedimento'))
    expect(screen.getAllByLabelText('Procedimento')).toHaveLength(2)
  })

  it('removes a row when its remove button is clicked', () => {
    render(<Harness initial={[filledRow(), emptyRow()]} />)
    expect(screen.getAllByLabelText('Procedimento')).toHaveLength(2)
    fireEvent.click(screen.getAllByText('Remover')[0])
    expect(screen.getAllByLabelText('Procedimento')).toHaveLength(1)
  })

  it('keeps rows editable in the table while typing', () => {
    const onChange = vi.fn()
    render(
      <StepProcedures
        value={[filledRow(), emptyRow()]}
        onProceduresChange={onChange}
      />
    )
    expect(screen.getAllByLabelText('Procedimento')).toHaveLength(2)
    fireEvent.change(screen.getAllByLabelText('Material')[1], { target: { value: '400' } })
    const emitted = onChange.mock.calls[0][0] as ProcedureInput[]
    expect(emitted).toHaveLength(2)
    expect(emitted[1].id).toBe('b')
  })
})
