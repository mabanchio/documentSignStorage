import { ethers } from 'ethers';

/**
 * Recupera la dirección del firmante de una firma de mensaje
 * @param message - El mensaje original que fue firmado
 * @param signature - La firma en formato hex
 * @returns La dirección del firmante
 */
export function recoverSignerAddress(message: string, signature: string): string {
  try {
    const messageHash = ethers.hashMessage(message);
    const recoveredAddress = ethers.recoverAddress(messageHash, signature);
    return recoveredAddress;
  } catch (error) {
    console.error('Error recuperando dirección del firmante:', error);
    throw new Error('No se pudo recuperar la dirección del firmante de la firma');
  }
}

/**
 * Verifica que una firma fue creada por una dirección específica
 * @param message - El mensaje original
 * @param signature - La firma
 * @param expectedAddress - La dirección esperada del firmante
 * @returns true si la firma coincide con la dirección
 */
export function verifySignature(message: string, signature: string, expectedAddress: string): boolean {
  try {
    const recoveredAddress = recoverSignerAddress(message, signature);
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch (error) {
    console.error('Error verificando firma:', error);
    return false;
  }
}
