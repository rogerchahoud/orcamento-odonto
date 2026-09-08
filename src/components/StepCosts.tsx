'use client'

import { FIXED_COST_CATEGORIES, type FixedCostCategory, type ValidationError } from '@/lib/lucre/types'
import { computeTotalFixedCosts, computeFixedCostPerMinute } from '@/lib/lucre/engine'
import { formatBRL, parseNumberInput } from '@/lib/format'
import { NumberInput } from './ui/NumberInput'
import type { FixedCosts } from '@/lib/lucre/types'

export const COST_LABELS: Record<FixedCostCategory, string> = {
  aluguel: 'Aluguel',
  folha: 'Folha',
  encargos: 'Encargos',
  energia: 'Energia',
  agua: 'Água',
  internet: 'Internet',
  contabilidade: 'Contabilidade',
  software: 'Software',
  marketing: 'Marketing',
  manutencao: 'Manutenção',
  materialAdm: 'Material administrativo',
  limpeza: 'Limpeza',
  financiamentos: 'Financiamentos',
  outros: 'Outros',
}

export type CostStrings = Record<FixedCostCategory, string>

interface StepCostsProps {
  value: CostStrings
  onChange: (next: CostStrings) => void
  capacityMinutes: number
  errors: ValidationError[]
}

function toNumber(raw: string): number {
  return parseNumberInput(raw) ?? -1
}

export function StepCosts({ value, onChange, capacityMinutes, errors }: StepCostsProps) {
  const costs: FixedCosts = {
    values: Object.fromEntries(
      FIXED_COST_CATEGORIES.map((c) => [c, toNumber(value[c])])
    ) as Record<FixedCostCategory, number>,
  }
  const total = computeTotalFixedCosts(costs)
  const perMinute = computeFixedCostPerMinute(costs, capacityMinutes)

  const update = (category: FixedCostCategory, raw: string) =>
    onChange({ ...value, [category]: raw })

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-zinc-500">
        Total de custos fixos:{' '}
        <span className="font-semibold text-zinc-800">{formatBRL(total)}</span>
        <span className="mx-2 text-zinc-300">|</span>
        Custo fixo por minuto:{' '}
        <span className="font-semibold text-zinc-800">{formatBRL(perMinute)}</span>
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FIXED_COST_CATEGORIES.map((category) => (
          <NumberInput
            key={category}
            label={COST_LABELS[category]}
            value={value[category]}
            onChange={(parsed) => update(category, parsed === null ? '' : String(parsed))}
            error={errors.find((error) => error.field === category)?.message}
          />
        ))}
      </div>
    </div>
  )
}