'use client';

import React, { useState } from 'react';
import { useMetaMask } from '@/hooks';
import { useToast } from '@/contexts/ToastContext';
import { useContract } from '@/hooks/useContract';
import { Upload, CheckCircle, Trash2, File, Download, Loader } from 'lucide-react';
import { saveSignedDocument } from '@/utils/documentStorage';

interface SignedFileData {
  fileName: string;
  fileHash: string;
  message: string;
  signature: string;
  status: 'pending' | 'signed' | 'saving' | 'saved' | 'error';
  error?: string;
  txHash?: string;
}

export function MultiDocumentSigner() {
  const { isConnected, signMessage } = useMetaMask();
  const contract = useContract();
  const { success, error: errorToast, info } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [signedFiles, setSignedFiles] = useState<Map<string, SignedFileData>>(new Map());
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const calculateFileHash = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result as ArrayBuffer;
        const hashArray = Array.from(new Uint8Array(data));
        const hashString = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        const keccak256Hash = '0x' + hashString.substring(0, 64);
        resolve(keccak256Hash);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFilesSelect = (fileList: FileList) => {
    const newFiles = Array.from(fileList).filter(
      file => !files.some(f => f.name === file.name && f.size === file.size)
    );

    if (newFiles.length > 0) {
      setFiles([...files, ...newFiles]);
      info(`Se agregaron ${newFiles.length} archivo(s)`);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) {
      handleFilesSelect(e.dataTransfer.files);
    }
  };

  const handleSignAll = async () => {
    if (!isConnected) {
      errorToast('✗ Conecta tu wallet primero');
      return;
    }

    if (files.length === 0) {
      errorToast('✗ Agrega archivos para firmar');
      return;
    }

    if (!contract.writable) {
      errorToast('✗ Contrato no disponible');
      return;
    }

    setIsProcessing(true);
    const newSignedFiles = new Map(signedFiles);
    let successCount = 0;

    for (const file of files) {
      try {
        const fileKey = `${file.name}_${file.size}`;
        
        // Si ya está guardado, saltar
        if (newSignedFiles.has(fileKey) && newSignedFiles.get(fileKey)?.status === 'saved') {
          continue;
        }

        // Actualizar estado a "saving"
        newSignedFiles.set(fileKey, {
          fileName: file.name,
          fileHash: '',
          message: '',
          signature: '',
          status: 'saving',
        });
        setSignedFiles(new Map(newSignedFiles));

        // 1. Calcular hash
        const fileHash = await calculateFileHash(file);
        const ts = Math.floor(Date.now() / 1000);
        const message = `Firmar documento: ${file.name}\nHash: ${fileHash}\nTimestamp: ${ts}`;

        // 2. Firmar localmente
        const signature = await signMessage(message);

        // Preparar parámetros para blockchain
        const hashBytes32 = fileHash.startsWith('0x')
          ? fileHash.padEnd(66, '0')
          : ('0x' + fileHash).padEnd(66, '0');

        // 3. Transacción blockchain PRIMERO
        let blockchainSuccess = false;
        try {
          const tx = await contract.writable.storeSignature(
            hashBytes32,
            file.name,
            BigInt(ts),
            signature,
            { gasLimit: 500000n }
          );

          // Esperar confirmación
          const receipt = await tx.wait(1);

          if (receipt) {
            blockchainSuccess = true;
          }
        } catch (blockchainError: any) {
          // Detectar tipo de error
          let errorMsg = 'Error en transacción blockchain';

          if (blockchainError.code === 'ACTION_REJECTED') {
            errorMsg = 'Transacción rechazada por el usuario';
          } else if (blockchainError.message?.includes('insufficient') && blockchainError.message?.includes('fund')) {
            errorMsg = 'Saldo insuficiente para pagar el gas';
          } else if (blockchainError.message?.includes('network') || blockchainError.message?.includes('connection')) {
            errorMsg = 'Error de conexión con la red';
          }

          newSignedFiles.set(fileKey, {
            fileName: file.name,
            fileHash,
            message,
            signature,
            status: 'error',
            error: errorMsg,
          });
          
          errorToast(`✗ ${file.name}: ${errorMsg}`);
          continue; // No guardar en localStorage si blockchain falla
        }

        // 4. Si blockchain OK → Guardar en localStorage
        if (blockchainSuccess) {
          saveSignedDocument(file.name, fileHash, message, signature);

          newSignedFiles.set(fileKey, {
            fileName: file.name,
            fileHash,
            message,
            signature,
            status: 'saved',
          });

          successCount++;
          success(`✓ ${file.name} firmado y guardado en blockchain + historial`);
        }
      } catch (error) {
        const fileKey = `${file.name}_${file.size}`;
        const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
        
        newSignedFiles.set(fileKey, {
          fileName: file.name,
          fileHash: '',
          message: '',
          signature: '',
          status: 'error',
          error: errorMsg,
        });
        
        errorToast(`✗ Error con ${file.name}: ${errorMsg}`);
      }
    }

    setSignedFiles(newSignedFiles);
    setIsProcessing(false);

    if (successCount > 0) {
      setSavedCount(successCount);
      setShowSaveConfirmation(true);
      success(`✓ ${successCount} documento(s) firmado(s) y guardado(s) exitosamente`);
    }
  };

  const handleRemoveFile = (fileName: string, fileSize: number) => {
    const fileKey = `${fileName}_${fileSize}`;
    setFiles(files.filter(f => !(f.name === fileName && f.size === fileSize)));
    const newSignedFiles = new Map(signedFiles);
    newSignedFiles.delete(fileKey);
    setSignedFiles(newSignedFiles);
  };

  const handleClearAll = () => {
    setFiles([]);
    setSignedFiles(new Map());
    success('✓ Lista de documentos limpiada');
  };

  const getSignedCount = () => signedFiles.size;
  const getSavedCount = () => Array.from(signedFiles.values()).filter(f => f.status === 'saved').length;

  return (
    <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
      <h3 className="font-bold text-sm mb-3">🔐 Firmar Múltiples Documentos</h3>

      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`mb-4 p-6 border-2 border-dashed rounded-lg cursor-pointer transition ${
          dragActive ? 'bg-indigo-100 border-indigo-400' : 'bg-white border-indigo-300 hover:border-indigo-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => e.target.files && handleFilesSelect(e.target.files)}
          className="hidden"
          accept="*/*"
        />
        <div className="flex flex-col items-center gap-2">
          <Upload size={24} className="text-indigo-500" />
          <p className="text-sm font-semibold text-gray-700">Arrastra archivos aquí o haz clic</p>
          <p className="text-xs text-gray-500">Puedes seleccionar múltiples archivos</p>
        </div>
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <div className="mb-4 space-y-2 max-h-48 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-600 mb-2">
            📋 {files.length} archivo(s) seleccionado(s)
          </p>
          {files.map((file, idx) => {
            const fileKey = `${file.name}_${file.size}`;
            const fileData = signedFiles.get(fileKey);
            const isSigned = fileData?.status === 'signed' || fileData?.status === 'saved';

            return (
              <div
                key={idx}
                className={`p-2 rounded border flex items-center justify-between text-xs ${
                  fileData?.status === 'saved'
                    ? 'bg-green-50 border-green-200'
                    : fileData?.status === 'saving'
                    ? 'bg-blue-50 border-blue-200'
                    : fileData?.status === 'error'
                    ? 'bg-red-50 border-red-200'
                    : fileData?.status === 'signed'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <File size={14} className={
                    fileData?.status === 'saved'
                      ? 'text-green-600'
                      : fileData?.status === 'saving'
                      ? 'text-blue-600 animate-spin'
                      : fileData?.status === 'error'
                      ? 'text-red-600'
                      : fileData?.status === 'signed'
                      ? 'text-yellow-600'
                      : 'text-gray-400'
                  } />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-gray-700">{file.name}</p>
                    <p className="text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                    {fileData?.status === 'saving' && (
                      <p className="text-xs text-blue-600 flex items-center gap-1">
                        <Loader size={10} className="animate-spin" /> Guardando en blockchain...
                      </p>
                    )}
                    {fileData?.status === 'error' && (
                      <p className="text-xs text-red-600">{fileData.error}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  {fileData?.status === 'saved' && (
                    <CheckCircle size={14} className="text-green-600" />
                  )}
                  {fileData?.status === 'signed' && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Firmado</span>
                  )}
                  <button
                    onClick={() => handleRemoveFile(file.name, file.size)}
                    className="p-1 hover:bg-gray-200 rounded transition"
                    title="Eliminar archivo"
                  >
                    <Trash2 size={14} className="text-red-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats */}
      {signedFiles.size > 0 && (
        <div className="mb-4 p-3 bg-white rounded border border-indigo-100 text-xs space-y-2">
          <p className="text-gray-600">
            📚 Guardados: <span className="font-bold text-green-600">{getSavedCount()}</span> |
            ❌ Errores: <span className="font-bold text-red-600">{Array.from(signedFiles.values()).filter(f => f.status === 'error').length}</span>
          </p>
          {isProcessing && (
            <p className="text-blue-600 flex items-center gap-1">
              <Loader size={12} className="animate-spin" /> Firmando y guardando en blockchain...
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={handleSignAll}
          disabled={files.length === 0 || isProcessing || !isConnected}
          className="flex-1 min-w-[150px] px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition text-xs font-semibold flex items-center justify-center gap-1"
        >
          {isProcessing ? (
            <>
              <Loader size={14} className="animate-spin" />
              Procesando...
            </>
          ) : (
            `Firmar y Guardar Todo (${files.length})`
          )}
        </button>

        <button
          onClick={handleClearAll}
          disabled={files.length === 0}
          className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition text-xs font-semibold flex items-center justify-center gap-1"
          title="Limpiar lista"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {!isConnected && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
          ⚠ Conecta tu wallet para firmar documentos
        </div>
      )}

      {/* Modal de Confirmación de Guardado */}
      {showSaveConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <CheckCircle size={24} />
                ¡Guardado Exitoso!
              </h3>
            </div>

            {/* Content */}
            <div className="px-6 py-6 space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <p className="text-gray-700 font-semibold text-lg mb-2">
                  Documentos guardados correctamente
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-2">Documentos guardados:</p>
                <p className="text-2xl font-bold text-green-600 text-center">{savedCount}</p>
              </div>

              <p className="text-xs text-gray-600 text-center">
                Todos los documentos están disponibles en la pestaña <span className="font-semibold">"Historial"</span>
              </p>
            </div>

            {/* Action */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => setShowSaveConfirmation(false)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-sm flex items-center justify-center gap-2"
              >
                <CheckCircle size={16} />
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
