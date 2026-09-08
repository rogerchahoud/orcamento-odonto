'use client'

import { useMemo, useState } from 'react'
import type { ClinicParams, FixedCosts, LucreInput, ProcedureInput } from '@/lib/lucre/types'
import { FIXED_COST_CATEGORIES } from '@/lib/lucre/types'
import { runLucre } from '@/lib/lucre/engine'
import { parseNumberInput } from '@/lib/format'
import { StepClinic, type ClinicStrings } from './StepClinic'
import { StepCosts, type CostStrings } from './StepCosts'
import { StepProcedures } from './StepProcedures'
import { ResultsTable } from './ResultsTable'
import { PresetManager } from './PresetManager'
import type { PresetSummary, Preset } from '@/lib/presets/repository'

const DEFAULT_CLINIC: ClinicStrings = {
  hoursPerDay: '10',
  workingDays: '22',
  chairs: '2',
  cardFee: '3,5',
  tax: '8',
  commission: '40',
  targetMargin: '30',
}

const DEFAULT_COSTS: CostStrings = Object.fromEntries(
  FIXED_COST_CATEGORIES.map((category) => [category, '0'])
) as CostStrings

function toNumber(raw: string): number {
  return parseNumberInput(raw) ?? -1
}

function clinicStringsToParams(clinic: ClinicStrings): ClinicParams {
  return {
    hoursPerDay: toNumber(clinic.hoursPerDay),
    workingDays: toNumber(clinic.workingDays),
    chairs: toNumber(clinic.chairs),
    cardFee: toNumber(clinic.cardFee) / 100,
    tax: toNumber(clinic.tax) / 100,
    commission: toNumber(clinic.commission) / 100,
    targetMargin: toNumber(clinic.targetMargin) / 100,
  }
}

function costStringsToFixed(clinic: CostStrings): FixedCosts {
  return {
    values: Object.fromEntries(FIXED_COST_CATEGORIES.map((c) => [c, toNumber(clinic[c])])),
  }
}

function paramsToClinicStrings(clinic: ClinicParams): ClinicStrings {
  return {
    hoursPerDay: String(clinic.hoursPerDay),
    workingDays: String(clinic.workingDays),
    chairs: String(clinic.chairs),
    cardFee: String(clinic.cardFee * 100),
    tax: String(clinic.tax * 100),
    commission: String(clinic.commission * 100),
    targetMargin: String(clinic.targetMargin * 100),
  }
}

function fixedToCostStrings(costs: FixedCosts): CostStrings {
  return Object.fromEntries(
    FIXED_COST_CATEGORIES.map((category) => [category, String(costs.values[category] ?? 0)])
  ) as CostStrings
}

interface LucreWizardProps {
  initialPresets: PresetSummary[]
}

const STEPS = ['Operação', 'Custos fixos', 'Procedimentos'] as const

export function LucreWizard({ initialPresets }: LucreWizardProps) {
  const [step, setStep] = useState(0)
  const [clinic, setClinic] = useState<ClinicStrings>(DEFAULT_CLINIC)
  const [costs, setCosts] = useState<CostStrings>(DEFAULT_COSTS)
  const [procedures, setProcedures] = useState<ProcedureInput[]>([])

  const input: LucreInput = useMemo(
    () => ({
      clinic: clinicStringsToParams(clinic),
      costs: costStringsToFixed(costs),
      procedures,
    }),
    [clinic, costs, procedures]
  )

  const result = useMemo(() => runLucre(input), [input])

  const applyPreset = (preset: Preset) => {
    setClinic(paramsToClinicStrings(preset.clinic))
    setCosts(fixedToCostStrings(preset.costs))
    setStep(0)
  }

  const clinicParams = clinicStringsToParams(clinic)

  return (
    <div className="flex flex-col gap-6">
      <PresetManager
        initialPresets={initialPresets}
        clinic={clinicParams}
        costs={costStringsToFixed(costs)}
        onLoad={applyPreset}
      />
      <div className="flex gap-2">
        {STEPS.map((label, index) => (
          <span
            key={label}
            className={`text-sm ${index === step ? 'font-semibold text-zinc-900' : 'text-zinc-400'}`}
          >
            {index + 1}. {label}
          </span>
        ))}
      </div>

      {!result.ok && result.errors.length > 0 ? (
        <div className="rounded border border-red-200 bg-red-50 p-3">
          <ul className="list-disc pl-5 text-sm text-red-700">
            {uniqueMessages(result.errors).map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {step === 0 ? (
        <StepClinic value={clinic} onChange={setClinic} errors={result.ok ? [] : result.errors} />
      ) : null}
      {step === 1 ? (
        <StepCosts
          value={costs}
          onChange={setCosts}
          capacityMinutes={result.ok ? result.output.capacityMinutes : 0}
          errors={result.ok ? [] : result.errors}
        />
      ) : null}
      {step === 2 ? (
        <div className="flex flex-col gap-6">
          <StepProcedures value={procedures} onProceduresChange={setProcedures} />
          {result.ok && result.output.results.length > 0 ? (
            <ResultsTable results={result.output.results} />
          ) : null}
        </div>
      ) : null}

      <div className="flex gap-2">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="rounded border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50"
          >
            Voltar
          </button>
        ) : null}
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="rounded bg-zinc-800 px-4 py-2 text-sm text-white hover:bg-zinc-700"
          >
            Próximo
          </button>
        ) : null}
      </div>
    </div>
  )
}

function uniqueMessages(errors: { message: string }[]): string[] {
  return [...new Set(errors.map((error) => error.message))]
}
