'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Wallet, JsonRpcProvider, Contract } from 'ethers';

// Wallets de prueba de Anvil
const ANVIL_PRIVATE_KEYS = [
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d',
  '0x5de4111afa1a4b94908f83103db1b1e6b24c6f2be5ad3f4cea67a6d7531cffae',
  '0x7c852118294e51e653712a81e05ca316182f4f7da0d4ab08c9729dbe2b6b310e',
  '0x47e1da1ea54c0b280405b1d87b0b036020c6416b3fa7ce192b6e63716cdc0ce0',
  '0x8b3a350cf5c34c9194ca85829a2df0ec3153bde0c3e65d4119c5d1cdee42f9d0',
  '0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88220c5e6427a',
  '0x4bbbf85ce3377467afe5d46f2d40cff4142d3053dd0caf37a49aa27d6d3c85f0',
  '0xdbda1821b80551c9d65939329250298aa3e26c3c920ea38aa78e3cd7a5e2cbf',
  '0x2a871d0798f97d79848a013d4936485c408a6b00e6fab63e46b1d798df6fbe43',
];

interface MetaMaskContextType {
  account: string | null;
  isConnected: boolean;
  selectedWalletIndex: number;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchWallet: (index: number) => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  getProvider: () => JsonRpcProvider | null;
  getWallet: () => Wallet | null;
  availableWallets: Array<{ index: number; address: string }>;
}

const MetaMaskContext = createContext<MetaMaskContextType | undefined>(undefined);

export function MetaMaskProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedWalletIndex, setSelectedWalletIndex] = useState<number>(0);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [provider, setProvider] = useState<JsonRpcProvider | null>(null);

  // Inicializar provider
  const initializeProvider = useCallback(() => {
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'http://localhost:8545';
    const newProvider = new JsonRpcProvider(rpcUrl);
    setProvider(newProvider);
    return newProvider;
  }, []);

  // Conectar con wallet seleccionada
  const connect = useCallback(async () => {
    try {
      const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'http://localhost:8545';
      const newProvider = new JsonRpcProvider(rpcUrl);
      setProvider(newProvider);

      const privateKey = ANVIL_PRIVATE_KEYS[selectedWalletIndex];
      const newWallet = new Wallet(privateKey, newProvider);

      setWallet(newWallet);
      setAccount(newWallet.address);
      setIsConnected(true);

      console.log('[MetaMask] Wallet conectado:', newWallet.address);
    } catch (error) {
      console.error('[MetaMask] Error conectando:', error);
      throw error;
    }
  }, [selectedWalletIndex]);

  // Desconectar
  const disconnect = useCallback(() => {
    setWallet(null);
    setAccount(null);
    setIsConnected(false);
    console.log('[MetaMask] Wallet desconectado');
  }, []);

  // Cambiar wallet
  const switchWallet = useCallback(async (index: number) => {
    try {
      const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'http://localhost:8545';
      const newProvider = new JsonRpcProvider(rpcUrl);

      const privateKey = ANVIL_PRIVATE_KEYS[index];
      const newWallet = new Wallet(privateKey, newProvider);

      setSelectedWalletIndex(index);
      setWallet(newWallet);
      setAccount(newWallet.address);
      setProvider(newProvider);

      console.log('[MetaMask] Wallet cambiado a:', newWallet.address);
    } catch (error) {
      console.error('[MetaMask] Error cambiando wallet:', error);
      throw error;
    }
  }, []);

  // Firmar mensaje
  const signMessage = useCallback(async (message: string) => {
    if (!wallet) {
      throw new Error('Wallet no conectado');
    }

    try {
      const signature = await wallet.signMessage(message);
      console.log('[MetaMask] Mensaje firmado:', signature);
      return signature;
    } catch (error) {
      console.error('[MetaMask] Error firmando mensaje:', error);
      throw error;
    }
  }, [wallet]);

  // Obtener provider
  const getProvider = useCallback(() => {
    if (!provider) {
      return initializeProvider();
    }
    return provider;
  }, [provider, initializeProvider]);

  // Obtener wallet
  const getWallet = useCallback(() => {
    return wallet;
  }, [wallet]);

  // Obtener wallets disponibles
  const availableWallets = ANVIL_PRIVATE_KEYS.map((privateKey, index) => ({
    index,
    address: new Wallet(privateKey).address,
  }));

  const value: MetaMaskContextType = {
    account,
    isConnected,
    selectedWalletIndex,
    connect,
    disconnect,
    switchWallet,
    signMessage,
    getProvider,
    getWallet,
    availableWallets,
  };

  return (
    <MetaMaskContext.Provider value={value}>
      {children}
    </MetaMaskContext.Provider>
  );
}

export function useMetaMask(): MetaMaskContextType {
  const context = useContext(MetaMaskContext);
  if (context === undefined) {
    throw new Error('useMetaMask debe ser usado dentro de MetaMaskProvider');
  }
  return context;
}
