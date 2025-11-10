import { cpSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

// Create Vercel Build Output API structure
const outputDir = '.vercel/output';
const staticDir = join(outputDir, 'static');
const configPath = join(outputDir, 'config.json');

// Clean and create output directories
mkdirSync(staticDir, { recursive: true });

// Copy all static files
console.log('Copying web directory...');
cpSync('web', join(staticDir, 'web'), { recursive: true });

console.log('Copying data directory...');
cpSync('data', join(staticDir, 'data'), { recursive: true });

console.log('Copying public directory...');
cpSync('public', join(staticDir, 'public'), { recursive: true });

console.log('Copying API functions...');
cpSync('api', join(outputDir, 'functions', 'api'), { recursive: true });

// Write config.json with version
const config = {
  version: 3
};

writeFileSync(configPath, JSON.stringify(config, null, 2));

console.log('Build complete! Output ready in .vercel/output');
