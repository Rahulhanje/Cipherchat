# CipherChat Anchor Program - Complete Setup

## ✅ What's Been Created

### Anchor Program Structure
```
programs/cipherchat/
├── src/
│   └── lib.rs              # Main program with all instructions
├── Cargo.toml              # Rust dependencies
└── README.md               # Program documentation

Root level:
├── Anchor.toml             # Anchor configuration
├── Cargo.toml              # Workspace configuration
├── DEPLOYMENT.md           # Deployment guide
└── tests/
    └── cipherchat.ts       # Test file template
```

### Program Features

#### Account Structures ✅
1. **UserMessagingKey** - PDA for storing X25519 public keys
   - Seeds: `["msgkey", wallet_pubkey]`
   - Stores encryption key, revocation status, timestamps
   
2. **MessageMetadata** - PDA for encrypted message metadata
   - Seeds: `["inbox", recipient, sequence]`
   - Stores sender, CID, ephemeral key, TTL, timestamps

#### Instructions ✅
1. **register_messaging_key** - Register X25519 key for encryption
2. **post_message** - Post encrypted message metadata
3. **revoke_key** - Revoke messaging key
4. **mark_message_read** - Mark message as read

#### Security Features ✅
- PDA-based access control
- Owner validation
- Key revocation support
- TTL limits (max 30 days)
- CID length validation (max 100 chars)
- Recipient key validation

#### Events ✅
- MessagingKeyRegistered
- MessagePosted
- MessagingKeyRevoked

#### Error Handling ✅
- 8 custom error codes with descriptive messages

## 🚀 Next Steps

### 1. Install Anchor & Solana CLI

**Windows (PowerShell):**
```powershell
# Install Rust if not already installed
winget install Rustlang.Rust.GNU

# Install Solana CLI
cmd /c "curl https://release.solana.com/v1.18.0/solana-install-init-x86_64-pc-windows-msvc.exe --output C:\solana-install-tmp\solana-install-init.exe"
C:\solana-install-tmp\solana-install-init.exe v1.18.0

# Install Anchor via cargo
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

### 2. Build the Program

```bash
cd d:\projects\cipherchat

# Build the Anchor program
anchor build

# This generates:
# - target/deploy/cipherchat.so (compiled program)
# - target/idl/cipherchat.json (Interface Definition)
# - target/types/cipherchat.ts (TypeScript types)
```

### 3. Get Program ID

```bash
anchor keys list
```

Output will show:
```
cipherchat: <YOUR_PROGRAM_ID>
```

### 4. Update Program ID

**In `programs/cipherchat/src/lib.rs`:**
```rust
declare_id!("YOUR_PROGRAM_ID_HERE");
```

**In `Anchor.toml`:**
```toml
[programs.devnet]
cipherchat = "YOUR_PROGRAM_ID_HERE"
```

### 5. Rebuild

```bash
anchor build
```

### 6. Deploy

```bash
# Configure Solana CLI
solana config set --url devnet

# Create or use existing wallet
solana-keygen new  # or use existing wallet

# Get SOL for deployment
solana airdrop 2

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

## 📦 Frontend Integration

### Copy Generated Files

After building, you'll have:
- `target/idl/cipherchat.json` - Program interface
- `target/types/cipherchat.ts` - TypeScript types

### Update Client SDK

The client SDK in `lib/cipherchat-client.ts` needs the IDL:

```typescript
import idl from '../target/idl/cipherchat.json';
import { Cipherchat } from '../target/types/cipherchat';

// Update the constructor:
this.program = new Program<Cipherchat>(
  idl as Cipherchat,
  programId,
  this.provider
);
```

### Environment Variables

Add to `.env.local`:
```env
NEXT_PUBLIC_CIPHERCHAT_PROGRAM_ID=<YOUR_PROGRAM_ID>
```

## 🔧 Development Workflow

### Local Testing
```bash
# Terminal 1: Start local validator
solana-test-validator

# Terminal 2: Run tests
anchor test --skip-local-validator
```

### Devnet Testing
```bash
anchor test --provider.cluster devnet
```

## 📝 Usage Example

```typescript
import { CipherChatClient } from '@/lib/cipherchat-client';
import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { generateKeyPair } from '@/lib/encryption';

function MyComponent() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  
  const sendMessage = async () => {
    if (!wallet) return;
    
    const programId = new PublicKey(
      process.env.NEXT_PUBLIC_CIPHERCHAT_PROGRAM_ID!
    );
    
    const client = new CipherChatClient(connection, wallet, programId);
    
    // 1. Register messaging key (one time)
    const messagingKey = generateKeyPair();
    await client.registerMessagingKey(messagingKey.publicKey);
    
    // 2. Send encrypted message
    const recipientPubkey = new PublicKey('...');
    const cid = 'QmYourIPFSHashHere';
    const ephemeralKey = generateKeyPair();
    
    await client.postMessage(
      recipientPubkey,
      cid,
      ephemeralKey.publicKey,
      86400, // 24 hours TTL
      new BN(0) // First message (sequence 0)
    );
  };
}
```

## 📚 Documentation

- **Program Details**: `programs/cipherchat/README.md`
- **Deployment Guide**: `DEPLOYMENT.md`
- **Encryption Utils**: `lib/encryption.ts`
- **Solana Utils**: `lib/solana.ts`

## ⚠️ Important Notes

1. **Program ID**: Must be updated after first build
2. **Rebuild Required**: After updating program ID
3. **IDL Generation**: Happens automatically during build
4. **TypeScript Errors**: Will resolve after building the program
5. **Rent Exemption**: Accounts require SOL for rent (~0.002 SOL per message)

## 🧪 Testing Checklist

- [ ] Build program successfully
- [ ] Deploy to devnet
- [ ] Register messaging key
- [ ] Post test message
- [ ] Fetch messages
- [ ] Mark message as read
- [ ] Revoke key
- [ ] Test error cases

## 🎯 Production Checklist

- [ ] Security audit
- [ ] Comprehensive testing
- [ ] Error handling review
- [ ] Cost optimization
- [ ] Deploy to mainnet
- [ ] Set upgrade authority (or make immutable)
- [ ] Document all PDAs and seeds
- [ ] Monitor program usage

## 🔗 Resources

- [Anchor Documentation](https://www.anchor-lang.com/)
- [Solana Cookbook](https://solanacookbook.com/)
- [Program Examples](https://github.com/coral-xyz/anchor/tree/master/examples)

---

**Your CipherChat Solana program is ready!** 🎉

Follow the steps above to build, deploy, and integrate with your Next.js frontend.
