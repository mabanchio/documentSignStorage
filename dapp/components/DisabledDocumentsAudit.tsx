'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';
import {
  getDisabledDocuments,
  enableSignedDocument,
  type SignedDocument,
} from '@/utils/documentStorage';
import { CopyButton, formatAddress } from './CopyButton';
import { RotateCcw, Eye, EyeOff, Search } from 'lucide-react';

export function DisabledDocumentsAudit() {
  const { success, info } = useToast();
  const [disabledDocuments, setDisabledDocuments] = useState<SignedDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadDisabledDocuments();
  }, []);

  const loadDisabledDocuments = () => {
    const docs = getDisabledDocuments();
    setDisabledDocuments(docs);
    if (docs.length > 0) {
      info(`ℹ ${docs.length} documento(s) deshabilitado(s) en el historial de auditoría`);
    }
  };

  const filteredDocuments = disabledDocuments.filter((doc) =>
    doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.fileHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.signerAddress.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRestore = (id: string, fileName: string) => {
    if (enableSignedDocument(id)) {
      setDisabledDocuments(getDisabledDocuments());
      success(`✓ Documento "${fileName}" habilitado nuevamente`);
    }
  };

  if (disabledDocuments.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
        <p className="text-xs text-gray-600">No hay documentos deshabilitados</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm">Auditoría de Documentos Deshabilitados ({filteredDocuments.length})</h3>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar en deshabilitados..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Documentos deshabilitados */}
      {filteredDocuments.length === 0 ? (
        <p className="text-xs text-gray-600 text-center py-4">No hay resultados</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="bg-white border border-orange-100 rounded-lg overflow-hidden">
              {/* Header colapsable */}
              <button
                onClick={() => setExpandedId(expandedId === doc.id ? null : doc.id)}
                className="w-full p-3 flex items-center justify-between hover:bg-orange-50 transition text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs text-gray-700 truncate">{doc.fileName}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Deshabilitado: {doc.disabledAt}
                  </p>
                </div>
                <div className="flex-shrink-0 ml-2">
                  {expandedId === doc.id ? (
                    <EyeOff size={16} className="text-orange-600" />
                  ) : (
                    <Eye size={16} className="text-orange-600" />
                  )}
                </div>
              </button>

              {/* Detalles expandidos */}
              {expandedId === doc.id && (
                <div className="px-3 pb-3 space-y-2 border-t border-orange-100 bg-orange-50 text-xs">
                  {/* Razón de deshabilitación */}
                  {doc.disabledReason && (
                    <div>
                      <p className="text-gray-600 font-semibold">Razón:</p>
                      <p className="text-gray-700">{doc.disabledReason}</p>
                    </div>
                  )}

                  {/* Hash */}
                  <div>
                    <p className="text-gray-600 font-semibold">Hash:</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-gray-700 break-all flex-1">{doc.fileHash}</p>
                      <CopyButton text={doc.fileHash} label="Hash" />
                    </div>
                  </div>

                  {/* Firmante */}
                  <div>
                    <p className="text-gray-600 font-semibold">Firmante:</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-gray-700">{formatAddress(doc.signerAddress)}</p>
                      <CopyButton text={doc.signerAddress} label="Dirección" />
                    </div>
                  </div>

                  {/* Fechas */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-gray-600 font-semibold">Firmado:</p>
                      <p className="text-gray-700">{doc.createdAt}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-semibold">Deshabilitado:</p>
                      <p className="text-gray-700">{doc.disabledAt}</p>
                    </div>
                  </div>

                  {/* Botón de restauración */}
                  <button
                    onClick={() => handleRestore(doc.id, doc.fileName)}
                    className="w-full mt-3 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={12} />
                    Habilitar Documento
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info sobre inmutabilidad */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
        <p className="font-semibold mb-1">🔗 Sobre Inmutabilidad:</p>
        <p>Los documentos deshabilitados se mantienen en este registro para preservar la integridad y auditoría de las transacciones, respetando el principio blockchain de inmutabilidad.</p>
      </div>
    </div>
  );
}
