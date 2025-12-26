import { ethers } from 'ethers';

/**
 * Utilidades criptográficas con Ethers.js v6
 */
export class EthersUtils {
  /**
   * Verifica una firma ECDSA
   */
  static verifySignature(
    message: string,
    signature: string,
    expectedAddress: string
  ): boolean {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    } catch (error) {
      console.error('[EthersUtils] Error verificando firma:', error);
      return false;
    }
  }

  /**
   * Recupera la dirección del firmante desde un mensaje y firma
   */
  static recoverAddress(message: string, signature: string): string | null {
    try {
      return ethers.verifyMessage(message, signature);
    } catch (error) {
      console.error('[EthersUtils] Error recuperando dirección:', error);
      return null;
    }
  }

  /**
   * Convierte un string a bytes32 (hash)
   */
  static stringToHash(input: string): string {
    return ethers.keccak256(ethers.toUtf8Bytes(input));
  }

  /**
   * Calcula el hash keccak256 de datos
   */
  static keccak256(data: Uint8Array): string {
    return ethers.keccak256(data);
  }

  /**
   * Codifica datos para empaquetar
   */
  static encodePackedBytes32(hash: string): string {
    return hash;
  }

  /**
   * Verifica si una dirección es válida
   */
  static isValidAddress(address: string): boolean {
    try {
      ethers.getAddress(address);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Formatea una dirección a formato checksum
   */
  static formatAddress(address: string): string {
    try {
      return ethers.getAddress(address);
    } catch {
      return address;
    }
  }
}
