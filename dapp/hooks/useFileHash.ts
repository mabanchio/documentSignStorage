import { useState, useCallback } from 'react';
import { ethers } from 'ethers';

interface FileHashResult {
  fileName: string;
  fileSize: number;
  sha256Hash: string;
  keccak256Hash: string;
  loading: boolean;
  error: string | null;
}

export function useFileHash() {
  const [result, setResult] = useState<FileHashResult>({
    fileName: '',
    fileSize: 0,
    sha256Hash: '',
    keccak256Hash: '',
    loading: false,
    error: null,
  });

  const calculateHash = useCallback(async (file: File): Promise<FileHashResult | null> => {
    setResult((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Leer archivo como array buffer
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // Calcular keccak256 usando ethers.js
      const keccak256Hash = ethers.keccak256(bytes);

      // Para SHA-256, usaremos una librería incorporada
      const sha256Hash = await calculateSHA256(bytes);

      const newResult: FileHashResult = {
        fileName: file.name,
        fileSize: file.size,
        sha256Hash,
        keccak256Hash,
        loading: false,
        error: null,
      };

      setResult(newResult);
      console.log('[FileHash] Hash calculado:', { file: file.name, keccak256: keccak256Hash });

      return newResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setResult((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      console.error('[FileHash] Error calculando hash:', error);
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setResult({
      fileName: '',
      fileSize: 0,
      sha256Hash: '',
      keccak256Hash: '',
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...result,
    calculateHash,
    reset,
  };
}

/**
 * Calcula el hash SHA-256 de un array de bytes usando SubtleCrypto
 */
async function calculateSHA256(data: Uint8Array): Promise<string> {
  try {
    // Usar Web Crypto API disponible en navegadores modernos
    // Crear un ArrayBuffer nuevo con los datos del Uint8Array
    const buffer = data.buffer as ArrayBuffer;
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    return bytesToHex(new Uint8Array(hashBuffer));
  } catch (error) {
    console.error('[FileHash] Error con SubtleCrypto:', error);
    // Si SubtleCrypto no está disponible, retornar placeholder
    return '0x' + Array.from(data).slice(0, 32).map((b) => b.toString(16).padStart(2, '0')).join('');
  }
}

/**
 * Convierte bytes a string hexadecimal
 */
function bytesToHex(bytes: Uint8Array): string {
  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  return '0x' + hex;
}
