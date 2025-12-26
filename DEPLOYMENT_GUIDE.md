# Guía de Despliegue - DocumentRegistry dApp

## ⚡ SOLUCIÓN RÁPIDA: Usa Foundry Cast en lugar de Anvil

Si Anvil sigue compilándose, puedes usar **Foundry Cast** para desplegar a una red de prueba pública:

```bash
# 1. Instala Foundry (más rápido que Anvil solo)
curl -L https://foundry.paradigm.xyz | bash
# o en Windows, descarga desde:
# https://github.com/foundry-rs/foundry/releases

# 2. Despliega a Sepolia Testnet
forge script script/Deploy.s.sol \
  --rpc-url https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161 \
  --broadcast \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# 3. Actualiza .env.local con la dirección desplegada
# NEXT_PUBLIC_CHAIN_ID=11155111
```

---

## Estado Actual

La instalación de Anvil está en progreso. Se está compilando desde el código fuente de Foundry usando Cargo.

### Dependencias Instaladas:
- ✅ Rust y Cargo
- ✅ CMake (necesario para compilar)
- ✅ NASM (necesario para compilar)
- ⏳ Anvil (en proceso de compilación)

## Próximos Pasos

### 1. Esperar a que se complete la instalación de Anvil

El comando en ejecución es:
```bash
cargo install --git https://github.com/foundry-rs/foundry --profile release anvil
```

Esto puede tomar 10-30 minutos dependiendo de tu computadora.

### 2. Una vez instalado Anvil, inicia el nodo local

Abre una nueva terminal en la carpeta raíz del proyecto y ejecuta:

```bash
# Agregar cargo al PATH (si no está agregado permanentemente)
$env:PATH = "$env:USERPROFILE\.cargo\bin;" + $env:PATH

# Iniciar Anvil con 10 cuentas y 10,000 ETH cada una
anvil --accounts 10 --balance 10000 --port 8545
```

Deberías ver algo como:
```
                             _   _
                            (_) | |
      __ _  _ __  __   __ _  _  | |
     / _` || '_ \ \ \ / / _` || || |
    | (_| || | | | \ V / (_| || || |
     \__,_||_| |_|  \_/ \__,_||_||_|

    anvil 0.1.0
    Available Accounts
    ==================
    ...
    Listening on 127.0.0.1:8545
```

### 3. En otra terminal, desplega el contrato

```bash
# Cambia a la carpeta raíz del proyecto
cd c:\Users\Matias\Desktop\Proyectos de Entrenamiento CodeCrypto\documentSignStorage

# Agrega cargo al PATH
$env:PATH = "$env:USERPROFILE\.cargo\bin;" + $env:PATH

# Desplega el contrato a Anvil
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

Anotaré la dirección del contrato desplegado (algo como `0x...`).

### 4. Actualiza la configuración de la dApp

Edita `dapp/.env.local`:

```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x... (la dirección del paso anterior)
NEXT_PUBLIC_RPC_URL=http://localhost:8545
NEXT_PUBLIC_CHAIN_ID=31337
```

### 5. Inicia la dApp

```bash
cd dapp
npm install  # Si es la primera vez
npm run dev
```

Accede a `http://localhost:3000`

## Scripts Disponibles

```bash
# Iniciar Anvil (local testnet)
npm run anvil

# Desplegar contrato a Anvil
npm run deploy

# Iniciar la dApp en desarrollo
npm run dev

# Compilar la dApp
npm build

# Tests de Solidity (si es necesario)
forge test
```

## Cuentas de Prueba en Anvil

Cuando ejecutes Anvil verás 10 cuentas de prueba con 10,000 ETH cada una:
- Account #0: 0x1234... (Privada: 0xac09...)
- Account #1: 0x5678... (Privada: 0x...)
- ... y más

Puedes usar cualquiera de estas cuentas en la dApp.

## Solución de Problemas

**Problema:** "anvil: command not found"
- **Solución:** Asegúrate de que cargo está en el PATH:
  ```bash
  $env:PATH = "$env:USERPROFILE\.cargo\bin;" + $env:PATH
  ```

**Problema:** El contrato no se despliega
- **Solución:** Asegúrate de que Anvil está corriendo en `http://localhost:8545`

**Problema:** Anvil sigue compilándose
- **Solución:** Paciencia. La primera compilación puede tomar 20-30 minutos. Puedes verificar el progreso con:
  ```bash
  tasklist | findstr cargo
  ```

## Notas Técnicas

- **Red Local:** Anvil (ChainID: 31337)
- **Solidity Versión:** 0.8.20
- **Framework Frontend:** Next.js 14+
- **Librería Web3:** Ethers.js v6
- **Gestión de Estado:** React Context API
- **Autenticación:** Wallets de Anvil (sin MetaMask requerido)

---

¡Buena suerte! Una vez que todo esté corriendo, tendrás un dApp completamente funcional para firmar y verificar documentos en blockchain.
