import { describe, it, expect, beforeEach } from 'vitest'
import { listPresets, upsertPreset, deletePreset, getPreset } from './repository'

const userId = 'user-test-1'
const otherUserId = 'user-test-2'

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

async function clearPresets(user: string) {
  for (const preset of await listPresets(user)) {
    await deletePreset(user, preset.id)
  }
}

describe('presets repository', () => {
  beforeEach(async () => {
    await clearPresets(userId)
    await clearPresets(otherUserId)
  })

  it('lists empty on a fresh database', async () => {
    expect(await listPresets(userId)).toEqual([])
  })

  it('upserts a new preset', async () => {
    const preset = await upsertPreset(userId, { name: 'Clinica A', clinic, costs: baseCosts })

    expect(preset.id).toBeTruthy()
    expect(preset.name).toBe('Clinica A')
    expect(preset.clinic).toEqual(clinic)
    expect(preset.costs).toEqual(baseCosts)
    expect(preset.createdAt).toBeTruthy()
    expect(preset.updatedAt).toBe(preset.createdAt)

    const summaries = await listPresets(userId)
    expect(summaries).toHaveLength(1)
    expect(summaries[0]).toEqual({
      id: preset.id,
      name: 'Clinica A',
      updatedAt: preset.updatedAt,
    })
  })

  it('overwrites an existing preset by name', async () => {
    const first = await upsertPreset(userId, { name: 'Clinica A', clinic, costs: baseCosts })

    const changedCosts = {
      values: { ...baseCosts.values, aluguel: 9000 },
    }
    const second = await upsertPreset(userId, { name: 'Clinica A', clinic, costs: changedCosts })

    expect(second.name).toBe('Clinica A')
    expect(second.id).toBe(first.id)
    expect(second.costs.values.aluguel).toBe(9000)
    expect(second.createdAt).toBe(first.createdAt)
    expect(second.updatedAt >= first.updatedAt).toBe(true)
    expect(await listPresets(userId)).toHaveLength(1)
  })

  it('deletes an existing preset', async () => {
    const preset = await upsertPreset(userId, { name: 'Clinica B', clinic, costs: baseCosts })

    expect(await deletePreset(userId, preset.id)).toBe(true)
    expect((await listPresets(userId)).some((p) => p.id === preset.id)).toBe(false)
  })

  it('returns false when deleting a missing id', async () => {
    expect(await deletePreset(userId, 'does-not-exist')).toBe(false)
  })

  it('gets a preset by id with its full clinic and costs payload', async () => {
    const preset = await upsertPreset(userId, { name: 'Clinica C', clinic, costs: baseCosts })

    const found = await getPreset(userId, preset.id)
    expect(found).not.toBeNull()
    expect(found?.name).toBe('Clinica C')
    expect(found?.clinic).toEqual(clinic)
    expect(found?.costs).toEqual(baseCosts)
  })

  it('returns null when getting a missing id', async () => {
    expect(await getPreset(userId, 'does-not-exist')).toBeNull()
  })

  it('keeps presets with distinct names separate', async () => {
    await upsertPreset(userId, { name: 'Clinica X', clinic, costs: baseCosts })
    await upsertPreset(userId, { name: 'Clinica Y', clinic, costs: baseCosts })

    const names = (await listPresets(userId)).map((p) => p.name)
    expect(names).toContain('Clinica X')
    expect(names).toContain('Clinica Y')
    expect(await listPresets(userId)).toHaveLength(2)
  })

  it('isolates presets between users', async () => {
    await upsertPreset(userId, { name: 'Clinica A', clinic, costs: baseCosts })
    await upsertPreset(otherUserId, { name: 'Clinica A', clinic, costs: baseCosts })

    expect(await listPresets(userId)).toHaveLength(1)
    expect(await listPresets(otherUserId)).toHaveLength(1)
  })
})
