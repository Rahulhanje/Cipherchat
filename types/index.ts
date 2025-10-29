import { PublicKey } from '@solana/web3.js';

export interface Message {
  id: string;
  sender: string;
  recipient: string;
  encryptedContent: string;
  timestamp: number;
  signature?: string;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: number;
}

export interface UserProfile {
  publicKey: string;
  displayName?: string;
  avatar?: string;
  encryptionPublicKey: Uint8Array;
  createdAt: number;
}

export interface EncryptionKeys {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
}

export interface SolanaConfig {
  network: 'devnet' | 'testnet' | 'mainnet-beta';
  rpcEndpoint: string;
  programId?: PublicKey;
}
