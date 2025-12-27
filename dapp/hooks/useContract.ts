import { useMemo } from 'react';
import { Contract } from 'ethers';
import { useMetaMask } from '@/contexts/MetaMaskContext';

// ABI del contrato DocumentRegistry
const DOCUMENT_REGISTRY_ABI = [
  'function storeDocumentHash(bytes32 hash, uint256 timestamp, bytes signature) external',
  'function verifyDocument(bytes32 hash, address signer, bytes signature) external view returns (bool)',
  'function getDocumentInfo(bytes32 hash) external view returns ((bytes32, uint256, address, bytes, bool))',
  'function isDocumentStored(bytes32 hash) external view returns (bool)',
  'function getDocumentSignature(bytes32 hash) external view returns (bytes)',
];

export function useContract() {
  const useMockMode = process.env.NEXT_PUBLIC_USE_MOCK === 'true';
  const { getWallet, getProvider } = useMetaMask();

  const contract = useMemo(() => {
    try {
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      if (!contractAddress) {
        console.warn('[useContract] CONTRACT_ADDRESS no configurada');
        return null;
      }

      // En modo mock, devolvemos un contrato simulado
      if (useMockMode) {
        console.warn('[useContract] MODO MOCK - Contrato simulado');
        return {
          readonly: new MockContract(),
          writable: new MockContract(),
          address: contractAddress,
        };
      }

      const wallet = getWallet();
      if (!wallet) {
        console.warn('[useContract] Wallet no disponible');
        return null;
      }

      const readonlyContract = new Contract(
        contractAddress,
        DOCUMENT_REGISTRY_ABI,
        wallet.provider
      );

      const writableContract = readonlyContract.connect(wallet);

      return {
        readonly: readonlyContract,
        writable: writableContract,
        address: contractAddress,
      };
    } catch (error) {
      console.error('[useContract] Error creando contrato:', error);
      return null;
    }
  }, [getWallet, getProvider, useMockMode]);

  return contract;
}

// Contrato simulado para modo mock
class MockContract {
  async storeDocumentHash(hash: string, timestamp: number, signature: string) {
    console.log('[MockContract] storeDocumentHash simulado', { hash, timestamp, signature });
    return {
      wait: async () => ({
        hash: '0xmock' + Math.random().toString(36).substring(7),
      }),
    };
  }

  async verifyDocument(hash: string, signer: string, signature: string) {
    console.log('[MockContract] verifyDocument simulado', { hash, signer, signature });
    return true;
  }

  async getDocumentInfo(hash: string) {
    console.log('[MockContract] getDocumentInfo simulado', { hash });
    return {
      exists: true,
      hash,
      timestamp: Math.floor(Date.now() / 1000),
      signer: '0x' + '0'.repeat(40),
      signature: '0xmock',
      verified: true,
    };
  }

  async isDocumentStored(hash: string) {
    console.log('[MockContract] isDocumentStored simulado', { hash });
    return true;
  }

  async getDocumentSignature(hash: string) {
    console.log('[MockContract] getDocumentSignature simulado', { hash });
    return '0xmock' + Math.random().toString(36).substring(7);
  }
}
