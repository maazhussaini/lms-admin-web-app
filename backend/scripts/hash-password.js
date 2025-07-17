#!/usr/bin/env node

/**
 * @file scripts/hash-password.js
 * @description Simple JavaScript version of the password hashing utility
 * @usage npm run hash-password-js <password>
 * @example npm run hash-password-js "mySecurePassword123!"
 */

const bcrypt = require('bcryptjs');

// Password policy configuration
const PASSWORD_POLICY = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 64,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL: true,
  SALT_ROUNDS: 12,
};

// Common weak passwords to check against
const COMMON_PASSWORDS = new Set([
  'password', 'admin', '123456', 'qwerty', 'welcome', 
  'letmein', '12345678', 'football', 'iloveyou', 'admin123',
  'password123', 'qwerty123', 'abc123', '111111', '123123'
]);

/**
 * Hash a password using bcrypt
 */
async function hashPassword(password, saltRounds = PASSWORD_POLICY.SALT_ROUNDS) {
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
  
  if (!Number.isInteger(saltRounds) || saltRounds < 4 || saltRounds > 31) {
    throw new Error('Salt rounds must be an integer between 4 and 31');
  }
  
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    return bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error(`Password hashing failed: ${error.message}`);
  }
}

/**
 * Validate password strength
 */
function validatePasswordStrength(password) {
  if (typeof password !== 'string') {
    return {
      isValid: false,
      issues: ['Password must be a string']
    };
  }
  
  const issues = [];
  
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
  
  return {
    isValid: issues.length === 0,
    issues: issues
  };
}

/**
 * Main function to hash a password from command line arguments
 */
async function main() {
  try {
    // Get password from command line arguments
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      console.error('❌ Error: Password is required');
      console.log('Usage: npm run hash-password-js <password>');
      console.log('Example: npm run hash-password-js "mySecurePassword123!"');
      process.exit(1);
    }

    if (args.length > 1) {
      console.error('❌ Error: Please provide password as a single argument (use quotes if it contains spaces)');
      console.log('Usage: npm run hash-password-js "your password here"');
      process.exit(1);
    }

    const password = args[0];

    if (!password) {
      console.error('❌ Error: Password cannot be empty');
      process.exit(1);
    }

    console.log('🔐 Password Hashing Utility (JavaScript)');
    console.log('========================================\n');

    // Validate password strength first
    console.log('🔍 Validating password strength...');
    const validation = validatePasswordStrength(password);
    
    if (!validation.isValid) {
      console.log('⚠️  Password validation warnings:');
      validation.issues.forEach(issue => {
        console.log(`   • ${issue}`);
      });
      console.log('\n❓ Do you want to continue anyway? This password may not meet security requirements.');
      console.log('   You can still hash it, but consider using a stronger password for production use.\n');
    } else {
      console.log('✅ Password meets security requirements\n');
    }

    // Hash the password
    console.log('🔄 Generating hash...');
    const startTime = Date.now();
    
    const hashedPassword = await hashPassword(password);
    
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log('✅ Password hashed successfully!\n');
    
    // Display results
    console.log('📋 Results:');
    console.log('===========');
    console.log(`Original Password: ${password}`);
    console.log(`Hashed Password:   ${hashedPassword}`);
    console.log(`Hash Length:       ${hashedPassword.length} characters`);
    console.log(`Processing Time:   ${duration}ms`);
    console.log(`Salt Rounds:       12 (OWASP recommended)\n`);
    
    // Additional information
    console.log('💡 Usage Instructions:');
    console.log('======================');
    console.log('1. Copy the hashed password above');
    console.log('2. Store it in your database (e.g., users table, password column)');
    console.log('3. Use the comparePassword() function from password.utils.ts to verify logins');
    console.log('\n📝 Example database storage:');
    console.log(`   INSERT INTO users (email, password_hash) VALUES ('user@example.com', '${hashedPassword}');`);
    console.log('\n🔒 Security Notes:');
    console.log('   • This hash cannot be reversed to get the original password');
    console.log('   • Each time you run this script, you\'ll get a different hash (due to unique salt)');
    console.log('   • Both hashes will work for the same password when using comparePassword()');

  } catch (error) {
    console.error('❌ Error occurred while hashing password:');
    console.error(`   ${error.message}`);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Password hashing cancelled by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Password hashing terminated');
  process.exit(0);
});

// Run the main function
main().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
