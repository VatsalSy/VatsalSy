# GitHub Profile Tests

This directory contains automated tests for the VatsalSy GitHub profile repository.

> **Note**: These tests and git hooks are for local development only. They do not affect GitHub Actions or automated workflows, which run in isolated environments without local git configurations.

## 🧪 Test Suites

### 1. Featured Repository Script Tests (`test-update-featured-repo.js`)
- Validates ES2015 compliance (Number.parseInt usage)
- Checks for redundant code removal
- Tests repository exclusion logic
- Validates README section markers
- Tests API error handling and rate limiting
- Validates GitHub token handling

### 2. Workflow and README Tests (`test-workflows.js`)
- Validates YAML syntax for all workflows
- Checks workflow schedules are correct
- Validates permissions configuration
- Tests secret usage in workflows
- Validates README structure and section markers

## 🚀 Running Tests

### Run all tests:
```bash
cd .github/test
npm test
```

### Run specific test suite:
```bash
# Test featured repo script
npm run test:featured-repo

# Test workflows
npm run test:workflows
```

### Direct execution:
```bash
node .github/test/run-all-tests.js
```

## 🪝 Git Hooks

This repository includes a pre-commit hook that automatically runs tests when you commit changes to:
- `.github/scripts/*.js` files
- `.github/workflows/*.yml` files  
- `README.md`

### Important Notes:
- **Local only**: Git hooks are configured locally and do not affect GitHub Actions
- **CI safe**: The hooks automatically skip execution in CI environments
- **Graceful fallback**: If Node.js is not available, tests are skipped
- **No interference**: Automated workflows in GitHub Actions run in clean environments

### Installing hooks:
```bash
./.githooks/install-hooks.sh
```

### Bypassing hooks (use sparingly):
```bash
git commit --no-verify
```

### Uninstalling hooks:
```bash
git config --unset core.hooksPath
```

## 📦 Dependencies

The test suite requires:
- Node.js >= 16.0.0
- js-yaml (for parsing workflow files)

Install dependencies:
```bash
cd .github/test
npm install
```

## 🔍 What Gets Tested

### On Every Commit:
1. **Code Quality**
   - ES2015 compliance
   - No redundant code
   - Proper error handling

2. **Workflow Integrity**
   - Valid YAML syntax
   - Correct cron schedules
   - Proper permissions

3. **README Structure**
   - All required sections present
   - Correct marker format
   - Section boundaries intact

## 🐛 Troubleshooting

If tests fail:
1. Run tests manually to see detailed output
2. Check the specific test that failed
3. Ensure all dependencies are installed
4. Verify file paths are correct

## 📝 Adding New Tests

To add new tests:
1. Create a new test file or add to existing ones
2. Follow the existing test structure
3. Add the test suite to `run-all-tests.js`
4. Update this README with test descriptions