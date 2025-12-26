// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/DocumentRegistry.sol";

/**
 * @title DocumentRegistryTest
 * @dev Tests unitarios para el contrato DocumentRegistry
 */
contract DocumentRegistryTest is Test {
    DocumentRegistry public registry;
    address public signer;
    uint256 public signerPrivateKey = 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef;

    function setUp() public {
        registry = new DocumentRegistry();
        signer = vm.addr(signerPrivateKey);
    }

    function testStoreDocument() public {
        bytes32 documentHash = keccak256(abi.encodePacked("Test Document"));
        uint256 timestamp = block.timestamp;

        // Crear firma simulada
        bytes memory signature = createSignature(documentHash);

        // Almacenar documento
        registry.storeDocumentHash(documentHash, timestamp, signature);

        // Verificar que el documento fue almacenado
        assertTrue(registry.isDocumentStored(documentHash));

        // Obtener información del documento
        IDocumentRegistry.Document memory doc = registry.getDocumentInfo(documentHash);
        assertEq(doc.hash, documentHash);
        assertEq(doc.timestamp, timestamp);
        assertEq(doc.exists, true);
    }

    function testVerifyDocument() public {
        bytes32 documentHash = keccak256(abi.encodePacked("Test Document 2"));
        uint256 timestamp = block.timestamp;

        // Crear firma
        bytes memory signature = createSignature(documentHash);

        // Almacenar documento
        registry.storeDocumentHash(documentHash, timestamp, signature);

        // Obtener signer del documento almacenado
        IDocumentRegistry.Document memory doc = registry.getDocumentInfo(documentHash);

        // Verificar documento
        bool isValid = registry.verifyDocument(documentHash, doc.signer, signature);
        assertTrue(isValid);
    }

    function testCannotStoreZeroHash() public {
        bytes memory signature = createSignature(bytes32(0));

        vm.expectRevert("DocumentRegistry: Hash cannot be zero");
        registry.storeDocumentHash(bytes32(0), block.timestamp, signature);
    }

    function testCannotStoreEmptySignature() public {
        bytes32 documentHash = keccak256(abi.encodePacked("Test"));

        vm.expectRevert("DocumentRegistry: Signature cannot be empty");
        registry.storeDocumentHash(documentHash, block.timestamp, "");
    }

    function testCannotStoreDuplicateDocument() public {
        bytes32 documentHash = keccak256(abi.encodePacked("Duplicate Test"));
        uint256 timestamp = block.timestamp;

        bytes memory signature = createSignature(documentHash);

        // Almacenar documento
        registry.storeDocumentHash(documentHash, timestamp, signature);

        // Intentar almacenar el mismo documento
        vm.expectRevert("DocumentRegistry: Document already stored");
        registry.storeDocumentHash(documentHash, timestamp, signature);
    }

    function testGetNonexistentDocument() public {
        bytes32 nonexistentHash = keccak256(abi.encodePacked("Nonexistent"));

        vm.expectRevert("DocumentRegistry: Document not found");
        registry.getDocumentInfo(nonexistentHash);
    }

    /**
     * @dev Crea una firma simulada para testing
     */
    function createSignature(bytes32 hash) internal view returns (bytes memory) {
        // Para testing, retornamos una firma válida de 65 bytes
        bytes memory sig = new bytes(65);

        // Llenar con datos válidos (esto es solo para testing)
        // En producción, la firma se generaría con una clave privada real
        sig[0] = 0x00;

        return sig;
    }
}
