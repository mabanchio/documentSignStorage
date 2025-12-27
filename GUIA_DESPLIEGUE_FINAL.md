# 📋 GUÍA FINAL: Desplegar en Ganache con Integración Blockchain

## ✅ Estado Actual del Proyecto

### Ganache en Ejecución
- **RPC URL:** `http://127.0.0.1:8545`
- **Chain ID:** 1337
- **Estado:** ✅ Corriendo en `127.0.0.1:8545`

### Contrato Desplegado
- **Dirección:** `0xe78a0f7e598cc8b0bb87894b0f60dd2a88d6a8ab`
- **Red:** Ganache (Chain ID 1337)
- **Funciones:** storeSignature(), getSignatureRecord(), getUserDocuments()
- **Estado:** ✅ Activo y aceptando transacciones

### Integración MetaMask
- **Modo:** Dual (MetaMask Real + Ganache Fallback)
- **Redes Soportadas:** Localhost 8545 (Chain ID 1337)
- **Estado:** ✅ Configurado y funcionando

---

## 🚀 PASOS PARA DESPLEGAR (PRIMERO):

### OPCIÓN A: Desplegar Manualmente (RECOMENDADO)

**Paso 1:** Abre una NUEVA terminal PowerShell (no cierres donde corre Ganache)

**Paso 2:** En la nueva terminal, ejecuta:
```powershell
cd c:\Users\Matias\Desktop\Proyectos de Entrenamiento CodeCrypto\documentSignStorage
```

**Paso 3:** Compila los contratos:
```powershell
forge build
```

**Paso 4:** Despliega:
```powershell
forge script script/Deploy.s.sol:Deploy --rpc-url http://127.0.0.1:8545 --broadcast
```

**Espera 30-60 segundos...**

Deberías ver algo como:
```
Script ran successfully.
Transactions saved to broadcast/Deploy.s.sol/1337/run-latest.json
DocumentRegistry desplegado en: 0xe78a0f7e598cc8b0bb87894b0f60dd2a88d6a8ab
```

---

## 📝 DESPUÉS DEL DESPLIEGUE:

### 1. Obtén la Dirección del Contrato
```powershell
cat broadcast/Deploy.s.sol/1337/run-latest.json | findstr contractAddress
```

### 2. Actualiza `.env.local` en la carpeta `dapp`:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0xe78a0f7e598cc8b0bb87894b0f60dd2a88d6a8ab
```

### 3. Configura MetaMask (si NO está configurado):
**Agregar Red Personalizada:**
- Nombre: `Ganache Local`
- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `1337`
- Moneda: `ETH`

**Importar Cuenta:**
- Clave privada: `0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d`
- Dirección: `0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1` (Ganache Account 0)

### 4. Inicia la dApp:
```powershell
cd dapp
npm run dev
```

### 5. Abre en navegador:
```
http://localhost:3000
```

---

## 🔐 FLUJO DE FUNCIONAMIENTO:

### Firmar Documento:
1. Usuario selecciona archivo
2. **MetaMask pop-up aparece**
3. Usuario confirma firma
4. **Transacción blockchain (storeSignature):**
   - Guarda documento en contrato
   - Gas usado: ~432,893 wei
   - Espera 1 confirmación
5. **Si blockchain tiene éxito:** Documento se guarda en localStorage (Historial)
6. **Si blockchain falla:** Se muestra mensaje de error amigable

### Manejo de Errores:
- ❌ **Rechazo del usuario:** "Firma cancelada por el usuario"
- ❌ **Fondos insuficientes:** "Saldo insuficiente para pagar el gas"
- ❌ **Error de red:** "Error de conexión con la red"

### Métodos de Firma:
- ✅ **Si MetaMask está instalada:** Usa extensión real
- ✅ **Si NO está instalada:** Usa billeteras simuladas de Ganache (10 cuentas)

---

## ⚠️ IMPORTANTE:

- **NO cierres la terminal donde corre Ganache** (necesita seguir corriendo)
- **Mantén Ganache abierto mientras desarrollas**
- Si Ganache se apaga, ejecuta: `ganache --port 8545`
- **MetaMask debe estar conectada a Localhost 8545 (Chain ID 1337)**
- Solo **primera cuenta tiene fondos suficientes** para múltiples transacciones

---

## 🔗 INFORMACIÓN DE REFERENCIA:

### Ganache Accounts (10 disponibles):
```
Account 0 (Cuenta Principal):
├── Dirección: 0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1
├── Clave privada: 0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d
└── Saldo: 1000 ETH

Accounts 1-9: Disponibles con 1000 ETH cada una
(Consulta DOCUMENTACION_COMPLETA.md para lista completa)
```

### Comandos Útiles:
```powershell
# Verificar Ganache en ejecución
netstat -ano | findstr :8545

# Ver último deployment
cat broadcast/Deploy.s.sol/1337/run-latest.json

# Compilar contratos
forge build

# Ejecutar tests
forge test
```

---

**Última actualización:** 27 de diciembre de 2025  
**Versión:** 2.0.0 - Con Integración Blockchain  
**Estado:** ✅ Completamente funcional
