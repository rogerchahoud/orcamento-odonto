import {
  FIXED_COST_CATEGORIES,
  type LucreInput,
  type ProcedureInput,
  type ValidationError,
} from './types'

export function isInvalidNumber(value: number): boolean {
  return !Number.isFinite(value) || value < 0
}

export function isBlankNumber(value: number): boolean {
  return !Number.isFinite(value) || value === 0
}

export function isEmptyProcedureRow(proc: ProcedureInput): boolean {
  const nameEmpty = proc.name.trim() === ''
  const numericsBlank =
    isBlankNumber(proc.timeMin) &&
    isBlankNumber(proc.material) &&
    isBlankNumber(proc.lab) &&
    isBlankNumber(proc.implants) &&
    isBlankNumber(proc.other)
  return nameEmpty || numericsBlank
}

export function filterEmptyProcedureRows(procedures: ProcedureInput[]): ProcedureInput[] {
  return procedures.filter((proc) => !isEmptyProcedureRow(proc))
}

export function validatePresetName(name: string): ValidationError | null {
  if (typeof name !== 'string' || name.trim() === '') {
    return { field: 'name', message: 'Informe um nome para o preset.' }
  }
  return null
}

export function validateLucreInput(input: LucreInput): ValidationError[] {
  const errors: ValidationError[] = []
  const { clinic, costs } = input

  if (clinic.hoursPerDay === 0) {
    errors.push({
      field: 'hoursPerDay',
      message: 'Informe as horas por dia para calcular a capacidade.',
    })
  }
  if (clinic.workingDays === 0) {
    errors.push({
      field: 'workingDays',
      message: 'Informe os dias úteis para calcular a capacidade.',
    })
  }

  const discountSum = clinic.cardFee + clinic.tax + clinic.commission + clinic.targetMargin
  if (discountSum >= 1) {
    const message = 'A soma das taxas e da margem deve ser menor que 1.'
    errors.push(
      { field: 'cardFee', message },
      { field: 'tax', message },
      { field: 'commission', message },
      { field: 'targetMargin', message }
    )
  }

  const clinicFields = [
    'hoursPerDay',
    'workingDays',
    'chairs',
    'cardFee',
    'tax',
    'commission',
    'targetMargin',
  ] as const
  for (const field of clinicFields) {
    if (isInvalidNumber(clinic[field])) {
      errors.push({ field, message: 'Informe um valor numérico válido.' })
    }
  }

  for (const category of FIXED_COST_CATEGORIES) {
    if (isInvalidNumber(costs.values[category])) {
      errors.push({ field: category, message: 'Informe um valor numérico válido.' })
    }
  }

  const procedureFields = ['timeMin', 'material', 'lab', 'implants', 'other'] as const
  for (const proc of input.procedures) {
    if (isEmptyProcedureRow(proc)) {
      continue
    }
    for (const field of procedureFields) {
      if (isInvalidNumber(proc[field])) {
        errors.push({ field, message: 'Informe um valor numérico válido.' })
      }
    }
  }

  return errors
}