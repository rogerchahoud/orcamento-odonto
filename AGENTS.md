# AGENTS.md

## Projeto
- **orcamento-odonto**: clonagem da "Calculadora L.U.C.R.E."
  (https://calculadora.drjacquessouza.me/calculadora) — precificação de
  procedimentos odontológicos, UI em pt-BR.
- Stack decidida: **Next.js (App Router) + Tailwind CSS + SQLite** (persistência inicial).
- Estado: ainda não há código; o único arquivo no repo é `calculadora-lucre.xlsx`.

## Referências de domínio
- O site original é uma SPA de 3 passos (React/Lovable): (1) operação da clínica
  e percentuais, (2) procedimentos, (3) resultado. Saídas por procedimento:
  **preço mínimo**, **preço recomendado**, **status de margem**.
- `calculadora-lucre.xlsx` = exportação do autor com dados fictícios; é a
  fonte de verdade para validar a matemática abaixo.

## Matemática L.U.C.R.E. (verificada contra o xlsx)
1. Capacidade mensal (min) = horas/dia × 60 × dias úteis × cadeiras
2. Custo fixo por minuto = Σ custos fixos mensais ÷ capacidade mensal
3. Custo fixo alocado (proc.) = tempo (min) × custo fixo por minuto
4. Custo direto total = fixo alocado + material + laboratório + implantes + outros
5. Preço mínimo = custo direto ÷ (1 − cartão − imposto − comissão)
6. Preço recomendado = custo direto ÷ (1 − cartão − imposto − comissão − margem_alvo)
7. Lucro = preço recomendado × margem_alvo
8. Margem real = lucro ÷ preço recomendado
9. Status = margem real vs margem alvo → Saudável / Em atenção / Abaixo da meta

Parâmetros de validação (xlsx): 10h/dia, 22 dias, 2 cadeiras → 26.400 min;
cartão 3,5%, imposto 8%, comissão 40%, margem alvo 30%. Caso conferido:
Implante unitário (90 min) → mínimo R$ 2.674,41 / recomendado R$ 7.011,30.

## Custos fixos (categorias do xlsx)
aluguel, folha, encargos, energia, água, internet, contabilidade, software,
marketing, manutenção, materialAdm, limpeza, financiamentos, outros.