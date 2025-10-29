# Anchor Program Deployment Guide

## Quick Start

### 1. Install Anchor
```bash
# Install Anchor CLI
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest

# Verify installation
anchor --version
```

### 2. Install Solana CLI
```bash
# Install Solana
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Verify installation
solana --version
```

### 3. Configure Solana CLI
```bash
# Set cluster (localnet/devnet/mainnet-beta)
solana config set --url devnet

# Create wallet if needed
solana-keygen new

# Check wallet address
solana address

# Airdrop SOL for devnet testing
solana airdrop 2
```

### 4. Build the Program
```bash
cd d:\projects\cipherchat

# Build the Anchor program
anchor build

# Get the program ID
anchor keys list
```

### 5. Update Program ID

Copy the program ID from `anchor keys list` and update:

**File: `programs/cipherchat/src/lib.rs`**
```rust
declare_id!("YOUR_PROGRAM_ID_HERE");
```

**File: `Anchor.toml`**
```toml
[programs.devnet]
cipherchat = "YOUR_PROGRAM_ID_HERE"
```

### 6. Rebuild
```bash
anchor build
```

### 7. Deploy
```bash
# Deploy to devnet
anchor deploy --provider.cluster devnet

# Or deploy to localnet
# First, start local validator:
# solana-test-validator
# Then:
# anchor deploy
```

## Verify Deployment

```bash
# Check program account
solana program show <PROGRAM_ID>

# View program logs
solana logs <PROGRAM_ID>
```

## Generate TypeScript SDK

After building, Anchor generates TypeScript types:

```bash
# Types are in target/types/cipherchat.ts
# IDL is in target/idl/cipherchat.json
```

## Integration with Frontend

### 1. Copy IDL to Frontend
```bash
# Copy IDL to your frontend project
cp target/idl/cipherchat.json app/idl/
```

### 2. Install Dependencies
```bash
npm install @coral-xyz/anchor
```

### 3. Use in Code
```typescript
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import idl from './idl/cipherchat.json';

function useProgram() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  if (!wallet) return null;

  const provider = new AnchorProvider(connection, wallet, {});
  return new Program(idl, provider);
}
```

## Troubleshooting

### Error: "Insufficient funds"
```bash
# Airdrop more SOL
solana airdrop 2

# Check balance
solana balance
```

### Error: "Program <ID> not deployed"
```bash
# Make sure you deployed
anchor deploy --provider.cluster devnet

# Verify deployment
solana program show <PROGRAM_ID>
```

### Error: "Program ID mismatch"
```bash
# Make sure program ID matches in:
# 1. lib.rs (declare_id!)
# 2. Anchor.toml ([programs.devnet])

# Rebuild after updating
anchor build
```

## Upgrade Program

```bash
# Build new version
anchor build

# Upgrade (requires authority)
anchor upgrade target/deploy/cipherchat.so --program-id <PROGRAM_ID> --provider.cluster devnet
```

## Testing Locally

### Start Local Validator
```bash
# In a separate terminal
solana-test-validator
```

### Run Tests
```bash
# Run anchor tests
anchor test

# Or run tests against local validator
anchor test --skip-local-validator
```

## Cost Calculation

### Deployment Cost
Program size × rent exemption rate

```bash
# Check program size
ls -lh target/deploy/cipherchat.so

# Typical size: ~50-100 KB
# Cost: ~0.5-1 SOL for rent exemption
```

### Upgrade Authority

To make program immutable (cannot be upgraded):
```bash
solana program set-upgrade-authority <PROGRAM_ID> --final
```

⚠️ **Warning**: This is permanent and cannot be undone!

## Next Steps

1. Deploy to devnet for testing
2. Test all instructions thoroughly
3. Conduct security audit
4. Deploy to mainnet-beta
5. Consider making program immutable

## Resources

- [Anchor Documentation](https://www.anchor-lang.com/)
- [Solana Cookbook](https://solanacookbook.com/)
- [Solana Program Library](https://spl.solana.com/)
