import nacl from 'tweetnacl';
import { decodeUTF8, encodeUTF8, encodeBase64, decodeBase64 } from 'tweetnacl-util';

/**
 * Generate a new keypair for encryption
 */
export const generateKeyPair = () => {
  return nacl.box.keyPair();
};

/**
 * Encrypt a message using the sender's secret key and recipient's public key
 * @param message - The message to encrypt
 * @param recipientPublicKey - The recipient's public key (Uint8Array)
 * @param senderSecretKey - The sender's secret key (Uint8Array)
 * @returns Encrypted message as base64 string
 */
export const encryptMessage = (
  message: string,
  recipientPublicKey: Uint8Array,
  senderSecretKey: Uint8Array
): string => {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const messageUint8 = decodeUTF8(message);
  const encrypted = nacl.box(messageUint8, nonce, recipientPublicKey, senderSecretKey);

  const fullMessage = new Uint8Array(nonce.length + encrypted.length);
  fullMessage.set(nonce);
  fullMessage.set(encrypted, nonce.length);

  return encodeBase64(fullMessage);
};

/**
 * Decrypt a message using the recipient's secret key and sender's public key
 * @param encryptedMessage - The encrypted message (base64 string)
 * @param senderPublicKey - The sender's public key (Uint8Array)
 * @param recipientSecretKey - The recipient's secret key (Uint8Array)
 * @returns Decrypted message as string or null if decryption fails
 */
export const decryptMessage = (
  encryptedMessage: string,
  senderPublicKey: Uint8Array,
  recipientSecretKey: Uint8Array
): string | null => {
  try {
    const messageWithNonce = decodeBase64(encryptedMessage);
    const nonce = messageWithNonce.slice(0, nacl.box.nonceLength);
    const message = messageWithNonce.slice(nacl.box.nonceLength);

    const decrypted = nacl.box.open(message, nonce, senderPublicKey, recipientSecretKey);

    if (!decrypted) {
      return null;
    }

    return encodeUTF8(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

/**
 * Generate a symmetric key for encryption
 */
export const generateSymmetricKey = (): Uint8Array => {
  return nacl.randomBytes(nacl.secretbox.keyLength);
};

/**
 * Encrypt a message with a symmetric key
 * @param message - The message to encrypt
 * @param key - The symmetric key
 */
export const symmetricEncrypt = (message: string, key: Uint8Array): string => {
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const messageUint8 = decodeUTF8(message);
  const encrypted = nacl.secretbox(messageUint8, nonce, key);

  const fullMessage = new Uint8Array(nonce.length + encrypted.length);
  fullMessage.set(nonce);
  fullMessage.set(encrypted, nonce.length);

  return encodeBase64(fullMessage);
};

/**
 * Decrypt a message with a symmetric key
 * @param encryptedMessage - The encrypted message
 * @param key - The symmetric key
 */
export const symmetricDecrypt = (encryptedMessage: string, key: Uint8Array): string | null => {
  try {
    const messageWithNonce = decodeBase64(encryptedMessage);
    const nonce = messageWithNonce.slice(0, nacl.secretbox.nonceLength);
    const message = messageWithNonce.slice(nacl.secretbox.nonceLength);

    const decrypted = nacl.secretbox.open(message, nonce, key);

    if (!decrypted) {
      return null;
    }

    return encodeUTF8(decrypted);
  } catch (error) {
    console.error('Symmetric decryption error:', error);
    return null;
  }
};

/**
 * Hash a message using SHA-512
 * @param message - The message to hash
 */
export const hashMessage = (message: string): Uint8Array => {
  const messageUint8 = decodeUTF8(message);
  return nacl.hash(messageUint8);
};
