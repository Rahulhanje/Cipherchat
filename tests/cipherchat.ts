/**
 * CipherChat Program Tests
 * 
 * NOTE: TypeScript errors in this file are expected until you build the Anchor program.
 * 
 * To fix the errors:
 * 1. Run: npm run anchor:build
 * 2. This will generate target/types/cipherchat.ts with proper types
 * 3. The import on line 3 will work after the build
 * 
 * The test dependencies are already installed.
 */

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Cipherchat } from "../target/types/cipherchat";
import { PublicKey, Keypair } from "@solana/web3.js";
import { assert } from "chai";
import nacl from "tweetnacl";

describe("cipherchat", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Cipherchat as Program<Cipherchat>;

  // Test keypairs
  let sender: Keypair;
  let recipient: Keypair;
  let senderMessagingKey: nacl.BoxKeyPair;
  let recipientMessagingKey: nacl.BoxKeyPair;

  before(async () => {
    // Generate test wallets
    sender = Keypair.generate();
    recipient = Keypair.generate();

    // Generate X25519 keypairs for messaging
    senderMessagingKey = nacl.box.keyPair();
    recipientMessagingKey = nacl.box.keyPair();

    // Airdrop SOL to test accounts
    const airdropSig1 = await provider.connection.requestAirdrop(
      sender.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSig1);

    const airdropSig2 = await provider.connection.requestAirdrop(
      recipient.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSig2);
  });

  it("Registers a messaging key for sender", async () => {
    const [userMessagingKeyPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("msgkey"), sender.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .registerMessagingKey(Array.from(senderMessagingKey.publicKey))
      .accounts({
        userMessagingKey: userMessagingKeyPDA,
        authority: sender.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([sender])
      .rpc();

    const keyAccount = await program.account.userMessagingKey.fetch(
      userMessagingKeyPDA
    );

    assert.equal(
      keyAccount.owner.toString(),
      sender.publicKey.toString()
    );
    assert.deepEqual(
      keyAccount.msgPubkey,
      Array.from(senderMessagingKey.publicKey)
    );
    assert.isFalse(keyAccount.isRevoked);
  });

  it("Registers a messaging key for recipient", async () => {
    const [userMessagingKeyPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("msgkey"), recipient.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .registerMessagingKey(Array.from(recipientMessagingKey.publicKey))
      .accounts({
        userMessagingKey: userMessagingKeyPDA,
        authority: recipient.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([recipient])
      .rpc();

    const keyAccount = await program.account.userMessagingKey.fetch(
      userMessagingKeyPDA
    );

    assert.equal(
      keyAccount.owner.toString(),
      recipient.publicKey.toString()
    );
    assert.deepEqual(
      keyAccount.msgPubkey,
      Array.from(recipientMessagingKey.publicKey)
    );
  });

  it("Posts a message from sender to recipient", async () => {
    const sequence = new anchor.BN(0);
    const cid = "QmTest123456789"; // Mock IPFS CID
    const ephemeralKey = nacl.box.keyPair();
    const ttl = new anchor.BN(86400); // 24 hours

    const [messageMetadataPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("inbox"),
        recipient.publicKey.toBuffer(),
        sequence.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    const [recipientKeyPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("msgkey"), recipient.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .postMessage(cid, Array.from(ephemeralKey.publicKey), ttl, sequence)
      .accounts({
        messageMetadata: messageMetadataPDA,
        recipientKey: recipientKeyPDA,
        sender: sender.publicKey,
        recipient: recipient.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([sender])
      .rpc();

    const messageAccount = await program.account.messageMetadata.fetch(
      messageMetadataPDA
    );

    assert.equal(
      messageAccount.sender.toString(),
      sender.publicKey.toString()
    );
    assert.equal(
      messageAccount.recipient.toString(),
      recipient.publicKey.toString()
    );
    assert.equal(messageAccount.cid, cid);
    assert.deepEqual(
      messageAccount.ephemeralPub,
      Array.from(ephemeralKey.publicKey)
    );
    assert.equal(messageAccount.sequence.toString(), sequence.toString());
    assert.isFalse(messageAccount.isRead);
  });

  it("Marks a message as read", async () => {
    const sequence = new anchor.BN(0);

    const [messageMetadataPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("inbox"),
        recipient.publicKey.toBuffer(),
        sequence.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    await program.methods
      .markMessageRead()
      .accounts({
        messageMetadata: messageMetadataPDA,
        recipient: recipient.publicKey,
      })
      .signers([recipient])
      .rpc();

    const messageAccount = await program.account.messageMetadata.fetch(
      messageMetadataPDA
    );

    assert.isTrue(messageAccount.isRead);
  });

  it("Revokes a messaging key", async () => {
    const [userMessagingKeyPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("msgkey"), sender.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .revokeKey()
      .accounts({
        userMessagingKey: userMessagingKeyPDA,
        authority: sender.publicKey,
      })
      .signers([sender])
      .rpc();

    const keyAccount = await program.account.userMessagingKey.fetch(
      userMessagingKeyPDA
    );

    assert.isTrue(keyAccount.isRevoked);
  });

  it("Fails to post message to revoked key", async () => {
    const sequence = new anchor.BN(1);
    const cid = "QmTest987654321";
    const ephemeralKey = nacl.box.keyPair();
    const ttl = new anchor.BN(86400);

    const [messageMetadataPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("inbox"),
        sender.publicKey.toBuffer(),
        sequence.toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    const [senderKeyPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("msgkey"), sender.publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.methods
        .postMessage(cid, Array.from(ephemeralKey.publicKey), ttl, sequence)
        .accounts({
          messageMetadata: messageMetadataPDA,
          recipientKey: senderKeyPDA,
          sender: recipient.publicKey,
          recipient: sender.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([recipient])
        .rpc();

      assert.fail("Should have thrown an error");
    } catch (error: any) {
      assert.include(error.toString(), "RecipientKeyRevoked");
    }
  });
});
