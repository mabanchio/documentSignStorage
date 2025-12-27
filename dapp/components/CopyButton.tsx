'use client';

import React, { useState } from 'react';
import { Copy, CheckCircle } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
  showText?: boolean;
}

export function CopyButton({
  text,
  label = 'Copiar',
  className = '',
  showText = false,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
        copied
          ? 'bg-green-100 text-green-700 hover:bg-green-200'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      } ${className}`}
      title={text}
    >
      {copied ? (
        <>
          <CheckCircle size={18} />
          {showText && <span>¡Copiado!</span>}
        </>
      ) : (
        <>
          <Copy size={18} />
          {showText && <span>{label}</span>}
        </>
      )}
    </button>
  );
}

export function formatAddress(address: string, chars = 6): string {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function AddressDisplay({ address }: { address: string }) {
  return (
    <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
      <code className="font-mono text-sm text-gray-700 flex-1">
        {formatAddress(address, 10)}
      </code>
      <CopyButton text={address} label="Copiar dirección" />
    </div>
  );
}
