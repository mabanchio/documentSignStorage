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
     * @dev Crea una firma válida para testing usando la clave privada
     */
    function createSignature(bytes32 hash) internal view returns (bytes memory) {
        // Usar vm.sign para crear una firma válida con la clave privada
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerPrivateKey, hash);
        
        // Convertir v, r, s a formato bytes concatenado (65 bytes)
        bytes memory sig = abi.encodePacked(r, s, v);
        
        return sig;
    }
}
