import type { Metadata } from 'next';
import { MetaMaskProvider } from '@/contexts/MetaMaskContext';
import { ToastProvider } from '@/contexts/ToastContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Verificador de Documentos - Firmas Digitales en Blockchain',
  description: 'dApp para almacenar y verificar documentos usando Ethereum',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-900">
        <ToastProvider>
          <MetaMaskProvider>{children}</MetaMaskProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
