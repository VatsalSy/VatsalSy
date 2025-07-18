# Git Hooks for VatsalSy GitHub Profile

This directory contains git hooks for local development quality assurance.

## 🔒 Important: Local Development Only

**These hooks DO NOT affect GitHub Actions or any automated workflows.**

- Git hooks are configured via `git config core.hooksPath`, which is a local-only setting
- GitHub Actions create fresh clones without any local git configurations
- The hooks explicitly check for CI environments and skip execution
- Your automated workflows will continue to work exactly as before

## 📋 Available Hooks

### pre-commit
Runs automated tests before allowing commits when you modify:
- JavaScript files in `.github/scripts/`
- Workflow files in `.github/workflows/`
- The main `README.md` file

## 🛡️ Safety Features

The pre-commit hook includes multiple safety checks:

1. **CI Detection**: Automatically skips in GitHub Actions (`GITHUB_ACTIONS` env var)
2. **Node.js Check**: Gracefully skips if Node.js is not installed
3. **Dependency Handling**: Skips tests if dependencies can't be installed
4. **Selective Testing**: Only runs tests for files that changed

## 💻 Installation

```bash
# Install hooks for this repository
./.githooks/install-hooks.sh

# Verify installation
git config --get core.hooksPath
# Should output: .githooks
```

## 🚫 Uninstallation

```bash
# Remove hooks configuration
git config --unset core.hooksPath
```

## 🔧 Troubleshooting

### Bypassing hooks temporarily:
```bash
git commit --no-verify -m "your message"
```

### If automated commits fail:
They won't! GitHub Actions don't use local git configs. But if you're testing locally:
```bash
# Temporarily disable for automation testing
CI=1 git commit -m "automated commit"
```

## 📝 For GitHub Actions

No action required! Your workflows will continue to work normally because:
- Each workflow runs in a fresh Ubuntu/Windows/macOS runner
- No local git configurations are present
- The repository is cloned fresh each time
- Git hooks path is not configured in the runners

Your automated commits from actions like:
- `anmol098/waka-readme-stats`
- `VatsalSy/commits-readme-stats`
- `jamesgeorge007/github-activity-readme`
- Custom scripts in workflows

...will all continue to work without any modifications needed.