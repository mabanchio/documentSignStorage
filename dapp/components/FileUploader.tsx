'use client';

import React, { useRef, useState } from 'react';
import { useFileHash } from '@hooks';
import { Upload } from 'lucide-react';

interface FileUploaderProps {
  onHashCalculated?: (hash: string, fileName: string) => void;
}

export function FileUploader({ onHashCalculated }: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { fileName, fileSize, keccak256Hash, loading, error, calculateHash, reset } = useFileHash();
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const result = await calculateHash(file);
      if (result && onHashCalculated) {
        onHashCalculated(result.keccak256Hash, result.fileName);
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
      const result = await calculateHash(file);
      if (result && onHashCalculated) {
        onHashCalculated(result.keccak256Hash, result.fileName);
      }
    }
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

      {error && <p className="text-danger text-sm mt-2">{error}</p>}

      {fileName && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-bold text-sm mb-2">Archivo procesado:</h3>
          <p className="text-xs text-gray-600">Nombre: {fileName}</p>
          <p className="text-xs text-gray-600">Tamaño: {(fileSize / 1024).toFixed(2)} KB</p>

          {loading && <p className="text-xs text-primary mt-2">Calculando hash...</p>}

          {keccak256Hash && (
            <>
              <p className="text-xs font-mono mt-2 break-all bg-white p-2 rounded border border-gray-200">
                {keccak256Hash}
              </p>
              <button
                onClick={reset}
                className="mt-2 px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
              >
                Limpiar
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
