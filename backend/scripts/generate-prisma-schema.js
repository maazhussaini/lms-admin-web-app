/**
 * @file scripts/generate-prisma-schema.js
 * @description Script to generate a combined Prisma schema from modular schema files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name using ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const schemaDir = path.join(__dirname, '../prisma/schemas');
const outputFile = path.join(__dirname, '../prisma/schema.prisma');

// Base schema content
const baseSchema = `// This is your Prisma schema file
// learn more about it in the docs: https://pris.ly/d/prisma-schema
// Auto-generated file - DO NOT EDIT DIRECTLY

// Database connection configuration
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Prisma Client generator
generator client {
  provider = "prisma-client-js"
}

// ============================================================================
// COMBINED SCHEMA CONTENT BELOW
// ============================================================================

`;

// Order of schema files to process
const schemaFileOrder = [
  '_database.prisma', // Skip this as it's already in base schema
  '_enums.prisma',
  'tenant-models.prisma',
  'system-user-models.prisma',
  'geographic-models.prisma',
  'academic-institution-models.prisma',
  'teacher-models.prisma',
  'student-models.prisma',
  'course-models.prisma',
  'enrollment-session-models.prisma',
  'quiz-models.prisma',
  'assignment-models.prisma',
  'notification-models.prisma',
];

async function generateCombinedSchema() {
  try {
    let combinedSchema = baseSchema;
    
    // Process schema files in order
    for (const fileName of schemaFileOrder) {
      // Skip _database.prisma as it's already in base schema
      if (fileName === '_database.prisma') continue;
      
      const filePath = path.join(schemaDir, fileName);
      
      if (fs.existsSync(filePath)) {
        console.log(`Processing schema file: ${fileName}`);
        
        // Read file content
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Add file header
        combinedSchema += `\n// ============================================================================\n`;
        combinedSchema += `// ${fileName}\n`;
        combinedSchema += `// ============================================================================\n\n`;
        
        // Add file content (excluding any datasource or generator blocks)
        const lines = content.split('\n');
        let skipLines = false;
        
        for (const line of lines) {
          // Skip datasource and generator blocks as they're already in base schema
          if (line.trim().startsWith('datasource') || line.trim().startsWith('generator')) {
            skipLines = true;
            continue;
          }
          
          if (skipLines && line.trim() === '}') {
            skipLines = false;
            continue;
          }
          
          if (!skipLines && !line.trim().startsWith('import')) {
            combinedSchema += line + '\n';
          }
        }
      } else {
        console.warn(`Warning: Schema file not found: ${fileName}`);
      }
    }
    
    // Write combined schema to output file
    fs.writeFileSync(outputFile, combinedSchema);
    console.log(`Combined schema written to: ${outputFile}`);
  } catch (error) {
    console.error('Error generating combined schema:', error);
    process.exit(1);
  }
}

// Run the function
generateCombinedSchema();
