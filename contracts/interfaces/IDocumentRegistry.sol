// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IDocumentRegistry
 * @dev Interfaz para el registro y verificación de documentos en blockchain
 */
interface IDocumentRegistry {
    /**
     * @dev Estructura para almacenar información de un documento
     */
    struct Document {
        bytes32 hash;
        uint256 timestamp;
        address signer;
        bytes signature;
        bool exists;
    }

    /**
     * @dev Evento emitido cuando se almacena un documento
     */
    event DocumentStored(
        bytes32 indexed hash,
        address indexed signer,
        uint256 timestamp,
        bytes signature
    );

    /**
     * @dev Evento emitido cuando se verifica un documento
     */
    event DocumentVerified(
        bytes32 indexed hash,
        address indexed signer,
        bool isValid
    );

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
    ) external;

    /**
     * @dev Verifica la autenticidad de un documento
     * @param hash Hash del documento a verificar
     * @param signer Dirección del firmante
     * @param signature Firma a verificar
     * @return isValid True si la firma es válida, false en caso contrario
     */
    function verifyDocument(
        bytes32 hash,
        address signer,
        bytes calldata signature
    ) external view returns (bool isValid);

    /**
     * @dev Obtiene la información completa de un documento almacenado
     * @param hash Hash del documento
     * @return document Estructura con la información del documento
     */
    function getDocumentInfo(bytes32 hash)
        external
        view
        returns (Document memory document);

    /**
     * @dev Verifica si un hash de documento existe
     * @param hash Hash del documento
     * @return exists True si el documento existe
     */
    function isDocumentStored(bytes32 hash) external view returns (bool exists);

    /**
     * @dev Obtiene la firma de un documento específico
     * @param hash Hash del documento
     * @return signature Firma del documento
     */
    function getDocumentSignature(bytes32 hash)
        external
        view
        returns (bytes memory signature);
}
