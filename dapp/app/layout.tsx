import type { Metadata } from 'next';
import { MetaMaskProvider } from '@contexts/MetaMaskContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Document Registry - Verificación de Documentos en Blockchain',
  description: 'dApp para almacenar y verificar documentos usando Ethereum',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-900">
        <MetaMaskProvider>{children}</MetaMaskProvider>
      </body>
    </html>
  );
}
