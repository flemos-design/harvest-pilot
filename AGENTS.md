# AGENTS.md — HarvestPilot

> Este ficheiro é o **guia de referência primário** para agentes de IA que trabalham no projeto HarvestPilot. Leia sempre antes de iniciar qualquer tarefa. Atualize este ficheiro se alterares arquitetura, stack ou convenções.

---

## 1. Visão Geral

**HarvestPilot** é uma plataforma de gestão agrícola com monitorização por satélite e alertas meteorológicos. Foco em produção de frutos secos — **castanheiro** e **cerejeira** — na região de **Espinhovela, Bragança** (41.79°N, -6.75°W, ~900m altitude).

**Fase atual:** MVP (Fase 1) — Mapa, Registos de Campo, Calendário, Relatórios e Assistente IA (Fase 5).

**Repositório:** `flemos-design/harvest-pilot`  
**Monorepo:** npm workspaces (`apps/*`, `packages/*`)

---

## 2. Stack Técnica

### Frontend (`apps/frontend/`)
| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 14 (App Router) + React 18 + TypeScript 5 |
| Estilos | Tailwind CSS 3 + shadcn/ui (Radix) + Framer Motion |
| Mapas | MapLibre GL JS + proj4 (EPSG:3763) + Turf.js |
| Estado Servidor | TanStack Query v5 |
| Estado UI | Zustand |
| Formulários | React Hook Form + Zod |
| Gráficos | Recharts 2.15 |
| Datas | date-fns (locale pt-PT) |
| i18n | next-intl |
| Upload | Uppy |
| Ícones | Lucide React |
| Testes | Playwright (E2E) + Vitest + Testing Library |

### Backend (`apps/backend/`)
| Camada | Tecnologia |
|--------|-----------|
| Framework | NestJS 10 (Node 20, TypeScript) |
| ORM | Prisma |
| DB | PostgreSQL 16 + PostGIS 3.4 |
| Cache | Redis 7 |
| Filas | BullMQ |
| Auth | JWT (preparado para Keycloak/OIDC) |
| Storage | MinIO (S3-compatible) |
| Docs | Swagger/OpenAPI |
| AI | OpenAI API (GPT-4o-mini) |

### Mobile & Desktop
| Plataforma | Tecnologia |
|-----------|-----------|
| PWA | Workbox 7 + next-pwa |
| iOS/Android | Capacitor 7 (plugins: Camera, Geolocation, Push, Filesystem, Share) |
| Desktop | Tauri (Rust) — `src-tauri/` |

### DevOps
| Ferramenta | Uso |
|-----------|-----|
| Docker Compose | Dev stack (Postgres, Redis, MinIO) |
| Railway | Deploy planejado (ver `RAILWAY.md`) |
| CI/CD | GitHub Actions (planeado) |

---

## 3. Estrutura do Projeto

```
Harvest Pilot/
├── apps/
│   ├── backend/                    # NestJS API
│   │   ├── src/
│   │   │   ├── modules/            # Módulos de domínio
│   │   │   │   ├── auth/           # Autenticação JWT
│   │   │   │   ├── parcelas/       # CRUD + estatísticas + geometria
│   │   │   │   ├── operacoes/      # CRUD + GPS + custos
│   │   │   │   ├── propriedades/   # CRUD
│   │   │   │   ├── culturas/       # Gestão de culturas
│   │   │   │   ├── calendario/     # Regras de calendário agrícola
│   │   │   │   ├── insumos/        # Inventário de insumos
│   │   │   │   ├── ciclos/         # Ciclos de cultura
│   │   │   │   ├── tarefas/        # Tarefas pendentes
│   │   │   │   ├── satelite/       # Sentinel Hub (NDVI)
│   │   │   │   ├── meteo/          # IPMA / Open-Meteo
│   │   │   │   └── ia/             # Assistente IA (RAG)
│   │   │   ├── common/             # Código partilhado
│   │   │   ├── config/             # Configurações
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # 11+ modelos
│   │   │   ├── seed.ts
│   │   │   └── init.sql            # PostGIS setup
│   │   └── package.json
│   │
│   └── frontend/                   # Next.js PWA
│       ├── src/
│       │   ├── app/                # App Router (páginas)
│       │   ├── components/         # Componentes React reutilizáveis
│       │   ├── hooks/              # Custom hooks (TanStack Query)
│       │   ├── lib/
│       │   │   ├── api/            # Cliente Axios + funções API
│       │   │   ├── capacitor/      # Wrappers nativos (Camera, GPS, Push)
│       │   │   └── providers.tsx   # Providers React
│       │   ├── types/              # Tipos TypeScript
│       │   └── contexts/           # Contextos React (Auth, etc.)
│       ├── public/
│       │   ├── manifest.json       # PWA manifest
│       │   ├── sw.js               # Service Worker
│       │   └── icons/              # Ícones PWA (8 tamanhos)
│       ├── ios/                    # Projeto Xcode (Capacitor)
│       ├── android/                # Projeto Android (Capacitor)
│       ├── capacitor.config.ts
│       ├── next.config.js
│       └── package.json
│
├── src-tauri/                      # App desktop (Tauri + Rust)
│   ├── src/main.rs
│   ├── tauri.conf.json
│   └── Cargo.toml
│
├── docker-compose.yml              # Stack dev: Postgres 5433, Redis 6380, MinIO 9000/9001
├── package.json                    # Root workspace
├── playwright.config.ts            # Testes E2E
└── [docs: README.md, IMPLEMENTACAO.md, MOBILE.md, RAILWAY.md, ASSISTENTE_IA.md, claude.md, projeto.pdf]
```

---

## 4. Convenções de Código

### TypeScript
- Strict mode ativado em todos os projetos.
- Tipar sempre: funções, props, retornos de API, estados.
- Usar `interfaces` para shapes de dados, `types` para uniões/aliases.

### Nomenclatura
- **Ficheiros:** kebab-case (`use-parcelas.ts`, `parcelas.controller.ts`)
- **Componentes React:** PascalCase (`MapPreview.tsx`)
- **Hooks:** prefixo `use-` (`use-parcelas.ts`, `use-camera.ts`)
- **API functions:** camelCase no ficheiro, export nomeado (`parcelas.ts` → `fetchParcelas()`)
- **DTOs:** suffixo `Dto`/`DTO` (`CreateParcelaDto`)

### Frontend Patterns

#### Estado
```typescript
// Server state → TanStack Query
export function useParcelas() {
  return useQuery({ queryKey: ['parcelas'], queryFn: fetchParcelas });
}

export function useCreateParcela() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createParcela,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['parcelas'] }),
  });
}

// UI state → Zustand (quando necessário)
```

#### Formulários
```typescript
// React Hook Form + Zod
const form = useForm<CreateParcelaInput>({
  resolver: zodResolver(createParcelaSchema),
});

// Pré-preencher em edit forms
useEffect(() => {
  if (data) reset({ field1: data.field1, field2: data.field2 });
}, [data, reset]);
```

#### Performance
- `useMemo` para filtragem/agrupamento pesado.
- Dynamic imports para componentes grandes (`next/dynamic`).
- Lazy loading de componentes de mapa.

### Backend Patterns
- NestJS modular: cada domínio tem seu próprio módulo (`*.module.ts`, `*.controller.ts`, `*.service.ts`, `dto/`).
- Validação com `class-validator` nos DTOs.
- Swagger decorators em todos os controllers.
- Error handling global via filter.
- Rate limiting: 100 req/min via `ThrottlerModule`.

---

## 5. Comandos Essenciais

### Desenvolvimento
```bash
# Instalar dependências
npm install

# Iniciar stack Docker (Postgres 5433, Redis 6380, MinIO)
npm run docker:up

# Dev completo (backend 3001 + frontend 3000)
npm run dev

# Backend apenas
npm run dev:backend

# Frontend apenas
npm run dev:frontend

# Desktop (Tauri)
npm run dev:desktop
```

### Base de Dados
```bash
# Migrações Prisma
npm run db:migrate

# Seed com dados de exemplo
npm run db:seed

# Prisma Studio (GUI)
npm run db:studio
```

### Build & Test
```bash
# Build produção
npm run build

# Testes E2E (Playwright)
npm run test:production

# Lint	npm run lint
```

### Mobile
```bash
cd apps/frontend

# Build estático para Capacitor
npm run build:export

# Sync com iOS/Android
npm run capacitor:sync

# Abrir Xcode / Android Studio
npm run capacitor:open:ios
npm run capacitor:open:android
```

---

## 6. Workflow de Desenvolvimento (OBRIGATÓRIO)

### EXPLORAR → PLANEAR → PROGRAMAR → COMMIT

1. **EXPLORAR**
   - Ler ficheiros, logs, configs relevantes.
   - Verificar `git log --oneline -10` se necessário.
   - **NÃO escrever código ainda.**

2. **PLANEAR** (tarefas > 30min)
   - Criar plano detalhado: passos, ficheiros, riscos, rollback.
   - **PAUSAR para aprovação humana antes de programar.**

3. **PROGRAMAR**
   - Implementar um passo de cada vez.
   - Respeitar política de diffs mínimos (< 30 linhas).
   - Só corrigir o bug descrito; não alterar UI/design/API sem autorização.

4. **COMMIT**
   - Mensagens descritivas: `tipo: descrição curta`
   - Exemplos: `fix: corrigir erro no login`, `feat: adicionar dashboard`
   - **NUNCA fazer push sem aprovação explícita do utilizador.**
   - **NUNCA fazer `git push -f` sem autorização crítica.**

### Política "Zero Regressões"
- Corrigir **apenas** o bug descrito.
- Não alterar: design, UI, cópia, tokens, estilos, contratos de API.
- Diffs > 30 linhas exigem justificação técnica explícita.

---

## 7. Contexto de Negócio

### Localização
- **Região:** Espinhosela, Bragança, Portugal
- **Coordenadas:** 41.79°N, -6.75°W
- **Altitude:** ~900m
- **Características:** Geadas tardias até abril/maio; solo variado (franco-arenoso, franco-argiloso)

### Culturas Principais
| Cultura | Variedade | Uso | Época Chave |
|---------|-----------|-----|-------------|
| Castanheiro | Judia | Fruto + Madeira | Plantação Nov-Fev; Colheita Out-Nov |
| Cerejeira | Saco | Fruto | Colheita Jun-Jul |

### Dados de Exemplo (Seed)
- **Organização:** Quinta de Espinhosela
- **Utilizador:** admin@harvestpilot.pt
- **Parcelas:** Parcela Norte (Castanheiro, 2.5ha) + Parcela Sul (Cerejeira, 1.8ha)

---

## 8. Módulos Implementados vs. Roadmap

### ✅ Implementado (MVP)
- [x] Auth (JWT + localStorage, 3 níveis: Admin, Gestor, Operador)
- [x] CRUD Parcelas (GeoJSON, KML, Shapefile, GPS, cálculo de área)
- [x] CRUD Operações (GPS, custos, fotos)
- [x] CRUD Propriedades, Culturas, Insumos, Ciclos
- [x] Calendário Agrícola (vista mensal, filtros, estatísticas)
- [x] Relatórios & Analytics (KPIs, gráficos Recharts, seleção de período)
- [x] Mapa Interativo (MapLibre, labels, hover, popups, thumbnails)
- [x] Dashboard (cards, gráficos, feed de atividade)
- [x] Assistente IA (chat, insights automáticos, terrenos críticos, RAG)
- [x] PWA offline-first (Workbox, background sync, cache de tiles)
- [x] App Mobile (Capacitor: iOS + Android)
- [x] App Desktop (Tauri)

### 📅 Roadmap — Próximas Fases
- **Fase 2:** Integração IPMA (meteo), agenda global, notificações push
- **Fase 3:** Sentinel Hub (NDVI/NDRE), alertas de anomalia
- **Fase 4:** Inventário completo, custos por parcela, relatórios avançados
- **Fase 5 (parcial):** Histórico de chat, suporte a imagens, fine-tuning
- **Fase 6 (opcional):** LoRaWAN/TTN, estações meteorológicas, rastreabilidade

---

## 9. Endpoints & Acessos

| Serviço | URL Local |
|---------|-----------|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001/api/v1 |
| Swagger Docs | http://localhost:3001/api/docs |
| PostgreSQL | localhost:5433 (user: `harvestpilot`, pass: `harvestpilot`) |
| Redis | localhost:6380 |
| MinIO API | localhost:9000 |
| MinIO Console | localhost:9001 (user: `minioadmin`, pass: `minioadmin`) |

### Endpoints Principais
```
GET    /api/v1/health
GET    /api/v1/parcelas
POST   /api/v1/parcelas
GET    /api/v1/parcelas/:id
GET    /api/v1/parcelas/:id/stats
PATCH  /api/v1/parcelas/:id
DELETE /api/v1/parcelas/:id

GET    /api/v1/operacoes
POST   /api/v1/operacoes
GET    /api/v1/operacoes/resumo
GET    /api/v1/operacoes/:id
PATCH  /api/v1/operacoes/:id
DELETE /api/v1/operacoes/:id

POST   /api/v1/ia/chat
GET    /api/v1/ia/insights
GET    /api/v1/ia/critical-parcelas
```

---

## 10. Cores por Tipo de Operação

| Tipo | Cor Tailwind |
|------|-------------|
| PLANTACAO | `green-600` |
| COLHEITA | `yellow-600` |
| TRATAMENTO | `blue-600` |
| PODA | `purple-600` |
| FERTILIZACAO | `orange-600` |
| IRRIGACAO | `cyan-600` |
| MANUTENCAO | `gray-600` |
| INSPECAO | `slate-600` |

---

## 11. Pontos de Atenção para Agentes

### ⚠️ NUNCA fazer sem autorização explícita
- `git push` (de nenhuma branch)
- `git push -f`
- `docker-compose down` (pode parar o stack de dev do utilizador)
- Alterar `prisma/schema.prisma` sem plano de migração
- Alterar `.env` files em produção

### ⚠️ Cuidados Específicos
- **Portas não padrão:** Postgres está em 5433 (não 5432), Redis em 6380 (não 6379).
- **Compression no backend:** temporariamente desativada (issue de imports).
- **Chave OpenAI:** apenas no `.env` do backend. Nunca expor no frontend.
- **Map tiles:** usar OpenStreetMap (gratuito). Mapbox só em produção se configurado.
- **Geometria:** dados GeoJSON usam coordenadas WGS84 (EPSG:4326). Conversão para EPSG:3763 (PT-TM06) via proj4 quando necessário.

### 🗺️ Componentes de Mapa
- `Map.tsx` — mapa completo com todas as parcelas (usado em `/mapa`)
- `MapSingle.tsx` — mapa focado numa única parcela (detalhes, edição)
- `MapPreview.tsx` — preview em tempo real com marker + polígono (criação)
- `MapThumbnail.tsx` — mini-mapa não interativo (lista de parcelas)

### 📱 Mobile / Capacitor
- Sempre que adicionar funcionalidade nativa (câmara, GPS), verificar se há fallback web.
- O build para mobile requer `npm run build:export` (estático) antes de `npx cap sync`.

### 🧪 Testes
- Playwright configuração em `playwright.config.ts` (raiz).
- Testes de produção em `production.spec.ts`.
- Sempre que adicionar página crítica, considerar adicionar teste E2E.

---

## 12. Documentação Relacionada

| Ficheiro | Conteúdo |
|----------|----------|
| `README.md` | Visão geral, setup, stack, roadmap completo |
| `IMPLEMENTACAO.md` | Resumo detalhado do que foi implementado (MVP) |
| `claude.md` | Workflow de desenvolvimento, regras Git, comandos |
| `ASSISTENTE_IA.md` | Guia do módulo de IA (setup OpenAI, endpoints, hooks) |
| `MOBILE.md` | Documentação PWA + Capacitor (iOS/Android) |
| `RAILWAY.md` | Guia de deploy no Railway |
| `LOGO_INTEGRATION.md` | Integração do logo/brand |
| `TESTES_PRODUCAO.md` | Testes de produção |
| `projeto.pdf` | Especificação completa do projeto |
| `docker-compose.yml` | Stack de desenvolvimento |

---

## 13. Notas para Manutenção deste Ficheiro

- **Atualizar** sempre que:
  - Novo módulo/backend/frontend for adicionado
  - Stack técnica mudar (versões, novas libs)
  - Convenções de código evoluírem
  - Roadmap avançar de fase
  - Novos endpoints críticos forem criados
- **Manter conciso:** este é um guia de referência rápida, não documentação completa. Apontar para os ficheiros detalhados quando necessário.

---

*Última atualização: 2026-04-22*  
*Versão do projeto: 0.1.0*  
*Fase: MVP (Fase 1) + Assistente IA (Fase 5)*
