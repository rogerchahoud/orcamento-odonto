import postgres from 'postgres'

export const sql = postgres(process.env.DATABASE_URL ?? 'postgres://localhost:5432/lucre', {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

let schemaReady: Promise<void> | null = null

export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = migratePresets()
  }
  return schemaReady
}

async function migratePresets(): Promise<void> {
  // Legado (antes do login): a tabela não tinha a coluna `user_id`. Nesse caso
  // descarta os presets antigos (globais) e recria com escopo por usuário.
  const columns = (await sql`
    SELECT column_name AS name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'presets'
  `) as unknown as { name: string }[]

  if (columns.length > 0 && !columns.some((column) => column.name === 'user_id')) {
    await sql`DROP TABLE presets`
  }

  await sql`
    CREATE TABLE IF NOT EXISTS presets (
      id         TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL,
      name       TEXT NOT NULL,
      data       TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE (user_id, name)
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS presets_user_id_idx ON presets (user_id)`
}
