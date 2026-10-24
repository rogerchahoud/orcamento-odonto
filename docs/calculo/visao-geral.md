# Visão geral do cálculo

A matemática L.U.C.R.E. transforma os dados da clínica (custos fixos, capacidade
e percentuais) em três saídas por procedimento: **preço mínimo**, **preço
recomendado** e **status de margem**.

## Cadeia de cálculo

1. **Capacidade mensal (minutos)**

   ```
   capacidade = horas/dia × 60 × dias úteis × cadeiras
   ```

2. **Custo fixo por minuto**

   ```
   custo fixo por minuto = Σ custos fixos mensais ÷ capacidade
   ```

3. **Custo fixo alocado ao procedimento**

   ```
   custo fixo alocado = tempo (min) × custo fixo por minuto
   ```

4. **Custo direto total**

   ```
   custo direto = custo fixo alocado + material + laboratório + implantes + outros
   ```

5. **Preço mínimo** (sem lucro)

   ```
   preço mínimo = custo direto ÷ (1 − cartão − imposto − comissão)
   ```

6. **Preço recomendado** (com margem alvo)

   ```
   preço recomendado = custo direto ÷ (1 − cartão − imposto − comissão − margem alvo)
   ```

7. **Lucro**

   ```
   lucro = preço recomendado × margem alvo
   ```

8. **Margem real e status**

   ```
   margem real = lucro ÷ preço recomendado
   status      = comparação da margem real com a margem alvo
   ```

## Nota sobre percentuais

Na interface os percentuais são digitados como números comuns (`3,5`, `8`, `40`,
`30`) e **divididos por 100** antes de chegar ao cálculo — ou seja, a engine
trabalha com frações (`0,035`, `0,08`, `0,40`, `0,30`). Essa conversão está em
`src/components/StepClinic.tsx` e `src/components/LucreWizard.tsx`.

## Exemplo usado nos demais documentos

- 10 h/dia × 60 × 22 dias × 2 cadeiras → **26.400 min** de capacidade.
- Custos fixos de **R$ 26.400/mês** → **R$ 1,00/min**.
- Procedimento de **90 min**, material **R$ 100**, sem lab/implantes/outros.
- Cartão 3,5% + imposto 8% + comissão 40% → descontos de **51,5%**.
- Margem alvo **30%**.

| Passo | Valor |
|-------|-------|
| Custo fixo alocado | R$ 90,00 |
| Custo direto total | R$ 190,00 |
| Preço mínimo | R$ 391,75 |
| Preço recomendado | R$ 1.027,03 |
| Lucro | R$ 308,11 |

> Detalhes e derivações estão em
> [preco-minimo.md](preco-minimo.md), [preco-recomendado.md](preco-recomendado.md)
> e [lucro.md](lucro.md).
