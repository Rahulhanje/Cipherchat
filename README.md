# CipherChat - Secure Messaging on Solana

End-to-end encrypted messaging application built on the Solana blockchain.

## Features

- 🔐 End-to-end encryption using tweetnacl & X25519
- ⚡ Built on Solana for fast, low-cost transactions
- 💼 Solana wallet integration (Phantom, Solflare, etc.)
- 🎨 Modern UI with Tailwind CSS
- 📱 Responsive design
- 🌐 Decentralized storage with web3.storage (IPFS)
- 🔗 Custom Anchor program for on-chain message metadata
- 🔑 PDA-based encryption key management
- ⏱️ Message TTL and revocation support

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Blockchain**: Solana Web3.js, Anchor Framework
- **Smart Contract**: Custom Anchor program (Rust)
- **Wallet**: Solana Wallet Adapter (Phantom, Solflare, Torus, Ledger)
- **Encryption**: tweetnacl, @noble/ed25519, X25519
- **Storage**: web3.storage (IPFS)
- **Icons**: lucide-react

## Architecture

### Frontend (Next.js)
- User interface and wallet connection
- Message encryption/decryption
- IPFS upload/download

### Smart Contract (Anchor/Rust)
Located in `programs/cipherchat/`
- User messaging key registration (X25519 public keys)
- Message metadata storage (sender, recipient, IPFS CID)
- Key revocation
- Message read receipts

### Flow
1. User registers X25519 public key on-chain
2. Sender encrypts message → uploads to IPFS → posts CID on-chain
3. Recipient fetches CID from chain → downloads from IPFS → decrypts message

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Solana wallet (Phantom, Solflare, etc.)
- Rust & Anchor CLI (for Solana program development)
- Solana CLI (for deployment)

### Installation

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
cipherchat/
├── app/                           # Next.js app directory
│   ├── layout.tsx                 # Root layout with wallet provider
│   ├── page.tsx                   # Home page
│   └── globals.css                # Global styles with Tailwind
├── components/                    # React components
│   ├── providers/
│   │   └── WalletProvider.tsx     # Solana wallet configuration
│   ├── WalletButton.tsx           # Wallet connect button
│   └── index.ts                   # Component exports
├── lib/                           # Utility libraries
│   ├── solana.ts                  # Solana helper functions
│   ├── encryption.ts              # Encryption utilities
│   └── cipherchat-client.ts       # Program client SDK
├── programs/                      # Anchor programs
│   └── cipherchat/
│       ├── src/
│       │   └── lib.rs             # Smart contract (Rust)
│       ├── Cargo.toml             # Rust dependencies
│       └── README.md              # Program documentation
├── types/                         # TypeScript types
│   ├── index.ts                   # App types
│   └── modules.d.ts               # Module declarations
├── tests/                         # Anchor tests
│   └── cipherchat.ts              # Program tests
├── Anchor.toml                    # Anchor configuration
├── Cargo.toml                     # Workspace configuration
├── ANCHOR_SETUP.md                # Anchor program setup guide
├── DEPLOYMENT.md                  # Deployment instructions
└── package.json                   # Node dependencies
```

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Solana Network (devnet, testnet, mainnet-beta)
NEXT_PUBLIC_SOLANA_NETWORK=devnet

# Optional: Custom RPC endpoint
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# CipherChat Program ID (after deployment)
NEXT_PUBLIC_CIPHERCHAT_PROGRAM_ID=your_program_id_here

# web3.storage API token (for IPFS storage)
NEXT_PUBLIC_WEB3_STORAGE_TOKEN=your_token_here
```

## Available Dependencies

### Solana & Blockchain
- `@solana/web3.js` - Solana JavaScript API
- `@solana/wallet-adapter-react` - React hooks for wallets
- `@solana/wallet-adapter-react-ui` - Wallet UI components
- `@solana/wallet-adapter-wallets` - Wallet adapters
- `@coral-xyz/anchor` - Anchor framework client

### Encryption & Utilities
- `tweetnacl` - Encryption library
- `tweetnacl-util` - Utility functions
- `bs58` - Base58 encoding
- `@noble/ed25519` - Ed25519 signatures

### Other
- `web3.storage` - Decentralized storage
- `lucide-react` - Icon library

## Solana Program Setup

The CipherChat Anchor program is located in `programs/cipherchat/`. See **[ANCHOR_SETUP.md](./ANCHOR_SETUP.md)** for complete setup instructions.

### Quick Start

```bash
# 1. Install Anchor & Solana CLI
# See ANCHOR_SETUP.md for platform-specific instructions

# 2. Build the program
anchor build

# 3. Get program ID
anchor keys list

# 4. Update program ID in lib.rs and Anchor.toml

# 5. Rebuild
anchor build

# 6. Deploy to devnet
anchor deploy --provider.cluster devnet
```

### Program Features

- **UserMessagingKey**: Store X25519 public keys on-chain
- **MessageMetadata**: Store encrypted message metadata (CID, ephemeral keys)
- **Key Management**: Register, update, and revoke encryption keys
- **Message Posting**: Post encrypted message references to IPFS
- **Access Control**: PDA-based security with owner validation

See **[programs/cipherchat/README.md](./programs/cipherchat/README.md)** for detailed program documentation.

## Next Steps

1. ✅ **Solana Program**: Already created in `programs/cipherchat/`
2. **Deploy Program**: Follow ANCHOR_SETUP.md to deploy
3. **Implement Encryption**: Use `lib/encryption.ts` utilities
4. **Build Chat UI**: Create chat interface components
5. **IPFS Integration**: Integrate web3.storage for message content
6. **Message Flow**: Connect frontend → program → IPFS
7. **User Management**: Implement contact lists and profiles

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Solana Documentation](https://docs.solana.com/)
- [Anchor Framework](https://www.anchor-lang.com/)
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
- [Anchor Program Setup](./ANCHOR_SETUP.md)
- [Deployment Guide](./DEPLOYMENT.md)

## License

MIT
