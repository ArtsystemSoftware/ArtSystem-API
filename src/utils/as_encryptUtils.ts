import * as crypto from 'crypto';

// Encrypt function
const as_encrypt = (plainText: string, password: string): string => {
    try {
        // Generate a random IV
        const iv = crypto.randomBytes(16);
        
        // Derive a key from the password using PBKDF2
        const key = crypto.pbkdf2Sync(password, iv, 10000, 32, 'sha256');
        
        // Create a cipher instance
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        
        // Encrypt the plaintext
        let encrypted = cipher.update(plainText, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        // Return the IV and encrypted text separated by a colon
        return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Encryption failed');
    }
};

// Decrypt function
const as_decrypt = (encryptedText: string, password: string): string => {
    try {
        // Split the encrypted text into IV and encrypted data
        const [ivHex, encryptedHex] = encryptedText.split(':');
        
        // Convert IV and encrypted data from hex to Buffer
        const iv = Buffer.from(ivHex, 'hex');
        const encryptedData = Buffer.from(encryptedHex, 'hex');
        
        // Derive the key from the password using PBKDF2
        const key = crypto.pbkdf2Sync(password, iv, 10000, 32, 'sha256');
        
        // Create a decipher instance
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        
        // Decrypt the data
        let decrypted = decipher.update(encryptedData);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        
        // Return the decrypted text
        return decrypted.toString('utf8');
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Decryption failed');
    }
};

export default { as_encrypt, as_decrypt };
