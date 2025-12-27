'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFileHash } from '@/hooks';
import { useToast } from '@/contexts/ToastContext';
import { recoverSignerAddress } from '@/utils/signatureUtils';
import { CheckCircle, XCircle, Download, Trash2, AlertCircle } from 'lucide-react';
import { CopyButton, AddressDisplay } from './CopyButton';
import { ExportVerificationModal } from './ExportVerificationModal';
import { type SignedDocument, getDocumentByFileHash } from '@/utils/documentStorage';

interface DocumentVerifierProps {
  preloadedDocument?: SignedDocument | null;
}

export function DocumentVerifier({ preloadedDocument }: DocumentVerifierProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileDropRef = useRef<HTMLDivElement>(null);
  const { keccak256Hash, fileName, fileSize, calculateHash, reset } = useFileHash();
  const { success, error: errorToast, warning, info } = useToast();
  const [dragActive, setDragActive] = useState(false);

  const [signature, setSignature] = useState('');
  const [signedMessage, setSignedMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    message: string;
    signerAddress?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exportDocument, setExportDocument] = useState<SignedDocument | null>(null);
  const [loadedDocumentData, setLoadedDocumentData] = useState<SignedDocument | null>(null);

  // Procesar archivo cargado
  const processFile = async (file: File) => {
    info(`Procesando archivo: ${file.name}...`);
    const result = await calculateHash(file);
    if (result) {
      success(`✓ Hash calculado para: ${result.fileName}`);
      
      // Buscar si este archivo ya fue firmado
      const signedDoc = getDocumentByFileHash(result.keccak256Hash);
      if (signedDoc) {
        setLoadedDocumentData(signedDoc);
        success(`📄 Documento firmado encontrado en la biblioteca`);
      } else {
        setLoadedDocumentData(null);
      }
    }
  };

  // Manejar cambio de archivo del input
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  // Manejar drag & drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      // Actualizar el input visual
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
      }
      await processFile(file);
    }
  };

  // Cargar datos cuando se proporciona un documento preglargado
  useEffect(() => {
    if (preloadedDocument) {
      setSignature(preloadedDocument.signature);
      setSignedMessage(preloadedDocument.message);
      success('✓ Datos de firma cargados');
    } else {
      // Limpiar datos cuando no hay documento precargado
      setSignature('');
      setSignedMessage('');
      setVerificationResult(null);
      setError(null);
      setShowExportModal(false);
      setExportDocument(null);
    }
  }, [preloadedDocument, success]);

  // Verificar si el archivo cargado ya está firmado
  useEffect(() => {
    if (keccak256Hash) {
      const signedDoc = getDocumentByFileHash(keccak256Hash);
      if (signedDoc) {
        setLoadedDocumentData(signedDoc);
        success(`📄 Archivo firmado encontrado en la biblioteca`);
      } else {
        setLoadedDocumentData(null);
      }
    } else {
      setLoadedDocumentData(null);
    }
  }, [keccak256Hash, success]);

  const handleClear = () => {
    setSignature('');
    setSignedMessage('');
    setVerificationResult(null);
    setError(null);
    setShowExportModal(false);
    setExportDocument(null);
    setLoadedDocumentData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    reset();
    success('✓ Datos de verificación limpiados');
  };

  const handleVerify = async () => {
    if (!signature || !signedMessage) {
      warning('⚠ Ingresa el mensaje firmado y la firma para verificar');
      return;
    }

    setIsVerifying(true);
    setError(null);
    setVerificationResult(null);

    try {
      // Recuperar la dirección del firmante de la firma y el mensaje
      let recoveredAddress: string;
      try {
        recoveredAddress = recoverSignerAddress(signedMessage, signature);
      } catch (e) {
        throw new Error('La firma no es válida para este mensaje. Verifica que copiaste correctamente.');
      }

      // En modo blockchain real, verificarías en el contrato
      // Modo mock: verificación local
      success('✓ Firma verificada correctamente');
      setVerificationResult({
        isValid: true,
        message: 'Firma verificada correctamente (modo simulación)',
        signerAddress: recoveredAddress,
      });
      
      // Crear documento para exportación
      const docForExport: SignedDocument = {
        id: `doc_${Date.now()}`,
        fileName: fileName || 'documento',
        fileHash: keccak256Hash || '',
        message: signedMessage,
        signature: signature,
        signerAddress: recoveredAddress,
        timestamp: Date.now(),
        createdAt: new Date().toLocaleString('es-ES'),
      };
      setExportDocument(docForExport);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMsg);
      errorToast('✗ Error verificando: ' + errorMsg);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
      <h3 className="font-bold text-sm mb-3">Verificar Documento</h3>

      <div className="space-y-3">
        {/* File uploader con drag & drop - ÚNICO ESPACIO */}
        <div
          ref={fileDropRef}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileName === '' && fileInputRef.current?.click()}
          className={`p-4 border-2 border-dashed rounded-lg transition ${
            dragActive
              ? 'border-purple-600 bg-purple-100'
              : 'border-gray-300 bg-white'
          } ${fileName === '' ? 'cursor-pointer' : ''}`}
        >
          <label className="text-xs font-semibold text-gray-700 block mb-3">Archivo a Verificar</label>
          
          {/* Mostrar estado del archivo */}
          {fileName ? (
            <div className="space-y-2">
              <div className="p-3 bg-purple-50 rounded border border-purple-300">
                <p className="text-xs font-semibold text-purple-700 break-all">{fileName}</p>
                {fileSize && (
                  <p className="text-xs text-purple-600 mt-1">
                    Tamaño: {(fileSize / 1024).toFixed(2)} KB
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-500">O arrastra otro archivo para reemplazarlo</p>
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-3">Arrastra un archivo aquí</p>
          )}
          
          {/* Input file oculto */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Aviso de archivo firmado encontrado */}
        {loadedDocumentData && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-green-700">Archivo firmado encontrado</p>
                <p className="text-xs text-green-600 mt-1">Este archivo ya está firmado en tu biblioteca. Puedes cargar los datos automáticamente.</p>
              </div>
            </div>
            <button
              onClick={() => {
                setSignature(loadedDocumentData.signature);
                setSignedMessage(loadedDocumentData.message);
                success('✓ Datos de firma cargados automáticamente');
              }}
              className="w-full px-3 py-2 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition font-semibold"
            >
              Cargar Datos de Firma
            </button>
          </div>
        )}

        {/* Signature input */}
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1">Mensaje Firmado</label>
          <textarea
            value={signedMessage}
            onChange={(e) => setSignedMessage(e.target.value)}
            placeholder="Pega el mensaje que fue firmado (ej: Firmar documento: archivo.pdf...)"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">💡 Copia el "Mensaje Firmado" del componente de firma</p>
        </div>

        {/* Signature input */}
        <div>
          <label className="text-xs font-semibold text-gray-700 block mb-1">Firma</label>
          <textarea
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder="Pega la firma aquí (0x...)"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">💡 Copia la firma del componente de firma</p>
        </div>

        {/* Hash display */}
        {keccak256Hash && (
          <div className="p-2 bg-white rounded border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Hash Calculado:</p>
            <p className="text-xs font-mono break-all text-gray-700 mb-2">{keccak256Hash}</p>
            <CopyButton text={keccak256Hash} label="Copiar hash" />
          </div>
        )}

        {/* Error */}
        {error && <p className="text-red-600 text-xs">{error}</p>}

        {/* Verification result */}
        {verificationResult && (
          <div
            className={`p-3 rounded-lg space-y-2 ${
              verificationResult.isValid
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <div className="flex items-start gap-2">
              {verificationResult.isValid ? (
                <CheckCircle size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-xs font-semibold ${verificationResult.isValid ? 'text-green-600' : 'text-red-600'}`}>
                {verificationResult.message}
              </p>
            </div>
            {verificationResult.isValid && verificationResult.signerAddress && (
              <div className="space-y-2">
                <div className="p-2 bg-white rounded border border-green-100">
                  <p className="text-xs text-gray-600 mb-1">Dirección del Firmante:</p>
                  <AddressDisplay address={verificationResult.signerAddress} />
                </div>
                {exportDocument && (
                  <button
                    onClick={() => {
                      setExportDocument(exportDocument);
                      setShowExportModal(true);
                    }}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2"
                  >
                    <Download size={14} />
                    Exportar Datos de Verificación
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Verify button */}
        <div className="flex gap-2">
          <button
            onClick={handleVerify}
            disabled={isVerifying || !signature || !signedMessage}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition text-sm font-semibold"
          >
            {isVerifying ? 'Verificando...' : 'Verificar Firma'}
          </button>
          <button
            onClick={handleClear}
            className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition text-sm font-semibold flex items-center justify-center gap-2"
            title="Limpiar todos los datos"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <ExportVerificationModal
          document={exportDocument}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}
