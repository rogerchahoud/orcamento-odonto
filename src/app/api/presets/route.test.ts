import { describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST, DELETE } from './route'
import { listPresets, deletePreset, upsertPreset } from '@/lib/presets/repository'

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

function postRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/presets', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  })
}

describe('presets route handler', () => {
  beforeEach(() => {
    for (const preset of listPresets()) {
      deletePreset(preset.id)
    }
  })

  it('returns an empty list on GET', async () => {
    const res = await GET()

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ presets: [] })
  })

  it('returns the saved presets on GET', async () => {
    await POST(postRequest({ name: 'Clinica B', clinic, costs }))

    const res = await GET()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.presets).toHaveLength(1)
    expect(data.presets[0].name).toBe('Clinica B')
  })

  it('returns a full preset on GET by id', async () => {
    const preset = upsertPreset({ name: 'Clinica D', clinic, costs })
    const req = new NextRequest(`http://localhost/api/presets?id=${preset.id}`)

    const res = await GET(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.preset.id).toBe(preset.id)
    expect(data.preset.clinic).toEqual(clinic)
    expect(data.preset.costs).toEqual(costs)
  })

  it('returns 404 on GET by unknown id', async () => {
    const req = new NextRequest('http://localhost/api/presets?id=missing')

    const res = await GET(req)
    expect(res.status).toBe(404)
  })

  it('creates a preset with 201', async () => {
    const res = await POST(postRequest({ name: 'Clinica A', clinic, costs }))

    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.preset.name).toBe('Clinica A')
    expect(data.preset.clinic).toEqual(clinic)
    expect(data.preset.costs).toEqual(costs)
  })

  it('overwrites an existing preset with 200', async () => {
    await POST(postRequest({ name: 'Clinica A', clinic, costs }))
    const changedCosts = { values: { ...costs.values, aluguel: 9000 } }

    const res = await POST(postRequest({ name: 'Clinica A', clinic, costs: changedCosts }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.preset.costs.values.aluguel).toBe(9000)
    expect(listPresets()).toHaveLength(1)
  })

  it('rejects a blank name with 400', async () => {
    const res = await POST(postRequest({ name: '   ', clinic, costs }))

    expect(res.status).toBe(400)
  })

  it('deletes a preset with 204', async () => {
    const preset = upsertPreset({ name: 'Clinica C', clinic, costs })
    const req = new NextRequest(`http://localhost/api/presets?id=${preset.id}`, {
      method: 'DELETE',
    })

    const res = await DELETE(req)
    expect(res.status).toBe(204)
    expect(listPresets().some((p) => p.id === preset.id)).toBe(false)
  })

  it('rejects DELETE without id with 400 and an unknown id with 404', async () => {
    const noId = await DELETE(new NextRequest('http://localhost/api/presets', { method: 'DELETE' }))
    expect(noId.status).toBe(400)

    const notFound = await DELETE(
      new NextRequest('http://localhost/api/presets?id=missing', { method: 'DELETE' })
    )
    expect(notFound.status).toBe(404)
  })
})