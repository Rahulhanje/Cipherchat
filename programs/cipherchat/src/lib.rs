use anchor_lang::prelude::*;

// This will be replaced with the actual program ID after deployment
declare_id!("11111111111111111111111111111111");

#[program]
pub mod cipherchat {
    use super::*;

    /// Register a user's X25519 public key for encrypted messaging
    pub fn register_messaging_key(
        ctx: Context<RegisterMessagingKey>,
        msg_pubkey: [u8; 32],
    ) -> Result<()> {
        let user_key = &mut ctx.accounts.user_messaging_key;
        
        // Ensure the key hasn't been registered yet or is being updated by the same owner
        require!(
            user_key.owner == Pubkey::default() || user_key.owner == ctx.accounts.authority.key(),
            CipherChatError::UnauthorizedKeyUpdate
        );

        user_key.owner = ctx.accounts.authority.key();
        user_key.msg_pubkey = msg_pubkey;
        user_key.is_revoked = false;
        user_key.created_at = Clock::get()?.unix_timestamp;
        user_key.updated_at = Clock::get()?.unix_timestamp;

        emit!(MessagingKeyRegistered {
            owner: ctx.accounts.authority.key(),
            msg_pubkey,
            timestamp: user_key.created_at,
        });

        Ok(())
    }

    /// Post an encrypted message metadata on-chain
    pub fn post_message(
        ctx: Context<PostMessage>,
        cid: String,
        ephemeral_pub: [u8; 32],
        ttl: i64,
        sequence: u64,
    ) -> Result<()> {
        // Validate CID length
        require!(
            cid.len() <= 100,
            CipherChatError::CidTooLong
        );

        // Validate TTL (max 30 days)
        require!(
            ttl > 0 && ttl <= 2_592_000,
            CipherChatError::InvalidTTL
        );

        // Ensure recipient has a registered key
        require!(
            !ctx.accounts.recipient_key.is_revoked,
            CipherChatError::RecipientKeyRevoked
        );

        let message = &mut ctx.accounts.message_metadata;
        let clock = Clock::get()?;

        message.sender = ctx.accounts.sender.key();
        message.recipient = ctx.accounts.recipient.key();
        message.cid = cid.clone();
        message.ephemeral_pub = ephemeral_pub;
        message.timestamp = clock.unix_timestamp;
        message.ttl = ttl;
        message.sequence = sequence;
        message.is_read = false;

        emit!(MessagePosted {
            sender: message.sender,
            recipient: message.recipient,
            cid,
            sequence,
            timestamp: message.timestamp,
        });

        Ok(())
    }

    /// Revoke a user's messaging key
    pub fn revoke_key(ctx: Context<RevokeKey>) -> Result<()> {
        let user_key = &mut ctx.accounts.user_messaging_key;

        require!(
            user_key.owner == ctx.accounts.authority.key(),
            CipherChatError::UnauthorizedKeyRevoke
        );

        require!(
            !user_key.is_revoked,
            CipherChatError::KeyAlreadyRevoked
        );

        user_key.is_revoked = true;
        user_key.updated_at = Clock::get()?.unix_timestamp;

        emit!(MessagingKeyRevoked {
            owner: ctx.accounts.authority.key(),
            timestamp: user_key.updated_at,
        });

        Ok(())
    }

    /// Mark a message as read
    pub fn mark_message_read(ctx: Context<MarkMessageRead>) -> Result<()> {
        let message = &mut ctx.accounts.message_metadata;

        require!(
            message.recipient == ctx.accounts.recipient.key(),
            CipherChatError::UnauthorizedMessageAccess
        );

        message.is_read = true;

        Ok(())
    }
}

// ============================================================================
// Account Contexts
// ============================================================================

#[derive(Accounts)]
pub struct RegisterMessagingKey<'info> {
    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + UserMessagingKey::INIT_SPACE,
        seeds = [b"msgkey", authority.key().as_ref()],
        bump
    )]
    pub user_messaging_key: Account<'info, UserMessagingKey>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(sequence: u64)]
pub struct PostMessage<'info> {
    #[account(
        init,
        payer = sender,
        space = 8 + MessageMetadata::INIT_SPACE,
        seeds = [
            b"inbox",
            recipient.key().as_ref(),
            sequence.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub message_metadata: Account<'info, MessageMetadata>,

    #[account(
        seeds = [b"msgkey", recipient.key().as_ref()],
        bump,
        constraint = recipient_key.owner == recipient.key() @ CipherChatError::InvalidRecipient
    )]
    pub recipient_key: Account<'info, UserMessagingKey>,

    #[account(mut)]
    pub sender: Signer<'info>,

    /// CHECK: Recipient's public key, validated against recipient_key
    pub recipient: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RevokeKey<'info> {
    #[account(
        mut,
        seeds = [b"msgkey", authority.key().as_ref()],
        bump,
        constraint = user_messaging_key.owner == authority.key() @ CipherChatError::UnauthorizedKeyRevoke
    )]
    pub user_messaging_key: Account<'info, UserMessagingKey>,

    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct MarkMessageRead<'info> {
    #[account(
        mut,
        seeds = [
            b"inbox",
            recipient.key().as_ref(),
            message_metadata.sequence.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub message_metadata: Account<'info, MessageMetadata>,

    pub recipient: Signer<'info>,
}

// ============================================================================
// Account Structures
// ============================================================================

#[account]
#[derive(InitSpace)]
pub struct UserMessagingKey {
    /// The wallet that owns this messaging key
    pub owner: Pubkey,
    
    /// X25519 public key for message encryption (32 bytes)
    pub msg_pubkey: [u8; 32],
    
    /// Whether this key has been revoked
    pub is_revoked: bool,
    
    /// Timestamp when key was created
    pub created_at: i64,
    
    /// Timestamp when key was last updated
    pub updated_at: i64,
}

#[account]
#[derive(InitSpace)]
pub struct MessageMetadata {
    /// Sender's wallet address
    pub sender: Pubkey,
    
    /// Recipient's wallet address
    pub recipient: Pubkey,
    
    /// IPFS CID pointing to encrypted message content
    #[max_len(100)]
    pub cid: String,
    
    /// Ephemeral X25519 public key for this message
    pub ephemeral_pub: [u8; 32],
    
    /// Unix timestamp when message was posted
    pub timestamp: i64,
    
    /// Time-to-live in seconds (max 30 days)
    pub ttl: i64,
    
    /// Sequence number for this recipient's inbox
    pub sequence: u64,
    
    /// Whether the message has been read
    pub is_read: bool,
}

// ============================================================================
// Events
// ============================================================================

#[event]
pub struct MessagingKeyRegistered {
    pub owner: Pubkey,
    pub msg_pubkey: [u8; 32],
    pub timestamp: i64,
}

#[event]
pub struct MessagePosted {
    pub sender: Pubkey,
    pub recipient: Pubkey,
    pub cid: String,
    pub sequence: u64,
    pub timestamp: i64,
}

#[event]
pub struct MessagingKeyRevoked {
    pub owner: Pubkey,
    pub timestamp: i64,
}

// ============================================================================
// Errors
// ============================================================================

#[error_code]
pub enum CipherChatError {
    #[msg("Unauthorized key update attempt")]
    UnauthorizedKeyUpdate,
    
    #[msg("Unauthorized key revoke attempt")]
    UnauthorizedKeyRevoke,
    
    #[msg("CID exceeds maximum length of 100 characters")]
    CidTooLong,
    
    #[msg("TTL must be between 1 and 2,592,000 seconds (30 days)")]
    InvalidTTL,
    
    #[msg("Recipient's messaging key has been revoked")]
    RecipientKeyRevoked,
    
    #[msg("Key has already been revoked")]
    KeyAlreadyRevoked,
    
    #[msg("Invalid recipient")]
    InvalidRecipient,
    
    #[msg("Unauthorized message access")]
    UnauthorizedMessageAccess,
}
