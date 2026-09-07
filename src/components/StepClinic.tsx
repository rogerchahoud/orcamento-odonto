'use client'

import type { ClinicParams, ValidationError } from '@/lib/lucre/types'
import { computeCapacity } from '@/lib/lucre/engine'
import { parseNumberInput } from '@/lib/format'
import { NumberInput } from './ui/NumberInput'

export type ClinicField = keyof ClinicParams
export type ClinicStrings = Record<ClinicField, string>

interface StepClinicProps {
  value: ClinicStrings
  onChange: (next: ClinicStrings) => void
  errors: ValidationError[]
}

function toNumber(raw: string): number {
  return parseNumberInput(raw) ?? -1
}

export function StepClinic({ value, onChange, errors }: StepClinicProps) {
  const errorFor = (field: ClinicField) =>
    errors.find((error) => error.field === field)?.message

  const clinic: ClinicParams = {
    hoursPerDay: toNumber(value.hoursPerDay),
    workingDays: toNumber(value.workingDays),
    chairs: toNumber(value.chairs),
    cardFee: toNumber(value.cardFee) / 100,
    tax: toNumber(value.tax) / 100,
    commission: toNumber(value.commission) / 100,
    targetMargin: toNumber(value.targetMargin) / 100,
  }
  const capacityMinutes = computeCapacity(clinic)

  const update = (field: ClinicField, raw: string) =>
    onChange({ ...value, [field]: raw })

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-zinc-500">
        Capacidade mensal:{' '}
        <span className="font-semibold text-zinc-800">
          {capacityMinutes.toLocaleString('pt-BR')} minutos
        </span>
      </p>
      <NumberInput
        label="Horas por dia"
        value={value.hoursPerDay}
        onChange={(parsed) => update('hoursPerDay', parsed === null ? '' : String(parsed))}
        error={errorFor('hoursPerDay')}
      />
      <NumberInput
        label="Dias úteis"
        value={value.workingDays}
        onChange={(parsed) => update('workingDays', parsed === null ? '' : String(parsed))}
        error={errorFor('workingDays')}
      />
      <NumberInput
        label="Cadeiras"
        value={value.chairs}
        onChange={(parsed) => update('chairs', parsed === null ? '' : String(parsed))}
        error={errorFor('chairs')}
      />
      <NumberInput
        label="Taxa cartão"
        value={value.cardFee}
        onChange={(parsed) => update('cardFee', parsed === null ? '' : String(parsed))}
        error={errorFor('cardFee')}
      />
      <NumberInput
        label="Imposto"
        value={value.tax}
        onChange={(parsed) => update('tax', parsed === null ? '' : String(parsed))}
        error={errorFor('tax')}
      />
      <NumberInput
        label="Comissão"
        value={value.commission}
        onChange={(parsed) => update('commission', parsed === null ? '' : String(parsed))}
        error={errorFor('commission')}
      />
      <NumberInput
        label="Margem alvo"
        value={value.targetMargin}
        onChange={(parsed) => update('targetMargin', parsed === null ? '' : String(parsed))}
        error={errorFor('targetMargin')}
      />
    </div>
  )
}
