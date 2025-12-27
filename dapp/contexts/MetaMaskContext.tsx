'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Wallet, JsonRpcProvider, BrowserProvider } from 'ethers';

// Wallets de prueba de Ganache como fallback
const GANACHE_PRIVATE_KEYS = [
  '0x4f3edf983ac636a65a842ce7c78d9aa706d3b113bce9c46f30d7d21715b23b1d',
  '0x6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1',
  '0x6370fd033278c143179d81c5526140625662b8daa446c22ee2d73db3707e620c',
  '0xf2f48ee19680706196e2e339e5da3491186e0c4c5030670656b0e0164837257d',
  '0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82',
  '0xa267530f49f8280200edf313ee7257651b2118fa27d891dcbc385c1dcd366038',
  '0x47e179ec197488593b187f80a00eb0da197161481a9c006cbe7ebeac5ebf4d3c',
  '0xc526ee95bf44d8fc405a0501055ce25ee236dcebc3f83f43d5e688a0b41c15ee',
  '0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e8175e5e27f93',
  '0x47b6160c8c2fbda25eeb2b34f09e9e2c9ae57a43a0fe52e47be837d31e9f2d0e',
];

interface MetaMaskContextType {
  account: string | null;
  isConnected: boolean;
  selectedWalletIndex: number;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchWallet: (index: number) => Promise<void>;
  signMessage: (message: string) => Promise<string>;
  getProvider: () => JsonRpcProvider | BrowserProvider | null;
  getWallet: () => Wallet | null;
  availableWallets: Array<{ index: number; address: string }>;
  isUsingMetaMask: boolean;
}

const MetaMaskContext = createContext<MetaMaskContextType | undefined>(undefined);

export function MetaMaskProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedWalletIndex, setSelectedWalletIndex] = useState<number>(0);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [provider, setProvider] = useState<JsonRpcProvider | BrowserProvider | null>(null);
  const [isUsingMetaMask, setIsUsingMetaMask] = useState(false);

  // Conectar con MetaMask o wallets simuladas
  const connect = useCallback(async () => {
    try {
      // Intentar conectar a MetaMask real
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          // Solicitar acceso a cuentas
          const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
          });
          
          if (accounts && accounts.length > 0) {
            const browserProvider = new BrowserProvider(window.ethereum);
            const signer = await browserProvider.getSigner();
            
            setProvider(browserProvider);
            setWallet(signer as any);
            setAccount(accounts[0]);
            setIsConnected(true);
            setIsUsingMetaMask(true);
            
            console.log('[MetaMask REAL] Conectado a:', accounts[0]);
            return;
          }
        } catch (error) {
          console.warn('[MetaMask] Error conectando a extensión real:', error);
        }
      }

      // Fallback: usar wallets simuladas de Ganache
      console.log('[MetaMask] Usando wallet simulada (Ganache)');
      const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'http://localhost:8545';
      const newProvider = new JsonRpcProvider(rpcUrl);
      
      const privateKey = GANACHE_PRIVATE_KEYS[selectedWalletIndex];
      const newWallet = new Wallet(privateKey, newProvider);

      setProvider(newProvider);
      setWallet(newWallet);
      setAccount(newWallet.address);
      setIsConnected(true);
      setIsUsingMetaMask(false);

      console.log('[MetaMask Simulado] Conectado a:', newWallet.address);
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
      // Solo cambiar si usamos wallets simuladas
      if (isUsingMetaMask) {
        throw new Error('No se pueden cambiar wallets cuando se usa MetaMask real');
      }

      const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'http://localhost:8545';
      const newProvider = new JsonRpcProvider(rpcUrl);

      const privateKey = GANACHE_PRIVATE_KEYS[index];
      const newWallet = new Wallet(privateKey, newProvider);

      setSelectedWalletIndex(index);
      setWallet(newWallet);
      setAccount(newWallet.address);
      setProvider(newProvider);

      console.log('[MetaMask] Wallet simulado cambiado a:', newWallet.address);
    } catch (error) {
      console.error('[MetaMask] Error cambiando wallet:', error);
      throw error;
    }
  }, [isUsingMetaMask]);

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
      const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'http://localhost:8545';
      return new JsonRpcProvider(rpcUrl);
    }
    return provider;
  }, [provider]);

  // Obtener wallet
  const getWallet = useCallback(() => {
    return wallet;
  }, [wallet]);

  // Obtener wallets disponibles
  const availableWallets = GANACHE_PRIVATE_KEYS.map((privateKey, index) => ({
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
    isUsingMetaMask,
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
