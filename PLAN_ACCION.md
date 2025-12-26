# 🎯 Plan de Acción - Próximas Tareas

**Fecha:** 26 de diciembre de 2025  
**Estado Actual:** Normalización Completada ✅

---

## 📍 Punto de Partida

✅ **Completado:**
- Documentación unificada
- Configuración del proyecto
- dApp en modo Mock (http://localhost:3000)
- 12 commits de desarrollo
- CI/CD automático configurado
- Guías de contribución

⏳ **En Progreso:**
- Compilación de Anvil (~70% estimado)

---

## ⚡ Próximas Acciones (Orden de Prioridad)

### AHORA (Inmediato)

#### 1. Prueba el dApp en Modo Mock
```bash
# Si no está corriendo:
cd dapp
npm run dev
```

**Acceso:** http://localhost:3000

**Qué probar:**
- ✓ Conectar wallet (10 cuentas disponibles)
- ✓ Cargar archivo PDF/imagen
- ✓ Ver cálculo automático de hashes
- ✓ Firmar documento
- ✓ Verificar autenticidad
- ✓ Cambiar entre cuentas

#### 2. Monitorea Compilación de Anvil
```powershell
# Ejecuta cada 5-10 minutos:
$anvilPath = "$env:USERPROFILE\.cargo\bin\anvil.exe"
if (Test-Path $anvilPath) {
  Write-Host "✅ Anvil LISTO!"
  & $anvilPath --version
} else {
  Write-Host "⏳ Compilando aún..."
}
```

---

### CUANDO ANVIL COMPILE (~30-60 min)

#### 3. Iniciar Anvil Local
```powershell
# Terminal 1
$env:PATH = "$env:USERPROFILE\.cargo\bin;" + $env:PATH
anvil --accounts 10 --balance 10000 --port 8545
```

**Deberías ver:**
```
    anvil 0.1.0
    Listening on 127.0.0.1:8545
    
    Available Accounts (10):
    (0) 0xf39Fd6e51aad88F6F4ce6aB8827279cFfFb92266
    ...
```

#### 4. Desplegar Contrato a Anvil (Terminal 2)
```powershell
$env:PATH = "$env:USERPROFILE\.cargo\bin;" + $env:PATH
cd "C:\Users\Matias\Desktop\Proyectos de Entrenamiento CodeCrypto\documentSignStorage"

forge script script/Deploy.s.sol `
  --rpc-url http://localhost:8545 `
  --broadcast `
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

**Anota la dirección** que aparezca como `DocumentRegistry deployed at: 0x...`

#### 5. Configurar dApp (Terminal 2)
```powershell
$contractAddress = "0x..." # Pega la dirección del paso anterior

@"
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_CONTRACT_ADDRESS=$contractAddress
NEXT_PUBLIC_RPC_URL=http://localhost:8545
NEXT_PUBLIC_CHAIN_ID=31337
"@ | Set-Content -Path "dapp\.env.local"
```

#### 6. Reiniciar dApp (Terminal 3)
```bash
cd dapp
npm run dev
```

Accede a http://localhost:3000 (ahora con blockchain real)

---

### OPCIONAL: SEPOLIA TESTNET

Si quieres probar blockchain real sin esperar a Anvil:

#### A. Configurar MetaMask
1. Instala MetaMask: https://metamask.io/
2. Settings → Networks → Add Network
3. Configura Sepolia:
   - Name: Sepolia
   - RPC: `https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161`
   - Chain ID: `11155111`
   - Currency: ETH

#### B. Obtener ETH de Prueba
- https://sepoliafaucet.com/
- Conecta MetaMask
- Solicita 0.5 ETH (espera 1-2 min)

#### C. Desplegar a Sepolia
```powershell
forge script script/Deploy.s.sol `
  --rpc-url "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161" `
  --broadcast `
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

#### D. Configurar dApp
```powershell
@"
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_CONTRACT_ADDRESS=0x<DIRECCIÓN_DEL_PASO_C>
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161
NEXT_PUBLIC_CHAIN_ID=11155111
"@ | Set-Content -Path "dapp\.env.local"
```

#### E. Reiniciar dApp
```bash
npm run dev
```

---

## 🔄 Workflow Recomendado

### Desarrollo Local (Con Anvil)

```
Terminal 1: anvil --accounts 10 --balance 10000 --port 8545
Terminal 2: forge test --watch
Terminal 3: cd dapp && npm run dev
```

### Testing

```bash
# Tests de contrato
forge test

# Tests de frontend
cd dapp && npm test

# Linting
forge fmt --check
cd dapp && npm run lint

# Format check
cd dapp && npm run format:check
```

### Antes de Hacer Commit

```bash
# Formatear código
forge fmt
cd dapp && npm run format

# Verificar tests
forge test
cd dapp && npm test

# Verificar lint
cd dapp && npm run lint
```

---

## 📚 Documentación de Referencia

| Archivo | Propósito |
|---------|----------|
| [README.md](README.md) | Guía principal |
| [STATUS.md](STATUS.md) | Estado del proyecto |
| [CHECKLIST.md](CHECKLIST.md) | Tareas completadas |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Cómo contribuir |

---

## ⚠️ Puntos Críticos

1. **Mantén .env.local actualizado** según el entorno (Mock/Anvil/Sepolia)
2. **No commits .env.local** - es para desarrollo local
3. **Ejecuta tests antes de push** - `forge test && cd dapp && npm test`
4. **Formatea código** - `forge fmt && cd dapp && npm run format`

---

## 🎯 Hitos Próximos

| Hito | Estado | ETA |
|------|--------|-----|
| Anvil compilado | ⏳ | 30-60 min |
| Despliegue a Anvil | 📋 | Cuando Anvil esté listo |
| Testing con blockchain real | 📋 | Después de despliegue |
| Optimizaciones | 📋 | Post-testing |
| Seguridad audit | 📋 | Antes de mainnet |

---

## 💡 Tips

- **Mock mode es tu amigo** - úsalo para debugging rápido
- **No necesitas MetaMask para Anvil** - usa los 10 accounts integrados
- **Anvil es reversible** - puedes resetear estado con `anvil --fork-url`
- **Sepolia es gratis** - obtén testnet ETH de faucets

---

## 🆘 Si Necesitas Ayuda

1. Revisa [STATUS.md](STATUS.md) para estado actual
2. Consulta [CONTRIBUTING.md](CONTRIBUTING.md) para workflow
3. Abre [README.md](README.md) sección "Resolución de Problemas"
4. Verifica los logs: `F12` en navegador, consola en terminal

---

**Próximo checkpoint:** ✅ Anvil compilado + Despliegue a Anvil Local

*Últimas actualizaciones: 26 de diciembre de 2025*
