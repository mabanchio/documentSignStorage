'use client';

import React, { useState, useEffect } from 'react';
import { useMetaMask } from '@/hooks';
import { useToast } from '@/contexts/ToastContext';
import { CheckCircle, Trash2, AlertCircle } from 'lucide-react';
import { CopyButton } from './CopyButton';
import { saveSignedDocument, getDocumentByFileHash } from '@/utils/documentStorage';

interface DocumentSignerProps {
  documentHash: string;
  fileName: string;
  onSigned?: (signature: string) => void;
  onClearFile?: () => void;
}

export function DocumentSigner({ documentHash, fileName, onSigned, onClearFile }: DocumentSignerProps) {
  const { isConnected, signMessage } = useMetaMask();
  const { success, error: errorToast, info, warning } = useToast();
  const [signature, setSignature] = useState<string | null>(null);
  const [signedMessage, setSignedMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAlreadySigned, setIsAlreadySigned] = useState(false);

  // Verificar si el documento ya fue firmado cuando se carga un archivo
  useEffect(() => {
    if (documentHash) {
      const existingDoc = getDocumentByFileHash(documentHash);
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

    // Verificar si el documento ya existe en la biblioteca
    const existingDoc = getDocumentByFileHash(documentHash);
    if (existingDoc) {
      warning(`⚠ Este documento ya se encuentra firmado en tu biblioteca`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Crear el mensaje a firmar con timestamp fijo
      const ts = Math.floor(Date.now() / 1000);
      const message = `Firmar documento: ${fileName}\nHash: ${documentHash}\nTimestamp: ${ts}`;

      info(`Se va a firmar: ${fileName}`);

      const sig = await signMessage(message);

      setSignature(sig);
      setSignedMessage(message);
      if (onSigned) {
        onSigned(sig);
      }
      success('✓ Documento firmado correctamente');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMsg);
      errorToast('✗ Error firmando documento: ' + errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStore = async () => {
    if (!signature || !signedMessage || !documentHash || !fileName) {
      errorToast('✗ Primero debes firmar el documento');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Guardar en almacenamiento local
      saveSignedDocument(fileName, documentHash, signedMessage, signature);
      setIsSaved(true);
      success(`✓ Documento firmado guardado en la biblioteca`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMsg);
      errorToast('✗ Error guardando documento: ' + errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    setSignature(null);
    setSignedMessage(null);
    setError(null);
    setIsSaved(false);
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
            <p className="text-xs text-yellow-600 mt-1">Este documento ya se encuentra en tu biblioteca. Selecciona otro archivo para firmar.</p>
          </div>
        </div>
      )}

      {!signature && (
        <button
          onClick={handleSign}
          disabled={isLoading || !isConnected || isAlreadySigned}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition text-sm font-semibold mb-2"
        >
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
              onClick={handleStore}
              disabled={isSaving || isSaved}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition text-sm font-semibold"
            >
              {isSaving ? 'Guardando...' : isSaved ? '✓ Guardado' : 'Guardar en Biblioteca'}
            </button>
            <button
              onClick={handleClear}
              className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition text-sm font-semibold flex items-center justify-center gap-2"
              title="Limpiar todos los datos"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {isSaved && (
            <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded-lg">
              <p className="text-xs text-green-700 font-semibold">✓ Documento guardado en tu biblioteca</p>
              <p className="text-xs text-green-600 mt-1">Accede a él en el listado de documentos</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
