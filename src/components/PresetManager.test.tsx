import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PresetManager } from './PresetManager'
import type { PresetSummary, Preset } from '@/lib/presets/repository'

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

const summary: PresetSummary = {
  id: 'p1',
  name: 'Clinica A',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const fullPreset: Preset = {
  id: 'p1',
  name: 'Clinica A',
  clinic,
  costs,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

describe('PresetManager', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the preset list by name', () => {
    render(
      <PresetManager
        initialPresets={[summary]}
        clinic={clinic}
        costs={costs}
        onLoad={vi.fn()}
      />
    )
    expect(screen.getByText('Clinica A')).toBeInTheDocument()
    expect(screen.getByText('Carregar')).toBeInTheDocument()
    expect(screen.getByText('Excluir')).toBeInTheDocument()
  })

  it('calls POST with the clinic and costs when saving a named preset', async () => {
    const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === 'POST') {
        return Promise.resolve(jsonResponse({ preset: fullPreset }, 201))
      }
      return Promise.resolve(jsonResponse({ presets: [summary] }))
    })
    vi.stubGlobal('fetch', fetchMock)

    render(
      <PresetManager initialPresets={[]} clinic={clinic} costs={costs} onLoad={vi.fn()} />
    )
    fireEvent.change(screen.getByLabelText('Nome do preset'), {
      target: { value: 'Clinica A' },
    })
    fireEvent.click(screen.getByText('Salvar'))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/presets',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'Clinica A', clinic, costs }),
        })
      )
    })
  })

  it('applies the preset to the wizard when Carregar is clicked', async () => {
    const onLoad = vi.fn()
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      if (String(input).includes('?id=')) {
        return Promise.resolve(jsonResponse({ preset: fullPreset }))
      }
      return Promise.resolve(jsonResponse({ presets: [summary] }))
    })
    vi.stubGlobal('fetch', fetchMock)

    render(
      <PresetManager initialPresets={[summary]} clinic={clinic} costs={costs} onLoad={onLoad} />
    )
    fireEvent.click(screen.getByText('Carregar'))

    await waitFor(() => {
      expect(onLoad).toHaveBeenCalledWith(fullPreset)
    })
  })

  it('calls DELETE for the preset id when Excluir is clicked', async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === 'DELETE') {
        return Promise.resolve(new Response(null, { status: 204 }))
      }
      return Promise.resolve(jsonResponse({ presets: [] }))
    })
    vi.stubGlobal('fetch', fetchMock)

    render(
      <PresetManager initialPresets={[summary]} clinic={clinic} costs={costs} onLoad={vi.fn()} />
    )
    fireEvent.click(screen.getByText('Excluir'))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/presets?id=p1', {
        method: 'DELETE',
      })
    })
  })

  it('blocks saving with a blank name', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    render(
      <PresetManager initialPresets={[]} clinic={clinic} costs={costs} onLoad={vi.fn()} />
    )
    fireEvent.click(screen.getByText('Salvar'))

    expect(screen.getByText('Informe um nome para o preset.')).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
