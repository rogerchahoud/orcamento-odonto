import { randomUUID } from 'node:crypto'
import { sql, ensureSchema } from '@/lib/db'

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

const FULL_COLUMNS = `
  id, name, data,
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`

export async function listPresets(userId: string): Promise<PresetSummary[]> {
  await ensureSchema()
  const rows = await sql`
    SELECT id, name, updated_at AS "updatedAt"
    FROM presets
    WHERE user_id = ${userId}
    ORDER BY name
  `
  return rows.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    updatedAt: row.updatedAt as string,
  }))
}

export async function upsertPreset(
  userId: string,
  input: {
    name: string
    clinic: ClinicParams
    costs: FixedCosts
  }
): Promise<Preset> {
  await ensureSchema()
  const now = new Date().toISOString()
  const rows = await sql`
    INSERT INTO presets (id, user_id, name, data, created_at, updated_at)
    VALUES (
      ${randomUUID()},
      ${userId},
      ${input.name},
      ${JSON.stringify({ clinic: input.clinic, costs: input.costs })},
      ${now},
      ${now}
    )
    ON CONFLICT (user_id, name) DO UPDATE
      SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at
    RETURNING ${sql.unsafe(FULL_COLUMNS)}
  `
  return mapRow(rows[0])
}

export async function getPreset(userId: string, id: string): Promise<Preset | null> {
  await ensureSchema()
  const rows = await sql`
    SELECT ${sql.unsafe(FULL_COLUMNS)}
    FROM presets
    WHERE id = ${id} AND user_id = ${userId}
  `
  const row = rows[0]
  return row ? mapRow(row) : null
}

export async function deletePreset(userId: string, id: string): Promise<boolean> {
  await ensureSchema()
  const result = await sql`DELETE FROM presets WHERE id = ${id} AND user_id = ${userId}`
  return result.count > 0
}

function mapRow(row: Record<string, unknown>): Preset {
  const payload = JSON.parse(String(row.data)) as { clinic: ClinicParams; costs: FixedCosts }
  return {
    id: String(row.id),
    name: String(row.name),
    clinic: payload.clinic,
    costs: payload.costs,
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
  }
}
