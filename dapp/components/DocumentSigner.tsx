'use client';

import React, { useState } from 'react';
import { useMetaMask, useContract } from '@hooks';
import { ethers } from 'ethers';
import { CheckCircle } from 'lucide-react';

interface DocumentSignerProps {
  documentHash: string;
  fileName: string;
  onSigned?: (signature: string) => void;
}

export function DocumentSigner({ documentHash, fileName, onSigned }: DocumentSignerProps) {
  const { account, isConnected, signMessage } = useMetaMask();
  const contract = useContract();
  const [signature, setSignature] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!documentHash) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg text-center text-gray-600">
        Selecciona un archivo para firmar
      </div>
    );
  }

  const handleSign = async () => {
    if (!isConnected) {
      alert('Conecta tu wallet primero');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Crear el mensaje a firmar
      const message = `Firmar documento: ${fileName}\nHash: ${documentHash}\nTimestamp: ${Math.floor(Date.now() / 1000)}`;

      alert(`Se va a firmar el siguiente mensaje:\n\n${message}\n\nConfirma para continuar.`);

      const sig = await signMessage(message);

      setSignature(sig);
      if (onSigned) {
        onSigned(sig);
      }

      alert('Documento firmado exitosamente!');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMsg);
      alert('Error firmando documento: ' + errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStore = async () => {
    if (!signature || !contract) {
      alert('Primero debes firmar el documento');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const timestamp = Math.floor(Date.now() / 1000);

      alert(
        `Se almacenará en blockchain:\n\nHash: ${documentHash}\nTimestamp: ${timestamp}\nFirma: ${signature.substring(0, 50)}...\n\nConfirma para continuar.`
      );

      const tx = await contract.writable.storeDocumentHash(documentHash, timestamp, signature);
      const receipt = await tx.wait();

      setTxHash(receipt?.hash);
      alert(`Documento almacenado! TX: ${receipt?.hash}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMsg);
      alert('Error guardando documento: ' + errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="font-bold text-sm mb-3">Firmar y Almacenar Documento</h3>

      <p className="text-xs text-gray-600 mb-3">Archivo: {fileName}</p>
      <p className="text-xs font-mono text-gray-600 mb-4 break-all">{documentHash}</p>

      {error && <p className="text-danger text-xs mb-3">{error}</p>}

      {!signature && (
        <button
          onClick={handleSign}
          disabled={isLoading || !isConnected}
          className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition text-sm font-semibold mb-2"
        >
          {isLoading ? 'Firmando...' : 'Firmar Documento'}
        </button>
      )}

      {signature && (
        <>
          <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={16} className="text-success" />
              <span className="text-sm font-semibold text-success">Documento Firmado</span>
            </div>
            <p className="text-xs font-mono text-gray-600 break-all">{signature}</p>
          </div>

          <button
            onClick={handleStore}
            disabled={isSaving}
            className="w-full px-4 py-2 bg-success text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition text-sm font-semibold"
          >
            {isSaving ? 'Almacenando...' : 'Almacenar en Blockchain'}
          </button>

          {txHash && (
            <p className="text-xs text-success mt-2 font-mono break-all">
              TX: {txHash}
            </p>
          )}
        </>
      )}
    </div>
  );
}
