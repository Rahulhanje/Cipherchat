# CipherChat - Secure Messaging on Solana

End-to-end encrypted messaging application built on the Solana blockchain.

## Features

- 🔐 End-to-end encryption using tweetnacl
- ⚡ Built on Solana for fast, low-cost transactions
- 💼 Solana wallet integration (Phantom, Solflare, etc.)
- 🎨 Modern UI with Tailwind CSS
- 📱 Responsive design
- 🌐 Decentralized storage with web3.storage

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Blockchain**: Solana Web3.js, Anchor Framework
- **Wallet**: Solana Wallet Adapter
- **Encryption**: tweetnacl, @noble/ed25519
- **Storage**: web3.storage (IPFS)
- **Icons**: lucide-react

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Solana wallet (Phantom, Solflare, etc.)
- (Optional) Solana CLI for local development

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
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout with wallet provider
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles with Tailwind
├── components/            # React components
│   ├── providers/
│   │   └── WalletProvider.tsx  # Solana wallet configuration
│   ├── WalletButton.tsx   # Wallet connect button
│   └── index.ts           # Component exports
├── public/                # Static files
└── package.json           # Dependencies
```

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Solana Network (devnet, testnet, mainnet-beta)
NEXT_PUBLIC_SOLANA_NETWORK=devnet

# Optional: Custom RPC endpoint
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

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

## Next Steps

1. **Set up Solana Program**: Create an Anchor program for message storage
2. **Implement Encryption**: Add message encryption/decryption logic
3. **Build Chat UI**: Create chat interface components
4. **Add Message Storage**: Integrate with Solana program and IPFS
5. **User Management**: Implement contact lists and profiles

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Solana Documentation](https://docs.solana.com/)
- [Anchor Framework](https://www.anchor-lang.com/)
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)

## License

MIT
