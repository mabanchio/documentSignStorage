# Smart Contracts - ETH Database Document

## Descripción

Este directorio contiene los smart contracts Solidity para el sistema de registro y verificación de documentos en blockchain.

## Contrato Principal: DocumentRegistry.sol

### Funcionalidades

- **storeDocumentHash**: Almacena el hash de un documento junto con timestamp y firma digital
- **verifyDocument**: Verifica la autenticidad de un documento validando la firma ECDSA
- **getDocumentInfo**: Obtiene la información completa de un documento almacenado
- **isDocumentStored**: Verifica si un documento existe
- **getDocumentSignature**: Obtiene la firma de un documento específico

### Estructura de Datos

```solidity
struct Document {
    bytes32 hash;        // Hash keccak256 del documento
    uint256 timestamp;   // Timestamp de cuando se almacenó
    address signer;      // Dirección del que firmó
    bytes signature;     // Firma digital ECDSA
    bool exists;         // Flag de existencia
}
```

## Compilación

```bash
cd ..
forge build
```

## Testing

```bash
forge test
```

## Despliegue en Anvil

```bash
# Terminal 1: Iniciar Anvil
anvil

# Terminal 2: Desplegar contrato
forge script script/Deploy.s.sol \
  --rpc-url http://localhost:8545 \
  --broadcast \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

## Seguridad

- Utiliza ECDSA (Elliptic Curve Digital Signature Algorithm) para validar firmas
- Verifica hash y firma antes de almacenar
- Previene duplicados con flag `exists`
- Almacenamientos inmutables en blockchain

## Interfaz (IDocumentRegistry.sol)

Proporciona la interfaz pública para interactuar con el contrato de registro de documentos.
