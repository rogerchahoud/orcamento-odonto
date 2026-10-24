# Cálculo do lucro

O **lucro** é a margem alvo aplicada sobre o preço recomendado.

## Fórmula

```
lucro = preço recomendado × margem alvo
```

Ou seja, se a margem alvo é 30%, o lucro é 30% do preço recomendado.

## De onde vem o preço recomendado

É uma fórmula de *mark-up* "por dentro":

```
preço recomendado = custo direto total ÷ (1 − cartão − imposto − comissão − margem alvo)
```

E o **custo direto total** é:

```
custo direto = custo fixo alocado + material + laboratório + implantes + outros
```

onde o **custo fixo alocado** rateia o custo fixo mensal pelo tempo:

```
capacidade mensal (min) = horas/dia × 60 × dias úteis × cadeiras
custo fixo por minuto   = Σ custos fixos mensais ÷ capacidade mensal
custo fixo alocado      = tempo (min) × custo fixo por minuto
```

## Exemplo numérico

- 10 h/dia × 60 × 22 dias × 2 cadeiras → **26.400 min**.
- Custos fixos de **R$ 26.400/mês** → **R$ 1,00/min**.
- Procedimento de **90 min**, material **R$ 100**, sem lab/implantes/outros.

| Passo | Cálculo | Valor |
|-------|---------|-------|
| Custo fixo alocado | 90 × R$ 1,00 | R$ 90,00 |
| Custo direto total | 90 + 100 | R$ 190,00 |
| Descontos | 3,5% + 8% + 40% | 51,5% |
| Preço mínimo | 190 ÷ 0,485 | R$ 391,75 |
| Preço recomendado | 190 ÷ 0,185 | R$ 1.027,03 |
| **Lucro** | **1.027,03 × 0,30** | **R$ 308,11** |

## Margem real e status

O código também calcula:

```
margem real = lucro ÷ preço recomendado
status = Saudável / Em atenção / Abaixo da meta
```

A classificação (em `engine.ts`):

| Condição | Status |
|----------|--------|
| margem real ≥ margem alvo | `Saudável` |
| lucro > 0 (mas margem abaixo da meta) | `Em atenção` |
| lucro ≤ 0 | `Abaixo da meta` |

> **Nuance do código atual:** como o único preço exibido **é** o recomendado, a
> `margem real` sempre iguala a margem alvo e o status fica sempre `Saudável`.
> Essa lógica de comparação parece preparada para um cenário futuro em que se
> informe também um **preço de venda real** — aí sim daria para ver se a margem
> praticada está acima ou abaixo da meta.
