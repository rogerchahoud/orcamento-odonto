export function formatBRL(value: number): string {
  const formatted = value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `R$ ${formatted}`
}

export function formatPercent(value: number): string {
  const formatted = (value * 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
  return `${formatted}%`
}

export function parseNumberInput(raw: string): number | null {
  const trimmed = raw.trim()
  if (trimmed === '') {
    return null
  }
  let normalized = trimmed
  if (normalized.includes(',')) {
    normalized = normalized.replace(/\./g, '').replace(',', '.')
  }
  const value = Number(normalized)
  if (Number.isNaN(value) || value < 0) {
    return null
  }
  return value
}