
### Regras Git
- **Commits:** Mensagens descritivas obrigatórias
- **Push:** Aguardar sempre aprovação explícita do utilizador
- **PRs:** Criar com descrição detalhada das alterações e ficheiros afetados
- **Branches:** Usar branches descritivos (ex: `fix/bug-login`, `feature/novo-dashboard`)

---

## WORKFLOW: EXPLORAR → PLANEAR → PROGRAMAR → COMMIT

### 1. EXPLORAR
- Ler ficheiros, logs, configurações relevantes
- Verificar histórico Git se relevante: `git log --oneline -10`
- Usar níveis de pensamento apropriados:
  - Simples/rotina → "think"
  - Integração/refactoring → "think hard"
  - Arquitetura/crítico → "ultrathink"
- **NÃO escrever código ainda**

### 2. PLANEAR (tarefas > 30min)
**Criar plano detalhado com:**
- Passos numerados e ordem de execução
- Lista de ficheiros a alterar (explícita)
- Riscos identificados
- Estratégia de rollback via Git
- Estimativa de impacto
- Branch a utilizar (se aplicável)

**PAUSAR para aprovação humana antes de programar**

### 3. PROGRAMAR
- Implementar um passo de cada vez
- Aguardar output/confirmação antes de prosseguir
- Respeitar política de diffs mínimos (< 30 linhas)
- Só corrigir o bug descrito; nenhuma alteração UI/design/API
- Fazer commits incrementais em pontos lógicos

### 4. COMMIT
- Criar commit com mensagem descritiva seguindo formato:
  - `tipo: descrição curta`
  - Exemplos: `fix: corrigir erro no login`, `feat: adicionar dashboard`
- Atualizar README/changelog se aplicável
- Limpar ficheiros temporários
- Fornecer comandos de limpeza
- **Não fazer push** - aguardar aprovação

---

## POLÍTICA "ZERO REGRESSÕES"

### Escopo de Correção
- Corrigir **apenas** o bug descrito
- Não alterar: design, UI, cópia, tokens, estilos, contratos de API
- Não alterar comportamentos fora dos casos fornecidos

### Diferença Mínima
- Alterar o **menor** número de linhas/ficheiros
- Diffs > 30 linhas requerem justificação técnica explícita
- Usar `git diff` para verificar escopo antes de commit

---

## ✅ CHECKLIST PRÉ-ALTERAÇÃO

- [ ] Backup com timestamp criado?
- [ ] Processos a usar ficheiro verificados? (lsof/fuser)
- [ ] Logs relevantes analisados?
- [ ] Problema reproduzível e entendido?
- [ ] Solução definitiva (não paliativa)?
- [ ] Impacto noutros processos avaliado e comunicado?
- [ ] Comando de rollback preparado?
- [ ] Ficheiros/módulos afetados listados explicitamente?
- [ ] Histórico Git verificado? (conflitos potenciais)

---

## ❌ PROIBIDO

- Esquecer `cd` no início de blocos de comandos
- Soluções apressadas/temporárias sem justificar
- Assumir sem verificar com comandos
- Prosseguir sem esperar resposta/output
- Mexer em ficheiros sem avisar impacto e sem backup
- Fazer alterações sem plano de rollback
- Deixar ficheiros de teste/lixo no repositório
- Alterar UI/design durante correção de bugs
- Diffs > 30 linhas sem justificação
- Executar `docker-compose down` sem autorização
- **Fazer push sem aprovação explícita**
- **Fazer force push (`git push -f`)** sem autorização crítica

---

## COMANDOS DO PROJETO

**Frontend (Next.js):**
- Dev: `npm run dev` (porta 3000)
- Build: `npm run build`
- Start produção: `npm start`
- Testar: `npm test`
- Lint: `npm run lint`
- Type check: `npm run type-check`

**Backend (NestJS):**
- Dev: `npm run start:dev`
- Build: `npm run build`
- Start produção: `npm run start:prod`
- Testar: `npm run test`
- Migrações Prisma: `npx prisma migrate dev`
- Prisma Studio: `npx prisma studio`

**Docker:**
- Iniciar stack: `docker-compose up -d`
- Parar stack: `docker-compose stop`
- Ver logs: `docker-compose logs -f [serviço]`
- Rebuild: `docker-compose up -d --build`

**PWA & Capacitor:**
- Build PWA: `npm run build && npx workbox generateSW`
- Sync Capacitor: `npx cap sync`
- Open iOS: `npx cap open ios`
- Open Android: `npx cap open android`

**Comandos Git:**
- Status completo: `git status && git log --oneline -3`
- Ver mudanças: `git diff`
- Histórico: `git log --graph --oneline -10`

## STACK TÉCNICO

### Frontend
- **Framework:** Next.js + React 18 + TypeScript
- **UI:** Tailwind CSS + shadcn/ui (Radix) + Framer Motion
- **Mapas:** MapLibre GL JS + proj4 (EPSG:3763) + Turf.js
- **Gestão de dados:** TanStack Query (server state) + Zustand (UI state)
- **Formulários/validação:** React Hook Form + Zod
- **i18n:** next-intl
- **PWA:** Workbox (offline, background sync) + localForage
- **Gráficos:** Recharts
- **Upload:** Uppy
- **Datas:** date-fns
- **Testes:** Playwright (E2E) + Vitest + Testing Library

### Mobile
- **Empacotamento:** Capacitor (iOS/Android)
- **Push notifications:** FCM/APNs
- **Acesso nativo:** Câmara, ficheiros, partilha

### Backend
- **Framework:** NestJS (Node 20, TypeScript) - modular monolith
- **Módulos:** Parcela, Calendário, Tarefas, Satélite, Meteo, IoT
- **ORM:** Prisma
- **API:** REST + WebSockets/SSE (eventos), OpenAPI documentado
- **Jobs/filas:** BullMQ + Redis 7
- **Cache:** Redis + HTTP caching (ETags)
- **Autenticação:** Keycloak (OIDC) com RBAC por papéis
- **Armazenamento:** S3 (MinIO dev, Wasabi/S3 UE prod)
- **Email:** Postmark (alt: SendGrid)
- **Meteo:** IPMA (Portugal), fallback Open-Meteo
- **Satélite:** Sentinel Hub Processing API
- **IoT:** The Things Stack/TTN via MQTT
- **Pesquisa:** Postgres FTS (fase 1), OpenSearch opcional (fase 2)

### Base de Dados & Geoespacial
- **Principal:** PostgreSQL 16 + PostGIS 3.4
- **Séries temporais:** TimescaleDB (sensores)
- **Embeddings IA:** pgvector (RAG)

### AI Layer
- **API:** OpenAI API (assistente, insights)
- **RAG:** Embeddings em pgvector, KB por parcela/cultura
- **Guardrails:** Limites de escopo, logging, feedback utilizador

### DevOps & Segurança
- **Contêineres:** Docker Compose (dev) → k3s/managed (prod)
- **CI/CD:** GitHub Actions (lint, testes, build, migrações Prisma)
- **Observabilidade:** OpenTelemetry + Prometheus + Grafana + Loki + Sentry
- **Infra:** Hetzner/OVH (região UE), Cloudflare (CDN/DNS), Let's Encrypt (TLS)
- **Backups:** WAL-G (PostgreSQL) + snapshots S3
- **Segredos:** Doppler/1Password
- **Dependências:** Dependabot/Renovate
- **IaC:** Terraform

### Performance & Entrega
- **Targets:** TTFB < 500ms, primeira vista < 2s
- **Otimização:** Cache tiles/dados (Service Worker), CDN, Brotli
- **Offline:** PWA offline-first, sincronização background



---

## NOTAS FINAIS

- Recolher evidência antes de corrigir: logs, erros, versões (`node -v`, `npm -v`)
- Verificar histórico Git para contexto de alterações anteriores
- Tom: cuidadoso mas direto; explicar o que vais fazer e porquê
- Avisar riscos quando pode afetar produção ou outros processos
- Fornecer sempre comandos de limpeza e rollback (incluindo `git reset` se necessário)
- Verificar estado Docker antes de iniciar qualquer trabalho
- Commits frequentes com mensagens claras > commits grandes e vagos

