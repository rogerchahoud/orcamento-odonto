import { describe, it, expect } from 'vitest'
import { formatBRL, formatPercent, parseNumberInput } from './format'

describe('formatBRL', () => {
  it('formats currency with thousands separator and comma decimals', () => {
    expect(formatBRL(1234.56)).toBe('R$ 1.234,56')
  })

  it('rounds to 2 decimals as the LUCRE-18 display values', () => {
    expect(formatBRL(2674.4142455482665)).toBe('R$ 2.674,41')
    expect(formatBRL(7011.302211302213)).toBe('R$ 7.011,30')
  })
})

describe('formatPercent', () => {
  it('formats a ratio as pt-BR percent with 1 decimal', () => {
    expect(formatPercent(0.3)).toBe('30,0%')
    expect(formatPercent(0.035)).toBe('3,5%')
  })
})

describe('parseNumberInput', () => {
  it('parses comma as decimal separator and dots as thousands', () => {
    expect(parseNumberInput('1.234,56')).toBe(1234.56)
    expect(parseNumberInput('1,5')).toBe(1.5)
  })

  it('parses dot as decimal separator when no comma is present', () => {
    expect(parseNumberInput('1234.56')).toBe(1234.56)
    expect(parseNumberInput('10')).toBe(10)
  })

  it('returns null for blank, invalid and negative input', () => {
    expect(parseNumberInput('')).toBeNull()
    expect(parseNumberInput('   ')).toBeNull()
    expect(parseNumberInput('abc')).toBeNull()
    expect(parseNumberInput('-5')).toBeNull()
  })
})