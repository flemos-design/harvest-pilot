# 🎨 Integração do Logotipo HarvestPilot

Este documento descreve a integração do logotipo HarvestPilot no projeto.

## ✅ Integração Completa

### Frontend (`apps/frontend`)

#### 1. Logotipo Copiado
- **Localização:** `/public/logo.png`
- **Formato:** PNG (fundo transparente)
- **Dimensões:** 400x120px (largura x altura aproximada)

#### 2. Homepage (`src/app/page.tsx`)
- ✅ Substituído ícone `<Sprout>` por `<Image>` com logotipo
- ✅ Logotipo com 400x120px
- ✅ `priority` loading para melhor performance
- ✅ h1 mantido com `sr-only` para acessibilidade (SEO)
- ✅ Corrigida porta do frontend na documentação: `3000` → `3003`

```tsx
<Image
  src="/logo.png"
  alt="HarvestPilot Logo"
  width={400}
  height={120}
  priority
  className="h-auto"
/>
```

#### 3. Navbar (`src/components/Navbar.tsx`)
- ✅ Substituído ícone `<Sprout>` e texto por logotipo
- ✅ Logotipo reduzido (180x40px) para navbar
- ✅ Hover effect com opacity
- ✅ Link para homepage

```tsx
<Link href="/" className="flex items-center hover:opacity-80 transition">
  <Image
    src="/logo.png"
    alt="HarvestPilot"
    width={180}
    height={40}
    priority
    className="h-8 w-auto"
  />
</Link>
```

### Backend (`apps/backend`)

#### 1. Logotipo Copiado
- **Localização:** `/public/logo.png`
- **Mesmo ficheiro do frontend**

#### 2. Configuração Ficheiros Estáticos (`src/main.ts`)
- ✅ Configurado `NestExpressApplication` para servir ficheiros estáticos
- ✅ Pasta `public` acessível via `/public/` URL

```typescript
app.useStaticAssets(join(__dirname, '..', 'public'), {
  prefix: '/public/',
});
```

#### 3. Swagger UI Customizado
- ✅ Título customizado: "HarvestPilot API Docs"
- ✅ Favicon customizado: logotipo
- ✅ CSS customizado para mostrar logotipo no header
- ✅ Border verde (#22c55e) na topbar

```typescript
SwaggerModule.setup('api/docs', app, document, {
  customSiteTitle: 'HarvestPilot API Docs',
  customfavIcon: '/public/logo.png',
  customCss: `
    .topbar-wrapper img { content: url('/public/logo.png'); width: 200px; height: auto; }
    .swagger-ui .topbar { background-color: #ffffff; border-bottom: 2px solid #22c55e; }
  `,
});
```

## ⚠️ Tarefas Pendentes

### Favicons e App Icons

O logotipo atual está integrado, mas ainda falta criar versões otimizadas para favicons e app icons:

#### Frontend
- `public/favicon.ico` - Favicon (16x16, 32x32, 48x48)
- `public/icon-192.png` - PWA icon 192x192
- `public/icon-512.png` - PWA icon 512x512

#### Backend
- `public/favicon.ico` - Favicon para Swagger

### Como Criar os Favicons

Podes usar ferramentas online como:
- **RealFaviconGenerator:** https://realfavicongenerator.net/
- **Favicon.io:** https://favicon.io/

**Passos:**
1. Upload do logotipo `/apps/frontend/public/logo.png`
2. Configurar estilos e plataformas (Web App, iOS, Android)
3. Download do pacote gerado
4. Copiar ficheiros para:
   - Frontend: `/apps/frontend/public/`
   - Backend: `/apps/backend/public/`

### Metadata a Atualizar (Frontend)

Depois de criar os favicons, atualizar `src/app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: 'HarvestPilot - Gestão Agrícola Inteligente',
  description: 'Plataforma de Gestão de Parcelas & Calendário Agrícola para Espinhosela, Bragança',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  // ... resto da config
};
```

## 📍 Onde o Logotipo Aparece

### Frontend
✅ **Homepage** (http://localhost:3003)
- Logotipo grande centralizado

✅ **Navbar** (todas as páginas exceto homepage)
- Logotipo pequeno no canto superior esquerdo
- Visível em: Dashboard, Mapa, Parcelas, Calendário, etc.

### Backend
✅ **Swagger UI** (http://localhost:3001/api/docs)
- Logotipo no header da documentação
- Favicon na tab do browser (após criar .ico)

## 🎨 Design System

### Cores do Logotipo
- **Azul Médio:** Pin de localização
- **Azul Escuro:** Folhas/agricultura
- **Branco:** Fundo transparente

### Cores do Projeto (Tailwind)
- **Verde Principal:** `#22c55e` (green-600)
- **Verde Claro:** `#10b981` (green-500)
- **Verde Hover:** `#16a34a` (green-700)

## 📝 Notas Técnicas

### Next.js Image Optimization
- Logotipo é otimizado automaticamente pelo Next.js
- `priority` garante carregamento rápido
- `width` e `height` previnem layout shift (CLS)

### Acessibilidade
- Atributo `alt` descritivo em todas as imagens
- h1 com `sr-only` mantém semântica HTML para screen readers

### Performance
- Logotipo PNG (não SVG) para compatibilidade máxima
- Tamanhos específicos para cada contexto (400px, 180px)

## 🔧 Manutenção

Se precisares de atualizar o logotipo:
1. Substituir `/apps/frontend/public/logo.png`
2. Copiar para `/apps/backend/public/logo.png`
3. Regenerar favicons com novo logotipo
4. Limpar cache do browser (Ctrl+F5)

## ✅ Checklist de Integração

- [x] Copiar logotipo para frontend/public
- [x] Atualizar homepage
- [x] Atualizar navbar
- [x] Copiar logotipo para backend/public
- [x] Configurar static assets no backend
- [x] Customizar Swagger UI
- [x] Corrigir porta na documentação (3000 → 3003)
- [ ] Criar favicon.ico
- [ ] Criar icon-192.png
- [ ] Criar icon-512.png
- [ ] Atualizar metadata no layout.tsx
- [ ] Testar PWA install

---

**Data:** 2025-11-08
**Versão:** 0.1.0
**Status:** ✅ Integração Básica Completa | ⚠️ Favicons Pendentes
