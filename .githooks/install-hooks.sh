#!/bin/bash
#
# Install git hooks for this repository
#

echo "🔧 Installing git hooks..."

# Get the repository root
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)

if [ -z "$REPO_ROOT" ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

cd "$REPO_ROOT" || exit 1

# Set the hooks path
git config core.hooksPath .githooks

if [ $? -eq 0 ]; then
    echo "✅ Git hooks installed successfully!"
    echo ""
    echo "The following hooks are now active:"
    echo "  • pre-commit: Runs tests before each commit"
    echo ""
    echo "To disable hooks temporarily, use:"
    echo "  git commit --no-verify"
    echo ""
    echo "To uninstall hooks, run:"
    echo "  git config --unset core.hooksPath"
else
    echo "❌ Failed to install git hooks"
    exit 1
fi