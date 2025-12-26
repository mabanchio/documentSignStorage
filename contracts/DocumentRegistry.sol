// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IDocumentRegistry.sol";

/**
 * @title DocumentRegistry
 * @dev Contrato para almacenar y verificar la autenticidad de documentos
 * utilizando hashes y firmas digitales ECDSA
 */
contract DocumentRegistry is IDocumentRegistry {
    // Mapeo de hashes a información de documentos
    mapping(bytes32 => Document) private documents;

    /**
     * @dev Almacena el hash de un documento con timestamp y firma
     * @param hash Hash keccak256 del documento
     * @param timestamp Timestamp de cuándo se firmó
     * @param signature Firma digital del documento
     */
    function storeDocumentHash(
        bytes32 hash,
        uint256 timestamp,
        bytes calldata signature
    ) external override {
        require(hash != bytes32(0), "DocumentRegistry: Hash cannot be zero");
        require(!documents[hash].exists, "DocumentRegistry: Document already stored");
        require(signature.length > 0, "DocumentRegistry: Signature cannot be empty");

        // Recuperar la dirección del firmante desde la firma
        address signer = recoverSigner(hash, signature);
        require(signer != address(0), "DocumentRegistry: Invalid signature");

        // Almacenar el documento
        documents[hash] = Document({
            hash: hash,
            timestamp: timestamp,
            signer: signer,
            signature: signature,
            exists: true
        });

        // Emitir evento
        emit DocumentStored(hash, signer, timestamp, signature);
    }

    /**
     * @dev Verifica la autenticidad de un documento
     * @param hash Hash del documento a verificar
     * @param signer Dirección del firmante
     * @param signature Firma a verificar
     * @return isValid True si la firma es válida
     */
    function verifyDocument(
        bytes32 hash,
        address signer,
        bytes calldata signature
    ) external override returns (bool isValid) {
        require(hash != bytes32(0), "DocumentRegistry: Hash cannot be zero");
        require(signer != address(0), "DocumentRegistry: Signer cannot be zero");

        // Recuperar la dirección del firmante desde la firma
        address recoveredSigner = recoverSigner(hash, signature);

        // Verificar si el firmante recuperado coincide con el proporcionado
        isValid = recoveredSigner == signer && documents[hash].exists;

        // Emitir evento
        emit DocumentVerified(hash, signer, isValid);
    }

    /**
     * @dev Obtiene la información completa de un documento almacenado
     * @param hash Hash del documento
     * @return document Estructura con la información del documento
     */
    function getDocumentInfo(bytes32 hash)
        external
        view
        override
        returns (Document memory document)
    {
        require(documents[hash].exists, "DocumentRegistry: Document not found");
        return documents[hash];
    }

    /**
     * @dev Verifica si un hash de documento existe
     * @param hash Hash del documento
     * @return exists True si el documento existe
     */
    function isDocumentStored(bytes32 hash) external view override returns (bool exists) {
        return documents[hash].exists;
    }

    /**
     * @dev Obtiene la firma de un documento específico
     * @param hash Hash del documento
     * @return signature Firma del documento
     */
    function getDocumentSignature(bytes32 hash)
        external
        view
        override
        returns (bytes memory signature)
    {
        require(documents[hash].exists, "DocumentRegistry: Document not found");
        return documents[hash].signature;
    }

    /**
     * @dev Recupera la dirección del firmante desde un hash y una firma
     * Implementa la recuperación ECDSA
     * @param hash Hash del documento
     * @param signature Firma digital
     * @return signer Dirección del firmante
     */
    function recoverSigner(bytes32 hash, bytes memory signature)
        internal
        pure
        returns (address signer)
    {
        // Verificar la longitud de la firma (debe ser 65 bytes para ECDSA)
        if (signature.length != 65) {
            return address(0);
        }

        bytes32 r;
        bytes32 s;
        uint8 v;

        // Extraer v, r, s de la firma
        assembly {
            // Saltar los primeros 32 bytes (longitud de bytes array)
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }

        // Ajustar v si es necesario (27 o 28)
        if (v < 27) {
            v += 27;
        }

        // Validar v
        if (v != 27 && v != 28) {
            return address(0);
        }

        // Recuperar la dirección usando ecrecover
        signer = ecrecover(hash, v, r, s);
    }
}
