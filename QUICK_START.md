# Quick Start Checklist

Use esta lista de verificación para asegurarse de que todo está correctamente configurado.

## Pre-requisitos ✓

- [ ] Node.js 18+ instalado (`node --version`)
- [ ] Cargo/Rust instalado (`rustc --version`)
- [ ] Foundry instalado (`forge --version` y `anvil --version`)
- [ ] Git instalado (`git --version`)

## Proyecto Clonado ✓

- [ ] Proyecto clonado en `c:\Users\Matias\Desktop\Proyectos de Entrenamiento CodeCrypto\documentSignStorage`
- [ ] Directorio `.git` existe
- [ ] Directorio `contracts/` existe
- [ ] Directorio `dapp/` existe

## Dependencias Instaladas ✓

```bash
cd dapp
npm install
```

- [ ] Carpeta `dapp/node_modules/` existe
- [ ] Archivo `dapp/package-lock.json` existe
- [ ] Sin errores en la instalación

## Verificación de Configuración ✓

```bash
# En el directorio raíz
forge build
```

- [ ] Compilación exitosa
- [ ] Carpeta `out/` creada
- [ ] Sin errores de compilación

## Ejecución en Tres Terminales ✓

### Terminal 1: Anvil
```bash
anvil
```
- [ ] Escucha en `127.0.0.1:8545`
- [ ] Muestra 10 cuentas disponibles
- [ ] Muestra "Listening" al inicio

### Terminal 2: Deploy
```bash
cd dapp/..
forge script script/Deploy.s.sol \
  --rpc-url http://localhost:8545 \
  --broadcast \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```
- [ ] Script ejecutado exitosamente
- [ ] Contrato desplegado
- [ ] Dirección del contrato visible en output
- [ ] Dirección copiada y guardada

### Terminal 3: dApp
```bash
cd dapp
```

**Actualizar .env.local:**
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=<TU_DIRECCIÓN>
NEXT_PUBLIC_RPC_URL=http://localhost:8545
NEXT_PUBLIC_CHAIN_ID=31337
```

- [ ] `.env.local` actualizado con dirección
- [ ] Archivo guardado

```bash
npm run dev
```
- [ ] Server escucha en `http://localhost:3000`
- [ ] Sin errores en compilación

## Navegador Web ✓

- [ ] Abre `http://localhost:3000`
- [ ] Página carga completamente
- [ ] Botón "Conectar Wallet" visible en esquina superior derecha

## Pruebas Básicas ✓

### Conectar Wallet
- [ ] Haz clic en "Conectar Wallet"
- [ ] Dropdown aparece con 10 opciones
- [ ] Selecciona Wallet 0
- [ ] Alerta de confirmación aparece
- [ ] Dirección de wallet muestra en botón

### Firmar Documento
- [ ] Crea archivo de prueba (`test.txt`)
- [ ] Arrastra o selecciona archivo
- [ ] Hash keccak256 aparece en pantalla
- [ ] Haz clic en "Firmar Documento"
- [ ] Alerta con mensaje de firma aparece
- [ ] Confirma en alerta
- [ ] Firma generada y mostrada
- [ ] Haz clic en "Almacenar en Blockchain"
- [ ] TX hash visible como confirmación

### Verificar Documento
- [ ] Cambia a pestaña "Verificar Documento"
- [ ] Sube el MISMO archivo
- [ ] Ingresa dirección de wallet que firmó
- [ ] Haz clic en "Verificar Documento"
- [ ] Resultado "Documento verificado correctamente" aparece
- [ ] Color verde indica éxito

### Cambiar Wallet
- [ ] Haz clic en dirección actual
- [ ] Dropdown con 10 wallets aparece
- [ ] Selecciona Wallet 1
- [ ] Dirección cambia en pantalla
- [ ] Contexto global actualiza

## Resolución de Problemas ✓

Si algo no funciona:

### Anvil no se inicia
- [ ] Verifica que Foundry esté instalado: `anvil --version`
- [ ] Puerto 8545 no está en uso: `netstat -ano | findstr :8545`
- [ ] Intenta nuevamente: `anvil`

### Contrato no se despliega
- [ ] Anvil está ejecutándose en Terminal 1
- [ ] RPC URL es correcto: `http://localhost:8545`
- [ ] Clave privada es válida
- [ ] Comando copiado correctamente

### dApp no carga
- [ ] Cancela proceso (Ctrl+C) y reinicia
- [ ] Verifica `.env.local` tiene dirección correcta
- [ ] Limpia caché del navegador (Ctrl+Shift+Del)
- [ ] Abre en modo incógnito

### Wallet no conecta
- [ ] Haz clic en "Conectar Wallet"
- [ ] Espera a que dropdown aparezca
- [ ] Selecciona una wallet
- [ ] Confirma alerta
- [ ] Revisa consola (F12) para errores

### Firma falla
- [ ] Wallet debe estar conectado
- [ ] Archivo debe tener hash válido
- [ ] Confirma alerta de firma
- [ ] Revisa consola para errores específicos

### Verificación no funciona
- [ ] Documento DEBE estar almacenado en blockchain
- [ ] Dirección de firmante DEBE coincidir
- [ ] Hash DEBE ser el mismo
- [ ] Intenta nuevamente sin cambiar datos

## Logs y Debugging ✓

### Ver Logs del Navegador
- Presiona `F12` para abrir DevTools
- Ve a pestaña "Console"
- Busca mensajes con `[MetaMask]`, `[FileHash]`, `[useContract]`

### Ver Logs de Terminal
- Terminal 1 (Anvil): Muestra transacciones
- Terminal 2 (Deploy): Muestra dirección del contrato
- Terminal 3 (dApp): Muestra cambios de archivos

### Comando Útil: Limpiar Caché
```bash
# En Terminal 3, presiona Ctrl+C
cd dapp
rm -r .next node_modules package-lock.json
npm install
npm run dev
```

## Archivos Críticos ✓

Verifica que estos archivos existen:

```
documentSignStorage/
├── contracts/DocumentRegistry.sol      [ ]
├── contracts/interfaces/IDocumentRegistry.sol [ ]
├── test/DocumentRegistry.t.sol         [ ]
├── script/Deploy.s.sol                 [ ]
├── dapp/app/page.tsx                   [ ]
├── dapp/app/layout.tsx                 [ ]
├── dapp/contexts/MetaMaskContext.tsx   [ ]
├── dapp/components/WalletSelector.tsx  [ ]
├── dapp/components/FileUploader.tsx    [ ]
├── dapp/components/DocumentSigner.tsx  [ ]
├── dapp/.env.local                     [ ]
├── foundry.toml                        [ ]
├── README.md                           [ ]
└── INSTRUCCIONES_PASO_A_PASO.md        [ ]
```

## Comandos Rápidos ✓

Guarда estos comandos para referencia:

```bash
# Verificar instalación
node --version
npm --version
forge --version
anvil --version

# Navegar al proyecto
cd c:\Users\Matias\Desktop\Proyectos\ de\ Entrenamiento\ CodeCrypto\documentSignStorage

# Compilar contrato
forge build

# Iniciar Anvil
anvil

# Desplegar contrato
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Instalar dependencias
cd dapp && npm install

# Iniciar dApp
npm run dev

# Build para producción
npm run build

# Limpiar caché
rm -r .next node_modules && npm install
```

## Escalas de Éxito ✓

### Nivel 1: Funcionalidad Básica
- [ ] Anvil ejecutándose
- [ ] Contrato desplegado
- [ ] dApp cargando

### Nivel 2: Conexión de Wallet
- [ ] Wallet conectado
- [ ] Dirección visible
- [ ] Cambio de wallet funciona

### Nivel 3: Firma de Documentos
- [ ] Archivo subido
- [ ] Hash calculado
- [ ] Documento firmado
- [ ] Almacenado en blockchain

### Nivel 4: Verificación Completa
- [ ] Documento verificado correctamente
- [ ] Resultado mostrado en UI
- [ ] Todo funciona sin errores

## Próximos Pasos ✓

Una vez que todo esté funcionando:

- [ ] Lee el archivo `ARQUITECTURA.md` para entender el proyecto
- [ ] Modifica los estilos en `tailwind.config.js`
- [ ] Agrega nuevas funciones al contrato
- [ ] Implementa persistencia en localStorage
- [ ] Deploy en testnet Sepolia
- [ ] Integra con MetaMask para producción

---

**¿Todo en verde? ¡Felicidades, tu dApp está lista!** 🎉
