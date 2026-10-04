# 🧪 Testes de Produção - HarvestPilot

Testes E2E automatizados com Playwright para validar domínios em produção.

## 📋 O que é testado

### ✅ Backend API (`api.harvestpilot.online`)
- Root endpoint retorna informação correta da API
- Health endpoint retorna status "ok" em produção
- Performance: resposta em < 2 segundos
- CORS configurado para frontend BO e APP
- Certificados SSL válidos

### ✅ Frontend BO (`bo.harvestpilot.online`)
- Carrega página HTML (não JSON da API)
- Página de login renderiza corretamente
- Campos de email e password visíveis
- Performance: carregamento em < 5 segundos
- Certificados SSL válidos

### ✅ Frontend APP (`app.harvestpilot.online`)
- Carrega página HTML
- Página de login renderiza corretamente
- Campos de email e password visíveis
- Certificados SSL válidos

### ✅ API Docs (`api.harvestpilot.online/api/docs`)
- Swagger UI carrega corretamente

## 🚀 Como executar

### Executar todos os testes:
```bash
npm run test:production
```

### Executar com interface visual:
```bash
npx playwright test --ui
```

### Ver relatório de testes anteriores:
```bash
npx playwright show-report
```

## 📊 Resultados Esperados

- **Taxa de sucesso:** 100% dos smoke checks executados
- **Performance API:** < 500ms (target: < 2s)
- **Performance Frontend:** < 3s (target: < 5s)
- **CORS:** Todos os domínios aceites
- **SSL:** Todos os certificados válidos

## 📁 Ficheiros

- `production.spec.ts` - Testes E2E de produção
- `playwright.config.ts` - Configuração do Playwright

## 🔄 Quando executar

- Após deploy em produção
- Após alterações na configuração de domínios
- Após alterações nas variáveis de ambiente
- Semanalmente (validação contínua)

## 📝 Notas

Os testes validam apenas disponibilidade e configuração básica dos domínios:
```
bo.harvestpilot.online  → Frontend Next.js
app.harvestpilot.online → Frontend Next.js
api.harvestpilot.online → Backend NestJS API
```

Estes testes não comprovam login, CRUD protegido, isolamento entre organizações,
permissões, upload, push notifications, sincronização offline ou integração Sentinel.
Esses fluxos continuam a exigir testes autenticados próprios antes de um release.

**Última execução bem-sucedida:** 8 Nov 2025 - 9/10 testes ✅
