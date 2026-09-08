'use client'

import type { ProcedureInput } from '@/lib/lucre/types'
import { parseNumberInput } from '@/lib/format'

interface StepProceduresProps {
  value: ProcedureInput[]
  onProceduresChange: (procedures: ProcedureInput[]) => void
}

let sequence = 0

function createEmptyRow(): ProcedureInput {
  sequence += 1
  return {
    id: `proc-${sequence}-${Date.now()}`,
    name: '',
    specialty: '',
    timeMin: 0,
    material: 0,
    lab: 0,
    implants: 0,
    other: 0,
  }
}

const NUMERIC_FIELDS = ['timeMin', 'material', 'lab', 'implants', 'other'] as const

export function StepProcedures({ value, onProceduresChange }: StepProceduresProps) {
  const emit = (rows: ProcedureInput[]) => onProceduresChange(rows)

  const addRow = () => onProceduresChange([...value, createEmptyRow()])

  const removeRow = (id: string) =>
    onProceduresChange(value.filter((row) => row.id !== id))

  const updateField = (id: string, patch: Partial<ProcedureInput>) =>
    emit(value.map((row) => (row.id === id ? { ...row, ...patch } : row)))

  const updateNumeric = (id: string, field: (typeof NUMERIC_FIELDS)[number], raw: string) =>
    updateField(id, { [field]: parseNumberInput(raw) ?? 0 })

  return (
    <div className="flex flex-col gap-4">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-left text-zinc-500">
            <th className="py-2 pr-2">Procedimento</th>
            <th className="py-2 pr-2">Especialidade</th>
            <th className="py-2 pr-2">Tempo (min)</th>
            <th className="py-2 pr-2">Material</th>
            <th className="py-2 pr-2">Laboratório</th>
            <th className="py-2 pr-2">Implantes</th>
            <th className="py-2 pr-2">Outros</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {value.map((row) => (
            <tr key={row.id} className="border-b border-zinc-100">
              <td className="py-2 pr-2">
                <input
                  aria-label="Procedimento"
                  value={row.name}
                  placeholder="Procedimento"
                  onChange={(event) => updateField(row.id, { name: event.target.value })}
                  className="w-full rounded border border-zinc-300 bg-white px-2 py-1 text-zinc-900"
                />
              </td>
              <td className="py-2 pr-2">
                <input
                  aria-label="Especialidade"
                  value={row.specialty}
                  placeholder="Especialidade"
                  onChange={(event) => updateField(row.id, { specialty: event.target.value })}
                  className="w-full rounded border border-zinc-300 bg-white px-2 py-1 text-zinc-900"
                />
              </td>
              <td className="py-2 pr-2">
                <input
                  aria-label="Tempo (min)"
                  inputMode="decimal"
                  value={row.timeMin}
                  onChange={(event) => updateNumeric(row.id, 'timeMin', event.target.value)}
                  className="w-20 rounded border border-zinc-300 bg-white px-2 py-1 text-right text-zinc-900"
                />
              </td>
              <td className="py-2 pr-2">
                <input
                  aria-label="Material"
                  inputMode="decimal"
                  value={row.material}
                  onChange={(event) => updateNumeric(row.id, 'material', event.target.value)}
                  className="w-20 rounded border border-zinc-300 bg-white px-2 py-1 text-right text-zinc-900"
                />
              </td>
              <td className="py-2 pr-2">
                <input
                  aria-label="Laboratório"
                  inputMode="decimal"
                  value={row.lab}
                  onChange={(event) => updateNumeric(row.id, 'lab', event.target.value)}
                  className="w-20 rounded border border-zinc-300 bg-white px-2 py-1 text-right text-zinc-900"
                />
              </td>
              <td className="py-2 pr-2">
                <input
                  aria-label="Implantes"
                  inputMode="decimal"
                  value={row.implants}
                  onChange={(event) => updateNumeric(row.id, 'implants', event.target.value)}
                  className="w-20 rounded border border-zinc-300 bg-white px-2 py-1 text-right text-zinc-900"
                />
              </td>
              <td className="py-2 pr-2">
                <input
                  aria-label="Outros"
                  inputMode="decimal"
                  value={row.other}
                  onChange={(event) => updateNumeric(row.id, 'other', event.target.value)}
                  className="w-20 rounded border border-zinc-300 bg-white px-2 py-1 text-right text-zinc-900"
                />
              </td>
              <td className="py-2">
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remover
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        type="button"
        onClick={addRow}
        className="self-start rounded border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50"
      >
        Adicionar procedimento
      </button>
    </div>
  )
}
