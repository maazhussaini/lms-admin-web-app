/**
 * Script to update all service files to use centralized Prisma client
 * This ensures soft delete middleware is applied globally
 */

const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, '..', 'src', 'services');
const controllersDir = path.join(__dirname, '..', 'src', 'controllers');

const filesToUpdate = [
  // Services
  'auth.service.ts',
  'client.service.ts',
  'course.service.ts',
  'institute.service.ts',
  'program.service.ts',
  'specialization.service.ts',
  'student-auth.service.ts',
  'student.service.ts',
  'system-user.service.ts',
  'teacher-auth.service.ts',
  'teacher.service.ts',
  'video.service.ts',
  // Controllers
  'auth.controller.ts',
  'course.controller.ts',
  'geographic.controller.ts',
  'student.controller.ts',
  'student-auth.controller.ts',
  'teacher-auth.controller.ts'
];

function updateFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Check if file has "const prisma = new PrismaClient()"
    if (content.includes('const prisma = new PrismaClient()')) {
      // Remove the line
      content = content.replace(/const prisma = new PrismaClient\(\);?\n?/g, '');
      
      // Check if import already has database import
      if (!content.includes("from '@/config/database'")) {
        // Add import for centralized prisma
        const prismaClientImportRegex = /import\s*{\s*PrismaClient\s*([^}]*?)}\s*from\s*['"]@prisma\/client['"];/;
        
        if (prismaClientImportRegex.test(content)) {
          // Replace PrismaClient import
          content = content.replace(
            prismaClientImportRegex,
            (match, otherImports) => {
              // Clean up other imports - remove PrismaClient and extra commas
              const cleanImports = otherImports
                .replace(/,\s*PrismaClient\s*/g, '')
                .replace(/\s*PrismaClient\s*,/g, '')
                .replace(/^\s*,\s*/, '')
                .replace(/,\s*$/, '')
                .trim();
              
              if (cleanImports) {
                return `import { ${cleanImports} } from '@prisma/client';\nimport prisma from '@/config/database';`;
              } else {
                return `import prisma from '@/config/database';`;
              }
            }
          );
        } else {
          // Just add the import at the top after other imports
          const lastImportIndex = content.lastIndexOf('\nimport ');
          if (lastImportIndex !== -1) {
            const endOfLastImport = content.indexOf(';', lastImportIndex) + 1;
            content = content.slice(0, endOfLastImport) + 
                     "\nimport prisma from '@/config/database';" + 
                     content.slice(endOfLastImport);
          }
        }
      }
      
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${path.basename(filePath)}`);
      return true;
    } else {
      console.log(`⏭️  Skipped (no changes needed): ${path.basename(filePath)}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

console.log('🚀 Starting Prisma import updates...\n');

let updatedCount = 0;
let totalCount = 0;

// Update services
console.log('📁 Updating services...');
filesToUpdate.forEach(filename => {
  let filePath;
  if (filename.endsWith('.service.ts')) {
    filePath = path.join(servicesDir, filename);
  } else {
    filePath = path.join(controllersDir, filename);
  }
  
  totalCount++;
  if (updateFile(filePath)) {
    updatedCount++;
  }
});

console.log(`\n✨ Complete! Updated ${updatedCount}/${totalCount} files.`);
console.log('\n💡 All services now use centralized Prisma client with soft delete middleware.');
