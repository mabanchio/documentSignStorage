'use client';

import React, { useState } from 'react';
import { useMetaMask } from '@/hooks';
import { useToast } from '@/contexts/ToastContext';
import { ChevronDown } from 'lucide-react';
import { AddressDisplay } from './CopyButton';

export function WalletSelector() {
  const { account, isConnected, selectedWalletIndex, connect, disconnect, switchWallet, availableWallets } =
    useMetaMask();
  const { success, error } = useToast();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connect();
      success('✓ Wallet conectado correctamente');
    } catch (err) {
      error('✗ Error conectando wallet: ' + (err instanceof Error ? err.message : 'Desconocido'));
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSwitchWallet = async (index: number) => {
    try {
      await switchWallet(index);
      setIsDropdownOpen(false);
      success('✓ Wallet cambiado correctamente');
    } catch (err) {
      error('✗ Error cambiando wallet: ' + (err instanceof Error ? err.message : 'Desconocido'));
    }
  };

  const handleDisconnect = () => {
    disconnect();
    success('✓ Wallet desconectado');
  };

  if (!isConnected) {
    return (
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
      >
        {isConnecting ? 'Conectando...' : 'Conectar Wallet'}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition"
        >
          <span className="text-sm">
            {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
          </span>
          <ChevronDown size={16} />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 bg-white text-gray-800 rounded-lg shadow-lg z-10 min-w-xs">
            <div className="p-2 max-h-64 overflow-y-auto">
              {availableWallets.map((w) => (
                <button
                  key={w.index}
                  onClick={() => handleSwitchWallet(w.index)}
                  className={`block w-full text-left px-4 py-2 rounded hover:bg-blue-100 transition ${
                    w.index === selectedWalletIndex ? 'bg-blue-200 font-bold' : ''
                  }`}
                >
                  <span className="text-xs">Wallet {w.index}</span>
                  <br />
                  <span className="text-xs text-gray-600">
                    {w.address.substring(0, 10)}...{w.address.substring(w.address.length - 8)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {account && (
        <div className="hidden sm:block">
          <AddressDisplay address={account} />
        </div>
      )}

      <button
        onClick={handleDisconnect}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
      >
        Desconectar
      </button>
    </div>
  );
}
