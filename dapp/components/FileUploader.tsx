'use client';

import React, { useRef, useState } from 'react';
import { useFileHash } from '@/hooks';
import { useToast } from '@/contexts/ToastContext';
import { getDocumentByFileHash, type SignedDocument } from '@/utils/documentStorage';
import { Upload, AlertCircle } from 'lucide-react';
import { CopyButton } from './CopyButton';

interface FileUploaderProps {
  onHashCalculated?: (hash: string, fileName: string) => void;
  onSignedDocumentFound?: (document: SignedDocument) => void;
  onClearExistingDocument?: () => void;
}

export function FileUploader({ onHashCalculated, onSignedDocumentFound, onClearExistingDocument }: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { fileName, fileSize, keccak256Hash, loading, error, calculateHash, reset } = useFileHash();
  const { success, info } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [existingDocument, setExistingDocument] = useState<SignedDocument | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      info(`Procesando archivo: ${file.name}...`);
      const result = await calculateHash(file);
      if (result && onHashCalculated) {
        success(`✓ Hash calculado para: ${result.fileName}`);
        onHashCalculated(result.keccak256Hash, result.fileName);
        
        // Buscar si este archivo ya fue firmado
        const signedDoc = getDocumentByFileHash(result.keccak256Hash);
        if (signedDoc) {
          setExistingDocument(signedDoc);
          success(`📄 Encontrado documento firmado para este archivo`);
        } else {
          setExistingDocument(null);
        }
      }
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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      info(`Procesando archivo: ${file.name}...`);
      const result = await calculateHash(file);
      if (result && onHashCalculated) {
        success(`✓ Hash calculado para: ${result.fileName}`);
        onHashCalculated(result.keccak256Hash, result.fileName);
        
        // Buscar si este archivo ya fue firmado
        const signedDoc = getDocumentByFileHash(result.keccak256Hash);
        if (signedDoc) {
          setExistingDocument(signedDoc);
          success(`📄 Encontrado documento firmado para este archivo`);
        } else {
          setExistingDocument(null);
        }
      }
    }
  };

  const handleClearFile = () => {
    reset();
    setExistingDocument(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClearExistingDocument?.();
  };

  return (
    <div className="w-full">
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
          dragActive ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-primary'
        } ${error ? 'border-danger' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          accept="*/*"
        />

        <Upload size={32} className="mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600">Arrastra un archivo o haz clic para seleccionar</p>
      </div>

      {error && <p className="text-red-600 text-sm mt-2">✗ {error}</p>}

      {/* Documento encontrado */}
      {existingDocument && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200 space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-green-600" />
            <p className="text-sm font-semibold text-green-700">✓ Documento ya firmado encontrado</p>
          </div>
          <p className="text-xs text-gray-600">
            Este archivo ya fue firmado por {existingDocument.signerAddress.substring(0, 6)}...{existingDocument.signerAddress.substring(-4)}
          </p>
          <p className="text-xs text-gray-500">Guardado: {existingDocument.createdAt}</p>
          <button
            onClick={() => {
              if (onSignedDocumentFound) {
                onSignedDocumentFound(existingDocument);
              }
            }}
            className="w-full mt-2 px-3 py-2 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition font-semibold"
          >
            Cargar datos de firma para verificar
          </button>
        </div>
      )}

      {fileName && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-bold text-sm mb-2">Archivo procesado:</h3>
          <p className="text-xs text-gray-600">Nombre: {fileName}</p>
          <p className="text-xs text-gray-600">Tamaño: {(fileSize / 1024).toFixed(2)} KB</p>

          {loading && <p className="text-xs text-blue-600 mt-2">⏳ Calculando hash...</p>}

          {keccak256Hash && (
            <>
              <p className="text-xs font-mono mt-2 break-all bg-white p-2 rounded border border-gray-200 mb-2">
                {keccak256Hash}
              </p>
              <div className="flex gap-2">
                <CopyButton text={keccak256Hash} label="Copiar Hash" />
                <button
                  onClick={handleClearFile}
                  className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                >
                  Limpiar
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
