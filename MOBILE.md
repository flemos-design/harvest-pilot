# 📱 HarvestPilot - Documentação Mobile (PWA + iOS + Android)

**Última atualização:** 10 de Novembro de 2025
**Versão:** 1.0.0
**Capacitor:** 7.4.4

---

## 🎯 Visão Geral

HarvestPilot é uma **Progressive Web App (PWA)** que pode ser:
1. Instalada como app web no browser
2. Empacotada como app iOS nativa
3. Empacotada como app Android nativa

Usamos **Capacitor 7** para acesso a funcionalidades nativas (câmara, GPS, push notifications).

---

## ✅ Funcionalidades Implementadas

### **PWA com suporte offline parcial**
- ✅ Service Worker com Workbox 7
- ✅ Cache estratégico (NetworkFirst para API, CacheFirst para assets)
- ✅ Background Sync para mutações suportadas
- ✅ Update notifications quando há nova versão
- ✅ Manifest.json completo com shortcuts
- ✅ Cache de tiles de mapas (OpenStreetMap)

> O `build:export` do frontend ainda não é um gate verde para Capacitor: as páginas autenticadas com rotas dinâmicas (por exemplo, `/insumos/[id]/editar`) exigem uma decisão de arquitetura antes de uma exportação estática utilizável.

### **Capacitor iOS**
- ⚠️ Plugins e configuração declarados; o projeto Xcode não está versionado neste checkout

### **Capacitor Android**
- ⚠️ Plugins e configuração declarados; o projeto Android não está versionado neste checkout

### **Plugins Nativos**
- ✅ **Camera API** - Tirar fotos e escolher da galeria
- ✅ **Geolocation API** - GPS com alta precisão e tracking
- ✅ **Push Notifications API** - FCM (Android) + APNs (iOS)
- ✅ **Filesystem API** - Acesso ao sistema de ficheiros
- ✅ **Share API** - Partilhar conteúdo

---

## 🚀 Comandos Disponíveis

### **Desenvolvimento Web**
```bash
cd apps/frontend
npm run dev              # Dev server (localhost:3000)
npm run build            # Build SSR para web
npm run build:web        # Alias para build
```

### **Build para Capacitor (Estático)**
```bash
npm run build:export     # Build estático para out/
npm run capacitor:build  # Build + sync com iOS/Android
npm run capacitor:sync   # Sync código web com apps nativas
```

### **iOS**
```bash
npm run capacitor:open:ios        # Abrir Xcode
npm run capacitor:run:ios         # Build + sync + run no simulator
```

### **Android**
```bash
npm run capacitor:open:android    # Abrir Android Studio
npm run capacitor:run:android     # Build + sync + run no emulator
```

### **Gestão**
```bash
npm run capacitor:update          # Atualizar Capacitor plugins
```

---

## 📂 Estrutura de Ficheiros

```
apps/frontend/
├── src/
│   ├── components/
│   │   └── SWUpdateNotification.tsx    # Notificação de updates do SW
│   ├── lib/
│   │   └── capacitor/
│   │       ├── camera.ts               # Wrapper Camera API
│   │       ├── geolocation.ts          # Wrapper Geolocation API
│   │       └── push.ts                 # Wrapper Push Notifications
│   ├── hooks/
│   │   ├── use-camera.ts               # Hook React para câmara
│   │   └── use-geolocation.ts          # Hook React para GPS
│   └── app/
│       └── layout.tsx                  # SW update notification integrado
├── public/
│   ├── manifest.json                   # PWA manifest
│   ├── sw.js                           # Service Worker (gerado)
│   ├── offline-fallback.json           # Fallback offline
│   └── icons/                          # Ícones PWA (8 tamanhos)
├── ios/                                # Projeto Xcode (criado por Capacitor)
├── android/                            # Projeto Android (criado por Capacitor)
├── capacitor.config.ts                 # Config Capacitor
├── next.config.js                      # Config Next.js + PWA
└── package.json                        # Scripts e deps
```

---

## 🔧 Configuração PWA

### **next.config.js - Workbox Runtime Caching**

```javascript
runtimeCaching: [
  // API - NetworkFirst (cache 24h)
  {
    urlPattern: /\/api\/v1\/(parcelas|operacoes|culturas)/,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'api-data-cache',
      expiration: { maxAgeSeconds: 24 * 60 * 60 },
      networkTimeoutSeconds: 10,
    },
  },
  // POST/PUT/DELETE - Background Sync
  {
    urlPattern: /\/api\/v1\/(parcelas|operacoes)/,
    method: 'POST',
    handler: 'NetworkOnly',
    options: {
      backgroundSync: {
        name: 'api-queue',
        options: { maxRetentionTime: 24 * 60 }, // 24h
      },
    },
  },
  // Map tiles - CacheFirst (30 dias)
  {
    urlPattern: /tile\.openstreetmap\.org/,
    handler: 'CacheFirst',
    options: {
      cacheName: 'map-tiles-cache',
      expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
    },
  },
]
```

### **manifest.json**
```json
{
  "name": "HarvestPilot - Gestão Agrícola Inteligente",
  "short_name": "HarvestPilot",
  "display": "standalone",
  "start_url": "/",
  "theme_color": "#22c55e",
  "background_color": "#dcfce7",
  "orientation": "portrait-primary",
  "categories": ["productivity", "business", "agriculture"],
  "shortcuts": [
    { "name": "Dashboard", "url": "/dashboard", "icons": [...] },
    { "name": "Mapa", "url": "/mapa", "icons": [...] },
    { "name": "Tarefas", "url": "/operacoes", "icons": [...] },
    { "name": "Calendário", "url": "/calendario", "icons": [...] }
  ]
}
```

---

## 📸 Como Usar a Câmara

### **Hook React**
```typescript
import { useCamera } from '@/hooks/use-camera';

function MyComponent() {
  const { photo, base64, isLoading, takePicture, clearPhoto } = useCamera();

  const handleTakePhoto = async () => {
    await takePicture({ quality: 90, allowEditing: true });
  };

  return (
    <div>
      <button onClick={handleTakePhoto} disabled={isLoading}>
        {isLoading ? 'Tirando foto...' : 'Tirar Foto'}
      </button>
      {photo && <img src={photo.webPath} alt="Preview" />}
      {base64 && <p>Base64: {base64.slice(0, 50)}...</p>}
    </div>
  );
}
```

### **API Direto**
```typescript
import { takePicture, photoToBase64 } from '@/lib/capacitor/camera';

const photo = await takePicture({ quality: 90 });
const base64 = await photoToBase64(photo);

// Upload para backend
await uploadPhoto(base64);
```

---

## 📍 Como Usar Geolocalização

### **Hook React**
```typescript
import { useGeolocation } from '@/hooks/use-geolocation';

function MyComponent() {
  const { position, isLoading, getCurrentPosition } = useGeolocation();

  const handleGetLocation = async () => {
    await getCurrentPosition();
  };

  return (
    <div>
      <button onClick={handleGetLocation} disabled={isLoading}>
        Obter GPS
      </button>
      {position && (
        <p>
          Lat: {position.latitude.toFixed(6)}, Lon: {position.longitude.toFixed(6)}
        </p>
      )}
    </div>
  );
}
```

### **Tracking Contínuo**
```typescript
const { startTracking, stopTracking, isTracking } = useGeolocation();

// Iniciar tracking
await startTracking();

// Parar tracking
stopTracking();
```

---

## 🔔 Push Notifications

### **Inicializar** (em `app/layout.tsx` ou Provider)
```typescript
import { initializePushNotifications } from '@/lib/capacitor/push';

useEffect(() => {
  initializePushNotifications({
    onRegistration: (token) => {
      console.log('Push token:', token);
      // Enviar token para backend
      api.registerPushToken(token);
    },
    onNotificationReceived: (notification) => {
      console.log('Notificação recebida:', notification);
    },
    onNotificationActionPerformed: (action) => {
      console.log('Ação na notificação:', action);
      // Navegar para página relevante
      router.push(action.notification.data.url);
    },
  });
}, []);
```

---

## 🏗️ Build e Deploy

### **1. Build Estático**
```bash
cd apps/frontend
BUILD_MODE=export npm run build
```

Isto gera pasta `out/` com ficheiros estáticos.

### **2. Sync com Capacitor**
```bash
npx cap sync
```

Copia ficheiros de `out/` para `ios/` e `android/`.

### **3. iOS - Xcode**
```bash
npx cap open ios
```

Em Xcode:
1. Selecionar target "App"
2. Signing & Capabilities → Team (Apple Developer Account)
3. Build → Run (⌘R)

### **4. Android - Android Studio**
```bash
npx cap open android
```

Em Android Studio:
1. Build → Make Project
2. Run → Run 'app' (Shift+F10)

---

## 🔐 Permissões

### **iOS (Info.plist)**
```xml
<key>NSCameraUsageDescription</key>
<string>HarvestPilot precisa de acesso à câmara para tirar fotos de operações</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>HarvestPilot precisa de acesso às fotos para escolher imagens</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>HarvestPilot precisa de acesso à localização para GPS de operações</string>

<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>HarvestPilot precisa de acesso à localização para tracking de parcelas</string>
```

### **Android (AndroidManifest.xml)**
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
```

---

## 🧪 Testar Offline

### **Chrome DevTools**
1. Abrir DevTools (F12)
2. Application → Service Workers → Verificar SW ativo
3. Network → Throttling → Offline
4. Testar navegação e criação de operações
5. Voltar Online → Sync automático

### **iOS Simulator**
```bash
npm run capacitor:run:ios
```

No simulador:
- Settings → Developer → Network Link Conditioner → Very Bad Network

### **Android Emulator**
```bash
npm run capacitor:run:android
```

No emulador:
- Settings → Network & Internet → Airplane mode

---

## 📊 Status de Implementação

| Feature | PWA Web | iOS | Android | Notas |
|---------|---------|-----|---------|-------|
| **Offline** | 🟡 | 🟡 | 🟡 | Mutações em fila; leitura offline completa pendente |
| **SW Update Notification** | ✅ | ✅ | ✅ | Toast com "Atualizar agora" |
| **Câmara** | 🟡 | ✅ | ✅ | Web usa file input fallback |
| **GPS** | 🟡 | ✅ | ✅ | Web usa HTML5 Geolocation |
| **Push Notifications** | ⚠️ | ⚠️ | ⚠️ | Requer configuração FCM/APNs |
| **Background Sync** | 🟡 | 🟡 | 🟡 | Aplicado às mutações suportadas |
| **Map tiles cache** | ✅ | ✅ | ✅ | 200 tiles, 30 dias |
| **API cache** | ✅ | ✅ | ✅ | NetworkFirst, 24h |

**Legenda:**
- ✅ Completo e funcional
- 🟡 Funcional com limitações
- ⚠️ Configuração adicional necessária
- ❌ Não implementado

---

## 🚧 Próximos Passos

### **Fase 7 - Push Notifications**
- [ ] Configurar Firebase Cloud Messaging (FCM)
- [ ] Configurar Apple Push Notification Service (APNs)
- [ ] Backend: Endpoint para enviar notificações
- [ ] Testar notificações em device real

### **Fase 8 - Integração Completa**
- [ ] Integrar câmara em `operacoes/nova/page.tsx`
- [ ] Integrar GPS em formulários de parcelas
- [ ] Upload de fotos para MinIO/S3
- [ ] Galeria de fotos em detalhes de operação

### **Melhorias Futuras**
- [ ] App Shell architecture
- [ ] Pré-cache de rotas principais
- [ ] Otimização de imagens com Next Image
- [ ] Lazy loading de componentes pesados
- [ ] E2E tests com Playwright (PWA offline)

---

## 📚 Recursos

- [Capacitor Docs](https://capacitorjs.com/docs)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [next-pwa](https://github.com/shadowwalker/next-pwa)

---

**HarvestPilot Mobile** - PWA Offline-First + Apps Nativas 🌾📱
