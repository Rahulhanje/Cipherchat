import { Program, AnchorProvider, BN, Idl } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorWallet } from '@solana/wallet-adapter-react';

// Type will be generated after building the Anchor program
// After building, uncomment and use:
// import { Cipherchat } from '../target/types/cipherchat';
// import idl from '../target/idl/cipherchat.json';

/**
 * CipherChat Program Client SDK
 * Provides easy-to-use methods for interacting with the CipherChat Solana program
 * 
 * Note: This client requires the program to be built first.
 * Run `npm run anchor:build` to generate the IDL and types.
 */
export class CipherChatClient {
  private program: Program | null = null;
  private provider: AnchorProvider;
  private programId: PublicKey;

  constructor(
    connection: Connection,
    wallet: AnchorWallet,
    programId: PublicKey,
    idl?: Idl
  ) {
    this.provider = new AnchorProvider(connection, wallet, {
      commitment: 'confirmed',
    });
    this.programId = programId;
    
    // If IDL is provided, initialize the program
    if (idl) {
      this.program = new Program(idl, this.provider);
    }
    
    // Note: After building the program, import and use the IDL:
    // import idl from '../target/idl/cipherchat.json';
    // Then pass it to the constructor or call initializeProgram(idl)
  }

  /**
   * Initialize the program with an IDL
   * Call this after building the Anchor program
   */
  initializeProgram(idl: Idl): void {
    this.program = new Program(idl, this.provider);
  }

  /**
   * Check if program is initialized
   */
  private ensureProgram(): Program {
    if (!this.program) {
      throw new Error(
        'Program not initialized. Build the Anchor program first with `npm run anchor:build`, ' +
        'then import the IDL and call initializeProgram(idl) or pass IDL to constructor.'
      );
    }
    return this.program;
  }

  /**
   * Find the UserMessagingKey PDA for a wallet
   */
  static findUserMessagingKeyPDA(
    wallet: PublicKey,
    programId: PublicKey
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('msgkey'), wallet.toBuffer()],
      programId
    );
  }

  /**
   * Find the MessageMetadata PDA for a recipient and sequence
   */
  static findMessageMetadataPDA(
    recipient: PublicKey,
    sequence: BN,
    programId: PublicKey
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [
        Buffer.from('inbox'),
        recipient.toBuffer(),
        sequence.toArrayLike(Buffer, 'le', 8),
      ],
      programId
    );
  }

  /**
   * Register a user's X25519 messaging key
   */
  async registerMessagingKey(msgPubkey: Uint8Array): Promise<string> {
    const program = this.ensureProgram();
    const [userMessagingKeyPDA] = CipherChatClient.findUserMessagingKeyPDA(
      this.provider.wallet.publicKey,
      this.programId
    );

    const tx = await program.methods
      .registerMessagingKey(Array.from(msgPubkey))
      .accounts({
        userMessagingKey: userMessagingKeyPDA,
        authority: this.provider.wallet.publicKey,
      })
      .rpc();

    return tx;
  }

  /**
   * Post an encrypted message
   */
  async postMessage(
    recipient: PublicKey,
    cid: string,
    ephemeralPub: Uint8Array,
    ttl: number,
    sequence: BN
  ): Promise<string> {
    const program = this.ensureProgram();
    const [messageMetadataPDA] = CipherChatClient.findMessageMetadataPDA(
      recipient,
      sequence,
      this.programId
    );

    const [recipientKeyPDA] = CipherChatClient.findUserMessagingKeyPDA(
      recipient,
      this.programId
    );

    const tx = await program.methods
      .postMessage(cid, Array.from(ephemeralPub), new BN(ttl), sequence)
      .accounts({
        messageMetadata: messageMetadataPDA,
        recipientKey: recipientKeyPDA,
        sender: this.provider.wallet.publicKey,
        recipient: recipient,
      })
      .rpc();

    return tx;
  }

  /**
   * Revoke user's messaging key
   */
  async revokeKey(): Promise<string> {
    const program = this.ensureProgram();
    const [userMessagingKeyPDA] = CipherChatClient.findUserMessagingKeyPDA(
      this.provider.wallet.publicKey,
      this.programId
    );

    const tx = await program.methods
      .revokeKey()
      .accounts({
        userMessagingKey: userMessagingKeyPDA,
        authority: this.provider.wallet.publicKey,
      })
      .rpc();

    return tx;
  }

  /**
   * Mark a message as read
   */
  async markMessageRead(sequence: BN): Promise<string> {
    const program = this.ensureProgram();
    const [messageMetadataPDA] = CipherChatClient.findMessageMetadataPDA(
      this.provider.wallet.publicKey,
      sequence,
      this.programId
    );

    const tx = await program.methods
      .markMessageRead()
      .accounts({
        messageMetadata: messageMetadataPDA,
        recipient: this.provider.wallet.publicKey,
      })
      .rpc();

    return tx;
  }

  /**
   * Fetch user's messaging key
   */
  async getUserMessagingKey(wallet: PublicKey): Promise<any | null> {
    const program = this.ensureProgram();
    const [userMessagingKeyPDA] = CipherChatClient.findUserMessagingKeyPDA(
      wallet,
      this.programId
    );

    try {
      // @ts-ignore - Account types are generated after build
      return await program.account.userMessagingKey.fetch(
        userMessagingKeyPDA
      );
    } catch (error) {
      return null;
    }
  }

  /**
   * Fetch a message by sequence number
   */
  async getMessage(recipient: PublicKey, sequence: BN): Promise<any | null> {
    const program = this.ensureProgram();
    const [messageMetadataPDA] = CipherChatClient.findMessageMetadataPDA(
      recipient,
      sequence,
      this.programId
    );

    try {
      // @ts-ignore - Account types are generated after build
      return await program.account.messageMetadata.fetch(
        messageMetadataPDA
      );
    } catch (error) {
      return null;
    }
  }

  /**
   * Fetch all messages for a recipient
   * Note: This is a simplified version. In production, use getProgramAccounts with filters
   */
  async getMessagesForRecipient(recipient: PublicKey, maxSequence: number = 100): Promise<any[]> {
    const messages = [];

    for (let i = 0; i < maxSequence; i++) {
      const message = await this.getMessage(recipient, new BN(i));
      if (message) {
        messages.push({ sequence: i, ...message });
      }
    }

    return messages;
  }

  /**
   * Subscribe to new messages for the current wallet
   */
  subscribeToMessages(
    callback: (message: any) => void,
    maxSequence: number = 1000
  ): () => void {
    const program = this.ensureProgram();
    const recipient = this.provider.wallet.publicKey;

    // Subscribe to account changes for potential message PDAs
    const subscriptions: number[] = [];

    for (let i = 0; i < maxSequence; i++) {
      const [messageMetadataPDA] = CipherChatClient.findMessageMetadataPDA(
        recipient,
        new BN(i),
        this.programId
      );

      const subId = this.provider.connection.onAccountChange(
        messageMetadataPDA,
        (accountInfo) => {
          // @ts-ignore - Coder types are generated after build
          const message = program.coder.accounts.decode(
            'messageMetadata',
            accountInfo.data
          );
          callback({ sequence: i, ...message });
        }
      );

      subscriptions.push(subId);
    }

    // Return cleanup function
    return () => {
      subscriptions.forEach((subId) => {
        this.provider.connection.removeAccountChangeListener(subId);
      });
    };
  }
}

/**
 * React hook for using the CipherChat program
 */
export function useCipherChatProgram(programId: string) {
  // This would integrate with React hooks from @solana/wallet-adapter-react
  // Example usage in a React component:
  
  /*
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  
  if (!wallet) return null;
  
  const client = new CipherChatClient(
    connection,
    wallet,
    new PublicKey(programId)
  );
  
  return client;
  */
}

export default CipherChatClient;
