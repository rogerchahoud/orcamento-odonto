export type FixedCostCategory =
  | 'aluguel'
  | 'folha'
  | 'encargos'
  | 'energia'
  | 'agua'
  | 'internet'
  | 'contabilidade'
  | 'software'
  | 'marketing'
  | 'manutencao'
  | 'materialAdm'
  | 'limpeza'
  | 'financiamentos'
  | 'outros'

export const FIXED_COST_CATEGORIES: FixedCostCategory[] = [
  'aluguel',
  'folha',
  'encargos',
  'energia',
  'agua',
  'internet',
  'contabilidade',
  'software',
  'marketing',
  'manutencao',
  'materialAdm',
  'limpeza',
  'financiamentos',
  'outros',
]

export interface ClinicParams {
  hoursPerDay: number
  workingDays: number
  chairs: number
  cardFee: number
  tax: number
  commission: number
  targetMargin: number
}

export interface FixedCosts {
  values: Record<FixedCostCategory, number>
}

export interface ProcedureInput {
  id: string
  name: string
  specialty: string
  timeMin: number
  material: number
  lab: number
  implants: number
  other: number
}

export type MarginStatus = 'Saudável' | 'Em atenção' | 'Abaixo da meta'

export interface ProcedureResult {
  procedure: ProcedureInput
  allocatedFixedCost: number
  totalDirectCost: number
  minPrice: number
  recommendedPrice: number
  profit: number
  realMargin: number
  status: MarginStatus
}

export interface LucreOutput {
  capacityMinutes: number
  totalFixedCosts: number
  fixedCostPerMinute: number
  results: ProcedureResult[]
}

export interface ValidationError {
  field: string
  message: string
}

export type LucreRunResult =
  | { ok: true; output: LucreOutput }
  | { ok: false; errors: ValidationError[] }

export interface LucreInput {
  clinic: ClinicParams
  costs: FixedCosts
  procedures: ProcedureInput[]
}