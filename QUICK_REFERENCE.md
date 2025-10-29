# Quick Reference Guide

## Common Commands

```bash
# Development
npm run dev              # Start dev server on localhost:3000
npm run build           # Build for production
npm start               # Start production server
npm run lint            # Run ESLint

# Package Management
npm install <package>   # Add new package
npm update              # Update packages
npm audit fix           # Fix security vulnerabilities
```

## File Locations

### Components
- `components/providers/WalletProvider.tsx` - Wallet configuration
- `components/WalletButton.tsx` - Connect wallet button

### Pages
- `app/page.tsx` - Home page
- `app/layout.tsx` - Root layout

### Utilities
- `lib/solana.ts` - Solana helper functions
- `lib/encryption.ts` - Encryption utilities

### Styles
- `app/globals.css` - Global styles + Tailwind config

### Types
- `types/index.ts` - TypeScript definitions

## Important Code Snippets

### Get Wallet Connection (Client Component)

```typescript
'use client';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

export function MyComponent() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();

  if (!connected || !publicKey) {
    return <div>Please connect wallet</div>;
  }

  // Use publicKey and connection
}
```

### Encrypt/Decrypt Message

```typescript
import { encryptMessage, decryptMessage } from '@/lib/encryption';

// Encrypt
const encrypted = encryptMessage(
  "Hello!",
  recipientPublicKey,
  mySecretKey
);

// Decrypt
const decrypted = decryptMessage(
  encrypted,
  senderPublicKey,
  mySecretKey
);
```

### Shorten Wallet Address

```typescript
import { shortenAddress } from '@/lib/solana';

const short = shortenAddress('7xKX...abc'); // "7xKX...abc"
```

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_WEB3_STORAGE_TOKEN=your_token
```

## Wallet Networks

Change in `components/providers/WalletProvider.tsx`:

```typescript
// Options:
WalletAdapterNetwork.Devnet    // For development
WalletAdapterNetwork.Testnet   // For testing
WalletAdapterNetwork.Mainnet   // For production
```

## Custom Colors

Update in `app/globals.css`:

```css
:root {
  --primary: #9945ff;      /* Solana purple */
  --secondary: #14f195;    /* Solana green */
  /* ... more colors */
}
```

## TypeScript Types

```typescript
import type { Message, Chat, UserProfile } from '@/types';
```

## Common Imports

```typescript
// Wallet
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

// Solana
import { PublicKey, Transaction } from '@solana/web3.js';

// Icons
import { MessageCircle, Send, Lock } from 'lucide-react';

// Utils
import { shortenAddress, getConnection } from '@/lib/solana';
import { encryptMessage, decryptMessage } from '@/lib/encryption';
```

## Troubleshooting

### "Hydration failed" error?
- Make sure client components use `'use client'`
- Check for client-only code in server components

### Wallet not appearing?
- Ensure WalletProvider wraps your app in layout.tsx
- Check wallet extension is installed

### Build errors?
- Run `npm run lint` to check for issues
- Clear `.next` folder and rebuild

## Resources

- Docs: See `README.md` and `SETUP.md`
- Examples: Check `app/page.tsx` for usage
- Types: See `types/index.ts` for data structures
