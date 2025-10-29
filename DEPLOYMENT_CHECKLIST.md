# 🚀 Deployment Checklist

Use this checklist to deploy your CipherChat Anchor program step by step.

## Prerequisites ✅

- [ ] Rust installed (`cargo --version`)
- [ ] Solana CLI installed (`solana --version`)
- [ ] Anchor CLI installed (`anchor --version`)
- [ ] Node.js 18+ installed (`node --version`)
- [ ] Git repository initialized

## Step 1: Configure Solana CLI

```bash
# Set cluster to devnet
solana config set --url devnet

# Verify configuration
npm run solana:config

# Expected output should show:
# RPC URL: https://api.devnet.solana.com
```

- [ ] Cluster set to devnet
- [ ] Configuration verified

## Step 2: Setup Wallet

```bash
# Check if wallet exists
solana address

# If no wallet, create one:
# solana-keygen new

# Save your seed phrase securely!
```

- [ ] Wallet address obtained
- [ ] Seed phrase saved securely

## Step 3: Get SOL for Deployment

```bash
# Request airdrop (2 SOL)
npm run solana:airdrop

# Check balance
npm run solana:balance

# You should have at least 2 SOL
```

- [ ] Received SOL airdrop
- [ ] Balance confirmed (≥2 SOL)

## Step 4: Build the Program (First Time)

```bash
# Build the Anchor program
npm run anchor:build
```

- [ ] Build successful
- [ ] No compilation errors
- [ ] Files generated in `target/` directory

**Expected output:**
```
✓ Compiling cipherchat
✓ Built program
```

## Step 5: Get Program ID

```bash
# List all program keypairs
npm run anchor:keys
```

Copy the program ID shown (looks like: `Fg6PaFpoGXkYsidMpWxTWKZx1b5j`...)

- [ ] Program ID obtained
- [ ] Program ID copied to clipboard

## Step 6: Update Program ID

### Update `programs/cipherchat/src/lib.rs`

Find this line:
```rust
declare_id!("11111111111111111111111111111111");
```

Replace with your program ID:
```rust
declare_id!("YOUR_PROGRAM_ID_HERE");
```

### Update `Anchor.toml`

Find the `[programs.devnet]` section:
```toml
[programs.devnet]
cipherchat = "11111111111111111111111111111111"
```

Replace with your program ID:
```toml
[programs.devnet]
cipherchat = "YOUR_PROGRAM_ID_HERE"
```

- [ ] Updated `lib.rs`
- [ ] Updated `Anchor.toml`
- [ ] Changes saved

## Step 7: Rebuild with New Program ID

```bash
# Rebuild the program
npm run anchor:build
```

- [ ] Rebuild successful
- [ ] No errors

## Step 8: Deploy to Devnet

```bash
# Deploy to devnet
npm run anchor:deploy

# This will:
# 1. Upload your program to devnet
# 2. Create program account
# 3. Write program data
```

**Expected output:**
```
Deploying cluster: devnet
Upgrade authority: <YOUR_WALLET>
Deploying program "cipherchat"...
Program Id: <YOUR_PROGRAM_ID>

Deploy success
```

- [ ] Deployment successful
- [ ] Program ID confirmed
- [ ] No errors

## Step 9: Verify Deployment

```bash
# Check program on-chain
solana program show <YOUR_PROGRAM_ID>
```

**Expected output should show:**
- Program Id
- Owner (BPFLoaderUpgradeable)
- ProgramData Address
- Authority (your wallet)
- Data Length
- Deployed status

- [ ] Program verified on-chain
- [ ] Upgrade authority is your wallet

## Step 10: Update Frontend Environment

Create `.env.local` file (copy from `.env.local.example`):

```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_CIPHERCHAT_PROGRAM_ID=YOUR_PROGRAM_ID_HERE
NEXT_PUBLIC_WEB3_STORAGE_TOKEN=your_web3_storage_token
```

- [ ] `.env.local` created
- [ ] Program ID added
- [ ] Network set to devnet

## Step 11: Test the Frontend

```bash
# Start Next.js development server
npm run dev
```

Open http://localhost:3000

- [ ] Frontend loads successfully
- [ ] Wallet adapter works
- [ ] No console errors

## Step 12: Test the Program (Optional)

```bash
# Run Anchor tests
npm run anchor:test

# Note: You may need to install test dependencies
# npm install --save-dev chai mocha @types/chai @types/mocha ts-mocha
```

- [ ] Tests pass (if running)
- [ ] All instructions work

## Step 13: Monitor Program Logs

In a separate terminal:

```bash
# Stream program logs
npm run program:logs
```

- [ ] Logs streaming
- [ ] Can see program activity

## Deployment Complete! 🎉

Your program is now deployed to Solana devnet!

### Important Information to Save

| Item | Value |
|------|-------|
| **Program ID** | `<YOUR_PROGRAM_ID>` |
| **Cluster** | devnet |
| **Wallet Address** | `<YOUR_WALLET_ADDRESS>` |
| **Deployment Date** | `<DATE>` |

### Next Steps

1. **Share with team**: Share program ID with frontend developers
2. **Document**: Update README with program ID
3. **Test**: Test all program instructions
4. **Monitor**: Watch logs for any issues
5. **Iterate**: Make improvements and redeploy as needed

## Upgrading the Program

When you need to update the program:

```bash
# 1. Make changes to lib.rs

# 2. Rebuild
npm run anchor:build

# 3. Deploy (this will upgrade)
npm run anchor:deploy

# The program will be upgraded in-place
# Same program ID, new code
```

- [ ] Know how to upgrade
- [ ] Understand upgrade process

## Troubleshooting

### Error: "Insufficient funds"
```bash
npm run solana:airdrop
npm run solana:balance
```

### Error: "Program already deployed"
This is normal - it will upgrade the existing program.

### Error: "Failed to deploy"
Check:
- [ ] Wallet has sufficient SOL
- [ ] Network is devnet
- [ ] Program built successfully
- [ ] Program ID matches in all files

### Error: "Program ID mismatch"
Make sure program ID is the same in:
- [ ] `programs/cipherchat/src/lib.rs`
- [ ] `Anchor.toml` [programs.devnet]

## Going to Mainnet

⚠️ **Before deploying to mainnet:**

1. **Security Audit**: Get professional security audit
2. **Extensive Testing**: Test all edge cases
3. **Sufficient SOL**: Deployment costs more on mainnet (~1-2 SOL)
4. **Immutable Program**: Consider making program immutable:
   ```bash
   solana program set-upgrade-authority <PROGRAM_ID> --final
   ```
   ⚠️ This is PERMANENT!

---

**Congratulations on deploying your CipherChat program!** 🚀
