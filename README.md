# DocumentRegistry - dApp de Verificación de Documentos en Ethereum

Una aplicación descentralizada (dApp) para almacenar y verificar la autenticidad de documentos usando blockchain Ethereum con Foundry (Anvil o Sepolia testnet).

## Características

- ✅ **Almacenamiento Seguro**: Guardar hashes de archivos con firmas digitales ECDSA
- ✅ **Sin MetaMask Obligatorio**: Usa wallets integradas de Anvil o conecta MetaMask para Sepolia
- ✅ **100% Descentralizado**: Smart contract en blockchain, sin servidor backend
- ✅ **Interfaz Intuitiva**: Next.js + TypeScript + Tailwind CSS
- ✅ **Criptografía ECDSA**: Firmas digitales con secp256k1
- ✅ **Verificación Inmediata**: Valida documentos contra blockchain con Keccak256
- ✅ **Modo Mock**: Prueba sin blockchain mientras compila Anvil

## Requisitos Previos

- **Node.js 18+** - JavaScript runtime
- **Rust/Cargo** - Para compilar Foundry
- **CMake + NASM** - Para dependencias de Foundry
- **Git** - Control de versiones
- Navegador web moderno (Chrome, Firefox, Edge)

### Verificar instalación

```powershell
node --version      # v18+
cargo --version     # 1.70+
forge --version     # 0.2.0+
cmake --version     # 3.20+
```

## Estructura del Proyecto

```
documentSignStorage/
├── .github/                   # GitHub Actions CI/CD
├── .vscode/                   # Configuración de VSCode
├── contracts/                 # Smart contracts en Solidity
│   ├── DocumentRegistry.sol   # Contrato principal
│   └── interfaces/
│       └── IDocumentRegistry.sol
├── test/                      # Tests del contrato
├── script/                    # Scripts de despliegue
├── dapp/                      # Aplicación Next.js
│   ├── app/                   # Páginas y layout
│   ├── components/            # Componentes React
│   ├── contexts/              # Context API para estado global
│   ├── hooks/                 # Hooks personalizados
│   ├── utils/                 # Utilidades
│   └── types/                 # Tipos TypeScript
├── lib/                       # Dependencias de Foundry
├── .editorconfig              # Configuración de editores
├── .gitignore                 # Archivos ignorados por Git
├── .prettierrc.json           # Configuración de Prettier
├── CONTRIBUTING.md            # Guía de contribución
├── foundry.toml               # Configuración de Foundry
├── LICENSE                    # Licencia MIT
├── package.json               # Dependencias del proyecto
├── README.md                  # Este archivo
└── STATUS.md                  # Estado actual del proyecto
```

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

### Paso 2: Instalar Foundry y Anvil

**Windows (PowerShell):**
```powershell
$env:PATH = "C:\Program Files\CMake\bin;" + "$env:USERPROFILE\.cargo\bin;" + $env:PATH
cargo install --git https://github.com/foundry-rs/foundry --profile release anvil --locked
```

**Mac/Linux:**
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### Paso 3: Instalar Dependencias de dApp

```bash
cd dapp
npm install
cd ..
```

### Paso 4: Compilar Smart Contracts

```bash
forge build
```

Deberías ver: `✓ [00m:00s] Compiling solidity contracts`

## Guías de Inicio

### OPCIÓN 1: Comienza AHORA con Modo Mock ⚡ (Recomendado para pruebas rápidas)

La dApp ya está corriendo en http://localhost:3000 con **10 wallets de prueba integradas**.

```bash
cd dapp
npm run dev
```

Accede a http://localhost:3000 y:
- ✅ Conecta wallets de prueba (0-9)
- ✅ Carga documentos y calcula hashes
- ✅ Firma digitalmente documentos
- ✅ Verifica autenticidad
- ✅ SIN blockchain real (perfecto para UI/UX)

**Cambiar a blockchain real después:** Edita `dapp/.env.local` y cambia `NEXT_PUBLIC_USE_MOCK=false`

### OPCIÓN 2: Anvil Local (Desarrollo óptimo)

**Paso 1: Iniciar Anvil (Terminal 1)**
```powershell
$env:PATH = "$env:USERPROFILE\.cargo\bin;" + $env:PATH
anvil --accounts 10 --balance 10000 --port 8545
```

Deberías ver:
```
    anvil 0.1.0
    Listening on 127.0.0.1:8545
    Available Accounts:
    (0) 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
    ... (10 cuentas totales)
```

**Paso 2: Desplegar Contrato (Terminal 2)**
```powershell
$env:PATH = "$env:USERPROFILE\.cargo\bin;" + $env:PATH
forge script script/Deploy.s.sol `
  --rpc-url http://localhost:8545 `
  --broadcast `
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

**Anota la dirección** que aparece como `DocumentRegistry deployed at: 0x...`

**Paso 3: Configurar dApp (Terminal 2)**
```powershell
# En el directorio documentSignStorage:
@"
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_CONTRACT_ADDRESS=0x<DIRECCIÓN_DEL_PASO_2>
NEXT_PUBLIC_RPC_URL=http://localhost:8545
NEXT_PUBLIC_CHAIN_ID=31337
"@ | Set-Content -Path "dapp\.env.local"
```

**Paso 4: Ejecutar dApp (Terminal 3)**
```bash
cd dapp
npm run dev
```

Abre http://localhost:3000

### OPCIÓN 3: Sepolia Testnet (Con MetaMask, real pero gratis)

**Paso 1: Configurar MetaMask**
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

**Paso 3: Desplegar a Sepolia**
```powershell
$env:PATH = "$env:USERPROFILE\.cargo\bin;" + $env:PATH
forge script script/Deploy.s.sol `
  --rpc-url "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161" `
  --broadcast `
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

**Paso 4: Configurar dApp**
```powershell
@"
NEXT_PUBLIC_USE_MOCK=false
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

| Aspecto | Mock | Anvil | Sepolia |
|--------|------|-------|---------|
| ⏱️ Tiempo inicio | Inmediato | 20-40 min (compilación) | 5 min |
| 💻 Internet requerido | No | No | Sí |
| 💰 Costo | Gratis | Gratis | Gratis |
| ⚡ Transacciones | Simuladas | Instantáneas | 12+ segundos |
| 🔧 Desarrollo | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 🧪 Testing | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |

**Recomendación:** Comienza con **Mock** para pruebas rápidas, luego **Anvil** para desarrollo serio.

## Ejecución Local

### Terminal 1: Iniciar Anvil

```bash
anvil
```

Verás output similar a:

```
Listening on 127.0.0.1:8545
Available Accounts:
(0) 0x1234...
(1) 0x5678...
... (10 cuentas totales)
```

### Terminal 2: Desplegar Contrato

```bash
# Compilar
forge build

# Desplegar en Anvil (usa la primera clave privada)
forge script script/Deploy.s.sol \
  --rpc-url http://localhost:8545 \
  --broadcast \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

**Anota la dirección del contrato** que aparezca como `DocumentRegistry desplegado en: 0x...`

### Terminal 3: Ejecutar la dApp

```bash
cd dapp

# Actualizar .env.local con la dirección del contrato
cat > .env.local << EOF
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_CONTRACT_ADDRESS=0x<DIRECCIÓN_DEL_CONTRATO>
NEXT_PUBLIC_RPC_URL=http://localhost:8545
NEXT_PUBLIC_CHAIN_ID=31337
EOF

# Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

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

## Funciones Principales

### storeDocumentHash
```solidity
function storeDocumentHash(
    bytes32 hash,
    uint256 timestamp,
    bytes signature
) external
```

Almacena un documento con su firma.

### verifyDocument
```solidity
function verifyDocument(
    bytes32 hash,
    address signer,
    bytes signature
) external view returns (bool)
```

Verifica si un documento es válido.

### getDocumentInfo
```solidity
function getDocumentInfo(bytes32 hash)
    external view
    returns (Document memory)
```

Obtiene toda la información de un documento.

## Testing

### Ejecutar Tests del Contrato

```bash
forge test
```

Deberías ver todos los tests pasando:

```
Running 6 tests for contracts/DocumentRegistry.t.sol
[PASS] testCannotStoreDuplicateDocument (gas: 68245)
[PASS] testCannotStoreEmptySignature (gas: 23437)
[PASS] testCannotStoreZeroHash (gas: 23353)
[PASS] testGetNonexistentDocument (gas: 23457)
[PASS] testStoreDocument (gas: 96853)
[PASS] testVerifyDocument (gas: 23569)

Test result: ok. 6 passed
```

### Test Coverage

```bash
forge coverage
```

Todos los contratos deben tener 100% de cobertura.

### Tests Específicos

```bash
forge test --match-test testStoreDocument
forge test --match-test testVerifyDocument
```

## Comandos Útiles

```bash
# Compilar
forge build

# Tests
forge test

# Cobertura de tests
forge coverage

# Formatear código Solidity
forge fmt

# Limpiar artefactos
forge clean

# Verificar formato
forge fmt --check

# Deploy a Sepolia
forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC --broadcast --verify

# Iniciar dApp en desarrollo
npm run dev

# Build de producción
npm run build

# Ejecutar build de producción
npm run start
```

## Wallets de Prueba

### Modo Mock (Integrado en la dApp)

10 wallets de prueba con 10,000 ETH cada una:

```
Wallet 0: 0x0000000000000000000000000000000000000000
Wallet 1: 0x0000000000000000000000000000000000000001
Wallet 2: 0x0000000000000000000000000000000000000002
... (hasta 9)
```

Disponibles en `dapp/contexts/MetaMaskContext.mock.tsx`

### Anvil (Local Testnet)

Anvil genera 10 wallets automáticamente al iniciar:

```
Account 0: 0xf39Fd6e51aad88F6F4ce6aB8827279cFfFb92266
Account 1: 0x70997970C51812e339D9B73b0245Ad59c36CB495
... (hasta 9)
```

Todas con 10,000 ETH de prueba. Las claves privadas se muestran al iniciar.

### Sepolia Testnet

Usa tu propia wallet de MetaMask con ETH obtenido de un faucet.

## Variables de Entorno

### dApp/.env.local

```env
# Modo mock (true = sin blockchain, false = con blockchain)
NEXT_PUBLIC_USE_MOCK=true

# Dirección del contrato desplegado (requerida si USE_MOCK=false)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...

# RPC URL (Anvil: http://localhost:8545, Sepolia: https://sepolia.infura.io/v3/...)
NEXT_PUBLIC_RPC_URL=http://localhost:8545

# Chain ID (Anvil: 31337, Sepolia: 11155111)
NEXT_PUBLIC_CHAIN_ID=31337
```

### Crear .env.local

**Modo Mock (para pruebas rápidas):**
```powershell
@"
NEXT_PUBLIC_USE_MOCK=true
NEXT_PUBLIC_RPC_URL=http://localhost:8545
NEXT_PUBLIC_CHAIN_ID=31337
"@ | Set-Content -Path "dapp\.env.local"
```

**Anvil Local:**
```powershell
@"
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_CONTRACT_ADDRESS=0x<TU_DIRECCIÓN>
NEXT_PUBLIC_RPC_URL=http://localhost:8545
NEXT_PUBLIC_CHAIN_ID=31337
"@ | Set-Content -Path "dapp\.env.local"
```

**Sepolia:**
```powershell
@"
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_CONTRACT_ADDRESS=0x<TU_DIRECCIÓN>
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161
NEXT_PUBLIC_CHAIN_ID=11155111
"@ | Set-Content -Path "dapp\.env.local"
```

## Resolución de Problemas

### Problema: "CMake not found" al compilar Anvil

**Solución:**
```powershell
winget install cmake
$env:PATH = "C:\Program Files\CMake\bin;" + $env:PATH
cargo install --git https://github.com/foundry-rs/foundry --profile release anvil --locked
```

### Problema: "NASM command not found"

**Solución:**
```powershell
winget install NASM.NASM
# Reinicia la terminal o agrega al PATH manualmente
```

### Problema: "Cannot connect to http://localhost:8545"

- ✅ Verifica que Anvil está corriendo: `Test-Path "$env:USERPROFILE\.cargo\bin\anvil.exe"`
- ✅ En otra terminal: `anvil --accounts 10 --balance 10000 --port 8545`
- ✅ Verifica el RPC URL en `.env.local`

### Problema: "Contract address not configured"

- ✅ Asegúrate de tener `dapp/.env.local`
- ✅ Verifica que `NEXT_PUBLIC_CONTRACT_ADDRESS` sea correcta
- ✅ No debe estar vacía ni ser `0x...`

### Problema: "Unknown wallet account"

- ✅ Si estás en **Mock mode**: selecciona 0-9 en el dropdown
- ✅ Si estás en **Anvil**: verifica que Anvil muestre 10 accounts
- ✅ Si estás en **Sepolia**: conecta MetaMask primero

### Problema: "Transaction reverted"

- ✅ Verifica que el contrato esté desplegado correctamente
- ✅ Abre la consola del navegador (F12) para ver errores
- ✅ En Anvil, verifica que la dirección del contrato sea correcta
- ✅ Asegúrate de usar `NEXT_PUBLIC_USE_MOCK=false` si quieres blockchain real

### Problema: "npm ERR! Cannot find module"

```bash
cd dapp
rm -r node_modules package-lock.json
npm install
```

### Problema: La dApp no se actualiza después de cambiar `.env.local`

```bash
# En el directorio dapp/:
npm run dev
# Ctrl+C para detener
# Vuelve a ejecutar npm run dev
```

### Verificar Estado General

```powershell
# Forge disponible
forge --version

# Anvil compilando o listo
$env:PATH = "$env:USERPROFILE\.cargo\bin;" + $env:PATH
Test-Path "$env:USERPROFILE\.cargo\bin\anvil.exe"

# npm disponible
npm --version

# Node.js disponible
node --version

# Solidity contracts compilados
Test-Path "out/DocumentRegistry.sol/DocumentRegistry.json"
```

## Stack Tecnológico

**Smart Contracts:**
- Solidity 0.8.20
- Foundry (forge + anvil)
- OpenZeppelin (librerías de seguridad)

**Frontend:**
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Ethers.js v6
- Lucide React (iconos)

**Blockchain:**
- Ethereum (local con Anvil)
- ECDSA para firmas
- Keccak256 para hashes

## Licencia

MIT License - Ver LICENSE para más detalles

## Contacto y Soporte

Para reportar issues o sugerencias, abre un issue en el repositorio.

---

**Hecho con ❤️ para Web3 Development**
