/**
 * @file utils/register-aliases.ts
 * @description Registers module aliases for proper path resolution at runtime.
 * This should be imported at the application entry point (server.ts) before any other imports.
 */

import moduleAlias from 'module-alias';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory name using ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Calculate root directory paths
const srcDir = path.resolve(__dirname, '..');
const rootDir = path.resolve(srcDir, '..');
// Updated to point to sibling "shared" folder located under lms-admin-web-app
const sharedDir = path.resolve(rootDir, '../shared');

// Register path aliases
moduleAlias.addAliases({
  '@': srcDir,
  '@shared': sharedDir
});

/**
 * Initialize module aliases
 * This function should be called at the application entry point (server.ts)
 */
export const registerAliases = (): void => {
  // The registration happens when this module is imported
  console.log('Module aliases registered:');
  console.log(`- @/ -> ${srcDir}`);
  console.log(`- @shared/ -> ${sharedDir}`);
};

export default registerAliases;
