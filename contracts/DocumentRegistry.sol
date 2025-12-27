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
    
    // Mapeo de dirección -> array de hashes que firmó
    mapping(address => bytes32[]) private userDocuments;
    
    // Estructura para almacenar información adicional de la firma
    struct SignatureRecord {
        string documentName;
        address signer;
        uint256 timestamp;
        bytes signature;
        bool verified;
    }
    
    // Mapeo de hash -> SignatureRecord
    mapping(bytes32 => SignatureRecord) private signatures;

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
     * @dev Almacena una firma de documento con nombre
     * @param hash Hash del documento
     * @param documentName Nombre del documento
     * @param timestamp Timestamp de la firma
     * @param signature Firma digital
     */
    function storeSignature(
        bytes32 hash,
        string calldata documentName,
        uint256 timestamp,
        bytes calldata signature
    ) external {
        require(hash != bytes32(0), "DocumentRegistry: Hash cannot be zero");
        require(signature.length > 0, "DocumentRegistry: Signature cannot be empty");
        require(bytes(documentName).length > 0, "DocumentRegistry: Document name cannot be empty");

        // Recuperar la dirección del firmante desde la firma
        address signer = recoverSigner(hash, signature);
        require(signer != address(0), "DocumentRegistry: Invalid signature");

        // Almacenar la firma con información adicional
        signatures[hash] = SignatureRecord({
            documentName: documentName,
            signer: signer,
            timestamp: timestamp,
            signature: signature,
            verified: true
        });

        // También guardar la referencia en storeDocumentHash si no existe
        if (!documents[hash].exists) {
            documents[hash] = Document({
                hash: hash,
                timestamp: timestamp,
                signer: signer,
                signature: signature,
                exists: true
            });
        }

        // Registrar el documento para el usuario
        userDocuments[signer].push(hash);

        // Emitir evento
        emit DocumentStored(hash, signer, timestamp, signature);
    }

    /**
     * @dev Almacena un documento sin requerir firma
     * Usa msg.sender como autenticidad (transacción blockchain)
     * @param hash Hash del documento
     * @param documentName Nombre del documento
     * @param timestamp Timestamp de cuándo se almacena
     */
    function storeDocument(
        bytes32 hash,
        string calldata documentName,
        uint256 timestamp
    ) external {
        require(hash != bytes32(0), "DocumentRegistry: Hash cannot be zero");
        require(bytes(documentName).length > 0, "DocumentRegistry: Document name cannot be empty");

        // Usar msg.sender como signer (el que envía la transacción)
        address signer = msg.sender;

        // Almacenar la firma sin firma criptográfica
        signatures[hash] = SignatureRecord({
            documentName: documentName,
            signer: signer,
            timestamp: timestamp,
            signature: bytes(''), // Sin firma
            verified: true
        });

        // También guardar la referencia en documents
        if (!documents[hash].exists) {
            documents[hash] = Document({
                hash: hash,
                timestamp: timestamp,
                signer: signer,
                signature: bytes(''),
                exists: true
            });
        }

        // Registrar el documento para el usuario
        userDocuments[signer].push(hash);

        // Emitir evento
        emit DocumentStored(hash, signer, timestamp, bytes(''));
    }

    /**
     * @dev Obtiene la información de una firma guardada
     * @param hash Hash del documento
     * @return record Información de la firma
     */
    function getSignatureRecord(bytes32 hash)
        external
        view
        returns (SignatureRecord memory record)
    {
        require(signatures[hash].verified, "DocumentRegistry: Signature not found");
        return signatures[hash];
    }

    /**
     * @dev Obtiene los documentos firmados por un usuario
     * @param signer Dirección del firmante
     * @return hashes Array de hashes de documentos firmados
     */
    function getUserDocuments(address signer)
        external
        view
        returns (bytes32[] memory hashes)
    {
        return userDocuments[signer];
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
    ) external view override returns (bool isValid) {
        require(hash != bytes32(0), "DocumentRegistry: Hash cannot be zero");
        require(signer != address(0), "DocumentRegistry: Signer cannot be zero");

        // Recuperar la dirección del firmante desde la firma
        address recoveredSigner = recoverSigner(hash, signature);

        // Verificar si el firmante recuperado coincide con el proporcionado
        isValid = recoveredSigner == signer && documents[hash].exists;

        // Emitir evento - NO se puede emitir en una función view
        // emit DocumentVerified(hash, signer, isValid);
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
