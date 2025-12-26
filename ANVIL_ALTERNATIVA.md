# Alternativa: Usar Red de Prueba Sin Anvil Local

Mientras se compila Anvil (que puede tomar 30+ minutos), puedes probar la dApp usando una red de prueba pública.

## Opción 1: Usar Sepolia Testnet (Recomendado)

Sepolia es la red de prueba oficial de Ethereum.

### Pasos:

1. **Instala MetaMask en tu navegador** (si no lo tienes)
   - https://metamask.io/

2. **Cambia a la red Sepolia en MetaMask**
   - Click en la red predeterminada (arriba a la derecha)
   - Selecciona "Sepolia"

3. **Obtén ETH de prueba**
   - Ve a: https://sepoliafaucet.com/
   - Conecta tu billetera MetaMask
   - Solicita 0.5 ETH

4. **Despliega el contrato en Sepolia**
   ```bash
   # Primero, necesitas usar Hardhat o Foundry con una red pública
   # Crea un archivo .env.secrets con tu clave privada (NUNCA en GitHub)
   
   # Con Foundry:
   forge script script/Deploy.s.sol \
     --rpc-url https://sepolia.infura.io/v3/YOUR_INFURA_KEY \
     --broadcast \
     --private-key YOUR_PRIVATE_KEY
   ```

5. **Actualiza la dApp**
   - Edita `dapp/.env.local`:
   ```
   NEXT_PUBLIC_CONTRACT_ADDRESS=0x... (la dirección desplegada)
   NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
   NEXT_PUBLIC_CHAIN_ID=11155111
   ```

## Opción 2: Esperar a que Anvil Compile (Recomendado para desarrollo local)

La compilación de Anvil está en progreso. Puede tomar:
- **Primera compilación**: 20-40 minutos
- **Compilaciones futuras**: Mucho más rápidas (caché)

### Estado Actual:
- ✅ CMake instalado
- ✅ NASM instalado
- ⏳ Compilación en progreso

### Verificar estado:
```bash
$env:PATH = "$env:USERPROFILE\.cargo\bin;" + $env:PATH
Test-Path "$env:USERPROFILE\.cargo\bin\anvil.exe"
# Devuelve: True (cuando esté listo)
```

### Una vez compilado:
```bash
# Terminal 1: Iniciar Anvil
$env:PATH = "$env:USERPROFILE\.cargo\bin;" + $env:PATH
anvil --accounts 10 --balance 10000 --port 8545

# Terminal 2: Desplegar contrato
cd c:\Users\Matias\Desktop\Proyectos\ de\ Entrenamiento\ CodeCrypto\documentSignStorage
forge script script/Deploy.s.sol \
  --rpc-url http://localhost:8545 \
  --broadcast \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Terminal 3: Iniciar dApp
cd dapp
npm run dev
```

## Opción 3: Usar ethers.js en Memoria (Solo para desarrollo)

Puedes modificar la dApp para usar una red simulada en el navegador sin Anvil:

```typescript
// dapp/contexts/MetaMaskContext.tsx
// Usar InfuraProvider en lugar de JsonRpcProvider
const provider = new ethers.InfuraProvider('sepolia', INFURA_KEY);
```

---

## Recomendación

1. **Mientras Anvil compila** (20-40 min): Usa Sepolia Testnet para probar la lógica
2. **Cuando Anvil esté listo**: Cambia a localhost para desarrollo local más rápido

## Troubleshooting

**P: ¿Cuándo estará Anvil listo?**
- Ejecuta: `Test-Path "$env:USERPROFILE\.cargo\bin\anvil.exe"`
- Si devuelve `True`, está listo

**P: ¿Puedo usar otras redes de prueba?**
- Sí: Goerli (deprecated), Amoy (Polygon), Mumbaidependencies
- Ejemplo con Amoy: `--rpc-url https://rpc-amoy.maticvigil.com`

**P: ¿Tengo que esperar 40 minutos?**
- No. Usa Sepolia Testnet ahora y cambia a Anvil cuando esté listo.
