'use client'

import { useState } from 'react'
import type { ClinicParams, FixedCosts, ValidationError } from '@/lib/lucre/types'
import type { PresetSummary, Preset } from '@/lib/presets/repository'

interface PresetManagerProps {
  initialPresets: PresetSummary[]
  clinic: ClinicParams
  costs: FixedCosts
  onLoad: (preset: Preset) => void
}

const BLANK_NAME_MESSAGE = 'Informe um nome para o preset.'

export function PresetManager({ initialPresets, clinic, costs, onLoad }: PresetManagerProps) {
  const [presets, setPresets] = useState<PresetSummary[]>(initialPresets)
  const [name, setName] = useState('')
  const [error, setError] = useState<ValidationError | null>(null)

  const refresh = async () => {
    const res = await fetch('/api/presets')
    const data = (await res.json()) as { presets: PresetSummary[] }
    setPresets(data.presets)
  }

  const save = async () => {
    if (name.trim() === '') {
      setError({ field: 'name', message: BLANK_NAME_MESSAGE })
      return
    }
    setError(null)
    const res = await fetch('/api/presets', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, clinic, costs }),
    })
    if (res.ok) {
      setName('')
      await refresh()
    }
  }

  const load = async (summary: PresetSummary) => {
    const res = await fetch(`/api/presets?id=${summary.id}`)
    const data = (await res.json()) as { preset: Preset }
    onLoad(data.preset)
  }

  const remove = async (id: string) => {
    await fetch(`/api/presets?id=${id}`, { method: 'DELETE' })
    await refresh()
  }

  return (
    <div className="flex flex-col gap-3 rounded border border-zinc-200 p-4">
      <h2 className="text-sm font-semibold text-zinc-700">Presets da clínica</h2>
      <div className="flex gap-2">
        <input
          aria-label="Nome do preset"
          value={name}
          placeholder="Nome do preset"
          onChange={(event) => setName(event.target.value)}
          className="rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
        />
        <button
          type="button"
          onClick={save}
          className="rounded bg-zinc-800 px-3 py-2 text-sm text-white hover:bg-zinc-700"
        >
          Salvar
        </button>
      </div>
      {error ? <span className="text-xs text-red-600">{error.message}</span> : null}
      <ul className="flex flex-col gap-1">
        {presets.map((preset) => (
          <li key={preset.id} className="flex items-center justify-between gap-2">
            <span className="text-sm">{preset.name}</span>
            <span className="flex gap-2">
              <button
                type="button"
                onClick={() => load(preset)}
                className="text-xs text-blue-600 hover:underline"
              >
                Carregar
              </button>
              <button
                type="button"
                onClick={() => remove(preset.id)}
                className="text-xs text-red-600 hover:underline"
              >
                Excluir
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
