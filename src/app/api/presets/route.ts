import { NextRequest, NextResponse } from 'next/server'
import { listPresets, upsertPreset, deletePreset } from '@/lib/presets/repository'
import { validatePresetName } from '@/lib/lucre/validate'

interface PresetBody {
  name: string
  clinic: {
    hoursPerDay: number
    workingDays: number
    chairs: number
    cardFee: number
    tax: number
    commission: number
    targetMargin: number
  }
  costs: {
    values: Record<string, number>
  }
}

const CLINIC_NUMBER_FIELDS = [
  'hoursPerDay',
  'workingDays',
  'chairs',
  'cardFee',
  'tax',
  'commission',
  'targetMargin',
] as const

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ presets: listPresets() })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await readBody(request)
  if (!body) {
    return NextResponse.json({ error: 'Corpo inválido.' }, { status: 400 })
  }
  const nameError = validatePresetName(body.name)
  if (nameError) {
    return NextResponse.json({ error: nameError.message }, { status: 400 })
  }
  const exists = listPresets().some((preset) => preset.name === body.name)
  const preset = upsertPreset({
    name: body.name,
    clinic: body.clinic,
    costs: body.costs,
  })
  return NextResponse.json({ preset }, { status: exists ? 200 : 201 })
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const id = request.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Informe o id.' }, { status: 400 })
  }
  if (!deletePreset(id)) {
    return NextResponse.json({ error: 'Preset não encontrado.' }, { status: 404 })
  }
  return new NextResponse(null, { status: 204 })
}

async function readBody(request: NextRequest): Promise<PresetBody | null> {
  let parsed: unknown
  try {
    parsed = await request.json()
  } catch {
    return null
  }
  if (typeof parsed !== 'object' || parsed === null) {
    return null
  }
  const record = parsed as Record<string, unknown>

  if (typeof record.name !== 'string') {
    return null
  }

  const clinic = record.clinic
  if (typeof clinic !== 'object' || clinic === null) {
    return null
  }
  const clinicRecord = clinic as Record<string, unknown>
  for (const field of CLINIC_NUMBER_FIELDS) {
    if (typeof clinicRecord[field] !== 'number') {
      return null
    }
  }

  const costs = record.costs
  if (typeof costs !== 'object' || costs === null) {
    return null
  }
  const costsRecord = costs as Record<string, unknown>
  const values = costsRecord.values
  if (typeof values !== 'object' || values === null) {
    return null
  }
  for (const value of Object.values(values)) {
    if (typeof value !== 'number') {
      return null
    }
  }

  return {
    name: record.name,
    clinic: clinicRecord as unknown as PresetBody['clinic'],
    costs: { values: values as Record<string, number> },
  }
}