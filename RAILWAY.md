# Deploy HarvestPilot no Railway - Guia Completo

## 📋 Pré-requisitos

- Conta no Railway: https://railway.app (grátis para começar, $5/mês depois)
- Código no GitHub: ✅ `flemos-design/harvest-pilot`
- Mapbox API Key
- Sentinel Hub API Key (apenas quando a integração de satélite for ativada)

---

## 🚀 Passo a Passo

### **1. Criar Novo Projeto no Railway**

1. Aceder a https://railway.app
2. Clicar em **"New Project"**
3. Selecionar **"Deploy from GitHub repo"**
4. Escolher `flemos-design/harvest-pilot`
5. Dar nome ao projeto: **"HarvestPilot"**

---

### **2. Adicionar Base de Dados PostgreSQL**

1. No dashboard do projeto, clicar em **"+ New"**
2. Selecionar **"Database"** → **"PostgreSQL"**
3. Railway irá criar automaticamente a base de dados
4. Anotar a variável `DATABASE_URL` (será usado no backend)

**Importante:** Railway cria automaticamente a extensão PostGIS. Se não criar:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

---

### **3. Configurar Backend (NestJS)**

#### 3.1. Adicionar Serviço Backend

1. No dashboard, clicar em **"+ New"**
2. Selecionar **"GitHub Repo"** → **"Configure"**
3. **Root Directory:** `apps/backend`
4. Dar nome: **"Backend"**

#### 3.2. Configurar Variáveis de Ambiente

No serviço Backend, ir a **"Variables"** e adicionar:

```bash
# Base de Dados
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Servidor
NODE_ENV=production
PORT=3001

# JWT
JWT_SECRET=sua-chave-secreta-super-segura-alterar-isto

# APIs Externas
MAPBOX_ACCESS_TOKEN=pk.ey...
SENTINEL_HUB_CLIENT_ID=seu-client-id
SENTINEL_HUB_CLIENT_SECRET=seu-client-secret
```

**Como obter as variáveis:**
- `DATABASE_URL`: Já está disponível como `${{Postgres.DATABASE_URL}}` (referência ao serviço Postgres)
- `JWT_SECRET`: Gerar uma chave aleatória (mínimo 32 caracteres)
- `MAPBOX_ACCESS_TOKEN`: https://account.mapbox.com/access-tokens/
- `SENTINEL_HUB_*`: https://apps.sentinel-hub.com/dashboard/

#### 3.3. Configurar Domínio Público

1. No serviço Backend, ir a **"Settings"** → **"Networking"**
2. Clicar em **"Generate Domain"**
3. Anotar o URL gerado (ex: `backend-production-xxxx.up.railway.app`)

---

### **4. Configurar Frontend (Next.js)**

#### 4.1. Adicionar Serviço Frontend

1. No dashboard, clicar em **"+ New"**
2. Selecionar **"GitHub Repo"** → **"Configure"**
3. **Root Directory:** `apps/frontend`
4. Dar nome: **"Frontend"**

#### 4.2. Configurar Variáveis de Ambiente

No serviço Frontend, ir a **"Variables"** e adicionar:

```bash
# API Backend
NEXT_PUBLIC_API_URL=https://backend-production-xxxx.up.railway.app

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk.ey...

# Build
NODE_ENV=production
```

**Importante:**
- Substituir `backend-production-xxxx.up.railway.app` pelo domínio real do backend (passo 3.3)
- `NEXT_PUBLIC_*` são expostas no browser, nunca colocar secrets aqui

#### 4.3. Configurar Domínio Público

1. No serviço Frontend, ir a **"Settings"** → **"Networking"**
2. Clicar em **"Generate Domain"**
3. Anotar o URL gerado (ex: `frontend-production-yyyy.up.railway.app`)

---

### **5. Executar Migrações da Base de Dados**

Após o backend fazer o primeiro deploy:

#### 5.1. Via Railway CLI (Recomendado)

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Conectar ao projeto
railway link

# Numa base já existente, marcar o baseline uma única vez após confirmar
# que o schema atual corresponde a apps/backend/prisma/migrations/00000000000000_baseline
railway run --service backend npx prisma migrate resolve --applied 00000000000000_baseline

# Executar migrações versionadas
railway run --service backend npm run migrate:deploy
```

#### 5.2. Via Interface Web

1. No serviço Backend, ir a **"Deploy Logs"**
2. Clicar em **"Deploy"** → **"Run Command"**
3. Numa base já existente, executar uma única vez `npx prisma migrate resolve --applied 00000000000000_baseline` depois de confirmar o schema.
4. Executar: `npm run migrate:deploy`

---

### **6. Testar Aplicação**

1. Abrir o domínio do frontend no browser
2. Testar login/registo
3. Testar criação de parcelas no mapa
4. Verificar se imagens de satélite carregam
5. Testar calendário e operações

**Se houver erros:**
- Ver logs do backend: Railway Dashboard → Backend → Deployments → View Logs
- Ver logs do frontend: Railway Dashboard → Frontend → Deployments → View Logs

---

## 🔧 Configurações Avançadas

### **Domínio Personalizado**

1. No serviço Frontend, ir a **"Settings"** → **"Domains"**
2. Clicar em **"Custom Domain"**
3. Adicionar: `harvestpilot.com` (ou subdomínio)
4. Configurar DNS:
   - Tipo: `CNAME`
   - Nome: `@` (ou `app` para subdomínio)
   - Valor: `frontend-production-yyyy.up.railway.app`

### **SSL/HTTPS**

Railway ativa SSL automaticamente para todos os domínios (grátis).

### **Auto-Deploy via GitHub**

Railway já está configurado para fazer deploy automático quando fizer push para `main`. Para desativar:

1. Ir a **"Settings"** → **"Deployments"**
2. Desativar **"Auto Deploy"**

---

## 💰 Custos Estimados

Railway funciona por **usage-based pricing**:

- **Plano Grátis (Trial):** $5 de crédito grátis/mês
- **Plano Developer:** $5/mês fixo + usage
- **Estimativa HarvestPilot:**
  - Backend: ~$2-3/mês
  - Frontend: ~$1-2/mês
  - PostgreSQL: ~$3-5/mês
  - **Total: ~$6-10/mês**

**Como reduzir custos:**
- Usar plano grátis durante desenvolvimento/testes
- Fazer scale down em ambientes de staging

---

## 🐛 Troubleshooting

### Backend não inicia

**Erro:** `Cannot find module '@nestjs/core'`

**Solução:** Verificar se `nixpacks.toml` tem `npm ci` em vez de `npm install`

---

### Frontend não conecta ao Backend

**Erro:** `Network Error` ou `CORS`

**Soluções:**
1. Verificar `NEXT_PUBLIC_API_URL` no frontend
2. Verificar CORS no backend (apps/backend/src/main.ts):
   ```typescript
   app.enableCors({
     origin: ['https://frontend-production-yyyy.up.railway.app'],
     credentials: true,
   });
   ```

---

### Migrações falham

**Erro:** `relation "xxx" already exists`

**Solução:** Não apagar a base de dados nem usar `prisma db push --accept-data-loss`. Criar e rever uma migração Prisma de correção, aplicá-la em staging e depois executar:
```bash
railway run --service backend npm run migrate:deploy
```

---

### Imagens de satélite não carregam

**Causas:**
1. `SENTINEL_HUB_*` variáveis incorretas
2. Conta Sentinel Hub sem créditos
3. CORS bloqueado

**Verificar logs do backend** para ver erros específicos.

---

## 📚 Comandos Úteis

```bash
# Ver logs em tempo real
railway logs --service backend
railway logs --service frontend

# Executar comando no serviço
railway run --service backend npm run migrate:deploy

# Conectar à base de dados
railway connect postgres

# Fazer rollback de deployment
railway rollback --service backend

# Ver variáveis de ambiente
railway variables
```

---

## 🔄 Workflow de Desenvolvimento

### Ambiente Local → Staging → Production

1. **Local:** Desenvolver e testar localmente
2. **Commit:** `git add . && git commit -m "feat: ..."`
3. **Push:** `git push origin main`
4. **Railway:** Faz deploy automático
5. **Testar:** Verificar em produção

### Rollback se necessário

```bash
railway rollback --service backend
railway rollback --service frontend
```

---

## ✅ Checklist Final

- [ ] Base de dados PostgreSQL criada
- [ ] Backend deployado com variáveis de ambiente configuradas
- [ ] Frontend deployado com `NEXT_PUBLIC_API_URL` correto
- [ ] Migrações executadas com sucesso
- [ ] Domínio público gerado para frontend
- [ ] Domínio público gerado para backend
- [ ] CORS configurado corretamente no backend
- [ ] Aplicação testada (login, mapa, satélite, calendário)
- [ ] Logs verificados (sem erros críticos)
- [ ] (Opcional) Domínio personalizado configurado
- [ ] (Opcional) Monitoring ativado

---

## 🆘 Suporte

- **Railway Docs:** https://docs.railway.app
- **Railway Discord:** https://discord.gg/railway
- **HarvestPilot Issues:** https://github.com/flemos-design/harvest-pilot/issues

---

**Última atualização:** 2025-01-08
