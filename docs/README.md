# Documentação — Calculadora L.U.C.R.E.

Documentação do domínio de precificação da **Calculadora L.U.C.R.E.**, clonagem da
[Calculadora L.U.C.R.E.](https://calculadora.drjacquessouza.me/calculadora).

## Índice

| Documento | O que explica |
|-----------|---------------|
| [Visão geral do cálculo](calculo/visao-geral.md) | A cadeia completa da matemática L.U.C.R.E., passo a passo. |
| [Preço mínimo](calculo/preco-minimo.md) | O preço de equilíbrio (break-even) — sem lucro. |
| [Preço recomendado](calculo/preco-recomendado.md) | O preço com a margem alvo embutida. |
| [Cálculo do lucro](calculo/lucro.md) | Como o lucro é calculado, mais margem real e status. |

## Onde está o código

A implementação vive em `src/lib/lucre/`:

- `engine.ts` — funções puras do cálculo (capacidade, rateio de custo fixo,
  preços, lucro, margem e status).
- `types.ts` — tipos de entrada/saída e categorias de custo fixo.
- `validate.ts` — validação das entradas.

A referência de domínio resumida também está em [`AGENTS.md`](../AGENTS.md),
que foi verificada contra o `calculadora-lucre.xlsx`.
