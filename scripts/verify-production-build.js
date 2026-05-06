/**
 * Production Build Verification Script
 * 
 * This script verifies that simulation code has been removed from production builds.
 * Run after: npm run build
 * 
 * Usage: node scripts/verify-production-build.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, '..', 'dist');

// Check if dist folder exists
if (!fs.existsSync(distPath)) {
    console.error('ERROR: dist folder not found. Run "npm run build" first.');
    process.exit(1);
}

// Patterns that should NOT exist in production builds
const forbiddenPatterns = [
    {
        pattern: '4CORE_simulated_user',
        description: 'Simulation localStorage key'
    },
    {
        pattern: 'setSimulatedUser',
        description: 'Simulation setter function'
    },
    {
        pattern: 'getSimulatedUser',
        description: 'Simulation getter function'
    }
];

// Files to check
const htmlFiles = fs.readdirSync(distPath).filter(f => f.endsWith('.html'));
const jsFiles = fs.readdirSync(distPath).filter(f => f.endsWith('.js'));

let hasViolations = false;

console.log('🔍 Verifying production build for simulation code...\n');

// Check HTML files
for (const htmlFile of htmlFiles) {
    const content = fs.readFileSync(path.join(distPath, htmlFile), 'utf8');

    for (const { pattern, description } of forbiddenPatterns) {
        if (content.includes(pattern)) {
            console.error(`❌ VIOLATION: Found "${description}" in ${htmlFile}`);
            hasViolations = true;
        }
    }
}

// Check JS files
for (const jsFile of jsFiles) {
    const content = fs.readFileSync(path.join(distPath, jsFile), 'utf8');

    for (const { pattern, description } of forbiddenPatterns) {
        if (content.includes(pattern)) {
            console.error(`❌ VIOLATION: Found "${description}" in ${jsFile}`);
            hasViolations = true;
        }
    }
}

// Check assets folder if it exists
const assetsPath = path.join(distPath, 'assets');
if (fs.existsSync(assetsPath)) {
    const assetFiles = fs.readdirSync(assetsPath).filter(f => f.endsWith('.js'));

    for (const jsFile of assetFiles) {
        const content = fs.readFileSync(path.join(assetsPath, jsFile), 'utf8');

        for (const { pattern, description } of forbiddenPatterns) {
            if (content.includes(pattern)) {
                console.error(`❌ VIOLATION: Found "${description}" in assets/${jsFile}`);
                hasViolations = true;
            }
        }
    }
}

if (hasViolations) {
    console.error('\n❌ Build verification FAILED!');
    console.error('   Simulation code found in production build.');
    console.error('   Ensure __SIMULATION_ENABLED__ is set to false in production mode.');
    process.exit(1);
} else {
    console.log('✅ Build verification PASSED!');
    console.log('   No simulation code found in production build.');
    process.exit(0);
}
