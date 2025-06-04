// This registers the TypeScript path aliases with Node.js
import { resolve as resolveTs } from 'ts-node/esm';
import * as tsConfigPaths from 'tsconfig-paths';
import { pathToFileURL } from 'url';
import { readFileSync } from 'fs';
import { resolve as pathResolve } from 'path';

// Load tsconfig.json manually
const tsconfigPath = pathResolve('./tsconfig.json');
const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf8'));
const { baseUrl = './', paths = {} } = tsconfig.compilerOptions || {};

const matchPath = tsConfigPaths.createMatchPath(pathResolve(baseUrl), paths);

export function resolve(specifier, context, nextResolve) {
  // Handle path aliases
  if (specifier.startsWith('@/') || specifier.startsWith('@shared/')) {
    const matched = matchPath(specifier);
    if (matched) {
      // Convert .js extensions to .ts for development
      const tsFile = matched.replace(/\.js$/, '.ts');
      return resolveTs(
        pathToFileURL(tsFile).href,
        context,
        nextResolve
      );
    }
  }
  
  return nextResolve(specifier);
}

// Re-export the TypeScript loaders
export { load, transformSource } from 'ts-node/esm';
