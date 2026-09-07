'use client'

import { parseNumberInput } from '@/lib/format'

interface NumberInputProps {
  label: string
  value: string
  onChange: (parsed: number | null) => void
  error?: string
  placeholder?: string
}

export function NumberInput({ label, value, onChange, error, placeholder }: NumberInputProps) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-zinc-700">{label}</span>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        placeholder={placeholder}
        aria-label={label}
        onChange={(event) => onChange(parseNumberInput(event.target.value))}
        className="rounded border border-zinc-300 px-3 py-2 text-sm"
      />
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  )
}
