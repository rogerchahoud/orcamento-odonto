import { randomUUID } from 'node:crypto'
import { db } from '@/lib/db'

interface ClinicParams {
  hoursPerDay: number
  workingDays: number
  chairs: number
  cardFee: number
  tax: number
  commission: number
  targetMargin: number
}

interface FixedCosts {
  values: Record<string, number>
}

export interface PresetSummary {
  id: string
  name: string
  updatedAt: string
}

export interface Preset {
  id: string
  name: string
  clinic: ClinicParams
  costs: FixedCosts
  createdAt: string
  updatedAt: string
}

interface PresetRow {
  id: string
  name: string
  data: string
  created_at: string
  updated_at: string
}

export function listPresets(): PresetSummary[] {
  const rows = db
    .prepare('SELECT id, name, updated_at FROM presets ORDER BY name')
    .all() as Array<{ id: string; name: string; updated_at: string }>
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    updatedAt: row.updated_at,
  }))
}

export function upsertPreset(input: {
  name: string
  clinic: ClinicParams
  costs: FixedCosts
}): Preset {
  const now = new Date().toISOString()
  db.prepare(
    `INSERT INTO presets (id, name, data, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(name) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`
  ).run(
    randomUUID(),
    input.name,
    JSON.stringify({ clinic: input.clinic, costs: input.costs }),
    now,
    now
  )
  const row = db
    .prepare('SELECT id, name, data, created_at, updated_at FROM presets WHERE name = ?')
    .get(input.name) as PresetRow
  return mapRow(row)
}

export function deletePreset(id: string): boolean {
  const info = db.prepare('DELETE FROM presets WHERE id = ?').run(id)
  return info.changes > 0
}

function mapRow(row: PresetRow): Preset {
  const payload = JSON.parse(row.data) as { clinic: ClinicParams; costs: FixedCosts }
  return {
    id: row.id,
    name: row.name,
    clinic: payload.clinic,
    costs: payload.costs,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}