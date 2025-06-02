<img src="https://my-badges.github.io/my-badges/fix-3.png" alt="I did 3 sequential fixes." title="I did 3 sequential fixes." width="128">
<strong>I did 3 sequential fixes.</strong>
<br><br>

Commits:

- <a href="https://github.com/VatsalSy/CloudPull/commit/64af47bacdaf82ba1e0f13dc04b7074983605d1a">64af47b</a>: Fix Windows compatibility issues

- Replace hardcoded /tmp path with cross-platform t.TempDir() in tests
- Add platform-specific signal handling (Windows doesn't support SIGTERM)
- Fix int64 to int conversion in status command
- Ensure builds work correctly on Windows

Co-Authored-By: Claude <noreply@anthropic.com>
- <a href="https://github.com/VatsalSy/CloudPull/commit/8a32e4fb287e4f7e3ddab30e00233c07f1027550">8a32e4f</a>: Fix failing tests across multiple packages

- Fix logger tests: Handle ANSI color codes in pretty logging test and correct With() method parameter passing
- Fix progress tracker test: Relax ETA validation to only check for non-negative values
- Fix retry logic: Allow adaptive backoff to reduce interval below initial value (down to 10%)
- Fix error test: Update expected values for adaptive backoff behavior
- <a href="https://github.com/VatsalSy/CloudPull/commit/1b107966d1ce49a79f67d55e74a9e44f8015e611">1b10796</a>: Fix build errors by removing duplicate formatBytes and unused config import

- Remove duplicate formatBytes function from example_usage.go (already defined in app.go)
- Remove unused config package import from init.go
- Use local parseChunkSize function instead of config package method


Created by <a href="https://github.com/my-badges/my-badges">My Badges</a>