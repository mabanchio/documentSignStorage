# DocumentRegistry - dApp de Verificación de Documentos en Ethereum

Una aplicación descentralizada (dApp) completa para almacenar y verificar documentos con firmas ECDSA integradas en blockchain Ethereum. Usa MetaMask real o Ganache local con transacciones blockchain inmutables.

## ✨ Características Principales

- ✅ **Almacenamiento Blockchain**: Guardar firmas inmutables en blockchain (Ganache/Ethereum)
- ✅ **Integración MetaMask Real**: Conecta con extensión MetaMask real del navegador
- ✅ **Fallback Ganache**: 10 wallets simuladas si MetaMask no está instalada
- ✅ **Flujo Blockchain-First**: Transacción blockchain PRIMERO, localStorage DESPUÉS
- ✅ **Manejo Robusto de Errores**: Detecta rechazo, fondos insuficientes, errores de red
- ✅ **Historial con Contador**: Muestra total de documentos + filtrados dinámicamente
- ✅ **Criptografía ECDSA**: Firmas digitales secp256k1 con recuperación de firmante
- ✅ **Interfaz Intuitiva**: Next.js 14 + TypeScript + Tailwind CSS + Lucide Icons
- ✅ **100% Descentralizado**: Smart contract en blockchain, sin servidor backend
- ✅ **Verificación Inmediata**: Valida documentos contra blockchain con Keccak256

## Requisitos Previos

- **Node.js 18+** - JavaScript runtime
- **npm 9+** - Gestor de paquetes
- **Git** - Control de versiones
- **Navegador web moderno** - Chrome, Firefox, Edge (para MetaMask)
- **MetaMask** (opcional) - Extensión de navegador para Ethereum
- **Ganache** (incluido) - Blockchain local con 10 wallets predefinidas

### Verificar instalación

```powershell
node --version      # v18+
npm --version       # 9+
git --version       # 2.37+
```

## Estructura del Proyecto

```
documentSignStorage/
├── .github/                   # GitHub Actions CI/CD
├── .vscode/                   # Configuración de VSCode
├── contracts/                 # Smart contracts en Solidity
│   ├── DocumentRegistry.sol   # Contrato principal para firmas blockchain
│   └── interfaces/
│       └── IDocumentRegistry.sol
├── test/                      # Tests del contrato
├── script/                    # Scripts de despliegue
├── dapp/                      # Aplicación Next.js
│   ├── app/                   # Páginas y layout
│   ├── components/            # Componentes React (Signer, Verifier, Library, etc.)
│   ├── contexts/              # Context API (MetaMask, Toast)
│   ├── hooks/                 # Hooks personalizados (useContract, useFileHash, useMetaMask)
│   ├── utils/                 # Utilidades (signatureUtils, documentStorage, etc.)
│   └── types/                 # Tipos TypeScript (ethereum.d.ts)
├── lib/                       # Dependencias de Foundry
├── cache/                     # Cache de compilación
├── .editorconfig              # Configuración de editores
├── .gitignore                 # Archivos ignorados por Git
├── .prettierrc.json           # Configuración de Prettier
├── CONTRIBUTING.md            # Guía de contribución
├── foundry.toml               # Configuración de Foundry
├── LICENSE                    # Licencia MIT
├── package.json               # Dependencias del proyecto
└── README.md                  # Este archivo
```

**Documentación Local (No en GitHub):**
- 📄 `DOCUMENTACION_COMPLETA.md` - Documentación técnica completa (local only, .gitignore)

## Configuración del Proyecto

### Archivos de Configuración Principales

- **`.editorconfig`** - Normaliza formato entre IDEs
- **`.prettierrc.json`** - Formateo automático de código
- **`.github/workflows/tests.yml`** - CI/CD automático
- **`.vscode/settings.json`** - Configuración recomendada de VSCode
- **`foundry.toml`** - Configuración de Foundry (compilador Solidity)
- **`tsconfig.json`** - Configuración de TypeScript

### Extensiones VSCode Recomendadas

- Prettier - Code formatter
- ESLint - Linter
- Hardhat Solidity - Soporte para Solidity
- GitHub Copilot - Autocompletado con IA

Las extensiones se instalan automáticamente si aceptas la sugerencia al abrir el proyecto.

## Estructura del Proyecto

## Instalación Rápida

### Paso 1: Clonar el Repositorio

```bash
git clone <tu-repositorio>
cd documentSignStorage
```

### Paso 2: Instalar Dependencias

```bash
npm install
cd dapp && npm install && cd ..
```

### Paso 3: Iniciar Ganache Local (Opcional)

```bash
npm run ganache
# O manualmente:
npx ganache-cli --accounts 10 --balance 1000 --port 8545
```

Ganache escuchará en `http://127.0.0.1:8545` con 10 wallets de 1000 ETH cada una.

## Guías de Inicio

### OPCIÓN 1: Comienza AHORA con MetaMask Real + Ganache ⚡ (Recomendado)

**Terminal 1: Iniciar Ganache**
```bash
npm run ganache
```

Verás output como:
```
ganache-cli v7.9.2
Listening on 127.0.0.1:8545
Available Accounts
(0) 0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1 (1000 ETH)
(1) 0xffcf8fdee72ac11b5c542428b35eef5769c409f0 (1000 ETH)
... (hasta 10 cuentas)
```

**Terminal 2: Ejecutar dApp**
```bash
cd dapp
npm run dev
```

**Paso 1: Conectar MetaMask**
1. Instala MetaMask: https://metamask.io/
2. Settings → Networks → Add Network
3. Red Ganache (Chain ID 1337):
   - Name: `Ganache Local`
   - RPC: `http://127.0.0.1:8545`
   - Chain ID: `1337`
   - Currency: `ETH`
4. Conecta a la página en http://localhost:3000

**Paso 2: Firmar Documentos**
- Accede a http://localhost:3000
- Haz clic en "Conectar" (MetaMask se abrirá)
- Carga un documento
- Haz clic en "Firmar Documento"
- Confirma la transacción en MetaMask
- ✅ El documento se guarda en blockchain + localStorage

**Paso 3: Verificar Documentos**
- Ve a la pestaña "Historial"
- Ve el contador: "Total activos: X"
- Filtra por fecha, nombre o busca
- Descarga documento como JSON

### OPCIÓN 2: Sin MetaMask - Usa Ganache Fallback + Wallets Simuladas

Si no tienes MetaMask, la dApp detecta Ganache automáticamente y usa 10 wallets simuladas:

**Terminal 1: Iniciar Ganache**
```bash
npm run ganache
```

**Terminal 2: Ejecutar dApp**
```bash
cd dapp
npm run dev
```

Accede a http://localhost:3000 y:
- ✅ Selecciona una wallet simulada (0-9) del dropdown
- ✅ Carga documentos
- ✅ Firma y guarda en blockchain
- ✅ SIN MetaMask requerida

Deberías ver:
```
    Listening on 127.0.0.1:8545
    Available Accounts:
    (0) 0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1 (1000 ETH)
    ... (10 cuentas totales)
```

**Paso 2: Ejecutar dApp (Terminal 2)**
```bash
cd dapp
npm run dev
```

Abre http://localhost:3000

### OPCIÓN 3: Sepolia Testnet (Con MetaMask real en red pública)

**Paso 1: Configurar MetaMask para Sepolia**
1. Instala MetaMask: https://metamask.io/
2. Settings → Networks → Add Network
3. Agregar Sepolia:
   - Name: `Sepolia`
   - RPC: `https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161`
   - Chain ID: `11155111`
   - Currency: `ETH`

**Paso 2: Obtener ETH de prueba**
- Abre https://sepoliafaucet.com/
- Conecta MetaMask
- Solicita 0.5 ETH

**Paso 3: Desplegar Contrato a Sepolia**
```bash
forge script script/Deploy.s.sol \
  --rpc-url https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161 \
  --broadcast \
  --verify
```

Anota la dirección del contrato que aparece.

**Paso 4: Configurar dApp**
```powershell
@"
NEXT_PUBLIC_CONTRACT_ADDRESS=0x<DIRECCIÓN_DEL_PASO_3>
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161
NEXT_PUBLIC_CHAIN_ID=11155111
"@ | Set-Content -Path "dapp\.env.local"
```

**Paso 5: Iniciar dApp**
```bash
cd dapp
npm run dev
```

Accede a http://localhost:3000 y conéctate con MetaMask

## Comparativa de Opciones

| Aspecto | MetaMask + Ganache | Ganache (Fallback) | Sepolia Testnet |
|--------|------------------|-------------------|-----------------|
| ⏱️ Tiempo inicio | 2 min | 2 min | 5 min |
| 💻 Internet requerido | No | No | Sí |
| 💰 Costo | Gratis | Gratis | Gratis |
| ⚡ Transacciones | Instantáneas | Instantáneas | 12+ segundos |
| 🦊 MetaMask | Sí (Real) | Fallback | Sí (Real) |
| 🔧 Desarrollo | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| 🧪 Testing | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |

**Recomendación:** Usa **MetaMask + Ganache** para desarrollo con experiencia realista de MetaMask.

## Ejecución Local

### Método Recomendado: MetaMask + Ganache

**Terminal 1: Iniciar Ganache**
```bash
npm run ganache
```

**Terminal 2: Ejecutar dApp**
```bash
cd dapp
npm run dev
```

**En el navegador:**
1. Abre http://localhost:3000
2. Conecta MetaMask (rojo en Ganache con Chain ID 1337)
3. ¡Comienza a firmar documentos!

### Variables de Entorno Automáticas

Si ejecutas Ganache localmente, las variables se configuran automáticamente:
- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `1337`
- Contrato: Se detecta automáticamente si está deployado

### Desplegar Contrato en Ganache

**Terminal 3: Desplegar (después de que Ganache está corriendo)**

```bash
# Con forge si tienes Foundry instalado:
forge script script/Deploy.s.sol \
  --rpc-url http://localhost:8545 \
  --broadcast \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

O usa el script npm si existe:
```bash
npm run deploy
```

**Anota la dirección** que aparezca como `DocumentRegistry deployed at: 0x...`

Luego **configura la dirección en dApp**:
```powershell
@"
NEXT_PUBLIC_CONTRACT_ADDRESS=0x<DIRECCIÓN_DEL_PASO_ANTERIOR>
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
NEXT_PUBLIC_CHAIN_ID=1337
"@ | Set-Content -Path "dapp\.env.local"
```

Reinicia la dApp y ¡listo! Ya puedes firmar documentos en blockchain.

## Uso de la Aplicación

### 1. Conectar Wallet

Haz clic en "Conectar Wallet" en la esquina superior derecha. Selecciona una de las 10 wallets de Anvil.

### 2. Firmar un Documento

- Ve a la pestaña "Firmar Documento"
- Arrastra o selecciona un archivo
- La app calculará automáticamente el hash keccak256
- Haz clic en "Firmar Documento"
- Confirma el mensaje de firma en la alerta
- Haz clic en "Almacenar en Blockchain"
- Confirma nuevamente y verás el hash de transacción

### 3. Verificar un Documento

- Ve a la pestaña "Verificar Documento"
- Sube el mismo archivo
- Ingresa la dirección del wallet que lo firmó
- Haz clic en "Verificar Documento"
- Verás si es válido o no

## Estructura de Datos del Contrato

```solidity
struct Document {
    bytes32 hash;        // Hash keccak256 del archivo
    uint256 timestamp;   // Timestamp del almacenamiento
    address signer;      // Dirección de quien firmó
    bytes signature;     // Firma digital ECDSA
    bool exists;         // Flag de existencia
}
```

## Funciones Principales del Contrato

### storeSignature
```solidity
function storeSignature(
    bytes32 hash,
    string documentName,
    uint256 timestamp,
    bytes signature
) external
```

Almacena una firma de documento en blockchain de forma inmutable.

### getSignatureRecord
```solidity
function getSignatureRecord(bytes32 hash)
    external view
    returns (SignatureRecord memory)
```

Obtiene el registro de firma de un documento.

### getUserDocuments
```solidity
function getUserDocuments(address signer)
    external view
    returns (bytes32[] memory)
```

Obtiene todos los documentos firmados por un usuario.

## Testing

### Ejecutar Tests del Contrato

```bash
npm run test
```

O directamente con forge:

```bash
forge test
```

Deberías ver todos los tests pasando.

### Test Coverage

```bash
npm run coverage
# o
forge coverage
```

### Tests Específicos

```bash
forge test --match-test testStoreSignature
forge test --match-test testGetSignatureRecord
```

## Comandos Útiles

```bash
# Iniciar Ganache (blockchain local)
npm run ganache
# O manualmente: npx ganache-cli --accounts 10 --balance 1000 --port 8545

# Desplegar contrato en Ganache
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Desplegar en Sepolia
forge script script/Deploy.s.sol --rpc-url https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161 --broadcast --verify

# Testing
npm run test
npm run coverage

# dApp
npm run dev          # Desarrollo
npm run build        # Build de producción
npm run start        # Ejecutar producción

# Linting y formateo
npm run lint
npm run format
```

## Wallets y Cuentas de Prueba

### Modo MetaMask Real

Conecta tu propia wallet de MetaMask. Si está en Ganache (Chain ID 1337):
- Todas las transacciones son instantáneas
- No necesitas ETH real (es simulado)
- Puedes hacer testing de verdad

### Ganache Local (Fallback)

Si no tienes MetaMask, Ganache proporciona 10 wallets simuladas automáticamente:

```
Account 0: 0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1
Account 1: 0xffcf8fdee72ac11b5c542428b35eef5769c409f0
Account 2: 0x5aAeb6053ba3EEdf0b6B0991E1d52F2D5b97B77
Account 3: 0x59b670e9fA9D0A427751Af201D676719a0BA7917
Account 4: 0x4B0897b0513fdC7C541B6d9D7E929C4631b92e0F
Account 5: 0x0D4C6E5F3B8E4F8F8E0A5E0C5E0F0A5C5E0F0A5C
Account 6: 0x1234567890123456789012345678901234567890
Account 7: 0x2345678901234567890123456789012345678901
Account 8: 0x3456789012345678901234567890123456789012
Account 9: 0x4567890123456789012345678901234567890123
```

Cada una con 1000 ETH simulados.

### Sepolia Testnet

Para red pública de prueba:
1. Obtén ETH gratis en: https://sepoliafaucet.com/
2. Conecta MetaMask a Sepolia
3. Despliega contrato a Sepolia
4. ¡Usa tu wallet real con ETH real de prueba!

## Variables de Entorno

### dApp/.env.local (Automático con Ganache)

Si ejecutas `npm run ganache`, la dApp detecta automáticamente:

```env
# Ganache RPC
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545

# Ganache Chain ID
NEXT_PUBLIC_CHAIN_ID=1337

# Dirección del contrato (se autodetecta después de deploy)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

### Configuración Manual (Sepolia)

Para Sepolia testnet:

```powershell
@"
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_CONTRACT_ADDRESS=0x<TU_DIRECCIÓN>
"@ | Set-Content -Path "dapp\.env.local"
```

## Resolución de Problemas

### Problema: "Cannot connect to http://127.0.0.1:8545"

- ✅ Verifica que Ganache está corriendo: `npm run ganache`
- ✅ En otra terminal: ejecuta `npm run dev`
- ✅ Verifica que el RPC URL en dapp/.env.local es correcto

### Problema: MetaMask muestra red equivocada

- ✅ Abre MetaMask
- ✅ Haz clic en el selector de red (arriba)
- ✅ Selecciona "Ganache Local" o "Localhost 8545"
- ✅ Si no aparece, agrega la red manualmente:
  - Name: Ganache Local
  - RPC: http://127.0.0.1:8545
  - Chain ID: 1337

### Problema: "Contract address not configured"

- ✅ Verifica que deployaste el contrato: `npm run deploy:ganache`
- ✅ Copia la dirección del contrato
- ✅ Pega en dapp/.env.local en `NEXT_PUBLIC_CONTRACT_ADDRESS`
- ✅ Reinicia: `npm run dev`

### Problema: "Transaction reverted"

- ✅ Abre la consola del navegador (F12)
- ✅ Verifica el error exacto
- ✅ Asegúrate de tener saldo en la wallet
- ✅ En Ganache, revierte automáticamente si hay error

### Problema: "npm ERR! Cannot find module"

```bash
cd dapp
rm -r node_modules package-lock.json
npm install
npm run dev
```

### Problema: La dApp no se actualiza después de cambiar .env.local

```bash
# En la terminal donde corre npm run dev:
# Presiona Ctrl+C para detener
# Luego vuelve a ejecutar:
npm run dev
```

### Problema: Ganache tira error de puerto en uso

```bash
# Si el puerto 8545 ya está en uso, usa otro:
npm run ganache -- --port 8546

# Y actualiza dapp/.env.local:
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8546
```

### Verificar Estado General

```powershell
# npm disponible
npm --version

# Node.js disponible
node --version

# Ganache disponible
npx ganache-cli --version

# Verificar que proyecto está correcto
Test-Path "foundry.toml"
Test-Path "dapp/package.json"
Test-Path "contracts/DocumentRegistry.sol"
```

## Stack Tecnológico

**Smart Contracts & Blockchain:**
- Solidity 0.8.20
- Foundry (forge)
- Ganache CLI 7.9.2 (blockchain local)
- OpenZeppelin (librerías de seguridad)
- ECDSA signature recovery (secp256k1)

**Frontend:**
- Next.js 14
- React 18
- TypeScript 5.0+
- Tailwind CSS
- Lucide React (iconos)
- ethers.js v6.16.0

**Integración Web3:**
- MetaMask (real + fallback)
- BrowserProvider (MetaMask)
- JsonRpcProvider (Ganache)
- Contract interaction
- Signature verification

**Testing & CI/CD:**
- Forge tests
- GitHub Actions
- Coverage reporting

## Licencia

MIT License - Ver LICENSE para más detalles

## Contacto y Soporte

Para reportar issues o sugerencias, abre un issue en el repositorio.

---

**Hecho con ❤️ para Web3 Development**
