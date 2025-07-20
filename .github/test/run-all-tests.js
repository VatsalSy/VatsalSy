#!/usr/bin/env node

/**
 * Main test runner for all GitHub profile tests
 * 
 * Runs all test suites and provides comprehensive reporting
 */

const path = require('node:path');

// Test suites
const testSuites = [
  {
    name: 'Featured Repository Script Tests',
    file: './test-update-featured-repo.js'
  },
  {
    name: 'Workflow and README Tests',
    file: './test-workflows.js'
  }
];

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
};

async function runTestSuite(suite) {
  console.log(`\n${colors.blue}${colors.bold}Running ${suite.name}...${colors.reset}`);
  console.log('─'.repeat(50));
  
  try {
    const testModule = require(suite.file);
    if (testModule.runTests) {
      await testModule.runTests();
      return { suite: suite.name, status: 'passed' };
    } else {
      throw new Error('Test module does not export runTests function');
    }
  } catch (error) {
    console.error(`${colors.red}Error in ${suite.name}:${colors.reset}`, error.message);
    return { suite: suite.name, status: 'failed', error: error.message };
  }
}

async function main() {
  console.log(`${colors.bold}GitHub Profile Test Suite${colors.reset}`);
  console.log('═'.repeat(50));
  console.log(`Running tests at: ${new Date().toISOString()}`);
  
  // Ensure we're in the test directory
  const currentDir = path.basename(__dirname);
  if (currentDir !== 'test') {
    // If not in test directory, try to change to it
    const testDir = path.join(__dirname, __dirname.endsWith('test') ? '' : 'test');
    if (require('node:fs').existsSync(testDir)) {
      process.chdir(testDir);
    }
  }
  
  // Run all test suites
  const results = [];
  for (const suite of testSuites) {
    const result = await runTestSuite(suite);
    results.push(result);
  }
  
  // Summary
  console.log(`\n${colors.bold}Test Summary${colors.reset}`);
  console.log('═'.repeat(50));
  
  const passed = results.filter(r => r.status === 'passed').length;
  const failed = results.filter(r => r.status === 'failed').length;
  
  results.forEach(result => {
    const statusColor = result.status === 'passed' ? colors.green : colors.red;
    const statusSymbol = result.status === 'passed' ? '✓' : '✗';
    console.log(`${statusColor}${statusSymbol} ${result.suite}${colors.reset}`);
    if (result.error) {
      console.log(`  └─ ${result.error}`);
    }
  });
  
  console.log(`\n${colors.bold}Total: ${passed} passed, ${failed} failed${colors.reset}`);
  
  // Exit with appropriate code
  if (failed > 0) {
    console.log(`\n${colors.red}${colors.bold}Tests failed!${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`\n${colors.green}${colors.bold}All tests passed! 🎉${colors.reset}`);
    process.exit(0);
  }
}

// Make file executable
if (require.main === module) {
  main().catch(error => {
    console.error(`${colors.red}Fatal error:${colors.reset}`, error);
    process.exit(1);
  });
}

module.exports = { main };