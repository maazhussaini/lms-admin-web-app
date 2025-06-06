/**
 * @file utils/password.utils.ts
 * @description Password hashing and validation utilities that follow OWASP security guidelines.
 * @see https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
 */

import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

/**
 * Password policy configuration interface
 */
export interface PasswordPolicyConfig {
  readonly MIN_LENGTH: number;
  readonly MAX_LENGTH: number;
  readonly REQUIRE_UPPERCASE: boolean;
  readonly REQUIRE_LOWERCASE: boolean;
  readonly REQUIRE_NUMBER: boolean;
  readonly REQUIRE_SPECIAL: boolean;
  readonly SALT_ROUNDS: number;
}

/**
 * Password validation result interface
 */
export interface PasswordValidationResult {
  readonly isValid: boolean;
  readonly issues: readonly string[];
}

/**
 * Password policy constants
 */
export const PASSWORD_POLICY: PasswordPolicyConfig = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 64,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL: true,
  SALT_ROUNDS: 12,
} as const;

/**
 * Common weak passwords to check against (abbreviated list)
 * In production, consider using a more comprehensive list or an API
 */
const COMMON_PASSWORDS: ReadonlySet<string> = new Set([
  'password', 'admin', '123456', 'qwerty', 'welcome', 
  'letmein', '12345678', 'football', 'iloveyou', 'admin123',
  'password123', 'qwerty123', 'abc123', '111111', '123123'
]);

/**
 * Hash a password using bcrypt
 * @param password Plain text password to hash
 * @param saltRounds Number of salt rounds for bcrypt (default: 12)
 * @returns Hashed password string
 * @throws Error if password is invalid or hashing fails
 */
export const hashPassword = async (password: string, saltRounds = PASSWORD_POLICY.SALT_ROUNDS): Promise<string> => {
  // Validate password before hashing
  if (typeof password !== 'string') {
    throw new Error('Password must be a string');
  }
  
  if (!password) {
    throw new Error('Password is required');
  }
  
  if (password.length < PASSWORD_POLICY.MIN_LENGTH) {
    throw new Error(`Password must be at least ${PASSWORD_POLICY.MIN_LENGTH} characters`);
  }
  
  if (password.length > PASSWORD_POLICY.MAX_LENGTH) {
    throw new Error(`Password must be no longer than ${PASSWORD_POLICY.MAX_LENGTH} characters`);
  }
  
  // Validate salt rounds
  if (!Number.isInteger(saltRounds) || saltRounds < 4 || saltRounds > 31) {
    throw new Error('Salt rounds must be an integer between 4 and 31');
  }
  
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    return bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error(`Password hashing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Compare a plain text password with a hashed password
 * @param password Plain text password to check
 * @param hashedPassword Hashed password to compare against
 * @returns True if passwords match, false otherwise
 * @throws Error if inputs are invalid or comparison fails
 */
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  // Validate inputs
  if (typeof password !== 'string' || typeof hashedPassword !== 'string') {
    throw new Error('Password and hashed password must be strings');
  }
  
  if (!password || !hashedPassword) {
    throw new Error('Password and hashed password are required');
  }
  
  // Basic format validation for bcrypt hash
  if (!hashedPassword.startsWith('$2') || hashedPassword.length < 59) {
    throw new Error('Invalid bcrypt hash format');
  }
  
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error(`Password comparison failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Generate a cryptographically secure random temporary password
 * @param length Length of the password (default: 16)
 * @returns Random password string that meets password policy requirements
 * @throws Error if length is invalid
 */
export const generateTemporaryPassword = (length = 16): string => {
  // Validate input parameters
  if (!Number.isInteger(length) || length < 1) {
    throw new Error('Password length must be a positive integer');
  }
  
  if (length < PASSWORD_POLICY.MIN_LENGTH) {
    length = PASSWORD_POLICY.MIN_LENGTH;
  }
  
  if (length > PASSWORD_POLICY.MAX_LENGTH) {
    length = PASSWORD_POLICY.MAX_LENGTH;
  }
  
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const specialChars = '!@#$%^&*()-_=+[]{}|;:,.<>?';
  
  // Ensure at least one character from each required character class
  let password = '';
  
  if (PASSWORD_POLICY.REQUIRE_UPPERCASE) {
    password += getSecureRandomChar(uppercaseChars);
  }
  
  if (PASSWORD_POLICY.REQUIRE_LOWERCASE) {
    password += getSecureRandomChar(lowercaseChars);
  }
  
  if (PASSWORD_POLICY.REQUIRE_NUMBER) {
    password += getSecureRandomChar(numberChars);
  }
  
  if (PASSWORD_POLICY.REQUIRE_SPECIAL) {
    password += getSecureRandomChar(specialChars);
  }
  
  // Build full character set based on policy
  let charset = '';
  if (PASSWORD_POLICY.REQUIRE_UPPERCASE) charset += uppercaseChars;
  if (PASSWORD_POLICY.REQUIRE_LOWERCASE) charset += lowercaseChars;
  if (PASSWORD_POLICY.REQUIRE_NUMBER) charset += numberChars;
  if (PASSWORD_POLICY.REQUIRE_SPECIAL) charset += specialChars;
  
  if (charset.length === 0) {
    throw new Error('No character classes are enabled in password policy');
  }
  
  // Fill the rest with random characters from the full charset
  const remainingLength = length - password.length;
  for (let i = 0; i < remainingLength; i++) {
    password += getSecureRandomChar(charset);
  }
  
  // Shuffle the password characters using Fisher-Yates algorithm
  // to prevent any pattern recognition
  return secureShuffle(password);
};

/**
 * Generate a cryptographically secure random character from the given charset
 * @param charset String containing possible characters
 * @returns A single random character from the charset
 * @throws Error if charset is empty
 */
const getSecureRandomChar = (charset: string): string => {
  if (!charset || charset.length === 0) {
    throw new Error('Charset cannot be empty');
  }
  
  const randomBytes = crypto.randomBytes(1);
  const firstByte = randomBytes[0];
  
  // TypeScript safety: ensure we have a valid byte
  if (firstByte === undefined) {
    throw new Error('Failed to generate random byte');
  }
  
  const randomIndex = firstByte % charset.length;
  return charset.charAt(randomIndex);
};

/**
 * Shuffle a string using the Fisher-Yates algorithm with crypto randomness
 * @param str String to shuffle
 * @returns Shuffled string
 * @throws Error if shuffling fails
 */
const secureShuffle = (str: string): string => {
  const array = str.split('');
  
  for (let i = array.length - 1; i > 0; i--) {
    // Generate a random index between 0 and i (inclusive)
    const randomBytes = crypto.randomBytes(4);
    const randomIndex = randomBytes.readUInt32BE(0) % (i + 1);
    
    // TypeScript safety: ensure array elements exist
    const currentElement = array[i];
    const targetElement = array[randomIndex];
    
    if (currentElement === undefined || targetElement === undefined) {
      throw new Error('Array indexing error during shuffle');
    }
    
    // Swap elements at i and randomIndex
    array[i] = targetElement;
    array[randomIndex] = currentElement;
  }
  
  return array.join('');
};

/**
 * Validate password strength according to policy and best practices
 * @param password Password to validate
 * @returns Object containing validity status and any issues found
 */
export const validatePasswordStrength = (password: string): PasswordValidationResult => {
  // Input validation
  if (typeof password !== 'string') {
    return {
      isValid: false,
      issues: Object.freeze(['Password must be a string'])
    } as const;
  }
  
  const issues: string[] = [];
  
  // Check length requirements
  if (!password || password.length < PASSWORD_POLICY.MIN_LENGTH) {
    issues.push(`Password must be at least ${PASSWORD_POLICY.MIN_LENGTH} characters`);
  }
  
  if (password && password.length > PASSWORD_POLICY.MAX_LENGTH) {
    issues.push(`Password must be no longer than ${PASSWORD_POLICY.MAX_LENGTH} characters`);
  }
  
  // Check character class requirements
  if (PASSWORD_POLICY.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    issues.push('Password must contain at least one uppercase letter');
  }
  
  if (PASSWORD_POLICY.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    issues.push('Password must contain at least one lowercase letter');
  }
  
  if (PASSWORD_POLICY.REQUIRE_NUMBER && !/[0-9]/.test(password)) {
    issues.push('Password must contain at least one number');
  }
  
  if (PASSWORD_POLICY.REQUIRE_SPECIAL && !/[!@#$%^&*()_\-+=[\]{}|;:,.<>?]/.test(password)) {
    issues.push('Password must contain at least one special character');
  }
  
  // Check for common passwords
  const normalizedPassword = password.toLowerCase();
  if (COMMON_PASSWORDS.has(normalizedPassword)) {
    issues.push('Password is too common and easily guessable');
  }
  
  // Check for repeated characters (more than 3 in a row)
  if (/(.)\1\1\1/.test(password)) {
    issues.push('Password should not contain more than 3 repeated characters in a row');
  }
  
  // Check for sequential characters (like "1234" or "abcd")
  if (/(?:0(?=1)|1(?=2)|2(?=3)|3(?=4)|4(?=5)|5(?=6)|6(?=7)|7(?=8)|8(?=9)){3,}/.test(password) ||
      /(?:a(?=b)|b(?=c)|c(?=d)|d(?=e)|e(?=f)|f(?=g)|g(?=h)|h(?=i)|i(?=j)|j(?=k)|k(?=l)|l(?=m)|m(?=n)|n(?=o)|o(?=p)|p(?=q)|q(?=r)|r(?=s)|s(?=t)|t(?=u)|u(?=v)|v(?=w)|w(?=x)|x(?=y)|y(?=z)){3,}/i.test(password)) {
    issues.push('Password should not contain sequential characters (like "1234" or "abcd")');
  }
  
  return {
    isValid: issues.length === 0,
    issues: Object.freeze(issues) // Make issues array immutable
  } as const;
};
