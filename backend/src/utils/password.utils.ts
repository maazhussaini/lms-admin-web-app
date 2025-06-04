/**
 * @file utils/password.utils.ts
 * @description Password hashing and validation utilities.
 */

import bcrypt from 'bcryptjs';

/**
 * Hash a password using bcrypt
 * @param password Plain text password to hash
 * @param saltRounds Number of salt rounds for bcrypt (default: 12)
 * @returns Hashed password string
 */
export const hashPassword = async (password: string, saltRounds = 12): Promise<string> => {
  const salt = await bcrypt.genSalt(saltRounds);
  return bcrypt.hash(password, salt);
};

/**
 * Compare a plain text password with a hashed password
 * @param password Plain text password to check
 * @param hashedPassword Hashed password to compare against
 * @returns True if passwords match, false otherwise
 */
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Generate a random temporary password
 * @param length Length of the password (default: 12)
 * @returns Random password string
 */
export const generateTemporaryPassword = (length = 12): string => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';
  let password = '';
  
  // Ensure at least one character from each character class
  password += charset.substring(0, 26).charAt(Math.floor(Math.random() * 26)); // Uppercase
  password += charset.substring(26, 52).charAt(Math.floor(Math.random() * 26)); // Lowercase
  password += charset.substring(52, 62).charAt(Math.floor(Math.random() * 10)); // Number
  password += charset.substring(62).charAt(Math.floor(Math.random() * (charset.length - 62))); // Special
  
  // Fill the rest with random characters
  for (let i = password.length; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  // Shuffle the password characters
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
};
