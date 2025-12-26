# Arquitectura del Proyecto

## Descripción General

Esta es una aplicación Web3 descentralizada (dApp) que permite a los usuarios almacenar y verificar la autenticidad de documentos usando blockchain Ethereum. La aplicación funciona 100% en el cliente sin necesidad de un servidor backend.

## Componentes Principales

### 1. Smart Contracts (Solidity + Foundry)

**Ubicación:** `/contracts`

#### DocumentRegistry.sol
- Contrato principal que almacena documentos
- Funciones principales:
  - `storeDocumentHash()` - Almacena un documento con firma
  - `verifyDocument()` - Verifica autenticidad de un documento
  - `getDocumentInfo()` - Obtiene información completa
  - `isDocumentStored()` - Verifica existencia
  - `getDocumentSignature()` - Obtiene firma de un documento

#### IDocumentRegistry.sol
- Interfaz del contrato
- Define eventos y funciones públicas

### 2. Frontend (Next.js + React + TypeScript)

**Ubicación:** `/dapp`

#### Estructura de Directorios

```
dapp/
├── app/
│   ├── layout.tsx         # Layout raíz con MetaMaskProvider
│   ├── page.tsx           # Página principal
│   └── globals.css        # Estilos globales
│
├── components/
│   ├── WalletSelector.tsx # Selector de wallets y conexión
│   ├── FileUploader.tsx   # Subida y cálculo de hash
│   ├── DocumentSigner.tsx # Firmar y almacenar documentos
│   ├── DocumentVerifier.tsx # Verificar documentos
│   └── index.ts           # Exportaciones
│
├── contexts/
│   └── MetaMaskContext.tsx # Context API para estado global de wallet
│
├── hooks/
│   ├── useFileHash.ts     # Hook para calcular hashes
│   ├── useContract.ts     # Hook para interactuar con contrato
│   └── index.ts           # Exportaciones
│
├── utils/
│   ├── ethers.ts          # Utilidades criptográficas
│   └── hash.ts            # Utilidades de hash
│
├── types/
│   └── ethereum.d.ts      # Tipos TypeScript
│
└── public/                # Archivos estáticos
```

#### Tecnologías Usadas

- **Next.js 14**: Framework React con SSR
- **React 18**: Librería UI
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Estilos
- **Ethers.js v6**: Interacción con blockchain
- **Lucide React**: Iconos
- **Context API**: Gestión de estado global

### 3. Estructura de Datos

#### Documento (Smart Contract)

```solidity
struct Document {
    bytes32 hash;        // Hash keccak256 del archivo
    uint256 timestamp;   // Timestamp de almacenamiento
    address signer;      // Dirección de quien firmó
    bytes signature;     // Firma digital ECDSA (65 bytes)
    bool exists;         // Flag de existencia
}
```

#### Documento (Frontend)

```typescript
interface FileHashResult {
    fileName: string;
    fileSize: number;
    sha256Hash: string;
    keccak256Hash: string;
    loading: boolean;
    error: string | null;
}
```

## Flujo de Datos

### 1. Almacenamiento de Documento

```
Usuario selecciona archivo
    ↓
FileUploader calcula hash keccak256
    ↓
DocumentSigner firma el hash con wallet
    ↓
MetaMaskContext.signMessage() genera firma ECDSA
    ↓
Firma se envía al contrato via storeDocumentHash()
    ↓
Contrato valida y almacena el documento
    ↓
Se emite evento DocumentStored
    ↓
Usuario recibe confirmación con TX hash
```

### 2. Verificación de Documento

```
Usuario sube archivo a verificar
    ↓
FileUploader calcula hash keccak256
    ↓
Usuario ingresa dirección del firmante
    ↓
DocumentVerifier llama a verifyDocument()
    ↓
Contrato recupera documento y verifica firma
    ↓
Se emite evento DocumentVerified
    ↓
Usuario ve resultado (válido/inválido)
```

## Gestión de Estado

### MetaMaskContext

Proporciona estado global para:
- `account`: Dirección de wallet actual
- `isConnected`: Estado de conexión
- `selectedWalletIndex`: Índice de wallet seleccionada
- `wallet`: Instancia de Wallet (ethers.js)
- `provider`: Instancia de JsonRpcProvider

Métodos principales:
- `connect()` - Conectar wallet seleccionada
- `disconnect()` - Desconectar
- `switchWallet(index)` - Cambiar a otra wallet
- `signMessage(msg)` - Firmar mensaje
- `getWallet()` - Obtener wallet actual
- `getProvider()` - Obtener provider

## Hooks Personalizados

### useFileHash()

Calcula hashes criptográficos de archivos:
- `calculateHash(file)` - Calcula SHA-256 y keccak256
- `reset()` - Limpia el estado

### useContract()

Proporciona acceso al contrato:
- `contract.readonly` - Para lectura
- `contract.writable` - Para transacciones
- `contract.address` - Dirección del contrato

### useMetaMask()

Re-exporta el contexto MetaMask:
- Acceso a todas las funciones del contexto

## Utilidades

### EthersUtils

```typescript
- verifySignature() - Verifica firma ECDSA
- recoverAddress() - Recupera dirección del firmante
- stringToHash() - Convierte string a hash
- isValidAddress() - Valida dirección Ethereum
- formatAddress() - Formatea a checksum
```

### HashUtils

```typescript
- keccak256() - Calcula hash keccak256
- hashFile() - Hash de un archivo
- stringToBytes32() - String a bytes32
- hashDocument() - Hash de estructura
- isValidHash() - Valida formato de hash
- shortenHash() - Acorta hash para UI
```

## Criptografía

### Hashes

- **keccak256**: Hash principal para documentos
- **SHA-256**: Hash complementario para archivos

### Firmas

- **ECDSA**: Algoritmo de firma digital
- **Recuperación**: Obtiene dirección del firmante desde firma
- **Validación**: Verifica que firma corresponde al firmante

## Comunicación Blockchain

### Provider: JsonRpcProvider

Conexión HTTP directa a Anvil:
```
dApp → JsonRpcProvider → http://localhost:8545 → Anvil
```

### Signer: ethers.Wallet

Wallets integradas con claves privadas de Anvil:
- 10 wallets de prueba precargadas
- 10,000 ETH cada una
- Claves privadas conocidas y fijas

### ABI del Contrato

```typescript
const ABI = [
  'function storeDocumentHash(bytes32, uint256, bytes)',
  'function verifyDocument(bytes32, address, bytes) view returns (bool)',
  'function getDocumentInfo(bytes32) view returns (...)',
  'function isDocumentStored(bytes32) view returns (bool)',
  'function getDocumentSignature(bytes32) view returns (bytes)',
]
```

## Seguridad

### Validaciones en Cliente

- Validación de dirección Ethereum
- Validación de formato de archivo
- Validación de firma ECDSA
- Confirmación con alertas de usuario

### Validaciones en Contrato

- Hash no puede ser zero
- Firma no puede estar vacía
- Prevención de duplicados
- Recuperación ECDSA en el contrato

### Consideraciones

- Claves privadas hardcodeadas (solo para desarrollo)
- Sin almacenamiento de claves en navegador
- Transacciones reversibles en Anvil
- Logs detallados con consola

## Eventos del Contrato

### DocumentStored
```solidity
event DocumentStored(
    bytes32 indexed hash,
    address indexed signer,
    uint256 timestamp,
    bytes signature
);
```

### DocumentVerified
```solidity
event DocumentVerified(
    bytes32 indexed hash,
    address indexed signer,
    bool isValid
);
```

## Variables de Entorno

```env
NEXT_PUBLIC_CONTRACT_ADDRESS  # Dirección del contrato en Anvil
NEXT_PUBLIC_RPC_URL           # URL del RPC de Anvil
NEXT_PUBLIC_CHAIN_ID          # ID de cadena (31337 para Anvil)
```

## Escalabilidad Futura

### Posibles Mejoras

1. **Persistencia de Datos**
   - localStorage para documentos recientes
   - IndexedDB para historial

2. **Funcionalidades Avanzadas**
   - Revocación de documentos
   - Registro de transacciones
   - Exportación de reportes

3. **Seguridad Mejorada**
   - Integración con wallets reales (MetaMask, WalletConnect)
   - Soporte para múltiples redes
   - Implementación en testnet

4. **UI/UX**
   - Temas oscuros/claros
   - Más componentes visuales
   - Animaciones

5. **Performance**
   - Caché de consultas
   - Paginación de documentos
   - Web Workers para hashing

## Deployment

### Desarrollo Local
- Usa Anvil
- Contrato se despliega vía script
- dApp corre en Next.js dev server

### Production
- Desplegar contrato en testnet/mainnet
- Build estático de Next.js
- Hostear en Vercel/GitHub Pages
- Usar proveedores como Infura/Alchemy
- Integrar con MetaMask/WalletConnect

---

**Arquitectura robusta, segura y escalable para aplicaciones Web3**
