/**
 * Tests for GitHub Actions workflows
 * 
 * Validates workflow syntax, schedules, and configuration
 */

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');

// Install js-yaml if not present
try {
  require.resolve('js-yaml');
} catch (e) {
  console.log('Installing js-yaml for workflow parsing...');
  require('child_process').execSync('npm install js-yaml', { stdio: 'inherit' });
}

const WORKFLOWS_DIR = path.join(__dirname, '../workflows');

// Workflow validation tests
const workflowTests = {
  'test_workflow_syntax': () => {
    console.log('Testing workflow YAML syntax...');
    const workflowFiles = fs.readdirSync(WORKFLOWS_DIR)
      .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'));
    
    workflowFiles.forEach(file => {
      const filePath = path.join(WORKFLOWS_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      try {
        const workflow = yaml.load(content);
        assert(workflow.name, `${file} should have a name`);
        assert(workflow.on, `${file} should have triggers defined`);
        console.log(`  ✓ ${file} has valid syntax`);
      } catch (error) {
        throw new Error(`${file} has invalid YAML: ${error.message}`);
      }
    });
  },

  'test_workflow_schedules': () => {
    console.log('Testing workflow schedules...');
    const expectedSchedules = {
      'update-featured-repo.yml': '30 */6 * * *',
      'ReadmeWaka.yml': '0 */4 * * *',
      'github-stats.yml': '0 */4 * * *',
      'my-badges.yml': '0 0 * * *',
      'update-readme.yml': '10 */4 * * *'
    };
    
    Object.entries(expectedSchedules).forEach(([file, expectedCron]) => {
      const filePath = path.join(WORKFLOWS_DIR, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const workflow = yaml.load(content);
        
        if (workflow.on && workflow.on.schedule) {
          const cron = workflow.on.schedule[0].cron;
          assert(cron === expectedCron, 
                 `${file} should have cron "${expectedCron}" but has "${cron}"`);
          console.log(`  ✓ ${file} schedule is correct`);
        }
      }
    });
  },

  'test_workflow_permissions': () => {
    console.log('Testing workflow permissions...');
    const workflowFiles = fs.readdirSync(WORKFLOWS_DIR)
      .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'));
    
    workflowFiles.forEach(file => {
      const filePath = path.join(WORKFLOWS_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const workflow = yaml.load(content);
      
      // Check if workflows that modify files have write permissions
      if (file.includes('update') || file.includes('stats') || file.includes('badges')) {
        const jobs = Object.values(workflow.jobs || {});
        jobs.forEach(job => {
          if (job.steps && job.steps.some(step => 
            step.run && (step.run.includes('git commit') || step.run.includes('git push')))) {
            // Should have contents: write permission
            assert(workflow.permissions?.contents === 'write' || 
                   job.permissions?.contents === 'write',
                   `${file} should have contents: write permission`);
            console.log(`  ✓ ${file} has correct permissions`);
          }
        });
      }
    });
  },

  'test_workflow_secrets': () => {
    console.log('Testing workflow secrets usage...');
    const secretsRequired = {
      'ReadmeWaka.yml': ['WAKATIME_API_KEY'],
      'github-stats.yml': ['GH_COMMIT_TOKEN'] // Custom token for commits
    };
    
    Object.entries(secretsRequired).forEach(([file, requiredSecrets]) => {
      const filePath = path.join(WORKFLOWS_DIR, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        requiredSecrets.forEach(secret => {
          assert(content.includes(secret) || content.includes(`secrets.${secret}`),
                 `${file} should reference ${secret}`);
          console.log(`  ✓ ${file} references ${secret}`);
        });
      }
    });
  }
};

// Test README structure
const readmeTests = {
  'test_readme_sections': () => {
    console.log('Testing README.md structure...');
    const readmePath = path.join(__dirname, '../../README.md');
    const readme = fs.readFileSync(readmePath, 'utf8');
    
    // Check for required sections
    const requiredSections = [
      '<!--START_SECTION:activity-->',
      '<!--END_SECTION:activity-->',
      '<!--START_SECTION:github-stats-->',
      '<!--END_SECTION:github-stats-->',
      '<!--START_SECTION:waka-->',
      '<!--END_SECTION:waka-->',
      '<!--START_SECTION:latest-repo-->',
      '<!--END_SECTION:latest-repo-->',
      '<!-- my-badges start -->',
      '<!-- my-badges end -->'
    ];
    
    requiredSections.forEach(section => {
      assert(readme.includes(section), `README should contain ${section}`);
    });
    
    console.log('✓ README has all required sections');
  }
};

// Run all tests
async function runTests() {
  console.log('Running workflow and README tests\n');
  
  let passed = 0;
  let failed = 0;
  const failures = [];
  
  const allTests = { ...workflowTests, ...readmeTests };
  
  for (const [testName, testFn] of Object.entries(allTests)) {
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
module.exports = { runTests, workflowTests, readmeTests };

// Run tests if called directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}