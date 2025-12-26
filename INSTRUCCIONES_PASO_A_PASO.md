# Guía Paso a Paso para Ejecutar el Proyecto

Esta guía te proporciona instrucciones detalladas para instalar, configurar y ejecutar la dApp de Verificación de Documentos.

## PARTE 1: INSTALACIÓN DE HERRAMIENTAS

### Paso 1.1: Instalar Node.js (si no lo tienes)

1. Descarga Node.js desde https://nodejs.org/ (versión LTS 18+)
2. Ejecuta el instalador y sigue las instrucciones
3. Verifica la instalación:
   ```bash
   node --version
   npm --version
   ```

### Paso 1.2: Instalar Foundry

**Si tienes Rust instalado:**
```bash
cargo install --git https://github.com/foundry-rs/foundry foundry-cli anvil
```

**Si NO tienes Rust, primero instala Rust:**
```powershell
# En PowerShell como administrador:
iwr https://win.rustup.rs -o rustup-init.exe; .\rustup-init.exe -y
```

Luego instala Foundry:
```bash
cargo install --git https://github.com/foundry-rs/foundry foundry-cli anvil
```

**Verifica la instalación:**
```bash
forge --version
anvil --version
```

## PARTE 2: PREPARACIÓN DEL PROYECTO

### Paso 2.1: Navegar al Directorio del Proyecto

```bash
cd c:\Users\Matias\Desktop\Proyectos\ de\ Entrenamiento\ CodeCrypto\documentSignStorage
```

### Paso 2.2: Verificar la Estructura

Verifica que existan estas carpetas:
- `contracts/` - Smart contracts
- `dapp/` - Aplicación Next.js
- `test/` - Tests
- `script/` - Scripts de despliegue

### Paso 2.3: Instalar Dependencias de dApp

```bash
cd dapp
npm install
```

Este proceso puede tomar 2-5 minutos. Espera a que termine sin interrupciones.

## PARTE 3: EJECUTAR EN TRES TERMINALES

### Terminal 1: Iniciar Anvil (Nodo Local de Ethereum)

1. Abre una **NUEVA terminal** (PowerShell, CMD o Git Bash)
2. Navega al directorio del proyecto:
   ```bash
   cd c:\Users\Matias\Desktop\Proyectos\ de\ Entrenamiento\ CodeCrypto\documentSignStorage
   ```
3. Ejecuta Anvil:
   ```bash
   anvil
   ```

Deberías ver:

```
Listening on 127.0.0.1:8545
Available Accounts:
(0) 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 (10000.000000000000000000 ETH)
(1) 0x70997970c51812e339d9b73b0245ad59aac7a6ca (10000.000000000000000000 ETH)
...
```

**⚠️ DEJA ESTA TERMINAL ABIERTA Y EN EJECUCIÓN**

### Terminal 2: Desplegar el Contrato

1. Abre una **NUEVA terminal**
2. Navega al directorio:
   ```bash
   cd c:\Users\Matias\Desktop\Proyectos\ de\ Entrenamiento\ CodeCrypto\documentSignStorage
   ```
3. Compila el contrato:
   ```bash
   forge build
   ```

   Deberías ver:
   ```
   [0] Installing foundry/lib/openzeppelin-contracts
   [⠢] installing (this may take a moment)...
   Compiling 1 file with 0.8.20
   Finished in XXXms
   ```

4. Ahora despliega el contrato:
   ```bash
   forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```

5. **IMPORTANTE**: En la salida, busca esta línea:
   ```
   DocumentRegistry desplegado en: 0x<DIRECCIÓN>
   ```
   
   Copia la dirección que aparece (ejemplo: `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0`)

### Terminal 3: Ejecutar la dApp

1. Abre una **TERCERA terminal**
2. Navega al directorio dapp:
   ```bash
   cd c:\Users\Matias\Desktop\Proyectos\ de\ Entrenamiento\ CodeCrypto\documentSignStorage\dapp
   ```

3. Actualiza el archivo `.env.local` con la dirección del contrato:
   
   **Opción A: Con Visual Studio Code**
   - Abre `.env.local` en el editor
   - Reemplaza `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0` con tu dirección
   - Guarda (Ctrl+S)

   **Opción B: Con PowerShell**
   ```powershell
   # Reemplaza <TU_DIRECCIÓN> con la dirección que copiaste
   @"
   NEXT_PUBLIC_CONTRACT_ADDRESS=<TU_DIRECCIÓN>
   NEXT_PUBLIC_RPC_URL=http://localhost:8545
   NEXT_PUBLIC_CHAIN_ID=31337
   "@ | Out-File -Encoding UTF8 -FilePath .env.local
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

   Deberías ver:
   ```
   ▲ Next.js 14.0.0
   - Local:        http://localhost:3000
   ```

5. Abre http://localhost:3000 en tu navegador

## PARTE 4: USAR LA APLICACIÓN

### Paso 4.1: Conectar Wallet

1. Haz clic en **"Conectar Wallet"** (arriba a la derecha)
2. Se abrirá un dropdown con las 10 wallets de Anvil
3. Selecciona cualquiera (ej: Wallet 0)
4. Verás una alerta confirmando la conexión
5. El botón cambiará mostrando tu dirección (ej: `0xf39f...3266`)

### Paso 4.2: Firmar un Documento

1. Asegúrate de estar en la pestaña **"Firmar Documento"**
2. Busca la sección "Selecciona un Archivo" a la izquierda
3. Haz clic en el área gris o arrastra un archivo:
   - Puedes usar cualquier archivo: PDF, imagen, documento, etc.
   - Ejemplo: crea un archivo de texto vacío para pruebas
4. La app calculará automáticamente el hash keccak256
5. En la sección "Firmar y Almacenar" a la derecha, haz clic en **"Firmar Documento"**
6. Verás una alerta con el mensaje a firmar
7. Haz clic en **OK** para confirmar
8. Aparecerá un cuadro verde mostrando la firma
9. Haz clic en **"Almacenar en Blockchain"**
10. Confirma nuevamente en la alerta
11. Verás un hash de transacción como confirmación

### Paso 4.3: Verificar un Documento

1. Cambia a la pestaña **"Verificar Documento"**
2. Sube el **MISMO archivo** que firmaste antes
3. Ingresa la dirección de la wallet que lo firmó (ej: `0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266`)
4. Haz clic en **"Verificar Documento"**
5. Deberías ver un mensaje verde: **"Documento verificado correctamente"**

### Paso 4.4: Cambiar de Wallet

1. Haz clic en tu dirección actual (esquina superior derecha)
2. Se abrirá un dropdown con las 10 wallets
3. Selecciona otra wallet
4. Tu sesión se actualizará automáticamente

## PARTE 5: EJEMPLOS DE USO

### Crear un Archivo de Prueba

**Opción 1: Archivo de Texto**
1. Abre el Bloc de Notas
2. Escribe algo como: "Este es un documento de prueba"
3. Guarda como `test.txt` en el Escritorio
4. Úsalo en la dApp

**Opción 2: Desde PowerShell**
```powershell
"Este es un documento de prueba" | Out-File -Encoding UTF8 -FilePath test.txt
```

### Probar con Múltiples Documentos

1. Crea varios archivos diferentes
2. Firma cada uno con wallets diferentes
3. Verifica que cada documento solo es válido con su wallet original
4. Intenta verificar un documento con una wallet diferente (debería fallar)

## TROUBLESHOOTING (Solución de Problemas)

### Error: "Anvil no se encuentra"

**Solución:**
```bash
# Asegúrate de que Rust y Cargo estén en PATH
$env:PATH
# Si ves ~/.cargo/bin en la salida, está bien

# Si no, agrega manualmente:
$env:PATH += ";$env:USERPROFILE\.cargo\bin"
anvil
```

### Error: "Cannot connect to http://localhost:8545"

**Solución:**
1. Verifica que Anvil esté ejecutándose en Terminal 1
2. Asegúrate de no tener otro programa en el puerto 8545
3. Intenta en otra terminal:
   ```bash
   netstat -ano | findstr :8545
   ```

### Error: "Contract address not configured"

**Solución:**
1. Verifica que `.env.local` exista en `dapp/`
2. Verifica que contenga la dirección correcta del contrato
3. Reinicia el servidor (Ctrl+C y `npm run dev` de nuevo)

### Los botones no responden

**Solución:**
1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Console"
3. Busca mensajes de error en rojo
4. Verifica que:
   - Anvil esté ejecutándose
   - El contrato esté desplegado
   - `.env.local` tenga la dirección correcta

### "Wallet no conectado"

**Solución:**
1. Haz clic en "Conectar Wallet"
2. Espera a que aparezca el dropdown
3. Selecciona Wallet 0
4. Confirma cualquier alerta que aparezca

## PASOS PARA DETENER TODO

Cuando termines:

1. **Terminal 1 (Anvil)**: Presiona `Ctrl+C`
2. **Terminal 2**: Presiona `Ctrl+C`
3. **Terminal 3 (dApp)**: Presiona `Ctrl+C`
4. Cierra las terminales

## PRÓXIMOS PASOS

Después de que todo funcione:

1. Modifica los componentes para agregar nuevas funcionalidades
2. Personaliza los estilos de Tailwind CSS
3. Agrega más funciones al contrato (ej: revocar documentos)
4. Implementa persistencia de datos en localStorage
5. Agrega más validaciones

## RECURSOS ÚTILES

- **Documentación de Ethers.js**: https://docs.ethers.org/v6/
- **Documentación de Next.js**: https://nextjs.org/docs
- **Documentación de Foundry**: https://book.getfoundry.sh/
- **Solidity by Example**: https://solidity-by-example.org/

## OBTENER AYUDA

Si encuentras problemas:

1. Revisa los logs en la consola del navegador (F12)
2. Revisa los logs de la terminal
3. Asegúrate de que todas las terminales estén ejecutándose
4. Recrea las terminales desde cero
5. Reinstala dependencias con `npm install` en `dapp/`

---

**¡Felicidades! Ahora tienes tu dApp funcionando localmente en Ethereum!**
