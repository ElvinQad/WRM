#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Checking workspace consistency...\n');

// Check if all packages have consistent versions for shared dependencies
function checkDependencyConsistency() {
  console.log('📦 Checking dependency consistency...');
  
  const packages = [
    'packages/frontend/package.json',
    'packages/backend/package.json',
    'types/package.json'
  ];
  
  const dependencyMap = new Map();
  
  packages.forEach(packagePath => {
    if (fs.existsSync(packagePath)) {
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const allDeps = {
        ...pkg.dependencies,
        ...pkg.devDependencies
      };
      
      Object.entries(allDeps).forEach(([name, version]) => {
        if (!dependencyMap.has(name)) {
          dependencyMap.set(name, new Map());
        }
        dependencyMap.get(name).set(packagePath, version);
      });
    }
  });
  
  let hasInconsistencies = false;
  dependencyMap.forEach((versions, depName) => {
    if (versions.size > 1) {
      const versionArray = Array.from(versions.entries());
      const uniqueVersions = [...new Set(versionArray.map(([, version]) => version))];
      if (uniqueVersions.length > 1 && versionArray.some(([, version]) => !version.startsWith('workspace:'))) {
        hasInconsistencies = true;
        console.log(`⚠️  Inconsistent versions for ${depName}:`);
        versionArray.forEach(([pkg, version]) => {
          console.log(`   ${pkg}: ${version}`);
        });
      }
    }
  });
  
  if (!hasInconsistencies) {
    console.log('✅ All dependencies are consistent');
  }
  
  return !hasInconsistencies;
}

// Check TypeScript configuration consistency
function checkTypeScriptConfig() {
  console.log('\n📝 Checking TypeScript configuration...');
  
  const configs = [
    'tsconfig.json',
    'tsconfig.base.json',
    'packages/frontend/tsconfig.json',
    'packages/backend/tsconfig.json',
    'types/tsconfig.json'
  ];
  
  let allConfigsExist = true;
  configs.forEach(config => {
    if (!fs.existsSync(config)) {
      console.log(`❌ Missing TypeScript config: ${config}`);
      allConfigsExist = false;
    }
  });
  
  if (allConfigsExist) {
    console.log('✅ All TypeScript configs are present');
  }
  
  return allConfigsExist;
}

// Check workspace structure
function checkWorkspaceStructure() {
  console.log('\n🏗️  Checking workspace structure...');
  
  const requiredFiles = [
    'pnpm-workspace.yaml',
    'package.json',
    '.prettierrc',
    '.prettierignore'
  ];
  
  const requiredDirs = [
    'packages/frontend',
    'packages/backend',
    'types'
  ];
  
  let allPresent = true;
  
  requiredFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      console.log(`❌ Missing required file: ${file}`);
      allPresent = false;
    }
  });
  
  requiredDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      console.log(`❌ Missing required directory: ${dir}`);
      allPresent = false;
    }
  });
  
  if (allPresent) {
    console.log('✅ Workspace structure is correct');
  }
  
  return allPresent;
}

// Run checks
const results = [
  checkWorkspaceStructure(),
  checkTypeScriptConfig(),
  checkDependencyConsistency()
];

console.log('\n' + '='.repeat(50));
if (results.every(Boolean)) {
  console.log('✅ All workspace consistency checks passed!');
  process.exit(0);
} else {
  console.log('❌ Some workspace consistency checks failed');
  process.exit(1);
}
