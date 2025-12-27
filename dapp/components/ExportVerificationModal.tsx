'use client';

import React, { useState } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { exportVerificationData, downloadVerificationData, type SignedDocument } from '@/utils/documentStorage';
import { Download, Copy, X } from 'lucide-react';

interface ExportVerificationModalProps {
  document: SignedDocument | null;
  onClose: () => void;
}

export function ExportVerificationModal({ document, onClose }: ExportVerificationModalProps) {
  const { success } = useToast();
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'txt' | 'csv'>('txt');

  if (!document) return null;

  const { json, text, csv } = exportVerificationData(document);
  const content = selectedFormat === 'json' ? json : selectedFormat === 'txt' ? text : csv;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    success('✓ Datos copiados al portapapeles');
  };

  const handleDownload = () => {
    downloadVerificationData(document, selectedFormat);
    success('✓ Archivo descargado');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Exportar Datos de Verificación</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Formato */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Formato</label>
            <div className="grid grid-cols-3 gap-2">
              {(['json', 'txt', 'csv'] as const).map((format) => (
                <button
                  key={format}
                  onClick={() => setSelectedFormat(format)}
                  className={`px-3 py-2 rounded text-sm font-semibold transition ${
                    selectedFormat === format
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Vista previa */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Datos</label>
            <textarea
              readOnly
              value={content}
              className="w-full h-40 p-3 border border-gray-300 rounded-lg font-mono text-xs bg-gray-50 resize-none"
            />
          </div>

          {/* Información */}
          <div className="bg-blue-50 border border-blue-200 p-3 rounded">
            <p className="text-xs text-blue-700">
              💡 Estos datos contienen toda la información necesaria para verificar la firma. Guárdalos en un lugar seguro.
            </p>
          </div>

          {/* Acciones */}
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold flex items-center justify-center gap-2"
            >
              <Copy size={16} />
              Copiar
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold flex items-center justify-center gap-2"
            >
              <Download size={16} />
              Descargar
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-semibold"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
