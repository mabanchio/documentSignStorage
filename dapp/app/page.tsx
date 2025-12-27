'use client';

import React, { useState } from 'react';
import {
  WalletSelector,
  FileUploader,
  DocumentSigner,
  DocumentVerifier,
  DocumentLibrary,
  MultiDocumentSigner,
} from '@/components';
import { type SignedDocument } from '@/utils/documentStorage';
import { FileText } from 'lucide-react';

export default function Home() {
  const [documentHash, setDocumentHash] = useState('');
  const [fileName, setFileName] = useState('');
  const [activeTab, setActiveTab] = useState<'sign' | 'multi' | 'verify' | 'library'>('sign');
  const [preloadedDocument, setPreloadedDocument] = useState<SignedDocument | null>(null);

  const handleHashCalculated = (hash: string, fname: string) => {
    setDocumentHash(hash);
    setFileName(fname);
  };

  const handleSignedDocumentFound = (document: SignedDocument) => {
    setPreloadedDocument(document);
    setActiveTab('verify');
  };

  const handleClearFile = () => {
    setDocumentHash('');
    setFileName('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={28} className="text-primary" />
            <h1 className="text-2xl font-bold text-gray-900">Verificador de Documentos</h1>
          </div>
          <WalletSelector />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('sign')}
              className={`py-2 px-4 border-b-2 font-semibold transition ${
                activeTab === 'sign'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Firmar Documento
            </button>
            <button
              onClick={() => setActiveTab('verify')}
              className={`py-2 px-4 border-b-2 font-semibold transition ${
                activeTab === 'verify'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Verificar Documento
            </button>
            <button
              onClick={() => setActiveTab('multi')}
              className={`py-2 px-4 border-b-2 font-semibold transition ${
                activeTab === 'multi'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Múltiples Documentos
            </button>
            <button
              onClick={() => setActiveTab('library')}
              className={`py-2 px-4 border-b-2 font-semibold transition ${
                activeTab === 'library'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Biblioteca
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'library' ? (
          <DocumentLibrary />
        ) : activeTab === 'multi' ? (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-lg font-bold mb-4 text-gray-900">Firmar Múltiples Documentos</h2>
            <MultiDocumentSigner />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - File Upload */}
            <div>
              <h2 className="text-lg font-bold mb-4 text-gray-900">Selecciona un Archivo</h2>
              <FileUploader 
                onHashCalculated={handleHashCalculated}
                onSignedDocumentFound={handleSignedDocumentFound}
                onClearExistingDocument={handleClearFile}
              />
            </div>

            {/* Right Column - Actions */}
            <div className="lg:col-span-2">
              {activeTab === 'sign' ? (
                <>
                  <h2 className="text-lg font-bold mb-4 text-gray-900">Firmar y Almacenar</h2>
                  <DocumentSigner
                    documentHash={documentHash}
                    fileName={fileName}
                    onSigned={() => {
                      // Aquí podrías hacer algo cuando el documento se firma
                    }}
                    onClearFile={handleClearFile}
                  />
                </>
              ) : (
                <>
                  <h2 className="text-lg font-bold mb-4 text-gray-900">Verificar</h2>
                  <DocumentVerifier preloadedDocument={preloadedDocument} />
                </>
              )}
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2">Almacenamiento Seguro</h3>
            <p className="text-sm text-gray-600">
              Los documentos se almacenan como hashes keccak256 junto con firmas digitales
              ECDSA, garantizando seguridad e inmutabilidad.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2">Sin Servidor Central</h3>
            <p className="text-sm text-gray-600">
              La aplicación funciona 100% en el navegador, conectándose directamente a
              Anvil sin necesidad de un backend centralizado.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-2">Wallets Integrados</h3>
            <p className="text-sm text-gray-600">
              Usa las 10 wallets de prueba de Anvil sin necesidad de MetaMask. Cambia
              entre wallets libremente durante el desarrollo.
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-bold text-gray-900 mb-3">Instrucciones</h3>
          <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
            <li>Conecta una wallet usando el botón en la esquina superior derecha</li>
            <li>Sube un archivo para calcular su hash keccak256</li>
            <li>Haz clic en "Firmar Documento" para crear una firma digital</li>
            <li>Haz clic en "Almacenar en Blockchain" para guardar en Anvil</li>
            <li>Ve a la pestaña "Verificar" para validar un documento existente</li>
          </ol>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white text-center py-4 mt-16">
        <p className="text-sm">
          &copy; 2025 Verificador de Documentos - dApp de Firmas Digitales en Blockchain
        </p>
      </footer>
    </div>
  );
}
