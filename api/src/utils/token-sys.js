import crypto from 'crypto';
import dotenv from 'dotenv-safe';

// Load environment variables from .env file
dotenv.config();

/**
 * Secret key for encryption, should be stored securely.
 * It is loaded from the environment variables for security.
 * In this case, it uses the MONGO_URI as a secret key, which can be changed.
 */
const secretKey = process.env.TOKEN_SECRET; // Can be of any length
const iv = crypto.randomBytes(16); // Initialization vector (IV) is needed for encryption

/**
 * Generates a token by encrypting the provided data (username, uid, and password)
 * using AES-256-CBC encryption.
 *
 * @param {string} username - The username to include in the token.
 * @param {string} uid - The unique user ID to include in the token.
 * @param {string} password - The password to include in the token.
 * @returns {string} The generated encrypted token, combining IV and encrypted data.
 */
function generateToken(username, uid, password) {
  const data = `${username}\n${uid}\n${password}`;

  // Hash the secret key to ensure it's 32 bytes for AES-256-CBC
  const key = crypto.createHash('sha256').update(secretKey).digest();

  // Create cipheriv with a random IV and AES-256-CBC algorithm
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Combine the IV with the encrypted data (you'll need to use it for decryption later)
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypts the token using AES-256-CBC decryption with the stored secret key.
 * The token must include the IV and the encrypted data.
 *
 * @param {string} token - The encrypted token, with IV and encrypted data separated by a colon.
 * @returns {string} The decrypted data, which includes the original username, uid, and password.
 */
function decryptToken(token) {
  // Split the token into IV and encrypted data
  const [ivHex, encryptedData] = token.split(':');
  const iv = Buffer.from(ivHex, 'hex');

  // Hash the secret key to ensure it's 32 bytes for AES-256-CBC
  const key = crypto.createHash('sha256').update(secretKey).digest();

  // Create decipheriv to decrypt with the same algorithm and IV used for encryption
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export { decryptToken, generateToken };
