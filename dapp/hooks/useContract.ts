import { useMemo } from 'react';
import { Contract, JsonRpcProvider } from 'ethers';
import { useMetaMask } from '@contexts/MetaMaskContext';

// ABI del contrato DocumentRegistry
const DOCUMENT_REGISTRY_ABI = [
  'function storeDocumentHash(bytes32 hash, uint256 timestamp, bytes signature) external',
  'function verifyDocument(bytes32 hash, address signer, bytes signature) external view returns (bool)',
  'function getDocumentInfo(bytes32 hash) external view returns ((bytes32, uint256, address, bytes, bool))',
  'function isDocumentStored(bytes32 hash) external view returns (bool)',
  'function getDocumentSignature(bytes32 hash) external view returns (bytes)',
];

export function useContract() {
  const { getWallet, getProvider } = useMetaMask();

  const contract = useMemo(() => {
    try {
      const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
      if (!contractAddress) {
        console.warn('[useContract] CONTRACT_ADDRESS no configurada');
        return null;
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
  }, [getWallet, getProvider]);

  return contract;
}
