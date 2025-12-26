# ETH Database Document - dApp de Verificación de Documentos

Una aplicación descentralizada (dApp) para almacenar y verificar la autenticidad de documentos usando blockchain Ethereum sin necesidad de MetaMask.

## Características

- ✅ **Almacenamiento Seguro**: Guardar hashes de archivos con firmas digitales
- ✅ **Sin MetaMask**: Usa wallets integradas de Anvil
- ✅ **100% Descentralizado**: No requiere servidor backend
- ✅ **Interfaz Intuitiva**: Construida con Next.js y Tailwind CSS
- ✅ **Criptografía ECDSA**: Firmas digitales seguras
- ✅ **Verificación Inmediata**: Valida documentos contra blockchain

## Requisitos Previos

- Node.js 18+ instalado
- Windows/Mac/Linux con terminal
- Navegador web moderno

## Estructura del Proyecto

```
documentSignStorage/
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
├── foundry.toml               # Configuración de Foundry
└── package.json               # Dependencias del proyecto
```

## Instalación Rápida

### Paso 1: Clonar el Repositorio

```bash
git clone <tu-repositorio>
cd documentSignStorage
```

### Paso 2: Instalar Anvil (opcional, si no lo tienes)

**Windows (PowerShell):**
```powershell
# Si tienes Rust/Cargo instalado:
cargo install --git https://github.com/foundry-rs/foundry foundry-cli anvil

# O descarga el ejecutable desde: https://github.com/foundry-rs/foundry/releases
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
```

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

## Comandos Útiles

```bash
# Compilar contrato
forge build

# Tests unitarios
forge test

# Cobertura
forge coverage

# Tests específicos
forge test --match-test testStoreDocument

# Formato de código
forge fmt

# Iniciar dApp en desarrollo
npm run dev

# Build de producción
npm run build

# Ejecutar dApp en producción
npm run start
```

## Wallets de Prueba (Anvil)

Anvil genera 10 wallets de prueba con 10,000 ETH cada una:

```
Wallet 0: 0x1F321E...
Wallet 1: 0xdf2Bc...
... (hasta 9)
```

Todas tienen las claves privadas hardcodeadas en `MetaMaskContext.tsx`.

## Seguridad

⚠️ **IMPORTANTE PARA DESARROLLO SOLO**

- Las claves privadas están hardcodeadas (solo para desarrollo)
- NO uses esto en producción o testnet
- Anvil es solo para desarrollo local
- Las transacciones son reversibles en Anvil

## Variables de Entorno (dApp)

```env
# Dirección del contrato desplegado
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...

# RPC URL de Anvil
NEXT_PUBLIC_RPC_URL=http://localhost:8545

# Chain ID
NEXT_PUBLIC_CHAIN_ID=31337
```

## Resolución de Problemas

### "Contract address not configured"
- Asegúrate de tener `.env.local` en `dapp/`
- Verifica que `NEXT_PUBLIC_CONTRACT_ADDRESS` sea correcta

### "Cannot connect to Anvil"
- Abre otra terminal y ejecuta `anvil`
- Verifica que escuche en `http://localhost:8545`

### "Wallet not connected"
- Haz clic en "Conectar Wallet"
- Selecciona una de las 10 wallets disponibles

### "Transaction reverted"
- Verifica que el contrato esté correctamente desplegado
- Comprueba el RPC URL en `.env.local`
- Revisa los logs en la consola del navegador (F12)

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
