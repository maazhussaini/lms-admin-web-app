#!/usr/bin/env node

/// <reference types="node" />

/**
 * @file scripts/hash-password.ts
 * @description Command-line utility to hash passwords using the project's password utilities
 * @usage npm run hash-password <password>
 * @example npm run hash-password "mySecurePassword123!"
 */

import { hashPassword, validatePasswordStrength } from '../src/utils/password.utils';

/**
 * Main function to hash a password from command line arguments
 */
async function main(): Promise<void> {
  try {
    // Get password from command line arguments
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      console.error('❌ Error: Password is required');
      console.log('Usage: npm run hash-password <password>');
      console.log('Example: npm run hash-password "mySecurePassword123!"');
      process.exit(1);
    }

    if (args.length > 1) {
      console.error('❌ Error: Please provide password as a single argument (use quotes if it contains spaces)');
      console.log('Usage: npm run hash-password "your password here"');
      process.exit(1);
    }

    const password = args[0];

    if (!password) {
      console.error('❌ Error: Password cannot be empty');
      process.exit(1);
    }

    console.log('🔐 Password Hashing Utility');
    console.log('==========================\n');

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
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    } else {
      console.error('   Unknown error occurred');
    }
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
