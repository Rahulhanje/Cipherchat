# CipherChat Solana Program

Anchor-based Solana program for end-to-end encrypted messaging on the blockchain.

## Program Structure

### Program ID
- Placeholder: `11111111111111111111111111111111`
- Will be replaced after deployment with: `anchor keys list`

## Account Structures

### 1. UserMessagingKey
PDA for storing user's X25519 public key for encryption.

**Seeds**: `["msgkey", wallet_pubkey]`

**Fields**:
- `owner: Pubkey` - Wallet that owns this key
- `msg_pubkey: [u8; 32]` - X25519 public key for encryption
- `is_revoked: bool` - Whether key has been revoked
- `created_at: i64` - Unix timestamp of creation
- `updated_at: i64` - Unix timestamp of last update

**Size**: 8 (discriminator) + 32 + 32 + 1 + 8 + 8 = 89 bytes

### 2. MessageMetadata
PDA for storing encrypted message metadata.

**Seeds**: `["inbox", recipient_wallet, sequence_u64]`

**Fields**:
- `sender: Pubkey` - Message sender
- `recipient: Pubkey` - Message recipient
- `cid: String` - IPFS CID (max 100 chars) pointing to encrypted content
- `ephemeral_pub: [u8; 32]` - Ephemeral X25519 public key
- `timestamp: i64` - Unix timestamp
- `ttl: i64` - Time-to-live in seconds (max 30 days)
- `sequence: u64` - Inbox sequence number
- `is_read: bool` - Read status

**Size**: 8 + 32 + 32 + (4 + 100) + 32 + 8 + 8 + 8 + 1 = 233 bytes

## Instructions

### 1. register_messaging_key
Register or update user's X25519 public key.

**Parameters**:
- `msg_pubkey: [u8; 32]` - User's X25519 public key

**Accounts**:
- `user_messaging_key` - UserMessagingKey PDA (init_if_needed)
- `authority` - Signer (wallet owner)
- `system_program` - System program

**Validation**:
- Only owner can update their key
- Emits `MessagingKeyRegistered` event

### 2. post_message
Post encrypted message metadata on-chain.

**Parameters**:
- `cid: String` - IPFS CID (max 100 chars)
- `ephemeral_pub: [u8; 32]` - Ephemeral public key
- `ttl: i64` - Time-to-live (1 to 2,592,000 seconds)
- `sequence: u64` - Message sequence number

**Accounts**:
- `message_metadata` - MessageMetadata PDA (init)
- `recipient_key` - Recipient's UserMessagingKey PDA
- `sender` - Signer (message sender)
- `recipient` - Recipient's wallet
- `system_program` - System program

**Validation**:
- CID must be ≤ 100 characters
- TTL must be 1 to 2,592,000 seconds (30 days)
- Recipient key must not be revoked
- Emits `MessagePosted` event

### 3. revoke_key
Revoke user's messaging key.

**Accounts**:
- `user_messaging_key` - UserMessagingKey PDA (mut)
- `authority` - Signer (key owner)

**Validation**:
- Only owner can revoke their key
- Key must not already be revoked
- Emits `MessagingKeyRevoked` event

### 4. mark_message_read
Mark a message as read.

**Accounts**:
- `message_metadata` - MessageMetadata PDA (mut)
- `recipient` - Signer (must be message recipient)

**Validation**:
- Only recipient can mark message as read

## Events

### MessagingKeyRegistered
```rust
{
    owner: Pubkey,
    msg_pubkey: [u8; 32],
    timestamp: i64,
}
```

### MessagePosted
```rust
{
    sender: Pubkey,
    recipient: Pubkey,
    cid: String,
    sequence: u64,
    timestamp: i64,
}
```

### MessagingKeyRevoked
```rust
{
    owner: Pubkey,
    timestamp: i64,
}
```

## Error Codes

- `UnauthorizedKeyUpdate` - Unauthorized key update attempt
- `UnauthorizedKeyRevoke` - Unauthorized key revoke attempt
- `CidTooLong` - CID exceeds 100 characters
- `InvalidTTL` - TTL not between 1 and 2,592,000 seconds
- `RecipientKeyRevoked` - Recipient's key has been revoked
- `KeyAlreadyRevoked` - Key already revoked
- `InvalidRecipient` - Invalid recipient
- `UnauthorizedMessageAccess` - Unauthorized message access

## Security Features

1. **PDA-based access control** - All accounts use PDAs with proper seeds
2. **Owner validation** - Keys can only be updated/revoked by owner
3. **Recipient validation** - Messages can only be sent to valid recipients
4. **Revocation support** - Keys can be revoked to prevent new messages
5. **TTL limits** - Maximum 30-day TTL to prevent spam
6. **CID length limits** - Maximum 100 character CIDs

## Usage Flow

### 1. User Registration
```
User → register_messaging_key(x25519_pubkey)
Creates: UserMessagingKey PDA
```

### 2. Sending Message
```
Sender → post_message(cid, ephemeral_pub, ttl, sequence)
Creates: MessageMetadata PDA
Stores: IPFS CID and ephemeral key for encryption
```

### 3. Reading Messages
```
Recipient → Query MessageMetadata PDAs
Decrypt: Using recipient's private key + ephemeral key
Mark read: mark_message_read()
```

### 4. Key Revocation
```
User → revoke_key()
Updates: UserMessagingKey.is_revoked = true
Effect: No new messages can be received
```

## Development Setup

### Prerequisites
- Rust 1.75+
- Solana CLI 1.18+
- Anchor 0.30.1+
- Node.js 18+

### Build
```bash
anchor build
```

### Deploy
```bash
# Local
anchor deploy

# Devnet
anchor deploy --provider.cluster devnet

# Update program ID in lib.rs and Anchor.toml
anchor keys list
```

### Test
```bash
anchor test
```

## Integration Example

See the Next.js frontend in the root directory for integration examples:
- `lib/solana.ts` - Connection utilities
- `lib/encryption.ts` - X25519 encryption helpers
- TypeScript SDK generation: `anchor build` creates IDL in `target/idl/`

## Cost Estimation

### Account Creation
- UserMessagingKey: ~0.0006 SOL (89 bytes)
- MessageMetadata: ~0.0017 SOL (233 bytes)

### Transactions
- register_messaging_key: ~0.000005 SOL
- post_message: ~0.000005 SOL
- revoke_key: ~0.000005 SOL

*Costs based on current Solana rent exemption and transaction fees*
