'use client';

import React, { useState, useEffect } from 'react';
import { useMetaMask } from '@/hooks';
import { useToast } from '@/contexts/ToastContext';
import { useContract } from '@/hooks/useContract';
import { CheckCircle, Trash2, AlertCircle, Loader } from 'lucide-react';
import { CopyButton } from './CopyButton';
import { saveSignedDocument, getDocumentByFileHash } from '@/utils/documentStorage';

interface DocumentSignerProps {
  documentHash: string;
  fileName: string;
  onSigned?: (signature: string) => void;
  onClearFile?: () => void;
}

export function DocumentSigner({ documentHash, fileName, onSigned, onClearFile }: DocumentSignerProps) {
  const { isConnected, signMessage, getWallet, account } = useMetaMask();
  const { success, error: errorToast, info, warning } = useToast();
  const contract = useContract();
  const [signature, setSignature] = useState<string | null>(null);
  const [signedMessage, setSignedMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingToBlockchain, setIsSavingToBlockchain] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAlreadySigned, setIsAlreadySigned] = useState(false);
  const [blockchainTxHash, setBlockchainTxHash] = useState<string | null>(null);

  // Verificar si el documento ya fue firmado cuando se carga un archivo
  useEffect(() => {
    if (documentHash) {
      console.log('[DocumentSigner] Verificando documento con hash:', documentHash);
      const existingDoc = getDocumentByFileHash(documentHash);
      console.log('[DocumentSigner] Resultado:', existingDoc ? 'Encontrado' : 'No encontrado');
      setIsAlreadySigned(!!existingDoc);
    } else {
      setIsAlreadySigned(false);
    }
  }, [documentHash]);

  if (!documentHash) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg text-center text-gray-600">
        Selecciona un archivo para firmar
      </div>
    );
  }

  const handleSign = async () => {
    if (!isConnected) {
      errorToast('✗ Conecta tu wallet primero');
      return;
    }

    // Verificar si el documento ya existe en el historial
    const existingDoc = getDocumentByFileHash(documentHash);
    if (existingDoc) {
      warning(`⚠ Este documento ya se encuentra firmado en tu historial`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const ts = Math.floor(Date.now() / 1000);

      info(`⏳ Guardando documento en blockchain...`);
      
      // **DIRECTAMENTE: Guardar en blockchain (sin firma local previa)**
      setIsSavingToBlockchain(true);
      
      let blockchainSuccess = false;
      
      try {
        console.log('[DocumentSigner] Intentando guardar en blockchain');
        console.log('[DocumentSigner] Contract object:', contract);
        console.log('[DocumentSigner] Contract writable:', contract?.writable);
        
        if (!contract?.writable) {
          console.warn('[DocumentSigner] Contrato writable no disponible');
          warning('⚠ Contrato no disponible, documento NO guardado');
          setIsSavingToBlockchain(false);
          return;
        }

        // Convertir documentHash a bytes32
        const hashBytes32 = documentHash.startsWith('0x') 
          ? documentHash 
          : '0x' + documentHash;

        console.log('[DocumentSigner] Parámetros para storeSignature:', {
          hashBytes32,
          fileName,
          ts
        });

        // Llamar a storeDocument en el contrato con gas limit explícito
        // Usa msg.sender como autenticidad (transacción blockchain)
        const tx = await contract.writable.storeDocument(
          hashBytes32,
          fileName,
          BigInt(ts),
          {
            gasLimit: 500000n  // Aumentar límite de gas
          }
        );

        console.log('[DocumentSigner] Transacción enviada:', tx.hash);
        info(`⏳ Transacción enviada: ${tx.hash}`);
        
        // Esperar confirmación
        const receipt = await tx.wait(1);  // Esperar 1 confirmación
        
        console.log('[DocumentSigner] Transacción confirmada:', receipt);
        setBlockchainTxHash(receipt?.hash || tx.hash);
        const message = `Guardado en blockchain: ${fileName}\nHash: ${documentHash}`;
        setSignature(''); // Firma vacía
        setSignedMessage(message);
        if (onSigned) {
          onSigned(''); // Callback con firma vacía
        }
        success(`✓ ¡Documento guardado en blockchain! Tx: ${tx.hash.slice(0, 10)}...`);
        info(`⛽ Gas gastado: ${receipt?.gasUsed.toString() || 'N/A'}`);
        
        blockchainSuccess = true;
        
      } catch (blockchainError) {
        const errorMsg = blockchainError instanceof Error 
          ? blockchainError.message 
          : 'Error desconocido al guardar en blockchain';
        
        const errorStr = errorMsg.toLowerCase();
        
        // Detectar diferentes tipos de errores
        let friendlyMessage = errorMsg;
        
        if (errorStr.includes('insufficient') && errorStr.includes('fund')) {
          friendlyMessage = 'Saldo insuficiente para pagar el gas de la transacción';
          errorToast('✗ Saldo insuficiente para guardar el documento');
        } else if (errorStr.includes('user rejected') || errorStr.includes('user denied') || errorStr.includes('action_rejected')) {
          friendlyMessage = 'Guardado cancelado por el usuario';
          info('ℹ Transacción cancelada por el usuario');
        } else if (errorStr.includes('network') || errorStr.includes('connection')) {
          friendlyMessage = 'Error de conexión con la blockchain';
          errorToast('✗ Error de conexión con la red');
        } else {
          console.error('[DocumentSigner] Error blockchain COMPLETO:', blockchainError);
          console.error('[DocumentSigner] Error mensaje:', errorMsg);
          console.error('[DocumentSigner] Error stack:', blockchainError instanceof Error ? blockchainError.stack : 'N/A');
          errorToast(`✗ Error al guardar en blockchain: ${errorMsg}`);
        }
        
        blockchainSuccess = false;
      } finally {
        setIsSavingToBlockchain(false);
      }

      // **Si blockchain fue exitoso, guardar en localStorage**
      if (blockchainSuccess) {
        try {
          const message = `Guardado en blockchain: ${fileName}\nHash: ${documentHash}`;
          saveSignedDocument(fileName, documentHash, message, '', account); // Pasar dirección de wallet
          info(`✓ Documento guardado en historial local`);
        } catch (saveError) {
          console.error('[DocumentSigner] Error guardando localmente:', saveError);
          errorToast('✗ Error guardando en historial local');
        }
      }

    } catch (error) {
      // Verificar si es un rechazo del usuario
      const errorStr = error instanceof Error ? error.message : String(error);
      const isUserRejection = errorStr.includes('ACTION_REJECTED') || 
                              errorStr.includes('User rejected') ||
                              errorStr.includes('user denied') ||
                              errorStr.includes('user rejected');

      if (isUserRejection) {
        // Limpiar UI si el usuario rechaza
        setSignature(null);
        setSignedMessage(null);
        info('ℹ Guardado cancelado por el usuario');
        return;
      }

      // Para otros errores, mostrar el mensaje de error
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMsg);
      errorToast('✗ Error guardando documento: ' + errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setSignature(null);
    setSignedMessage(null);
    setError(null);
    setIsAlreadySigned(false);
    onClearFile?.();
    success('✓ Datos de firma limpiados');
  };

  return (
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h3 className="font-bold text-sm mb-3">Firmar y Almacenar Documento</h3>

      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-gray-600 mb-2">Archivo: {fileName}</p>
          <p className="text-xs font-mono text-gray-600 break-all">{documentHash}</p>
        </div>
        <button
          onClick={() => onClearFile?.()}
          className="p-1 hover:bg-gray-200 rounded transition flex-shrink-0 ml-2"
          title="Limpiar archivo cargado"
        >
          <Trash2 size={14} className="text-red-500" />
        </button>
      </div>

      {error && <p className="text-red-600 text-xs mb-3">{error}</p>}

      {isAlreadySigned && !signature && (
        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
          <AlertCircle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-yellow-700">Documento ya firmado</p>
            <p className="text-xs text-yellow-600 mt-1">Este documento ya se encuentra en tu historial. Selecciona otro archivo para firmar.</p>
          </div>
        </div>
      )}

      {!signature && (
        <button
          onClick={handleSign}
          disabled={isLoading || !isConnected || isAlreadySigned}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition text-sm font-semibold mb-2 flex items-center justify-center gap-2"
        >
          {isLoading && <Loader size={16} className="animate-spin" />}
          {isLoading ? 'Firmando...' : isAlreadySigned ? 'Documento ya firmado' : 'Firmar Documento'}
        </button>
      )}

      {signature && (
        <>
          <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-600" />
              <span className="text-sm font-semibold text-green-600">Documento Firmado</span>
            </div>
            
            {/* Mensaje firmado */}
            {signedMessage && (
              <div className="bg-white p-2 rounded border border-green-100">
                <p className="text-xs text-gray-600 mb-1">Mensaje Firmado:</p>
                <p className="text-xs font-mono text-gray-700 mb-2 whitespace-pre-wrap">{signedMessage}</p>
                <CopyButton text={signedMessage} label="Copiar Mensaje" />
              </div>
            )}
            
            {/* Firma */}
            <div className="bg-white p-2 rounded border border-green-100">
              <p className="text-xs text-gray-600 mb-1">Firma (copiar para verificar):</p>
              <p className="text-xs font-mono text-gray-700 break-all mb-2">{signature}</p>
              <CopyButton text={signature} label="Copiar Firma" showText />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleClear}
              className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition text-sm font-semibold flex items-center justify-center gap-2"
              title="Limpiar todos los datos"
            >
              <Trash2 size={16} />
              Limpiar
            </button>
          </div>

          {/* Mensaje de confirmación */}
          <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded-lg space-y-2">
            <p className="text-xs text-green-700 font-semibold">✓ Documento guardado en tu historial</p>
            <p className="text-xs text-green-600">Accede a él en el historial de documentos</p>
            
            {isSavingToBlockchain && (
              <div className="flex items-center gap-2 text-blue-600 text-xs mt-2">
                <Loader size={12} className="animate-spin" />
                Guardando en blockchain...
              </div>
            )}
            
            {blockchainTxHash && (
              <div className="bg-white p-2 rounded border border-green-200 mt-2">
                <p className="text-xs text-gray-600 font-semibold">✓ Guardado en blockchain</p>
                <p className="text-xs font-mono text-gray-700 break-all mt-1">{blockchainTxHash}</p>
                <p className="text-xs text-gray-600 mt-1">La firma está permanentemente guardada en la blockchain</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
