# Understanding TypeScript Errors (Before Building)

## Expected Errors ✅

The following TypeScript errors in `tests/cipherchat.ts` and `lib/cipherchat-client.ts` are **completely normal** and **expected** before you build the Anchor program:

### 1. `Cannot find module '../target/types/cipherchat'`

**Why**: The types file doesn't exist yet because the program hasn't been built.

**Fix**: Run `npm run anchor:build` - this will generate `target/types/cipherchat.ts`

### 2. `Property 'program' has no initializer`

**Why**: The client SDK waits for the IDL to be provided after building.

**Status**: ✅ Fixed with proper null checks and `ensureProgram()` method

### 3. Account type errors (`userMessagingKey`, `messageMetadata`)

**Why**: Account types are generated during the build process.

**Status**: ✅ Fixed with `@ts-ignore` comments (types will be correct after build)

## After Building the Program

Once you run `npm run anchor:build`, the following files will be generated:

```
target/
├── deploy/
│   └── cipherchat.so          # Compiled program binary
├── idl/
│   └── cipherchat.json        # Interface Definition Language
└── types/
    └── cipherchat.ts          # TypeScript types ✨
```

The `cipherchat.ts` types file will include:

- `Cipherchat` - Program type
- `UserMessagingKey` - Account type
- `MessageMetadata` - Account type
- All instruction parameter types
- Error code types

## Current Status

| File | Status | Notes |
|------|--------|-------|
| `lib/cipherchat-client.ts` | ✅ Ready | Uses `@ts-ignore` for pre-build compatibility |
| `tests/cipherchat.ts` | ⚠️ Needs Build | Will work after `npm run anchor:build` |
| Test dependencies | ✅ Installed | mocha, chai, @types/mocha, @types/chai |

## How to Use the Client SDK

### Before Build (Development)

The client will throw a helpful error:

```typescript
const client = new CipherChatClient(connection, wallet, programId);
// Error: "Program not initialized. Build the Anchor program first..."
```

### After Build

```typescript
import { CipherChatClient } from '@/lib/cipherchat-client';
import idl from '../target/idl/cipherchat.json';
import { PublicKey } from '@solana/web3.js';

// Option 1: Pass IDL in constructor
const client = new CipherChatClient(
  connection,
  wallet,
  new PublicKey(process.env.NEXT_PUBLIC_CIPHERCHAT_PROGRAM_ID!),
  idl
);

// Option 2: Initialize later
const client = new CipherChatClient(connection, wallet, programId);
client.initializeProgram(idl);

// Now you can use all methods
await client.registerMessagingKey(myPublicKey);
await client.postMessage(recipient, cid, ephemeralKey, ttl, sequence);
```

## Running Tests

### Option 1: Full Test (Recommended for first time)

```bash
npm run anchor:test
```

This will:
1. Start a local validator
2. Build the program
3. Deploy to local validator
4. Run tests
5. Shut down validator

### Option 2: Local Validator (Faster iteration)

Terminal 1:
```bash
npm run anchor:localnet
```

Terminal 2:
```bash
npm run anchor:test:local
```

## Quick Fix Checklist

To resolve all TypeScript errors:

- [ ] Install Rust (`cargo --version`)
- [ ] Install Solana CLI (`solana --version`)
- [ ] Install Anchor CLI (`anchor --version`)
- [ ] Run `npm run anchor:build`
- [ ] Verify `target/types/cipherchat.ts` exists
- [ ] All test file errors should disappear

## Still See Errors After Building?

1. **Restart TypeScript server**:
   - VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

2. **Check build was successful**:
   ```bash
   ls target/types/cipherchat.ts
   ```

3. **Rebuild clean**:
   ```bash
   anchor clean
   npm run anchor:build
   ```

4. **Check for build errors**:
   ```bash
   npm run anchor:build 2>&1 | grep -i error
   ```

## Summary

✅ **Test dependencies**: Installed
✅ **Client SDK**: Ready (with pre-build compatibility)
⚠️ **TypeScript errors**: Expected until you build the program
✅ **Solution**: Run `npm run anchor:build`

---

**These errors are normal for an Anchor project that hasn't been built yet!** They'll disappear automatically once you build the program.
