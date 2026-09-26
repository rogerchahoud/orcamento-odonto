import postgres from 'postgres'

export const sql = postgres(process.env.DATABASE_URL ?? 'postgres://localhost:5432/lucre', {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

let schemaReady: Promise<void> | null = null

export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = sql`
      CREATE TABLE IF NOT EXISTS presets (
        id         TEXT PRIMARY KEY,
        name       TEXT NOT NULL UNIQUE,
        data       TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `.then(() => undefined)
  }
  return schemaReady
}