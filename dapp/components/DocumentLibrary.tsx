'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useMetaMask } from '@/hooks';
import { useToast } from '@/contexts/ToastContext';
import {
  getSignedDocuments,
  searchDocuments,
  disableSignedDocument,
  type SignedDocument,
} from '@/utils/documentStorage';
import { CopyButton, formatAddress } from './CopyButton';
import { Trash2, Download, Search, Filter, RefreshCw } from 'lucide-react';

export function DocumentLibrary() {
  const { account } = useMetaMask();
  const { success, info, error: errorToast } = useToast();

  const [documents, setDocuments] = useState<SignedDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterByMe, setFilterByMe] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'name'>('date-desc');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState<string>('');

  // Cargar documentos al montar
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = () => {
    const docs = getSignedDocuments();
    setDocuments(docs);
    info(`✓ ${docs.length} documentos cargados`);
  };

  // Filtrar y buscar documentos
  const filteredDocuments = useMemo(() => {
    let result = documents;

    // Búsqueda
    if (searchQuery) {
      result = searchDocuments(searchQuery);
    }

    // Filtrar por mi cuenta
    if (filterByMe && account) {
      result = result.filter((doc) => doc.signerAddress.toLowerCase() === account.toLowerCase());
    }

    // Filtrar por fecha
    if (startDate) {
      const start = new Date(startDate).getTime();
      result = result.filter((doc) => doc.timestamp >= start);
    }
    if (endDate) {
      const end = new Date(endDate).getTime() + 86400000; // Hasta final del día
      result = result.filter((doc) => doc.timestamp <= end);
    }

    // Ordenar
    switch (sortBy) {
      case 'date-asc':
        result.sort((a, b) => a.timestamp - b.timestamp);
        break;
      case 'date-desc':
        result.sort((a, b) => b.timestamp - a.timestamp);
        break;
      case 'name':
        result.sort((a, b) => a.fileName.localeCompare(b.fileName));
        break;
    }

    return result;
  }, [documents, searchQuery, filterByMe, startDate, endDate, sortBy, account]);

  const handleDelete = (id: string, fileName: string) => {
    setDeleteConfirmId(id);
    setDeleteConfirmName(fileName);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      disableSignedDocument(deleteConfirmId, 'Usuario deshabilitó el documento');
      setDocuments(getSignedDocuments());
      success('✓ Documento deshabilitado');
      setDeleteConfirmId(null);
      setDeleteConfirmName('');
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
    setDeleteConfirmName('');
  };

  const handleDownload = (doc: SignedDocument) => {
    try {
      const content = JSON.stringify(doc, null, 2);
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = globalThis.document.createElement('a');
      link.href = url;
      link.download = `${doc.fileName}-${doc.id}.json`;
      globalThis.document.body.appendChild(link);
      link.click();
      globalThis.document.body.removeChild(link);
      URL.revokeObjectURL(url);
      success('✓ Documento descargado');
    } catch (error) {
      console.error('Error descargando documento:', error);
      errorToast('✗ Error al descargar el documento');
    }
  };

  return (
    <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-sm">Historial de Documentos</h3>
          <p className="text-xs text-gray-600 mt-1">
            Total activos: <span className="font-semibold text-indigo-600">{documents.length}</span> 
            {searchQuery || filterByMe || startDate || endDate ? 
              ` • Mostrados: ${filteredDocuments.length}` : ''}
          </p>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, hash o dirección..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Filtros */}
      <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-3">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-600" />
          <span className="text-xs font-semibold text-gray-700">Filtros</span>
          <button
            onClick={() => {
              setFilterByMe(false);
              setStartDate('');
              setEndDate('');
              setSortBy('date-desc');
            }}
            className="ml-auto px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition flex items-center gap-1"
          >
            <RefreshCw size={12} />
            Limpiar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Mis documentos */}
          {account && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filterByMe}
                onChange={(e) => setFilterByMe(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-xs text-gray-700">Solo mis documentos</span>
            </label>
          )}

          {/* Fecha inicio */}
          <div>
            <label className="text-xs text-gray-600 block mb-1">Desde</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
            />
          </div>

          {/* Fecha fin */}
          <div>
            <label className="text-xs text-gray-600 block mb-1">Hasta</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
            />
          </div>

          {/* Ordenar */}
          <div>
            <label className="text-xs text-gray-600 block mb-1">Ordenar por</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
            >
              <option value="date-desc">Más reciente</option>
              <option value="date-asc">Más antiguo</option>
              <option value="name">Nombre A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de documentos */}
      {filteredDocuments.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-white rounded-lg border border-gray-200">
          <p className="text-sm">No hay documentos que coincidan con los filtros</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="bg-white p-3 rounded-lg border border-gray-200 hover:border-indigo-400 transition">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{doc.fileName}</p>
                  <p className="text-xs text-gray-500 mt-1">Hash: {formatAddress(doc.fileHash, 8)}</p>
                  <p className="text-xs text-gray-500">Firmante: {formatAddress(doc.signerAddress, 6)}</p>
                  <p className="text-xs text-gray-400 mt-1">{doc.createdAt}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <CopyButton
                    text={doc.signature}
                    label="Firma"
                    className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                  />
                  <button
                    onClick={() => handleDownload(doc)}
                    className="px-2 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded transition flex items-center gap-1"
                    title="Descargar documento"
                  >
                    <Download size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id, doc.fileName)}
                    disabled={account && account.toLowerCase() !== doc.signerAddress.toLowerCase()}
                    className={`px-2 py-1 text-xs rounded transition ${
                      account && account.toLowerCase() === doc.signerAddress.toLowerCase()
                        ? 'bg-red-100 hover:bg-red-200 text-red-700 cursor-pointer'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                    title={account && account.toLowerCase() !== doc.signerAddress.toLowerCase() ? 'Solo el firmante puede deshabilitar' : 'Deshabilitar documento'}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {documents.length > 0 && (
        <p className="text-xs text-gray-500 text-center">
          Total: {documents.length} documentos | Mostrando: {filteredDocuments.length}
        </p>
      )}

      {/* Modal de Confirmación de Deshabilitación */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-4">
              <h3 className="font-bold text-white text-lg">Confirmar Deshabilitación</h3>
            </div>

            {/* Content */}
            <div className="px-6 py-4 space-y-3">
              <p className="text-gray-700 text-sm">
                ¿Estás seguro de que deseas deshabilitar este documento?
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Documento:</p>
                <p className="font-mono text-sm text-yellow-700 break-all font-semibold">{deleteConfirmName}</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                <p className="font-semibold mb-1">ℹ Nota sobre inmutabilidad:</p>
                <p>El documento no será eliminado. Se deshabilitará respetando el principio de inmutabilidad de la blockchain. Puedes ver el registro en la auditoría.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition font-semibold text-sm"
              >
                Deshabilitar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
