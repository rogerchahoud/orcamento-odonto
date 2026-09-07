import { describe, it, expect } from 'vitest'
import {
  validateLucreInput,
  validatePresetName,
  filterEmptyProcedureRows,
} from './validate'
import type { LucreInput, ProcedureInput } from './types'

const clinic = {
  hoursPerDay: 10,
  workingDays: 22,
  chairs: 2,
  cardFee: 0.035,
  tax: 0.08,
  commission: 0.4,
  targetMargin: 0.3,
}

const costs = {
  values: {
    aluguel: 8000,
    folha: 12000,
    encargos: 3000,
    energia: 800,
    agua: 200,
    internet: 300,
    contabilidade: 500,
    software: 400,
    marketing: 1500,
    manutencao: 300,
    materialAdm: 500,
    limpeza: 400,
    financiamentos: 1000,
    outros: 780,
  },
}

const implante: ProcedureInput = {
  id: 'p1',
  name: 'Implante unitário',
  specialty: 'Implante unitário',
  timeMin: 90,
  material: 350,
  lab: 0,
  implants: 800,
  other: 50,
}

function makeInput(overrides: Partial<LucreInput> = {}): LucreInput {
  return {
    clinic,
    costs,
    procedures: [implante],
    ...overrides,
  }
}

describe('validateLucreInput', () => {
  it('reports a capacity-zero error when hoursPerDay is zero', () => {
    const errors = validateLucreInput(makeInput({ clinic: { ...clinic, hoursPerDay: 0 } }))

    const error = errors.find((e) => e.field === 'hoursPerDay')
    expect(error?.field).toBe('hoursPerDay')
    expect(error?.message).toBeTruthy()
    expect(errors.some((e) => e.field === 'workingDays')).toBe(false)
  })

  it('reports a capacity-zero error when workingDays is zero', () => {
    const errors = validateLucreInput(makeInput({ clinic: { ...clinic, workingDays: 0 } }))

    const error = errors.find((e) => e.field === 'workingDays')
    expect(error?.field).toBe('workingDays')
    expect(error?.message).toBeTruthy()
  })

  it('reports the percentage-sum guard on all percentage fields', () => {
    const errors = validateLucreInput(makeInput({ clinic: { ...clinic, cardFee: 0.3 } }))

    const fields = errors.map((e) => e.field)
    expect(fields).toContain('cardFee')
    expect(fields).toContain('tax')
    expect(fields).toContain('commission')
    expect(fields).toContain('targetMargin')
    expect(errors[0]?.message).toBe('A soma das taxas e da margem deve ser menor que 1.')
  })

  it('reports a negative clinic numeric field', () => {
    const errors = validateLucreInput(makeInput({ clinic: { ...clinic, cardFee: -0.05 } }))

    const error = errors.find((e) => e.field === 'cardFee')
    expect(error?.field).toBe('cardFee')
    expect(error?.message).toBeTruthy()
  })

  it('reports a negative procedure numeric field', () => {
    const broken = { ...implante, material: -10 }
    const errors = validateLucreInput(makeInput({ procedures: [broken] }))

    const error = errors.find((e) => e.field === 'material')
    expect(error?.field).toBe('material')
    expect(error?.message).toBeTruthy()
  })

  it('excludes rows with no name or all numeric fields blank', () => {
    const noName: ProcedureInput = {
      id: 'e1',
      name: '',
      specialty: '',
      timeMin: 0,
      material: 0,
      lab: 0,
      implants: 0,
      other: 0,
    }
    const namedButBlank: ProcedureInput = {
      id: 'e2',
      name: 'Sem custos',
      specialty: '',
      timeMin: 0,
      material: 0,
      lab: 0,
      implants: 0,
      other: 0,
    }
    const filtered = filterEmptyProcedureRows([noName, namedButBlank, implante])

    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe('p1')
    expect(validateLucreInput(makeInput({ procedures: [noName, namedButBlank, implante] }))).toEqual(
      []
    )
  })
})

describe('validatePresetName', () => {
  it('rejects a blank preset name', () => {
    const error = validatePresetName('   ')
    expect(error?.field).toBe('name')
    expect(error?.message).toBeTruthy()
    expect(validatePresetName('Minha Clínica')).toBeNull()
  })
})