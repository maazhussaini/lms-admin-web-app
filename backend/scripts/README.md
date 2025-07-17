# Password Hashing Utilities

This directory contains command-line utilities for hashing passwords using the same secure algorithms used by your LMS application.

## Available Scripts

### 1. JavaScript Version (Recommended)
```bash
npm run hash-password-js "your_password_here"
```

### 2. TypeScript Version
```bash
npm run hash-password "your_password_here"
```

## Usage Examples

### Basic Usage
```bash
# Hash a simple password
npm run hash-password-js "password123"

# Hash a strong password
npm run hash-password-js "MySecure123!@#"

# Hash password with spaces (use quotes)
npm run hash-password-js "my secure password 2024!"
```

### Expected Output
```
🔐 Password Hashing Utility (JavaScript)
========================================

🔍 Validating password strength...
✅ Password meets security requirements

🔄 Generating hash...
✅ Password hashed successfully!

📋 Results:
===========
Original Password: MySecure123!@#
Hashed Password:   $2b$12$B8hk.1nJE.osdL/7.CpTA.Pbu9mOC9Pc.3uYZTfBfvJPXY4t80VYG
Hash Length:       60 characters
Processing Time:   273ms
Salt Rounds:       12 (OWASP recommended)

💡 Usage Instructions:
======================
1. Copy the hashed password above
2. Store it in your database (e.g., users table, password column)
3. Use the comparePassword() function from password.utils.ts to verify logins

📝 Example database storage:
   INSERT INTO users (email, password_hash) VALUES ('user@example.com', '$2b$12$B8hk.1nJE.osdL/7.CpTA.Pbu9mOC9Pc.3uYZTfBfvJPXY4t80VYG');

🔒 Security Notes:
   • This hash cannot be reversed to get the original password
   • Each time you run this script, you'll get a different hash (due to unique salt)
   • Both hashes will work for the same password when using comparePassword()
```

## Password Policy

The utilities enforce the following password policy:

- **Minimum Length**: 8 characters
- **Maximum Length**: 64 characters
- **Required**: At least one uppercase letter (A-Z)
- **Required**: At least one lowercase letter (a-z)
- **Required**: At least one number (0-9)
- **Required**: At least one special character (!@#$%^&*()_-+=[]{}|;:,.<>?)
- **Salt Rounds**: 12 (OWASP recommended)

## Security Features

### Password Validation
- Checks against common/weak passwords
- Prevents repeated characters (more than 3 in a row)
- Prevents sequential characters (like "1234" or "abcd")
- Validates all character class requirements

### Secure Hashing
- Uses bcryptjs with 12 salt rounds
- Each hash is unique even for the same password
- Cryptographically secure and OWASP compliant
- Cannot be reversed to obtain original password

## Integration with Your Application

The generated hashes are fully compatible with your application's authentication system:

```typescript
import { comparePassword } from '@/utils/password.utils';

// Verify password during login
const isValid = await comparePassword(userInputPassword, storedHashFromDatabase);
if (isValid) {
  // Login successful
} else {
  // Invalid password
}
```

## Database Storage

Store the generated hash in your database:

```sql
-- Example table structure
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(60) NOT NULL,  -- bcrypt hashes are always 60 characters
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert user with hashed password
INSERT INTO users (email, password_hash) 
VALUES ('admin@example.com', '$2b$12$B8hk.1nJE.osdL/7.CpTA.Pbu9mOC9Pc.3uYZTfBfvJPXY4t80VYG');
```

## Troubleshooting

### Common Issues

1. **Password too weak**: The utility will warn you but still generate a hash. Consider using a stronger password for production.

2. **Special characters in terminal**: Use quotes around your password if it contains special characters:
   ```bash
   npm run hash-password-js "password!@#"
   ```

3. **Spaces in password**: Always use quotes:
   ```bash
   npm run hash-password-js "my password with spaces"
   ```

### Error Messages

- `Password must be at least 8 characters`: Your password is too short
- `Password must contain at least one uppercase letter`: Add A-Z characters
- `Password must contain at least one special character`: Add !@#$%^&*() etc.
- `Password is too common and easily guessable`: Use a more unique password

## Files

- `hash-password.js` - JavaScript version (recommended for simplicity)
- `hash-password.ts` - TypeScript version (uses existing project types)
- `tsconfig.scripts.json` - TypeScript configuration for scripts
- `README.md` - This documentation file

## Security Best Practices

1. **Never store plain text passwords** - Always use the hashed version
2. **Use strong passwords** - Follow the password policy requirements
3. **Different environments** - Use different passwords for development/production
4. **Regular updates** - Change passwords periodically
5. **Secure storage** - Ensure your database is properly secured
