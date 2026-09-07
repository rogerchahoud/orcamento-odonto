import { describe, it, expect } from 'vitest'
import {
  computeCapacity,
  computeTotalFixedCosts,
  computeFixedCostPerMinute,
  computeAllocatedFixedCost,
  computeTotalDirectCost,
  computeMinPrice,
  computeRecommendedPrice,
  computeProfit,
  computeRealMargin,
  computeStatus,
  runLucre,
} from './engine'
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
    marketing: 1000,
    manutencao: 300,
    materialAdm: 500,
    limpeza: 400,
    financiamentos: 1000,
    outros: 80,
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

describe('lucre engine', () => {
  it('computes monthly capacity in minutes (LUCRE-10)', () => {
    expect(computeCapacity(clinic)).toBe(26400)
  })

  it('computes total fixed costs', () => {
    expect(computeTotalFixedCosts(costs)).toBe(28480)
  })

  it('computes fixed cost per minute (LUCRE-11)', () => {
    expect(computeFixedCostPerMinute(costs, 26400)).toBeCloseTo(1.0787878787878789, 10)
  })

  it('computes allocated fixed cost (LUCRE-12)', () => {
    expect(computeAllocatedFixedCost(90, 1.0787878787878789)).toBeCloseTo(97.09090909090909, 10)
  })

  it('computes total direct cost (LUCRE-13)', () => {
    expect(computeTotalDirectCost(implante, 97.09090909090909)).toBeCloseTo(
      1297.0909090909091,
      10
    )
  })

  it('computes minimum price (LUCRE-14)', () => {
    expect(computeMinPrice(1297.0909090909091, 0.515)).toBeCloseTo(2674.4142455482665, 10)
  })

  it('computes recommended price (LUCRE-15)', () => {
    expect(computeRecommendedPrice(1297.0909090909091, 0.815)).toBeCloseTo(7011.302211302213, 10)
  })

  it('computes profit (LUCRE-16)', () => {
    expect(computeProfit(7011.302211302213, 0.3)).toBeCloseTo(2103.3906633906638, 10)
  })

  it('computes real margin (LUCRE-17)', () => {
    expect(computeRealMargin(2103.3906633906638, 7011.302211302213)).toBeCloseTo(0.3, 10)
  })

  it('marks a procedure Saudável when real margin reaches the target (LUCRE-20)', () => {
    expect(computeStatus(0.3, 0.3, 2103.39)).toBe('Saudável')
  })

  it('marks a procedure Em atenção when profitable but below the target (LUCRE-21)', () => {
    expect(computeStatus(0.1, 0.3, 100)).toBe('Em atenção')
  })

  it('marks a procedure Abaixo da meta when profit is not positive (LUCRE-22)', () => {
    expect(computeStatus(0.1, 0.3, -5)).toBe('Abaixo da meta')
    expect(computeStatus(0.1, 0.3, 0)).toBe('Abaixo da meta')
  })

  it('rejects invalid input and reproduces the LUCRE-18 regression', () => {
    const invalid = runLucre(makeInput({ clinic: { ...clinic, hoursPerDay: 0 } }))
    expect(invalid.ok).toBe(false)
    if (invalid.ok) return
    expect(invalid.errors.length).toBeGreaterThan(0)

    const result = runLucre(makeInput())
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.output.capacityMinutes).toBe(26400)
    expect(result.output.totalFixedCosts).toBe(28480)
    expect(result.output.fixedCostPerMinute).toBeCloseTo(1.0787878787878789, 10)
    expect(result.output.results).toHaveLength(1)
    const implanteResult = result.output.results[0]
    expect(implanteResult.procedure.name).toBe('Implante unitário')
    expect(implanteResult.minPrice).toBeCloseTo(2674.4142455482665, 10)
    expect(implanteResult.recommendedPrice).toBeCloseTo(7011.302211302213, 10)
    expect(implanteResult.profit).toBeCloseTo(2103.3906633906638, 10)
    expect(implanteResult.realMargin).toBeCloseTo(0.3, 10)
    expect(implanteResult.status).toBe('Saudável')
  })
})