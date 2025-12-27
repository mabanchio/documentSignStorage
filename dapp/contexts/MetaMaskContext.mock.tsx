import { createContext, useContext, useState, useCallback } from 'react';
import { ethers } from 'ethers';

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
const MOCK_ACCOUNTS = Array.from({ length: 10 }, (_, i) => {
  // Claves privadas válidas de Anvil (determinísticas)
  const privateKeys = [
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
  
  const wallet = new ethers.Wallet(privateKeys[i]);
  return {
    address: wallet.address,
    balance: '10000.0',
    privateKey: privateKeys[i],
  };
});

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
