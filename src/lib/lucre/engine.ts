import {
  FIXED_COST_CATEGORIES,
  type ClinicParams,
  type FixedCosts,
  type LucreInput,
  type LucreOutput,
  type LucreRunResult,
  type MarginStatus,
  type ProcedureInput,
  type ProcedureResult,
} from './types'
import { validateLucreInput, filterEmptyProcedureRows } from './validate'

export function computeCapacity(clinic: ClinicParams): number {
  return clinic.hoursPerDay * 60 * clinic.workingDays * clinic.chairs
}

export function computeTotalFixedCosts(costs: FixedCosts): number {
  return FIXED_COST_CATEGORIES.reduce((sum, category) => sum + costs.values[category], 0)
}

export function computeFixedCostPerMinute(costs: FixedCosts, capacityMinutes: number): number {
  return computeTotalFixedCosts(costs) / capacityMinutes
}

export function computeAllocatedFixedCost(timeMin: number, fixedCostPerMinute: number): number {
  return timeMin * fixedCostPerMinute
}

export function computeTotalDirectCost(
  proc: ProcedureInput,
  allocatedFixedCost: number
): number {
  return allocatedFixedCost + proc.material + proc.lab + proc.implants + proc.other
}

export function computeMinPrice(totalDirectCost: number, discountSum: number): number {
  return totalDirectCost / (1 - discountSum)
}

export function computeRecommendedPrice(
  totalDirectCost: number,
  discountSumPlusMargin: number
): number {
  return totalDirectCost / (1 - discountSumPlusMargin)
}

export function computeProfit(recommendedPrice: number, targetMargin: number): number {
  return recommendedPrice * targetMargin
}

export function computeRealMargin(profit: number, recommendedPrice: number): number {
  return profit / recommendedPrice
}

export function computeStatus(
  realMargin: number,
  targetMargin: number,
  profit: number
): MarginStatus {
  if (realMargin >= targetMargin) {
    return 'Saudável'
  }
  if (profit > 0) {
    return 'Em atenção'
  }
  return 'Abaixo da meta'
}

export function runLucre(input: LucreInput): LucreRunResult {
  const errors = validateLucreInput(input)
  if (errors.length > 0) {
    return { ok: false, errors }
  }

  const capacityMinutes = computeCapacity(input.clinic)
  const totalFixedCosts = computeTotalFixedCosts(input.costs)
  const fixedCostPerMinute = computeFixedCostPerMinute(input.costs, capacityMinutes)
  const discountSum = input.clinic.cardFee + input.clinic.tax + input.clinic.commission
  const discountSumPlusMargin = discountSum + input.clinic.targetMargin

  const results: ProcedureResult[] = filterEmptyProcedureRows(input.procedures).map((proc) => {
    const allocatedFixedCost = computeAllocatedFixedCost(proc.timeMin, fixedCostPerMinute)
    const totalDirectCost = computeTotalDirectCost(proc, allocatedFixedCost)
    const minPrice = computeMinPrice(totalDirectCost, discountSum)
    const recommendedPrice = computeRecommendedPrice(totalDirectCost, discountSumPlusMargin)
    const profit = computeProfit(recommendedPrice, input.clinic.targetMargin)
    const realMargin = computeRealMargin(profit, recommendedPrice)
    return {
      procedure: proc,
      allocatedFixedCost,
      totalDirectCost,
      minPrice,
      recommendedPrice,
      profit,
      realMargin,
      status: computeStatus(realMargin, input.clinic.targetMargin, profit),
    }
  })

  const output: LucreOutput = {
    capacityMinutes,
    totalFixedCosts,
    fixedCostPerMinute,
    results,
  }
  return { ok: true, output }
}