# Available NPM Scripts

This document lists all available npm scripts for the CipherChat project.

## Frontend Development

### `npm run dev`
Start the Next.js development server on http://localhost:3000

### `npm run build`
Build the Next.js application for production

### `npm run start`
Start the Next.js production server (requires build first)

### `npm run lint`
Run ESLint to check code quality

## Anchor Program Development

### Build & Deploy

#### `npm run anchor:build`
Build the Anchor program
- Compiles Rust code to BPF
- Generates IDL in `target/idl/cipherchat.json`
- Generates TypeScript types in `target/types/cipherchat.ts`
- Creates program binary in `target/deploy/cipherchat.so`

**Usage:**
```bash
npm run anchor:build
```

#### `npm run anchor:deploy`
Deploy the program to **devnet**
- Requires sufficient SOL in wallet
- Updates program on devnet cluster

**Usage:**
```bash
npm run anchor:deploy
```

#### `npm run anchor:deploy:local`
Deploy the program to **localnet**
- Requires `solana-test-validator` running
- Deploys to local validator

**Usage:**
```bash
# Terminal 1
npm run anchor:localnet

# Terminal 2
npm run anchor:deploy:local
```

### Testing

#### `npm run anchor:test`
Run Anchor tests
- Starts local validator
- Deploys program
- Runs tests in `tests/` directory
- Shuts down validator

**Usage:**
```bash
npm run anchor:test
```

#### `npm run anchor:test:local`
Run tests against already running local validator
- Skips starting/stopping validator
- Faster for iterative testing

**Usage:**
```bash
# Terminal 1
npm run anchor:localnet

# Terminal 2
npm run anchor:test:local
```

### Utilities

#### `npm run anchor:keys`
List all program IDs
- Shows program keypairs and their public keys
- Use this to get your program ID after building

**Usage:**
```bash
npm run anchor:keys

# Output:
# cipherchat: <PROGRAM_ID>
```

#### `npm run anchor:localnet`
Start a local Solana test validator
- Runs on localhost:8899
- Useful for local development and testing
- Keep running in separate terminal

**Usage:**
```bash
npm run anchor:localnet
```

## Solana CLI Utilities

### `npm run program:logs`
Stream program logs in real-time
- Shows all program logs from the cluster
- Useful for debugging

**Usage:**
```bash
npm run program:logs
```

### `npm run solana:config`
Display current Solana CLI configuration
- Shows RPC URL, websocket URL, keypair path, commitment level

**Usage:**
```bash
npm run solana:config
```

### `npm run solana:airdrop`
Request 2 SOL airdrop (devnet/testnet only)
- Requires devnet or testnet cluster
- Won't work on mainnet

**Usage:**
```bash
npm run solana:airdrop
```

### `npm run solana:balance`
Check wallet SOL balance

**Usage:**
```bash
npm run solana:balance
```

## Common Workflows

### Initial Setup & Deployment

```bash
# 1. Build the program
npm run anchor:build

# 2. Get program ID
npm run anchor:keys

# 3. Update program ID in lib.rs and Anchor.toml

# 4. Rebuild with new program ID
npm run anchor:build

# 5. Check Solana config (should show devnet)
npm run solana:config

# 6. Get SOL for deployment
npm run solana:airdrop

# 7. Check balance
npm run solana:balance

# 8. Deploy to devnet
npm run anchor:deploy
```

### Local Development Workflow

```bash
# Terminal 1: Start local validator
npm run anchor:localnet

# Terminal 2: Deploy and test
npm run anchor:build
npm run anchor:deploy:local
npm run anchor:test:local

# Or run all tests (starts its own validator)
npm run anchor:test
```

### Development Iteration

```bash
# Make changes to lib.rs

# Rebuild
npm run anchor:build

# Test locally
npm run anchor:test:local

# Deploy to devnet when ready
npm run anchor:deploy
```

### Debugging

```bash
# Terminal 1: Stream logs
npm run program:logs

# Terminal 2: Test/interact with program
npm run anchor:test:local
```

## Environment Setup

Before running Anchor commands, ensure:

1. **Rust is installed**
   ```bash
   cargo --version
   ```

2. **Solana CLI is installed**
   ```bash
   solana --version
   ```

3. **Anchor is installed**
   ```bash
   anchor --version
   ```

4. **Cluster is configured**
   ```bash
   # For devnet
   solana config set --url devnet
   
   # For localnet
   solana config set --url localhost
   ```

5. **Wallet is configured**
   ```bash
   # Check current wallet
   solana address
   
   # Create new wallet if needed
   solana-keygen new
   ```

## Troubleshooting

### "anchor: command not found"
Install Anchor CLI:
```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

### "insufficient funds"
Get more SOL:
```bash
npm run solana:airdrop
```

### "Program <ID> not deployed"
Deploy the program first:
```bash
npm run anchor:deploy
```

### Build errors
Clean and rebuild:
```bash
anchor clean
npm run anchor:build
```

## Additional Commands

### Manual Anchor Commands

If you need to run custom Anchor commands:

```bash
# Build specific program
anchor build -p cipherchat

# Deploy with specific provider
anchor deploy --provider.cluster devnet --provider.wallet ~/.config/solana/id.json

# Run specific test file
anchor test tests/cipherchat.ts

# Generate IDL only
anchor idl init --filepath target/idl/cipherchat.json <PROGRAM_ID>

# Upgrade deployed program
anchor upgrade target/deploy/cipherchat.so --program-id <PROGRAM_ID>

# Verify build
anchor verify <PROGRAM_ID>
```

### Manual Solana Commands

```bash
# Set cluster
solana config set --url <devnet|testnet|mainnet-beta|localhost>

# Get program account info
solana program show <PROGRAM_ID>

# View program buffer
solana program dump <PROGRAM_ID> dump.so

# Close program (recover SOL)
solana program close <PROGRAM_ID>
```

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run anchor:build` | Build Anchor program |
| `npm run anchor:deploy` | Deploy to devnet |
| `npm run anchor:test` | Run all tests |
| `npm run anchor:keys` | Show program IDs |
| `npm run solana:airdrop` | Get 2 SOL (devnet) |
| `npm run program:logs` | Stream program logs |

## Notes

- All Anchor commands use the configuration in `Anchor.toml`
- Default cluster is set to **devnet** in `Anchor.toml`
- Wallet path defaults to `~/.config/solana/id.json`
- On Windows, wallet is typically at: `C:\Users\<username>\.config\solana\id.json`
