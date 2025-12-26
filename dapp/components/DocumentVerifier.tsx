'use client';

import React, { useState, useRef } from 'react';
import { useFileHash, useContract } from '@/hooks';
import { EthersUtils } from '@utils/ethers';
import { CheckCircle, XCircle } from 'lucide-react';

export function DocumentVerifier() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { keccak256Hash, calculateHash } = useFileHash();
  const contract = useContract();

  const [signerAddress, setSignerAddress] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    const result = await calculateHash(file);
    if (result && contract) {
      // El hash está disponible, listo para verificar
    }
  };

  const handleVerify = async () => {
    if (!keccak256Hash || !signerAddress || !contract) {
      alert('Selecciona un archivo, ingresa una dirección y conecta wallet');
      return;
    }

    setIsVerifying(true);
    setError(null);
    setVerificationResult(null);

    try {
      // Validar dirección
      if (!EthersUtils.isValidAddress(signerAddress)) {
        throw new Error('Dirección de firmante inválida');
      }

      // Obtener información del documento
      const docInfo = await contract.readonly.getDocumentInfo(keccak256Hash);

      if (!docInfo.exists) {
        setVerificationResult({
          isValid: false,
          message: 'El documento no está registrado en blockchain',
        });
        return;
      }

      // Verificar que la firma coincide con el firmante especificado
      const isValid = docInfo.signer.toLowerCase() === signerAddress.toLowerCase();

      setVerificationResult({
        isValid,
        message: isValid ? 'Documento verificado correctamente' : 'La firma no coincide con el firmante especificado',
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMsg);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
      <h3 className="font-bold text-sm mb-3">Verificar Documento</h3>

      <div className="space-y-3">
        {/* File uploader */}
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1">Archivo a Verificar</label>
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
          />
        </div>

        {/* Signer address input */}
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1">Dirección del Firmante</label>
          <input
            type="text"
            value={signerAddress}
            onChange={(e) => setSignerAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono"
          />
        </div>

        {/* Hash display */}
        {keccak256Hash && (
          <div className="p-2 bg-white rounded border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Hash Calculado:</p>
            <p className="text-xs font-mono break-all text-gray-700">{keccak256Hash}</p>
          </div>
        )}

        {/* Error */}
        {error && <p className="text-danger text-xs">{error}</p>}

        {/* Verification result */}
        {verificationResult && (
          <div
            className={`p-3 rounded-lg flex items-start gap-2 ${
              verificationResult.isValid
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            {verificationResult.isValid ? (
              <CheckCircle size={16} className="text-success flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle size={16} className="text-danger flex-shrink-0 mt-0.5" />
            )}
            <p className={`text-xs font-semibold ${verificationResult.isValid ? 'text-success' : 'text-danger'}`}>
              {verificationResult.message}
            </p>
          </div>
        )}

        {/* Verify button */}
        <button
          onClick={handleVerify}
          disabled={isVerifying || !keccak256Hash || !signerAddress}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition text-sm font-semibold"
        >
          {isVerifying ? 'Verificando...' : 'Verificar Documento'}
        </button>
      </div>
    </div>
  );
}
