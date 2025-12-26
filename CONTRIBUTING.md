# Guía de Contribución - DocumentRegistry

## 🎯 Objetivo del Proyecto

DocumentRegistry es una dApp descentralizada para almacenar y verificar la autenticidad de documentos en blockchain Ethereum usando Solidity, Next.js y Foundry.

## 🚀 Comenzar a Contribuir

### Requisitos Previos

- Node.js 18+
- Rust/Cargo
- CMake + NASM
- Git

### Configuración Local

1. **Clonar el repositorio**
   ```bash
   git clone <repositorio>
   cd documentSignStorage
   ```

2. **Instalar dependencias**
   ```bash
   cd dapp && npm install && cd ..
   ```

3. **Compilar contratos**
   ```bash
   forge build
   ```

4. **Ejecutar tests**
   ```bash
   forge test
   ```

## 📋 Estructura del Código

### Smart Contracts (`contracts/`)
- `DocumentRegistry.sol` - Contrato principal
- `interfaces/IDocumentRegistry.sol` - Interface
- Tests en `test/DocumentRegistry.t.sol`

### Frontend (`dapp/`)
- `app/` - Pages y layout
- `components/` - Componentes React
- `contexts/` - State management con Context API
- `hooks/` - Hooks personalizados
- `utils/` - Utilidades y funciones helpers

### Scripts (`script/`)
- `Deploy.s.sol` - Script de despliegue

## 🔧 Convenciones de Código

### Solidity
```solidity
// Usar 0.8.20
pragma solidity ^0.8.20;

// Nombres en camelCase
function storeDocumentHash() external {}

// Comentarios NatSpec
/// @notice Almacena un documento
```

### TypeScript/React
```typescript
// Interfaces en PascalCase con prefijo I
interface IUser {
  id: string;
  name: string;
}

// Componentes en PascalCase
export function DocumentUploader() {}

// Hooks en camelCase
export function useContract() {}

// Variables en camelCase
const userName = 'John';
```

### Formato
- Usa Prettier: `npm run format` en `dapp/`
- Usa Solidity Formatter: `forge fmt`
- Ancho de línea: 100 caracteres
- Indentación: 2 espacios

## 📝 Commit Messages

Usa mensajes significativos en español:

```
✨ Agregar nueva funcionalidad
🐛 Corregir bug
📝 Documentación
🔧 Configuración
♻️ Refactorizar código
✅ Tests
🚀 Deploy/Release
```

Ejemplo:
```
✨ Agregar verificación de documentos en blockchain
- Implementar función verifyDocument en contrato
- Crear componente DocumentVerifier
- Agregar tests para verificación
```

## 🧪 Testing

### Smart Contracts
```bash
# Todos los tests
forge test

# Tests específicos
forge test --match-test testStoreDocument

# Con gas report
forge test --gas-report

# Con coverage
forge coverage
```

### Frontend
```bash
# En el directorio dapp/
npm test
```

## 📚 Documentación

- README.md - Documentación principal
- STATUS.md - Estado actual del proyecto
- Comentarios en código (NatSpec para Solidity, JSDoc para JS)

## 🔄 Workflow de Contribución

1. **Crear rama** (si es un cambio mayor)
   ```bash
   git checkout -b feature/mi-funcionalidad
   ```

2. **Hacer cambios y tests**
   - Modifica el código
   - Corre `forge test` para contratos
   - Corre `npm test` para frontend

3. **Commit y push**
   ```bash
   git add .
   git commit -m "✨ Descripción del cambio"
   git push origin feature/mi-funcionalidad
   ```

4. **Pull Request**
   - Describe los cambios
   - Incluye tests
   - Asegura que todos los tests pasen

## 🐛 Reporte de Bugs

Si encuentras un bug:

1. Verifica que no esté reportado
2. Abre un issue con:
   - Título descriptivo
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Stack trace si aplica

## ✅ Checklist para PRs

- [ ] Tests pasen (`forge test`, `npm test`)
- [ ] Código formateado (`forge fmt`, `npm run format`)
- [ ] Sin warnings de compilación
- [ ] Documentación actualizada
- [ ] Commit messages significativos

## 📞 Contacto

- Issues: Abre un issue en el repositorio
- Discussions: Para preguntas generales

---

¡Gracias por contribuir! 🙏
