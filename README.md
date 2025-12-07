# 🌾 HarvestPilot

<div align="center">

![GitHub](https://img.shields.io/github/license/flemos-design/harvest-pilot)
![GitHub last commit](https://img.shields.io/github/last-commit/flemos-design/harvest-pilot)
![GitHub issues](https://img.shields.io/github/issues/flemos-design/harvest-pilot)
![GitHub stars](https://img.shields.io/github/stars/flemos-design/harvest-pilot)
![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

</div>

**Plataforma de Gestão Agrícola com Satélite e Meteo**

Sistema completo de gestão agrícola com monitorização por satélite e alertas meteorológicos para produção de frutos secos (castanheiro e cerejeira). Inclui mapa de parcelas, registos de campo offline, calendário agrícola, análise de vigor vegetativo e previsões meteorológicas.

---

## 📋 Índice

- [Características](#-características)
- [Stack Técnica](#-stack-técnica)
- [Pré-requisitos](#-pré-requisitos)
- [Setup Local](#-setup-local)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Desenvolvimento](#-desenvolvimento)
- [Documentação da API](#-documentação-da-api)
- [Roadmap](#-roadmap)

---

## ✨ Características

### Fase 1 - MVP (Atual)
- ✅ **Autenticação & Autorização**
  - Sistema completo de login e registo
  - Gestão de sessão com JWT e localStorage
  - 3 níveis de acesso (Admin, Gestor, Operador)
  - Proteção de rotas e UI condicional
  - Logout funcional com limpeza de sessão
- ✅ **Mapa de Parcelas**
  - MapLibre GL JS com suporte GeoJSON, KML, Shapefile
  - Upload de ficheiros geoespaciais
  - Cálculo automático de área e centroide
- ✅ **Gestão de Parcelas & Operações**
  - CRUD completo de Parcelas (criar, listar, editar, eliminar)
  - CRUD completo de Operações com GPS e custos
  - Registos de campo com localização e fotos (offline-first)
- ✅ **Calendário Agrícola**
  - Vista mensal com operações organizadas por dia
  - Filtros por tipo de operação
  - Estatísticas mensais agregadas
- ✅ **Relatórios e Analytics**
  - KPIs operacionais (operações, custos, parcelas)
  - Gráficos de tendência mensal e distribuição por tipo
  - Análise de custos e eficiência
  - Seleção de período customizável
- ✅ **UI/UX Moderna**
  - Sidebar vertical colapsável com categorias
  - Header com breadcrumbs, pesquisa e perfil de utilizador
  - Design SaaS profissional com Tailwind CSS
  - Navegação responsiva e intuitiva
- ✅ **Infraestrutura**
  - Base de dados geoespacial (PostGIS)
  - API REST documentada (Swagger)
  - PWA (Progressive Web App)
  - Sistema de gestão de culturas e ciclos

### Fases Futuras
- 📅 Janelas recomendadas de plantação/colheita
- 🌦️ Integração meteorológica (IPMA)
- 🛰️ Análise NDVI/NDRE (Sentinel Hub)
- 🔔 Sistema de notificações push
- 🔐 Sistema de autenticação (JWT)
- 📸 Upload de fotos (MinIO/S3)
- 🤖 Assistente IA

---

## 🛠 Stack Técnica

### Frontend
- **Framework:** Next.js 14 (App Router) + React 18 + TypeScript
- **UI:** Tailwind CSS + shadcn/ui + Lucide Icons
- **Mapas:** MapLibre GL JS + Turf.js + proj4
- **State:** TanStack Query v5 + Zustand
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts 2.15
- **Data:** date-fns (locale pt-PT)
- **PWA:** Workbox + localForage

### Backend
- **Framework:** NestJS (Node 20, TypeScript)
- **ORM:** Prisma
- **Database:** PostgreSQL 16 + PostGIS 3.4
- **Cache:** Redis 7
- **Jobs:** BullMQ
- **Storage:** MinIO (S3-compatible)
- **API:** REST + Swagger/OpenAPI

### DevOps
- **Containers:** Docker Compose
- **CI/CD:** GitHub Actions (planeado)
- **Observability:** Prometheus + Grafana (planeado)

---

## 🏗️ Arquitetura Frontend

### Padrões de Implementação

#### 1. Gestão de Estado
- **TanStack Query** para dados do servidor (cache automático, invalidação, refetch)
- **Custom hooks** para abstrair lógica de API (`use-parcelas.ts`, `use-operacoes.ts`)
- Exemplo de hook:
```typescript
export function useOperacoes() {
  return useQuery({
    queryKey: ['operacoes'],
    queryFn: fetchOperacoes,
  });
}

export function useCreateOperacao() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOperacao,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operacoes'] });
    },
  });
}
```

#### 2. Formulários
- **React Hook Form** com validação **Zod**
- Pattern de pré-preenchimento para edit forms:
```typescript
useEffect(() => {
  if (data) {
    reset({
      field1: data.field1,
      field2: data.field2,
    });
  }
}, [data, reset]);
```

#### 3. Otimização de Performance
- **useMemo** para computações pesadas (filtragem, agrupamento)
- **Dynamic imports** para componentes grandes
- Exemplo:
```typescript
const operacoesFiltradas = useMemo(() => {
  return operacoes.filter(op => op.tipo === filtro);
}, [operacoes, filtro]);
```

#### 4. Navegação e UX
- **useRouter** do Next.js para navegação programática
- **Confirmações** com `window.confirm()` antes de operações destrutivas
- **Loading states** em todos os botões de ação
- **Error boundaries** (a implementar)

#### 5. Data Formatting
- **date-fns** para manipulação de datas com locale português
```typescript
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const formatted = format(date, "d 'de' MMMM, yyyy", { locale: ptBR });
```

---

## 📦 Pré-requisitos

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **Docker** >= 24.0.0
- **Docker Compose** >= 2.0.0

---

## 🚀 Setup Local

### 1. Clonar o repositório

```bash
git clone <repository-url>
cd "Harvest Pilot"
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Iniciar serviços Docker

```bash
npm run docker:up
```

Isto irá iniciar:
- **PostgreSQL 16 + PostGIS** na porta `5433`
- **Redis 7** na porta `6380`
- **MinIO** nas portas `9000` (API) e `9001` (Console)

### 4. Configurar variáveis de ambiente

Os ficheiros `.env` já foram criados a partir dos `.env.example`. Verifique se estão corretos:

```bash
# Backend
cat apps/backend/.env

# Frontend
cat apps/frontend/.env
```

### 5. Executar migrações do Prisma

```bash
npm run db:migrate
```

### 6. Popular base de dados (seed)

```bash
npm run db:seed
```

### 7. Iniciar aplicação

```bash
npm run dev
```

Isto irá iniciar:
- **Backend (NestJS)** em `http://localhost:3001`
- **Frontend (Next.js)** em `http://localhost:3000`

---

## 📂 Estrutura do Projeto

```
Harvest Pilot/
├── apps/
│   ├── backend/              # NestJS API
│   │   ├── src/
│   │   │   ├── modules/      # Módulos de funcionalidades
│   │   │   ├── common/       # Código partilhado
│   │   │   ├── config/       # Configurações
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma # Schema da BD
│   │   │   ├── seed.ts       # Dados iniciais
│   │   │   └── init.sql      # Script PostGIS
│   │   └── package.json
│   │
│   └── frontend/             # Next.js PWA
│       ├── src/
│       │   ├── app/          # App Router
│       │   ├── components/   # Componentes React
│       │   ├── lib/          # Utilitários
│       │   ├── hooks/        # Custom hooks
│       │   └── types/        # TypeScript types
│       ├── public/
│       │   └── manifest.json # PWA manifest
│       └── package.json
│
├── packages/                 # Código partilhado (futuro)
├── docs/                     # Documentação
├── docker-compose.yml        # Serviços Docker
├── package.json              # Root package
├── claude.md                 # Instruções Claude
├── projeto.pdf               # Especificação completa
└── README.md
```

---

## 💻 Desenvolvimento

### Comandos Principais

```bash
# Desenvolvimento (backend + frontend)
npm run dev

# Apenas backend
npm run dev:backend

# Apenas frontend
npm run dev:frontend

# Build de produção
npm run build

# Testes
npm test

# Linting
npm run lint

# Desktop (Tauri)
# Pré-requisitos: Rust/cargo + toolchains de plataforma (Xcode no macOS; Visual Studio Build Tools no Windows)
npm install
npm run dev:desktop   # dev: abre Tauri + Next em http://localhost:3000
npm run build:desktop # build: usa next export para gerar bundle desktop
```

### Docker

```bash
# Iniciar serviços
npm run docker:up

# Parar serviços
npm run docker:down

# Ver logs
npm run docker:logs

# Logs de um serviço específico
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Base de Dados (Prisma)

```bash
# Criar migração
npm run db:migrate

# Aplicar migrações
cd apps/backend && npx prisma migrate deploy

# Prisma Studio (GUI)
npm run db:studio

# Gerar cliente Prisma
cd apps/backend && npx prisma generate

# Seed
npm run db:seed
```

### Acessos

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001/api/v1
- **API Docs (Swagger):** http://localhost:3001/api/docs
- **PostgreSQL:** localhost:5433 (user: `harvestpilot`, pass: `harvestpilot`)
- **Redis:** localhost:6380
- **MinIO Console:** http://localhost:9001 (user: `minioadmin`, pass: `minioadmin`)

---

## 📚 Documentação da API

A documentação completa da API está disponível via Swagger:

👉 **http://localhost:3001/api/docs**

Endpoints principais:
- `GET /health` - Health check
- `GET /api/v1/parcelas` - Listar parcelas
- `POST /api/v1/parcelas` - Criar parcela
- `GET /api/v1/parcelas/:id` - Detalhe de parcela
- `PUT /api/v1/parcelas/:id` - Atualizar parcela
- `DELETE /api/v1/parcelas/:id` - Eliminar parcela
- `GET /api/v1/operacoes` - Listar operações
- `POST /api/v1/operacoes` - Registar operação
- `GET /api/v1/operacoes/:id` - Detalhe de operação
- `PUT /api/v1/operacoes/:id` - Atualizar operação
- `DELETE /api/v1/operacoes/:id` - Eliminar operação

---

## 🖥️ Páginas da Aplicação

### Páginas Principais

| Rota | Descrição | Funcionalidades |
|------|-----------|-----------------|
| `/` | **Página Inicial** | Links rápidos para todas as secções, descrição de features |
| `/dashboard` | **Dashboard** | KPIs, estatísticas, resumo de atividade recente |
| `/parcelas` | **Lista de Parcelas** | Grid de parcelas, filtros, criar nova parcela |
| `/parcelas/nova` | **Criar Parcela** | Form com validação, GPS opcional, seleção de propriedade |
| `/parcelas/[id]` | **Detalhe Parcela** | Info completa, operações associadas, editar/eliminar |
| `/parcelas/[id]/editar` | **Editar Parcela** | Form pré-preenchido, atualizar todos os campos |
| `/operacoes` | **Lista de Operações** | Cards de operações, filtro por tipo, criar nova |
| `/operacoes/nova` | **Criar Operação** | Form com tipo, data, parcela, GPS, custos |
| `/operacoes/[id]` | **Detalhe Operação** | Info completa, parcela associada, editar/eliminar |
| `/operacoes/[id]/editar` | **Editar Operação** | Form pré-preenchido, atualizar todos os campos |
| `/calendario` | **Calendário** | Vista mensal, operações por dia, filtro por tipo |
| `/relatorios` | **Relatórios** | Analytics, gráficos, KPIs, seleção de período |

### Componentes Partilhados

- **Navbar**: Navegação global com 6 links (Home, Dashboard, Relatórios, Calendário, Parcelas, Operações)
- **LayoutWrapper**: Controla visibilidade do navbar (oculto na home)
- **Cards**: Componentes reutilizáveis para parcelas e operações
- **Forms**: React Hook Form + Zod para validação

### Padrões de Design

- **Cores por Tipo de Operação**:
  - `PLANTACAO`: Verde (`green-600`)
  - `COLHEITA`: Amarelo (`yellow-600`)
  - `TRATAMENTO`: Azul (`blue-600`)
  - `PODA`: Púrpura (`purple-600`)
  - `FERTILIZACAO`: Laranja (`orange-600`)
  - `IRRIGACAO`: Ciano (`cyan-600`)
  - `MANUTENCAO`: Cinza (`gray-600`)

- **Estados de Loading**: Todos os forms e botões de ação têm estados de loading com spinners
- **Confirmações**: Diálogos de confirmação para operações destrutivas (eliminar)
- **Navegação**: Links de retorno em todas as páginas de detalhe

---

## 🗺️ Roadmap

### ✅ Fase 1 - MVP Mapa & Registos (Atual)
- [x] Estrutura do projeto (monorepo)
- [x] Backend NestJS + Prisma + PostGIS
- [x] Frontend Next.js + MapLibre
- [x] Docker Compose para desenvolvimento
- [x] Schema da base de dados
- [x] Seed com dados de exemplo
- [x] **Módulo de Parcelas (CRUD completo)**
  - [x] Listar parcelas com filtros
  - [x] Criar nova parcela com GPS
  - [x] Detalhe de parcela com operações associadas
  - [x] Editar parcela (form pré-preenchido)
  - [x] Eliminar parcela (com confirmação)
- [x] **Módulo de Operações (CRUD completo)**
  - [x] Listar operações com filtros por tipo
  - [x] Criar operação com GPS e custos
  - [x] Detalhe de operação com parcela associada
  - [x] Editar operação (form pré-preenchido)
  - [x] Eliminar operação (com confirmação)
- [x] **Calendário Agrícola**
  - [x] Vista mensal com navegação
  - [x] Operações agrupadas por dia
  - [x] Filtro por tipo de operação
  - [x] Estatísticas mensais
- [x] **Relatórios e Analytics**
  - [x] Seleção de período (30d, 90d, 6m, 1y)
  - [x] KPIs operacionais (operações, custos, parcelas)
  - [x] Gráfico de tendência mensal (linha)
  - [x] Distribuição por tipo (barras)
  - [x] Análise de custos e eficiência
- [x] **Navegação Global**
  - [x] Navbar com 6 páginas
  - [x] Indicador de página ativa
  - [x] Logo e menu mobile
- [ ] Upload de GeoJSON/KML
- [ ] PWA offline-first com service workers

### 📅 Fase 2 - Meteo & Agenda
- [ ] Integração IPMA
- [ ] Agenda global
- [ ] Notificações push
- [ ] Janelas recomendadas

### 🛰️ Fase 3 - Satélite & Alertas
- [ ] Integração Sentinel Hub
- [ ] NDVI por parcela
- [ ] Alertas de anomalia

### 📊 Fase 4 - Operações & Custos
- [ ] Inventário de insumos
- [ ] Custos por parcela
- [ ] Relatórios

### 🤖 Fase 5 - IA aplicada
- [ ] Assistente IA
- [ ] Recomendações explicáveis
- [ ] Deteção de outliers

### 📡 Fase 6 - Sensores (Opcional)
- [ ] LoRaWAN/TTN
- [ ] Estações meteo
- [ ] Rastreabilidade

---

## 📝 Notas de Desenvolvimento

### Regras Git (ver `claude.md`)
- ✅ Commits descritivos obrigatórios
- ⚠️ Push apenas com aprovação explícita
- 🚫 Nunca fazer `git push -f` sem autorização
- 📦 Branches descritivos (ex: `feature/mapa-parcelas`)

### Workflow
1. **EXPLORAR** → Ler ficheiros, logs, configurações
2. **PLANEAR** → Criar plano detalhado com aprovação
3. **PROGRAMAR** → Implementar passo a passo
4. **COMMIT** → Mensagens descritivas, sem push automático

### Política Zero Regressões
- Corrigir **apenas** o bug descrito
- Não alterar: design, UI, cópia, tokens, estilos
- Diffs < 30 linhas (justificar se maior)

---

## 🌍 Localização

**Região:** Espinhosela, Bragança
**Coordenadas:** 41.79°N, -6.75°W
**Altitude:** ~900m
**Características:** Altitude elevada, geadas tardias até abril/maio

**Culturas principais:**
- Castanheiro (Castanea sativa) - fruto e madeira
- Cerejeira (Prunus avium) - fruto

---

## 📄 Licença

Este projeto está licenciado sob a licença MIT - consulte o ficheiro [LICENSE](LICENSE) para mais detalhes.

---

## 🤝 Contribuir

Contribuições são bem-vindas! Por favor:

1. Faça fork do projeto
2. Crie uma branch para a sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit das suas alterações (`git commit -m 'feat: adicionar MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

Para bugs e sugestões de features, abra uma [issue](https://github.com/flemos-design/harvest-pilot/issues).

---

## 📧 Contacto

Para questões técnicas ou sugestões, abra uma issue no repositório.

---

**HarvestPilot** - Gestão Agrícola Inteligente 🌾
