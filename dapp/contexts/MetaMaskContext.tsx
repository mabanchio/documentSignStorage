'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Wallet, JsonRpcProvider } from 'ethers';

// Wallets de prueba de Anvil
const ANVIL_PRIVATE_KEYS = [
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
  '0x59c6995e6f100ccd141f8bf8586221bd8a0c2469f5eefe7f592f1e22fdf8b9f5',
  '0x5de4111afa1a4b94908f83103db48b3f2ad97a98fd93ac0e2ac2a10e9aafc43e',
  '0xe2e7610b6bd4691606a7dc97e89c4b31cbf4e8992817234f7fae19b7b2c82999',
  '0x15da8d1caf38423906938541723678aaaf63d63081eb281b12d9b822e414c4e1',
  '0x4bbbf85ce3377467afe5d46723e98038dfa5ced26f655c7ecaaf43fe2b4b6d0d',
  '0x70997970c51812e339d9b73b0245ad59c36cb495405ac7722cc2debb5a050c45',
  '0x6c3927290329c912a6e9307c1ee4f2fcac00b21f9be86881859075d98f3b8267',
  '0x02ca57573f23b82a349658418fcf4294813feb0706cdb0516c1b2ca3e41dff10',
  '0x27a3693cd37582441cb3bca6519ac89c58503216bcc514f728fdd7ecf1e21ad8',
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
  const useMockMode = process.env.NEXT_PUBLIC_USE_MOCK === 'true';
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
      if (useMockMode) {
        // Modo mock: usar wallets simuladas sin conectar a blockchain
        const privateKey = ANVIL_PRIVATE_KEYS[selectedWalletIndex];
        const mockWallet = new Wallet(privateKey);
        setWallet(mockWallet);
        setAccount(mockWallet.address);
        setIsConnected(true);
        console.log('[MetaMask - MOCK] Wallet conectado (sin blockchain):', mockWallet.address);
        return;
      }

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
  }, [selectedWalletIndex, useMockMode]);

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
      if (useMockMode) {
        const privateKey = ANVIL_PRIVATE_KEYS[index];
        const mockWallet = new Wallet(privateKey);
        setSelectedWalletIndex(index);
        setWallet(mockWallet);
        setAccount(mockWallet.address);
        console.log('[MetaMask - MOCK] Wallet cambiado (sin blockchain) a:', mockWallet.address);
        return;
      }

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
  }, [useMockMode]);

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
