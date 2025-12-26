import { createContext, useContext, useState, useCallback } from 'react';
import { ethers } from 'ethers';

// Mock de contratos para desarrollo sin Anvil
const MOCK_CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890';

interface MetaMaskContextType {
  account: string | null;
  isConnected: boolean;
  balance: string;
  connect: () => Promise<void>;
  switchWallet: (index: number) => void;
  signMessage: (message: string) => Promise<string>;
  provider: ethers.JsonRpcProvider | null;
  contract: ethers.Contract | null;
}

const MetaMaskContext = createContext<MetaMaskContextType | undefined>(undefined);

// Cuentas mock para desarrollo sin Anvil
const MOCK_ACCOUNTS = Array.from({ length: 10 }, (_, i) => ({
  address: `0x${i.toString().padStart(40, '0')}`,
  balance: '10000.0',
  privateKey: `0x${i.toString().padStart(64, '0')}`,
}));

export function MetaMaskProvider({ children }: { children: React.ReactNode }) {
  const [currentAccountIndex, setCurrentAccountIndex] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const currentAccount = MOCK_ACCOUNTS[currentAccountIndex];

  const connect = useCallback(async () => {
    setIsConnected(true);
    console.log('✓ Conectado a cuenta mock:', currentAccount.address);
  }, [currentAccount.address]);

  const switchWallet = useCallback((index: number) => {
    if (index >= 0 && index < MOCK_ACCOUNTS.length) {
      setCurrentAccountIndex(index);
      console.log('Cambié a cuenta:', MOCK_ACCOUNTS[index].address);
    }
  }, []);

  const signMessage = useCallback(async (message: string): Promise<string> => {
    // Simular firma
    const signer = new ethers.Wallet(currentAccount.privateKey);
    const signature = await signer.signMessage(message);
    return signature;
  }, [currentAccount.privateKey]);

  const value: MetaMaskContextType = {
    account: isConnected ? currentAccount.address : null,
    isConnected,
    balance: currentAccount.balance,
    connect,
    switchWallet,
    signMessage,
    provider: null,
    contract: null,
  };

  return (
    <MetaMaskContext.Provider value={value}>
      {children}
    </MetaMaskContext.Provider>
  );
}

export function useMetaMask() {
  const context = useContext(MetaMaskContext);
  if (!context) {
    throw new Error('useMetaMask debe usarse dentro de MetaMaskProvider');
  }
  return context;
}
