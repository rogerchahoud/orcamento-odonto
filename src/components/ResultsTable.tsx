'use client'

import type { ProcedureResult } from '@/lib/lucre/types'
import { formatBRL, formatPercent } from '@/lib/format'

interface ResultsTableProps {
  results: ProcedureResult[]
}

export function ResultsTable({ results }: ResultsTableProps) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-zinc-200 text-left text-zinc-500">
          <th className="py-2 pr-2">Procedimento</th>
          <th className="py-2 pr-2">Especialidade</th>
          <th className="py-2 pr-2">Preço mínimo</th>
          <th className="py-2 pr-2">Preço recomendado</th>
          <th className="py-2 pr-2">Lucro</th>
          <th className="py-2 pr-2">Margem real</th>
          <th className="py-2">Status</th>
        </tr>
      </thead>
      <tbody>
        {results.map((result) => (
          <tr key={result.procedure.id} className="border-b border-zinc-100">
            <td className="py-2 pr-2">{result.procedure.name}</td>
            <td className="py-2 pr-2">{result.procedure.specialty}</td>
            <td className="py-2 pr-2">{formatBRL(result.minPrice)}</td>
            <td className="py-2 pr-2">{formatBRL(result.recommendedPrice)}</td>
            <td className="py-2 pr-2">{formatBRL(result.profit)}</td>
            <td className="py-2 pr-2">{formatPercent(result.realMargin)}</td>
            <td className="py-2">
              <span
                className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                  result.status === 'Saudável'
                    ? 'bg-green-100 text-green-800'
                    : result.status === 'Em atenção'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                }`}
              >
                {result.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
