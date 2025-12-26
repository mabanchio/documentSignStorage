import { ethers } from 'ethers';

/**
 * Utilidades para cálculo de hashes
 */
export class HashUtils {
  /**
   * Calcula el hash keccak256 de datos
   */
  static keccak256(data: Uint8Array | string): string {
    if (typeof data === 'string') {
      return ethers.keccak256(ethers.toUtf8Bytes(data));
    }
    return ethers.keccak256(data);
  }

  /**
   * Calcula el hash keccak256 de un archivo
   */
  static async hashFile(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    return this.keccak256(bytes);
  }

  /**
   * Convierte un string a bytes32 hash
   */
  static stringToBytes32(str: string): string {
    // Asegurar que el string tenga máximo 31 caracteres para bytes32
    const truncated = str.substring(0, 31);
    const padded = truncated.padEnd(32, '\0');
    return ethers.keccak256(ethers.toUtf8Bytes(padded));
  }

  /**
   * Calcula el hash de una estructura (hash, timestamp, signature)
   */
  static hashDocument(hash: string, timestamp: number, signature: string): string {
    const encoded = ethers.solidityPacked(
      ['bytes32', 'uint256', 'bytes'],
      [hash, timestamp, signature]
    );
    return ethers.keccak256(encoded);
  }

  /**
   * Verifica si un string es un hash válido (0x + 64 caracteres hexadecimales)
   */
  static isValidHash(hash: string): boolean {
    return /^0x[a-fA-F0-9]{64}$/.test(hash);
  }

  /**
   * Obtiene los primeros N bytes de un hash (como string hexadecimal)
   */
  static shortenHash(hash: string, chars: number = 6): string {
    if (!hash) return '';
    return hash.substring(0, chars + 2) + '...' + hash.substring(hash.length - chars);
  }
}
