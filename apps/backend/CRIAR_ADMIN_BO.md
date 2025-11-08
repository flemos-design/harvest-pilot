# 🔐 Criar Utilizador Admin BO em Produção

## Credenciais

- **Email:** `bo@harvestpilot.com`
- **Password:** `#Mdk2477FL2025!` (encriptada com bcrypt)
- **Papel:** `ADMIN`
- **Organização:** `HarvestPilot Admin` (criada automaticamente se não existir)

## Como Executar em Produção

### Opção 1: Via Railway CLI (Recomendado)

```bash
# 1. Instalar Railway CLI (se ainda não tiver)
npm install -g @railway/cli

# 2. Fazer login no Railway
railway login

# 3. Ligar ao projeto correto
railway link

# 4. Executar o script em produção
railway run npx ts-node src/scripts/create-admin-bo.ts
```

### Opção 2: Via Railway Web Console

1. Aceder ao dashboard do Railway: https://railway.app
2. Selecionar o projeto **HarvestPilot**
3. Selecionar o serviço **backend**
4. Ir para a tab **"Deployments"**
5. Clicar no deployment mais recente
6. Clicar em **"View Logs"** e depois em **"Shell"**
7. Executar:
   ```bash
   cd /app/apps/backend
   npx ts-node src/scripts/create-admin-bo.ts
   ```

### Opção 3: Localmente com DATABASE_URL de Produção (Cuidado!)

```bash
# 1. Ir para o backend
cd apps/backend

# 2. Exportar DATABASE_URL de produção
export DATABASE_URL="postgresql://postgres:xxx@xxx.railway.app:xxx/railway"

# 3. Executar script
npx ts-node src/scripts/create-admin-bo.ts
```

⚠️ **ATENÇÃO:** Esta opção acede diretamente à base de dados de produção!

## Verificar se Funcionou

### Via Swagger API

1. Abrir https://api.harvestpilot.online/api/docs
2. Tentar fazer login com as credenciais (se houver endpoint de auth)

### Via Prisma Studio (Local apontando para Produção)

```bash
cd apps/backend
export DATABASE_URL="postgresql://..."
npx prisma studio
```

### Via SQL Direto (Railway Console)

```sql
SELECT id, email, nome, papel, created_at
FROM utilizadores
WHERE email = 'bo@harvestpilot.com';
```

## Segurança

- ✅ Password encriptada com **bcrypt** (10 rounds)
- ✅ Não existe em código (apenas neste script de setup)
- ✅ Script verifica se já existe antes de criar
- ✅ Hash nunca é exposto nos logs

## Troubleshooting

### Erro: "Utilizador já existe"

O script não cria duplicados. Se o utilizador já existir, mostra os dados existentes.

Para recriar:
1. Eliminar o utilizador existente
2. Executar o script novamente

```sql
DELETE FROM utilizadores WHERE email = 'bo@harvestpilot.com';
```

### Erro: "PrismaClient initialization failed"

Verificar se `DATABASE_URL` está configurado corretamente no Railway.

### Erro: "bcryptjs not found"

```bash
cd apps/backend
npm install bcryptjs @types/bcryptjs
```

## Password Hash Exemplo

Para referência, o hash bcrypt da password `#Mdk2477FL2025!` será algo como:

```
$2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

O hash real será diferente em cada execução devido ao salt aleatório.
