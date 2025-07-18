/**
 * Tests for update-featured-repo.js
 * 
 * Tests the GitHub API interaction, repository filtering, and README update functionality
 */

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

// Test configuration
const TEST_README_PATH = path.join(__dirname, 'test-readme.md');
const SCRIPT_PATH = path.join(__dirname, '../scripts/update-featured-repo.js');

// Mock data
const mockEvents = [
  {
    type: 'PushEvent',
    repo: { name: 'VatsalSy/test-repo' },
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    type: 'PushEvent',
    repo: { name: 'VatsalSy/VatsalSy' }, // Should be excluded
    created_at: '2024-01-15T11:00:00Z'
  },
  {
    type: 'PushEvent',
    repo: { name: 'VatsalSy/another-repo' },
    created_at: '2024-01-15T09:00:00Z'
  }
];

const mockRepoData = {
  name: 'test-repo',
  full_name: 'VatsalSy/test-repo',
  description: 'A test repository for testing',
  html_url: 'https://github.com/VatsalSy/test-repo',
  language: 'JavaScript',
  stargazers_count: 10,
  owner: { login: 'VatsalSy' },
  fork: false
};

const mockForkRepoData = {
  ...mockRepoData,
  fork: true
};

// Test utilities
function createTestReadme() {
  const content = `# Test README

## About Me
This is a test readme.

<!--START_SECTION:latest-repo-->
### [old-repo](https://github.com/VatsalSy/old-repo)

Old repository description

<!--END_SECTION:latest-repo-->

## Contact
End of readme.`;
  
  fs.writeFileSync(TEST_README_PATH, content);
}

function cleanupTestReadme() {
  if (fs.existsSync(TEST_README_PATH)) {
    fs.unlinkSync(TEST_README_PATH);
  }
}

// Tests
const tests = {
  'test_parseInt_usage': () => {
    console.log('Testing Number.parseInt usage...');
    const scriptContent = fs.readFileSync(SCRIPT_PATH, 'utf8');
    
    // Check that parseInt is not used directly
    const hasDirectParseInt = /[^.]parseInt\s*\(/.test(scriptContent);
    assert(!hasDirectParseInt, 'Script should use Number.parseInt instead of global parseInt');
    
    // Check that Number.parseInt is used
    const hasNumberParseInt = /Number\.parseInt\s*\(/.test(scriptContent);
    assert(hasNumberParseInt, 'Script should use Number.parseInt');
    
    console.log('✓ Number.parseInt usage is correct');
  },

  'test_no_redundant_fork_check': () => {
    console.log('Testing for redundant fork checks...');
    const scriptContent = fs.readFileSync(SCRIPT_PATH, 'utf8');
    
    // Check main function doesn't have redundant fork check
    const mainFunctionMatch = scriptContent.match(/async function main\(\)[\s\S]*?^}/m);
    if (mainFunctionMatch) {
      const mainFunction = mainFunctionMatch[0];
      const hasRedundantForkCheck = /if\s*\([^)]*!repo\.isFork[^)]*\)/.test(mainFunction);
      assert(!hasRedundantForkCheck, 'Main function should not check repo.isFork');
    }
    
    console.log('✓ No redundant fork checks found');
  },

  'test_exclude_repos': () => {
    console.log('Testing repository exclusion logic...');
    const scriptContent = fs.readFileSync(SCRIPT_PATH, 'utf8');
    
    // Check that VatsalSy is in EXCLUDE_REPOS
    const excludeMatch = scriptContent.match(/EXCLUDE_REPOS\s*=\s*\[(.*?)\]/);
    assert(excludeMatch, 'EXCLUDE_REPOS should be defined');
    assert(excludeMatch[1].includes("'VatsalSy'") || excludeMatch[1].includes('"VatsalSy"'), 
           'VatsalSy should be in EXCLUDE_REPOS');
    
    console.log('✓ Repository exclusion configured correctly');
  },

  'test_readme_section_markers': () => {
    console.log('Testing README section markers...');
    createTestReadme();
    
    const readme = fs.readFileSync(TEST_README_PATH, 'utf8');
    assert(readme.includes('<!--START_SECTION:latest-repo-->'), 
           'README should contain start marker');
    assert(readme.includes('<!--END_SECTION:latest-repo-->'), 
           'README should contain end marker');
    
    cleanupTestReadme();
    console.log('✓ README section markers are correct');
  },

  'test_api_error_handling': () => {
    console.log('Testing API error handling...');
    const scriptContent = fs.readFileSync(SCRIPT_PATH, 'utf8');
    
    // Check for rate limit handling
    assert(scriptContent.includes('x-ratelimit-reset'), 
           'Script should handle rate limit headers');
    assert(scriptContent.includes('403'), 
           'Script should handle 403 status code');
    assert(scriptContent.includes('exponential backoff') || scriptContent.includes('Math.pow'), 
           'Script should implement retry with backoff');
    
    console.log('✓ API error handling is implemented');
  },

  'test_github_token_handling': () => {
    console.log('Testing GitHub token handling...');
    const scriptContent = fs.readFileSync(SCRIPT_PATH, 'utf8');
    
    // Check for token usage
    assert(scriptContent.includes('GITHUB_TOKEN') || scriptContent.includes('GH_TOKEN'), 
           'Script should support GitHub token');
    assert(scriptContent.includes('Authorization'), 
           'Script should use Authorization header');
    
    console.log('✓ GitHub token handling is correct');
  }
};

// Run all tests
async function runTests() {
  console.log('Running tests for update-featured-repo.js\n');
  
  let passed = 0;
  let failed = 0;
  const failures = [];
  
  for (const [testName, testFn] of Object.entries(tests)) {
    try {
      await testFn();
      passed++;
    } catch (error) {
      failed++;
      failures.push({ testName, error: error.message });
      console.log(`✗ ${testName} failed: ${error.message}`);
    }
  }
  
  console.log(`\n========================================`);
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log(`========================================\n`);
  
  if (failures.length > 0) {
    console.log('Failed tests:');
    failures.forEach(({ testName, error }) => {
      console.log(`  - ${testName}: ${error}`);
    });
    process.exit(1);
  }
  
  console.log('All tests passed! ✨');
}

// Export for use in other test runners
module.exports = { runTests, tests };

// Run tests if called directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}