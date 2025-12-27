# Documentación Completa - Verificador de Documentos Digitales

## 📋 Índice
1. [Descripción General](#descripción-general)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Tecnologías Utilizadas](#tecnologías-utilizadas)
4. [Componentes](#componentes)
5. [Hooks Personalizados](#hooks-personalizados)
6. [Utilidades](#utilidades)
7. [Contextos](#contextos)
8. [Flujo de la Aplicación](#flujo-de-la-aplicación)
9. [Características Principales](#características-principales)

---

## 📖 Descripción General

**Verificador de Documentos Digitales** es una aplicación Web3 que permite:
- Firmar documentos usando ECDSA (Elliptic Curve Digital Signature Algorithm)
- Verificar la autenticidad de firmas digitales
- Almacenar documentos firmados localmente
- Gestionar una biblioteca de documentos
- Exportar datos de verificación en múltiples formatos

**Características de Seguridad:**
- Firmas ECDSA sin blockchain (cálculo local)
- Almacenamiento seguro en localStorage
- Recuperación de dirección del firmante desde la firma
- Hash criptográfico de documentos (Keccak256 y SHA-256)
- Validación de integridad de documentos

---

## 📁 Estructura del Proyecto

```
documentSignStorage/
├── dapp/                          # Aplicación Next.js
│   ├── app/
│   │   ├── page.tsx              # Página principal con pestañas
│   │   ├── layout.tsx            # Layout global
│   │   └── globals.css           # Estilos globales
│   │
│   ├── components/               # Componentes React
│   │   ├── DocumentSigner.tsx    # Componente de firma
│   │   ├── DocumentVerifier.tsx  # Componente de verificación
│   │   ├── DocumentLibrary.tsx   # Biblioteca de documentos
│   │   ├── FileUploader.tsx      # Cargador de archivos
│   │   ├── MultiDocumentSigner.tsx # Firma múltiple
│   │   ├── WalletSelector.tsx    # Selector de wallet
│   │   ├── CopyButton.tsx        # Botón copiar al portapapeles
│   │   ├── ExportVerificationModal.tsx # Modal de exportación
│   │   └── index.ts              # Exportaciones
│   │
│   ├── hooks/                    # Hooks personalizados
│   │   ├── useFileHash.ts        # Cálculo de hash de archivo
│   │   ├── useContract.ts        # Interacción con contrato (mock)
│   │   └── useMetaMask.ts        # Integración con MetaMask
│   │
│   ├── contexts/                 # React Contexts
│   │   ├── MetaMaskContext.tsx   # Contexto de MetaMask
│   │   ├── MetaMaskContext.mock.tsx # Mock de MetaMask
│   │   └── ToastContext.tsx      # Contexto de notificaciones
│   │
│   ├── utils/                    # Funciones utilitarias
│   │   ├── signatureUtils.ts     # Firma y verificación ECDSA
│   │   ├── documentStorage.ts    # Gestión de localStorage
│   │   ├── ethers.ts             # Utilidades de ethers.js
│   │   └── constants.ts          # Constantes globales
│   │
│   └── public/                   # Archivos estáticos
│
├── contracts/                    # Contratos Solidity
│   └── DocumentRegistry.sol      # Contrato (no activo)
│
└── script/
    └── Deploy.s.sol              # Script de deployment

```

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **Next.js** | 14.2+ | Framework React con SSR |
| **React** | 18+ | Biblioteca de UI |
| **TypeScript** | Última | Type safety |
| **Tailwind CSS** | Última | Estilos CSS |
| **Ethers.js** | v6 | Interacción Web3 y criptografía |
| **Lucide React** | Última | Iconografía |
| **Solidity** | 0.8.20 | Contratos inteligentes |
| **Foundry** | Última | Testing y deployment |

---

## 🧩 Componentes

### 1. **page.tsx** - Página Principal
**Ubicación:** `dapp/app/page.tsx`

**Responsabilidades:**
- Gestionar el estado global de la aplicación (documento cargado, pestaña activa)
- Renderizar las 4 pestañas principales
- Pasar props a componentes secundarios
- Manejar eventos de carga de documentos y cambios de pestaña

**Variables de Estado:**
```typescript
- documentHash: Hash del documento cargado
- fileName: Nombre del archivo cargado
- activeTab: Pestaña actual ('sign' | 'multi' | 'verify' | 'library')
- preloadedDocument: Documento precargado desde biblioteca
```

**Estructura:**
- Header con logo y WalletSelector
- Navegación de pestañas
- Contenido dinámico según pestaña activa

---

### 2. **FileUploader.tsx** - Cargador de Archivos
**Ubicación:** `dapp/components/FileUploader.tsx`

**Responsabilidades:**
- Permitir carga de archivos mediante click o drag & drop
- Calcular hash del archivo
- Detectar si el documento ya está firmado
- Mostrar información del archivo cargado

**Funciones Principales:**
```typescript
handleFileChange()      // Procesa archivo del input
handleDrag()           // Maneja eventos de arrastre
handleDrop()           // Procesa archivo arrastrado
processFile()          // Calcula hash y busca documento
```

**Props:**
```typescript
onHashCalculated?      // Callback con hash y nombre
onSignedDocumentFound? // Callback si documento existe
onClearExistingDocument? // Callback para limpiar
```

---

### 3. **DocumentSigner.tsx** - Componente de Firma
**Ubicación:** `dapp/components/DocumentSigner.tsx`

**Responsabilidades:**
- Firmar documentos con la cuenta MetaMask conectada
- Prevenir firma múltiple del mismo documento
- Guardar documentos firmados en biblioteca
- Mostrar firma y permitir copiar

**Funciones Principales:**
```typescript
handleSign()           // Firma el documento
handleStore()          // Guarda en biblioteca
handleClear()          // Limpia el formulario
```

**Validaciones:**
- ✅ Wallet debe estar conectada
- ✅ Verificar si documento ya está firmado
- ✅ Validar que hay mensaje y documento
- ✅ Mostrar aviso si documento existe

**Estados:**
```typescript
- signature: Firma ECDSA (0x...)
- signedMessage: Mensaje que fue firmado
- isLoading: Mientras se firma
- isSaving: Mientras se guarda
- isSaved: Confirmación de guardado
- isAlreadySigned: Si documento ya existe
```

---

### 4. **DocumentVerifier.tsx** - Componente de Verificación
**Ubicación:** `dapp/components/DocumentVerifier.tsx`

**Responsabilidades:**
- Permitir carga de archivos a verificar
- Detectar automáticamente si archivo está firmado
- Permitir ingreso manual de firma y mensaje
- Verificar autenticidad de la firma
- Mostrar dirección del firmante

**Funciones Principales:**
```typescript
processFile()          // Procesa archivo cargado
handleFileChange()     // Maneja cambio de input
handleDrag()          // Maneja drag & drop
handleDrop()          // Procesa archivo soltado
handleVerify()        // Verifica la firma
handleClear()         // Limpia formularios
```

**Características:**
- Auto-detección de documentos firmados
- Carga automática de datos si encuentra documento
- Recuperación de dirección firmante desde firma
- Exportación de datos de verificación
- Limpieza automática al cambiar pestaña

---

### 5. **DocumentLibrary.tsx** - Biblioteca de Documentos
**Ubicación:** `dapp/components/DocumentLibrary.tsx`

**Responsabilidades:**
- Mostrar lista de todos los documentos firmados
- Filtrar y buscar documentos
- Ordenar por fecha o nombre
- Descargar documentos individuales
- Eliminar documentos (solo el firmante)

**Funciones Principales:**
```typescript
loadDocuments()        // Carga todos los documentos
handleDelete()         // Inicia proceso de eliminación
confirmDelete()        // Confirma eliminación
handleDownload()       // Descarga documento como JSON
```

**Filtros Disponibles:**
- 🔍 Búsqueda por nombre, hash o dirección
- 📅 Rango de fechas (desde - hasta)
- 👤 Solo mis documentos (filtra por wallet)
- 📊 Ordenar por: Más reciente, Más antiguo, Nombre A-Z

**Botones por Documento:**
- 📋 Copiar Firma (azul)
- ⬇️ Descargar (verde) - Descarga JSON del documento
- 🗑️ Eliminar (rojo/gris) - Solo si eres el firmante

---

### 6. **MultiDocumentSigner.tsx** - Firma Múltiple
**Ubicación:** `dapp/components/MultiDocumentSigner.tsx`

**Responsabilidades:**
- Permitir selección de múltiples archivos
- Firmar todos en lote
- Guardar todos simultáneamente
- Mostrar progreso de operación

**Funciones Principales:**
```typescript
handleDrop()           // Procesa múltiples archivos
handleFileSelect()     // Carga archivos del input
signAll()             // Firma todos los documentos
saveAll()             // Guarda todos en biblioteca
```

**Características:**
- Drag & drop para múltiples archivos
- Indicador de progreso
- Contadores de firmados/guardados
- Modal de confirmación antes de guardar
- Validación de cada documento

---

### 7. **WalletSelector.tsx** - Selector de Wallet
**Ubicación:** `dapp/components/WalletSelector.tsx`

**Responsabilidades:**
- Conectar/desconectar MetaMask
- Mostrar wallet conectada
- Mostrar saldo
- Selector de red

**Modos:**
- **Real:** Conecta a MetaMask real
- **Mock:** 10 wallets simuladas para testing

---

### 8. **CopyButton.tsx** - Botón Copiar
**Ubicación:** `dapp/components/CopyButton.tsx`

**Responsabilidades:**
- Copiar texto al portapapeles
- Mostrar feedback visual
- Formatar direcciones largas

**Funciones:**
```typescript
formatAddress()        // Acorta direcciones (0x123...abc)
AddressDisplay         // Componente para mostrar direcciones
```

---

### 9. **ExportVerificationModal.tsx** - Modal de Exportación
**Ubicación:** `dapp/components/ExportVerificationModal.tsx`

**Responsabilidades:**
- Permitir exportación en 3 formatos
- Mostrar preview del contenido
- Descargar o copiar al portapapeles

**Formatos Soportados:**
- 📄 **JSON** - Objeto completo serializado
- 📝 **TXT** - Formato legible para humanos
- 📊 **CSV** - Para hojas de cálculo

---

## 🎣 Hooks Personalizados

### 1. **useFileHash.ts**
**Ubicación:** `dapp/hooks/useFileHash.ts`

**Propósito:** Calcular hashes criptográficos de archivos

**Funciones:**
```typescript
calculateHash(file)    // Calcula keccak256 y SHA-256
reset()               // Limpia el estado
```

**Retorna:**
```typescript
{
  fileName: string              // Nombre del archivo
  fileSize: number              // Tamaño en bytes
  sha256Hash: string            // Hash SHA-256
  keccak256Hash: string         // Hash Keccak256
  loading: boolean              // Mientras calcula
  error: string | null          // Mensaje de error
  calculateHash: (file) => Promise
  reset: () => void
}
```

**Detalles Técnicos:**
- Usa **ethers.js** para Keccak256
- Usa **Web Crypto API** para SHA-256
- Procesa archivos completamente en el navegador
- Sin envío a servidores

---

### 2. **useMetaMask.ts**
**Ubicación:** `dapp/hooks/useMetaMask.ts`

**Propósito:** Gestionar conexión y operaciones con MetaMask/Wallets

**Funciones:**
```typescript
connectWallet()        // Conecta a MetaMask
disconnectWallet()     // Desconecta
signMessage(message)   // Firma un mensaje
switchNetwork(chainId) // Cambia de red
```

**Retorna:**
```typescript
{
  account: string | null         // Dirección de wallet
  isConnected: boolean           // Si está conectada
  balance: string                // Saldo en ETH
  chainId: number                // ID de la red
  chainName: string              // Nombre de la red
  connectWallet: () => Promise
  disconnectWallet: () => void
  signMessage: (msg) => Promise<string>
  switchNetwork: (chainId) => Promise
}
```

---

### 3. **useContract.ts**
**Ubicación:** `dapp/hooks/useContract.ts`

**Propósito:** Interacción con contrato inteligente (desactivado, modo mock)

**Nota:** El contrato no está deployado. La aplicación funciona completamente con criptografía local.

---

## 🔧 Utilidades

### 1. **signatureUtils.ts**
**Ubicación:** `dapp/utils/signatureUtils.ts`

**Funciones:**

#### `recoverSignerAddress(message, signature)`
```typescript
// Recupera la dirección de la billetera que firmó el mensaje
// Usa ECDSA recovery (ethers.recoverAddress)
const address = recoverSignerAddress(
  "Firmar documento: file.pdf...",
  "0x1234..."
);
// Retorna: "0x742d35Cc6634C0532925a3b844Bc9e7595f42bE"
```

#### `verifySignature(message, signature, expectedAddress)`
```typescript
// Verifica si la firma es válida para el mensaje y dirección
const isValid = verifySignature(
  "Firmar documento: file.pdf...",
  "0x1234...",
  "0x742d..."
);
// Retorna: boolean
```

---

### 2. **documentStorage.ts**
**Ubicación:** `dapp/utils/documentStorage.ts`

**Interfaz SignedDocument:**
```typescript
{
  id: string              // ID único
  fileName: string        // Nombre original del archivo
  fileHash: string        // Keccak256 del archivo
  message: string         // Mensaje que se firmó
  signature: string       // Firma ECDSA
  signerAddress: string   // Dirección del firmante
  timestamp: number       // Timestamp de creación
  createdAt: string       // Fecha formateada
}
```

**Funciones CRUD:**

#### `saveSignedDocument(fileName, fileHash, message, signature)`
```typescript
// Guarda un documento firmado en localStorage
const doc = saveSignedDocument(
  "documento.pdf",
  "0xabcd...",
  "Firmar documento: documento.pdf...",
  "0x1234..."
);
```

#### `getSignedDocuments()`
```typescript
// Obtiene todos los documentos guardados
const docs = getSignedDocuments(); // SignedDocument[]
```

#### `getDocumentByFileHash(fileHash)`
```typescript
// Busca un documento por su hash
const doc = getDocumentByFileHash("0xabcd...");
```

#### `deleteSignedDocument(id)`
```typescript
// Elimina un documento por su ID
deleteSignedDocument("doc_123456");
```

**Funciones de Filtrado:**

#### `searchDocuments(query)`
```typescript
// Busca en nombre, hash y dirección del firmante
const results = searchDocuments("archivo");
```

#### `filterDocumentsByDate(startDate, endDate)`
```typescript
// Filtra documentos por rango de fechas
const docs = filterDocumentsByDate(
  new Date("2025-01-01"),
  new Date("2025-12-31")
);
```

#### `filterDocumentsBySignatory(address)`
```typescript
// Filtra documentos de un firmante específico
const docs = filterDocumentsBySignatory("0x742d...");
```

#### `sortDocuments(docs, sortBy)`
```typescript
// Ordena documentos
// sortBy: 'date-asc' | 'date-desc' | 'name'
const sorted = sortDocuments(docs, 'date-desc');
```

**Almacenamiento:**
- Usa **localStorage** con clave: `documentSignStorage_signedDocuments`
- Datos persistentes entre sesiones
- Accesible solo en el navegador local

---

## 📡 Contextos

### 1. **ToastContext.tsx**
**Ubicación:** `dapp/contexts/ToastContext.tsx`

**Tipos de Notificaciones:**
- ✅ `success()` - Verde, confirmación
- ❌ `error()` - Rojo, error
- ℹ️ `info()` - Azul, información
- ⚠️ `warning()` - Amarillo, advertencia

**Hook de Uso:**
```typescript
const { success, error, info, warning } = useToast();

success('✓ Documento guardado');
error('✗ Error al firmar');
info('Procesando archivo...');
warning('⚠ Documento ya existe');
```

**Características:**
- Auto-dismiss después de 3 segundos
- Posición fija en pantalla
- Stack de múltiples toasts
- Estilos Tailwind integrados

---

### 2. **MetaMaskContext.tsx**
**Ubicación:** `dapp/contexts/MetaMaskContext.tsx`

**Modos:**
1. **Modo Real:** Conecta a MetaMask real del navegador
2. **Modo Mock:** Usa 10 wallets simuladas sin necesidad de extensión

**Variables Globales:**
```typescript
- account: Dirección de wallet conectada
- isConnected: Si hay wallet conectada
- balance: Saldo actual
- chainId: ID de la red blockchain
- chainName: Nombre de la red
```

---

## 📊 Flujo de la Aplicación

### Flujo 1: Firmar Documento
```
1. Usuario selecciona archivo en pestaña "Firmar Documento"
   ↓
2. FileUploader calcula hash (Keccak256)
   ↓
3. Se busca si documento ya está firmado
   ↓
4. Si existe, muestra aviso y deshabilita botón
   ↓
5. Si no existe, usuario hace click en "Firmar Documento"
   ↓
6. DocumentSigner llama a wallet.signMessage()
   ↓
7. Usuario confirma en MetaMask/Wallet
   ↓
8. Se obtiene la firma ECDSA
   ↓
9. Se recupera dirección del firmante
   ↓
10. Se muestra firma y permite copiar
   ↓
11. Usuario hace click en "Guardar en Biblioteca"
   ↓
12. Se guarda en localStorage
   ↓
13. Toast de confirmación
```

### Flujo 2: Verificar Documento
```
1. Usuario va a pestaña "Verificar Documento"
   ↓
2. Se limpia automáticamente cualquier archivo anterior
   ↓
3. Usuario carga archivo (drag & drop o click)
   ↓
4. Se calcula hash del archivo
   ↓
5. Se busca si existe en biblioteca
   ↓
6. Si existe:
   - Muestra cuadro "Documento firmado encontrado"
   - Botón "Cargar Datos de Firma" lo rellena automáticamente
   ↓
7. Usuario ingresa firma (manual o automática)
   ↓
8. Usuario ingresa mensaje (manual o automático)
   ↓
9. Usuario hace click "Verificar Firma"
   ↓
10. Se recupera dirección del firmante
   ↓
11. Se muestra:
    - ✅ Firma válida / ❌ Firma inválida
    - Dirección del firmante
    - Opción de exportar
```

### Flujo 3: Biblioteca
```
1. Usuario va a pestaña "Biblioteca"
   ↓
2. Se cargan todos los documentos de localStorage
   ↓
3. Usuario puede:
   - Buscar por nombre/hash/dirección
   - Filtrar por fecha
   - Filtrar por "solo mis documentos"
   - Ordenar por fecha o nombre
   ↓
4. Cada documento muestra:
   - Nombre del archivo
   - Hash (truncado)
   - Dirección del firmante (truncada)
   - Fecha de creación
   ↓
5. Botones de cada documento:
   - 📋 Copiar Firma
   - ⬇️ Descargar como JSON
   - 🗑️ Eliminar (solo si eres el firmante)
```

---

## ✨ Características Principales

### 1. **Firma ECDSA Local**
- ✅ Sin blockchain requerido
- ✅ Cálculo completamente en el navegador
- ✅ Recuperación de dirección desde firma
- ✅ Validación de integridad

### 2. **Almacenamiento Persistente**
- ✅ localStorage para documentos
- ✅ Datos persistentes entre sesiones
- ✅ Sin servidor necesario
- ✅ Privado en el navegador local

### 3. **Hashes Criptográficos**
- 🔐 **Keccak256** - Compatible con Ethereum
- 🔐 **SHA-256** - Estándar de seguridad

### 4. **Detección Automática**
- ✅ Detecta documentos ya firmados
- ✅ Auto-carga de datos de firma
- ✅ Validación de duplicados
- ✅ Prevención de firmas múltiples

### 5. **Interfaz Intuitiva**
- 🎨 Tailwind CSS responsive
- 🎨 Iconografía con Lucide React
- 🎨 Notificaciones Toast
- 🎨 Modales de confirmación

### 6. **Exportación de Datos**
- 📤 JSON - Formato completo
- 📤 TXT - Legible para humanos
- 📤 CSV - Para hojas de cálculo
- 📤 Descarga individual de documentos

### 7. **Gestión de Documentos**
- 🗂️ Búsqueda y filtrado
- 🗂️ Ordenamiento flexible
- 🗂️ Eliminación (solo del firmante)
- 🗂️ Descarga de documento

### 8. **Modo Mock para Testing**
- ✅ 10 wallets predefinidas
- ✅ No necesita MetaMask
- ✅ Ideal para desarrollo
- ✅ Completamente funcional

---

## 🔐 Seguridad

### Implementaciones Seguras:
1. **ECDSA Signatures** - Criptografía de curva elíptica
2. **Hash Integrity** - Verificación de integridad de archivos
3. **Address Recovery** - Validación de firmante
4. **localStorage Isolation** - Datos solo en navegador local
5. **Input Validation** - Validación en todos los puntos de entrada

### Limitaciones:
- ⚠️ No hay contrato inteligente (diseño intencional)
- ⚠️ localStorage no está encriptado (es el navegador quien lo maneja)
- ⚠️ Datos no se sincronizan entre dispositivos
- ⚠️ Máximo tamaño de archivo limitado por navegador

---

## 🚀 Guía de Uso Rápido

### Firma un Documento:
1. Ve a "Firmar Documento"
2. Carga o arrastra un archivo
3. Conecta tu wallet (o selecciona una en modo mock)
4. Haz click "Firmar Documento"
5. Confirma en tu wallet
6. Haz click "Guardar en Biblioteca"

### Verifica una Firma:
1. Ve a "Verificar Documento"
2. Carga el archivo (automáticamente detecta si está firmado)
3. Los datos se cargan automáticamente si existe
4. Haz click "Verificar Firma"
5. Ve el resultado y el firmante

### Firma Múltiples:
1. Ve a "Múltiples Documentos"
2. Arrastra varios archivos
3. Haz click en cada wallet para seleccionar
4. "Firmar Todo" - Cada archivo se firma
5. "Guardar Todo" - Se guardan todos

---

## 📝 Notas Técnicas

### Variables de Entorno:
```env
NEXT_PUBLIC_USE_MOCK=true    # Activa modo mock
```

### Dependencias Principales:
- **ethers.js v6** - ECDSA recovery y utilities
- **Next.js 14+** - Framework y SSR
- **React 18+** - UI Library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Performance:
- ⚡ Cálculo de hash en tiempo real
- ⚡ Búsqueda y filtrado instantáneos
- ⚡ Sin llamadas a servidor
- ⚡ Aplicación completamente offline

---

## 🎯 Conclusión

Esta aplicación demuestra cómo construir un sistema robusto de firma y verificación de documentos sin necesidad de blockchain. Es ideal para:
- 🎓 Aprendizaje de criptografía
- 🧪 Testing y demostración
- 🔒 Firma de documentos locales
- 📊 Auditoría de integridad de archivos
- 🎯 Base para sistemas más complejos

La arquitectura es escalable y puede extenderse fácilmente para agregar:
- Integración real con blockchain
- Autenticación de usuarios
- Almacenamiento en la nube
- Compartición de documentos
- Notarización pública

---

**Última actualización:** 26 de diciembre de 2025
**Versión:** 1.0.0
**Autor:** Desarrollo CodeCrypto