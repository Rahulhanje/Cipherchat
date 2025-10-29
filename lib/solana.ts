import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl, Connection } from '@solana/web3.js';

/**
 * Get the Solana network from environment variables
 * Defaults to devnet if not specified
 */
export const getSolanaNetwork = (): WalletAdapterNetwork => {
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK;
  
  switch (network) {
    case 'mainnet-beta':
      return WalletAdapterNetwork.Mainnet;
    case 'testnet':
      return WalletAdapterNetwork.Testnet;
    case 'devnet':
    default:
      return WalletAdapterNetwork.Devnet;
  }
};

/**
 * Get the RPC endpoint URL
 * Uses custom RPC if specified in env, otherwise uses default cluster URL
 */
export const getRpcEndpoint = (): string => {
  const customRpc = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
  
  if (customRpc) {
    return customRpc;
  }
  
  const network = getSolanaNetwork();
  return clusterApiUrl(network);
};

/**
 * Create a new Solana connection instance
 * @param commitment - The commitment level for the connection
 */
export const getConnection = (commitment: 'processed' | 'confirmed' | 'finalized' = 'confirmed') => {
  return new Connection(getRpcEndpoint(), commitment);
};

/**
 * Shorten a wallet address for display
 * @param address - The full wallet address
 * @param chars - Number of characters to show at start/end
 */
export const shortenAddress = (address: string, chars = 4): string => {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

/**
 * Format lamports to SOL
 * @param lamports - Amount in lamports
 * @param decimals - Number of decimal places
 */
export const lamportsToSol = (lamports: number, decimals = 4): string => {
  const sol = lamports / 1e9;
  return sol.toFixed(decimals);
};

/**
 * Format SOL to lamports
 * @param sol - Amount in SOL
 */
export const solToLamports = (sol: number): number => {
  return Math.floor(sol * 1e9);
};
