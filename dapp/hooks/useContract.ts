import { useMemo } from 'react';
import { Contract, Wallet, JsonRpcProvider, BrowserProvider } from 'ethers';
import { useMetaMask } from '@/contexts/MetaMaskContext';

// ABI del contrato DocumentRegistry
const DOCUMENT_REGISTRY_ABI = [
  'function storeDocumentHash(bytes32 hash, uint256 timestamp, bytes signature) external',
  'function storeSignature(bytes32 hash, string documentName, uint256 timestamp, bytes signature) external',
  'function verifyDocument(bytes32 hash, address signer, bytes signature) external view returns (bool)',
  'function getDocumentInfo(bytes32 hash) external view returns ((bytes32, uint256, address, bytes, bool))',
  'function getSignatureRecord(bytes32 hash) external view returns ((string, address, uint256, bytes, bool))',
  'function isDocumentStored(bytes32 hash) external view returns (bool)',
  'function getDocumentSignature(bytes32 hash) external view returns (bytes)',
  'function getUserDocuments(address signer) external view returns (bytes32[])',
];

export function useContract() {
  const { getWallet, getProvider, account, isConnected } = useMetaMask();

  const contract = useMemo(() => {
    try {
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      console.log('[useContract] Recalculando contrato. ConnectStatus:', {
        isConnected,
        account,
        contractAddress
      });

      if (!contractAddress) {
        console.warn('[useContract] CONTRACT_ADDRESS no configurada');
        return {
          readonly: null,
          writable: null,
          address: null,
        };
      }

      // Obtener wallet y provider
      const wallet = getWallet();
      const provider = getProvider();

      console.log('[useContract] Obtenidos:', {
        hasWallet: !!wallet,
        walletAddress: wallet?.address,
        hasProvider: !!provider,
        providerUrl: provider?.connection?.url
      });

      if (!wallet || !provider) {
        console.warn('[useContract] Wallet o Provider no disponible', { wallet, provider });
        return {
          readonly: null,
          writable: null,
          address: contractAddress,
        };
      }

      // Crear contrato de lectura con el provider
      const readonlyContract = new Contract(
        contractAddress,
        DOCUMENT_REGISTRY_ABI,
        provider
      );

      // Crear contrato de escritura conectando la wallet
      const writableContract = readonlyContract.connect(wallet);

      console.log('[useContract] ✓ Contrato creado exitosamente');

      return {
        readonly: readonlyContract,
        writable: writableContract,
        address: contractAddress,
      };
    } catch (error) {
      console.error('[useContract] Error creando contrato:', error);
      return {
        readonly: null,
        writable: null,
        address: null,
      };
    }
  }, [getWallet, getProvider, account, isConnected]);

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
