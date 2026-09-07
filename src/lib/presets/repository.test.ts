import { describe, it, expect, beforeEach } from 'vitest'
import { listPresets, upsertPreset, deletePreset } from './repository'

const clinic = {
  hoursPerDay: 10,
  workingDays: 22,
  chairs: 2,
  cardFee: 0.035,
  tax: 0.08,
  commission: 0.4,
  targetMargin: 0.3,
}

const baseCosts = {
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

describe('presets repository', () => {
  beforeEach(() => {
    for (const preset of listPresets()) {
      deletePreset(preset.id)
    }
  })

  it('lists empty on a fresh database', () => {
    expect(listPresets()).toEqual([])
  })

  it('upserts a new preset', () => {
    const preset = upsertPreset({ name: 'Clinica A', clinic, costs: baseCosts })

    expect(preset.id).toBeTruthy()
    expect(preset.name).toBe('Clinica A')
    expect(preset.clinic).toEqual(clinic)
    expect(preset.costs).toEqual(baseCosts)
    expect(preset.createdAt).toBeTruthy()
    expect(preset.updatedAt).toBe(preset.createdAt)

    const summaries = listPresets()
    expect(summaries).toHaveLength(1)
    expect(summaries[0]).toEqual({
      id: preset.id,
      name: 'Clinica A',
      updatedAt: preset.updatedAt,
    })
  })

  it('overwrites an existing preset by name', () => {
    const first = upsertPreset({ name: 'Clinica A', clinic, costs: baseCosts })

    const changedCosts = {
      values: { ...baseCosts.values, aluguel: 9000 },
    }
    const second = upsertPreset({ name: 'Clinica A', clinic, costs: changedCosts })

    expect(second.name).toBe('Clinica A')
    expect(second.id).toBe(first.id)
    expect(second.costs.values.aluguel).toBe(9000)
    expect(second.createdAt).toBe(first.createdAt)
    expect(second.updatedAt >= first.updatedAt).toBe(true)
    expect(listPresets()).toHaveLength(1)
  })

  it('deletes an existing preset', () => {
    const preset = upsertPreset({ name: 'Clinica B', clinic, costs: baseCosts })

    expect(deletePreset(preset.id)).toBe(true)
    expect(listPresets().some((p) => p.id === preset.id)).toBe(false)
  })

  it('returns false when deleting a missing id', () => {
    expect(deletePreset('does-not-exist')).toBe(false)
  })

  it('keeps presets with distinct names separate', () => {
    upsertPreset({ name: 'Clinica X', clinic, costs: baseCosts })
    upsertPreset({ name: 'Clinica Y', clinic, costs: baseCosts })

    const names = listPresets().map((p) => p.name)
    expect(names).toContain('Clinica X')
    expect(names).toContain('Clinica Y')
    expect(listPresets()).toHaveLength(2)
  })
})