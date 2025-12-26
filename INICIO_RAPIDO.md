# 🚀 GUÍA COMPLETA DE INICIO - DocumentRegistry dApp

## Estado Actual ⏳

Anvil se está compilando desde Rust. **Tiempo estimado: 15-40 minutos** (dependiendo de tu sistema)

---

## OPCIÓN A: Comienza AHORA con Sepolia Testnet ⭐

**Ventaja**: No necesitas esperar, comienzas inmediatamente
**Desventaja**: Requiere ETH real (gratis en faucet)

### Paso 1: Configurar MetaMask
1. Instala MetaMask: https://metamask.io/
2. En MetaMask, ve a Settings → Networks → Add Network
3. Agrega Sepolia:
   - Network Name: Sepolia
   - RPC URL: `https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161`
   - Chain ID: `11155111`
   - Currency: ETH

### Paso 2: Obtén ETH de prueba
1. Abre: https://sepoliafaucet.com/
2. Conecta MetaMask
3. Solicita 0.5 ETH (toma 1-2 minutos)

### Paso 3: Despliega el contrato a Sepolia
```bash
$env:PATH = "$env:USERPROFILE\.cargo\bin;" + $env:PATH

forge script script/Deploy.s.sol \
  --rpc-url https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161 \
  --broadcast \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### Paso 4: Copia la dirección desplegada y actualiza `.env.local`:
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x... (de la salida anterior)
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161
NEXT_PUBLIC_CHAIN_ID=11155111
```

### Paso 5: Inicia la dApp
```bash
cd dapp
npm install  # (solo la primera vez)
npm run dev
```

Accede a: `http://localhost:3000`

---

## OPCIÓN B: Espera por Anvil Local (Desarrollo óptimo)

**Ventaja**: No requiere Internet ni ETH real, más rápido, desarrollo offline
**Desventaja**: Debes esperar a que termine la compilación (15-40 min)

### Verificar si Anvil está listo:
```bash
# Ejecuta cada 2 minutos:
$env:PATH = "$env:USERPROFILE\.cargo\bin;" + $env:PATH
Test-Path "$env:USERPROFILE\.cargo\bin\anvil.exe"
```

Cuando devuelva `True`, sigue estos pasos:

### Paso 1: Inicia Anvil (Terminal 1)
```bash
$env:PATH = "$env:USERPROFILE\.cargo\bin;" + $env:PATH
anvil --accounts 10 --balance 10000 --port 8545
```

Deberías ver:
```
                             _   _
                            (_) | |
      __ _  _ __  __   __ _  _  | |
     / _` || '_ \ \ \ / / _` || || |
    | (_| || | | | \ V / (_| || || |
     \__,_||_| |_|  \_/ \__,_||_||_|

    anvil 0.1.0
    Listening on 127.0.0.1:8545
```

### Paso 2: Despliega el contrato (Terminal 2)
```bash
$env:PATH = "$env:USERPROFILE\.cargo\bin;" + $env:PATH

cd c:\Users\Matias\Desktop\Proyectos\ de\ Entrenamiento\ CodeCrypto\documentSignStorage

forge script script/Deploy.s.sol \
  --rpc-url http://localhost:8545 \
  --broadcast \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### Paso 3: Actualiza `.env.local` (Copiar la dirección del paso anterior)
```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x... (de la salida anterior)
NEXT_PUBLIC_RPC_URL=http://localhost:8545
NEXT_PUBLIC_CHAIN_ID=31337
```

### Paso 4: Inicia la dApp (Terminal 3)
```bash
cd dapp
npm install  # (solo la primera vez)
npm run dev
```

Accede a: `http://localhost:3000`

---

## COMPARATIVA

| Característica | Sepolia | Anvil Local |
|---|---|---|
| ⏱️ Tiempo inicio | 5 minutos | 15-40 min (esperar compilación) |
| 💻 Requiere Internet | Sí | No |
| 💰 Costo | Gratis (ETH fake) | Gratis |
| ⚡ Velocidad | 12s por transacción | Instantáneo |
| 🔧 Desarrollo | Bueno | Excelente |
| 🧪 Testing | Bueno | Excelente |

**Recomendación**: Comienza con **Sepolia ahora** mientras Anvil compila. Luego cambia a **Anvil** cuando esté listo para desarrollo más rápido.

---

## Flujo de Documentos

### 1️⃣ Conectar Billetera
- Click "Conectar Billetera"
- Selecciona una cuenta (0-9 si es Anvil, o tu MetaMask si es Sepolia)

### 2️⃣ Cargar Documento
- Click en el tab "Cargar Documento"
- Sube un PDF, imagen o archivo de texto
- El hash se calcula automáticamente

### 3️⃣ Firmar Documento
- Click "Firmar documento"
- Confirma la transacción
- Verás el hash de transacción

### 4️⃣ Verificar Documento
- Click en el tab "Verificar Documento"
- Carga el **mismo archivo** original
- Si los hashes coinciden: ✅ Auténtico
- Si no coinciden: ❌ Falsificado

---

## Troubleshooting

### Error: "Cannot connect to http://localhost:8545"
- ❌ Anvil no está corriendo
- ✅ Inicia Anvil en la Terminal 1

### Error: "Contract address not found"
- ❌ Olvidad copiar la dirección desplegada
- ✅ Re-despliega el contrato y copia bien la dirección

### Transacción lenta en Sepolia
- ✅ Normal, toma 12+ segundos
- Con Anvil será instantáneo

### "Unknown account #0" error
- ❌ Estás usando una cuenta no disponible
- ✅ Con Anvil usa 0-9; con Sepolia usa tu MetaMask

---

## Verificar Instalación

```bash
# Verifica que forge está disponible:
forge --version
# Debe mostrar: forge 0.2.0 (algo similar)

# Verifica que anvil está compilándose:
tasklist | findstr cargo
# Si hay un proceso "cargo", está compilando

# Verifica que npm funciona:
npm --version
```

---

## Próximos Pasos

1. **Elige una opción** (Sepolia o Anvil)
2. **Sigue los pasos** correspondientes
3. **Abre http://localhost:3000**
4. **¡Prueba a firmar documentos!**

---

## Contacto / Preguntas

Si tienes problemas:
1. Verifica que el `.env.local` tiene la dirección correcta
2. Asegúrate de que Anvil O Sepolia está corriendo
3. Revisa la consola del navegador (F12) para errores

¡Buena suerte! 🚀
