import { recoverSignerAddress } from './signatureUtils';

export interface SignedDocument {
  id: string;
  fileName: string;
  fileHash: string;
  message: string;
  signature: string;
  signerAddress: string;
  timestamp: number;
  createdAt: string; // ISO string para display
  disabled?: boolean; // Marca si el documento está deshabilitado (en lugar de eliminado)
  disabledAt?: string; // Fecha de deshabilitación
  disabledReason?: string; // Razón de la deshabilitación
}

const STORAGE_KEY = 'documentSignStorage_signedDocuments';

/**
 * Guarda un documento firmado en localStorage
 */
export function saveSignedDocument(
  fileName: string,
  fileHash: string,
  message: string,
  signature: string,
  signerAddress?: string
): SignedDocument {
  try {
    // Recuperar la dirección del firmante
    // Si no hay firma (vacía), usar la dirección proporcionada
    let address = signerAddress;
    
    if (!address && signature && signature !== '' && signature !== '0x') {
      // Solo intentar recuperar si hay una firma válida
      try {
        address = recoverSignerAddress(message, signature);
      } catch (error) {
        console.warn('[DocumentStorage] No se pudo recuperar dirección de firma:', error);
        // Continuar sin dirección del signer
      }
    }

    const timestamp = Date.now();
    const document: SignedDocument = {
      id: `doc_${timestamp}_${Math.random().toString(36).substring(7)}`,
      fileName,
      fileHash,
      message,
      signature,
      signerAddress: address || 'unknown',
      timestamp,
      createdAt: new Date(timestamp).toLocaleString('es-ES'),
    };

    // Obtener documentos existentes
    const existing = getSignedDocuments();
    existing.push(document);

    // Guardar en localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

    console.log('[DocumentStorage] Documento guardado:', document.id);
    return document;
  } catch (error) {
    console.error('[DocumentStorage] Error guardando documento:', error);
    throw new Error('No se pudo guardar el documento firmado');
  }
}

/**
 * Obtiene todos los documentos firmados almacenados (solo activos, excluye deshabilitados)
 */
export function getSignedDocuments(): SignedDocument[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const documents = stored ? JSON.parse(stored) : [];
    // Filtra solo documentos activos (no deshabilitados)
    return documents.filter((doc: SignedDocument) => !doc.disabled);
  } catch (error) {
    console.error('[DocumentStorage] Error obteniendo documentos:', error);
    return [];
  }
}

/**
 * Obtiene todos los documentos incluidos los deshabilitados
 */
export function getAllDocuments(): SignedDocument[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('[DocumentStorage] Error obteniendo documentos:', error);
    return [];
  }
}

/**
 * Obtiene un documento específico por ID
 */
export function getSignedDocumentById(id: string): SignedDocument | null {
  const documents = getSignedDocuments();
  return documents.find((doc) => doc.id === id) || null;
}

/**
 * Obtiene un documento por hash de archivo (solo si está activo)
 */
export function getDocumentByFileHash(fileHash: string): SignedDocument | null {
  const documents = getSignedDocuments();
  const found = documents.find((doc) => doc.fileHash.toLowerCase() === fileHash.toLowerCase()) || null;
  
  if (fileHash) {
    console.log('[DocumentStorage] Buscando documento con hash:', fileHash);
    console.log('[DocumentStorage] Documentos en storage:', documents.length);
    if (found) {
      console.log('[DocumentStorage] Documento encontrado:', found.id, found.fileName);
    } else {
      console.log('[DocumentStorage] No se encontró documento con este hash');
    }
  }
  
  return found;
}

/**
 * Filtra documentos por firmante
 */
export function getDocumentsByAddress(address: string): SignedDocument[] {
  const documents = getSignedDocuments();
  return documents.filter((doc) => doc.signerAddress.toLowerCase() === address.toLowerCase());
}

/**
 * Filtra documentos por rango de fechas
 */
export function getDocumentsByDateRange(startDate: Date, endDate: Date): SignedDocument[] {
  const documents = getSignedDocuments();
  const start = startDate.getTime();
  const end = endDate.getTime();
  return documents.filter((doc) => doc.timestamp >= start && doc.timestamp <= end);
}

/**
 * Busca documentos por nombre de archivo
 */
export function searchDocuments(query: string): SignedDocument[] {
  const documents = getSignedDocuments();
  const lowerQuery = query.toLowerCase();
  return documents.filter(
    (doc) =>
      doc.fileName.toLowerCase().includes(lowerQuery) ||
      doc.fileHash.toLowerCase().includes(lowerQuery) ||
      doc.signerAddress.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Deshabilita un documento (en lugar de eliminarlo, respetando la inmutabilidad)
 * Mantiene el registro pero lo marca como deshabilitado
 */
export function disableSignedDocument(id: string, reason?: string): boolean {
  try {
    const documents = getAllDocuments();
    const documentIndex = documents.findIndex((doc) => doc.id === id);
    
    if (documentIndex === -1) {
      console.error('[DocumentStorage] Documento no encontrado:', id);
      return false;
    }

    // Marcar el documento como deshabilitado en lugar de eliminarlo
    documents[documentIndex].disabled = true;
    documents[documentIndex].disabledAt = new Date().toLocaleString('es-ES');
    documents[documentIndex].disabledReason = reason || 'Usuario deshabilitó el documento';

    // Guardar en localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    console.log('[DocumentStorage] Documento deshabilitado:', id);
    return true;
  } catch (error) {
    console.error('[DocumentStorage] Error deshabilitando documento:', error);
    return false;
  }
}

/**
 * Re-habilita un documento previamente deshabilitado
 */
export function enableSignedDocument(id: string): boolean {
  try {
    const documents = getAllDocuments();
    const documentIndex = documents.findIndex((doc) => doc.id === id);
    
    if (documentIndex === -1) {
      console.error('[DocumentStorage] Documento no encontrado:', id);
      return false;
    }

    // Habilitar el documento
    documents[documentIndex].disabled = false;
    delete documents[documentIndex].disabledAt;
    delete documents[documentIndex].disabledReason;

    // Guardar en localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    console.log('[DocumentStorage] Documento habilitado:', id);
    return true;
  } catch (error) {
    console.error('[DocumentStorage] Error habilitando documento:', error);
    return false;
  }
}

/**
 * Obtiene documentos deshabilitados para auditoría
 */
export function getDisabledDocuments(): SignedDocument[] {
  const documents = getAllDocuments();
  return documents.filter((doc) => doc.disabled === true);
}

/**
 * @deprecated Usar disableSignedDocument en su lugar
 * Elimina un documento del almacenamiento
 */
export function deleteSignedDocument(id: string): boolean {
  console.warn('[DocumentStorage] deleteSignedDocument está deprecado. Use disableSignedDocument en su lugar.');
  return disableSignedDocument(id, 'Eliminado por método deprecado');
}

/**
 * Deshabilita todos los documentos almacenados (respetando inmutabilidad)
 */
export function disableAllDocuments(reason?: string): boolean {
  try {
    const documents = getAllDocuments();
    const now = new Date().toLocaleString('es-ES');
    const defaultReason = reason || 'Usuario deshabilitó todos los documentos';
    
    documents.forEach((doc) => {
      doc.disabled = true;
      doc.disabledAt = now;
      doc.disabledReason = defaultReason;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    console.log('[DocumentStorage] Todos los documentos fueron deshabilitados');
    return true;
  } catch (error) {
    console.error('[DocumentStorage] Error deshabilitando documentos:', error);
    return false;
  }
}

/**
 * @deprecated Usar disableAllDocuments en su lugar
 * Limpia todos los documentos almacenados
 */
export function clearAllDocuments(): boolean {
  console.warn('[DocumentStorage] clearAllDocuments está deprecado. Use disableAllDocuments en su lugar.');
  return disableAllDocuments('Limpiado por método deprecado');
}

/**
 * Exporta documentos como JSON
 */
export function exportDocumentsAsJSON(): string {
  const documents = getSignedDocuments();
  return JSON.stringify(documents, null, 2);
}

/**
 * Descarga documentos como archivo JSON
 */
export function downloadDocumentsAsJSON(): void {
  const json = exportDocumentsAsJSON();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `documentos-firmados-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exporta datos de verificación de un documento en formato simple
 */
export function exportVerificationData(document: SignedDocument): {
  json: string;
  text: string;
  csv: string;
} {
  const json = JSON.stringify(
    {
      archivo: document.fileName,
      hash: document.fileHash,
      mensaje: document.message,
      firma: document.signature,
      firmante: document.signerAddress,
      fecha: document.createdAt,
    },
    null,
    2
  );

  const text = `DATOS DE VERIFICACIÓN DE FIRMA
================================
Archivo: ${document.fileName}
Hash: ${document.fileHash}
Firmante: ${document.signerAddress}
Fecha: ${document.createdAt}

MENSAJE FIRMADO:
${document.message}

FIRMA:
${document.signature}`;

  const csv = `Archivo,Hash,Mensaje,Firma,Firmante,Fecha
"${document.fileName}","${document.fileHash}","${document.message.replace(/"/g, '""')}","${document.signature}","${document.signerAddress}","${document.createdAt}"`;

  return { json, text, csv };
}

/**
 * Descarga datos de verificación en un formato específico
 */
export function downloadVerificationData(
  document: SignedDocument,
  format: 'json' | 'txt' | 'csv' = 'json'
): void {
  const { json, text, csv } = exportVerificationData(document);

  let content = '';
  let filename = '';
  let mimeType = '';

  switch (format) {
    case 'json':
      content = json;
      filename = `verificacion-${document.fileName}.json`;
      mimeType = 'application/json';
      break;
    case 'txt':
      content = text;
      filename = `verificacion-${document.fileName}.txt`;
      mimeType = 'text/plain';
      break;
    case 'csv':
      content = csv;
      filename = `verificacion-${document.fileName}.csv`;
      mimeType = 'text/csv';
      break;
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = globalThis.document.createElement('a');
  link.href = url;
  link.download = filename;
  globalThis.document.body.appendChild(link);
  link.click();
  globalThis.document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
