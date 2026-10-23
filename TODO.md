# Pendências

Lista de tarefas em aberto no projeto.

## Neon / Vercel
- [ ] **Committar a integração Neon** — arquivos ainda não commitados: `neon.ts` (novo), `package.json`, `package-lock.json` e `.gitignore` (entrada `.neon`).
- [ ] **Configurar env vars na Vercel** — `DATABASE_URL` (obrigatória) e `DATABASE_URL_UNPOOLED` (recomendada) para o deploy deixar de dar erro.
- [ ] **Apontar os testes para uma branch separada do Neon** — hoje `npm test` roda contra a branch `production` e limpa a tabela `presets` no `beforeEach`.

## Limpeza / docs
- [ ] **Remover scripts `db:up`/`db:down`** — o container local (WSL/Docker) ficou sobrando; o app agora usa o Neon via `DATABASE_URL`.
- [ ] **Atualizar o README** — a seção "Banco de dados local" ainda documenta o container WSL/Docker, não o Neon.

## Segurança
- [ ] **Investigar vulnerabilidades do `npm audit`** — 9 no total (8 high, 1 critical) vindas de `@neon/config`/`@neon/env` (tooling de build, não runtime).

## Concluído
- [x] Migrar persistência de SQLite para PostgreSQL (`postgres`/postgres.js).
- [x] Setup do Neon (CLI + `neon.ts` + env vars em `.env`).
- [x] Mover botões Voltar/Próximo para o topo, à direita do indicador de passos.
