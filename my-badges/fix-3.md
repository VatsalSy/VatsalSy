<img src="https://my-badges.github.io/my-badges/fix-3.png" alt="I did 3 sequential fixes." title="I did 3 sequential fixes." width="128">
<strong>I did 3 sequential fixes.</strong>
<br><br>

Commits:

- <a href="https://github.com/VatsalSy/CloudPull/commit/ed73d7218953531b5698ccb5fcaed1503fbc4af8">ed73d72</a>: fix: resolve lint errors in error handler

- Add ErrorTypeContext to exhaustive switch statement
- Check return value of WithContext method call
- <a href="https://github.com/VatsalSy/CloudPull/commit/5dba6188812349e57f40fba162bf3a35a6aabf67">5dba618</a>: fix: handle viper config errors and validate chunk size input

- Return error from initViper instead of ignoring config read failures
- Add proper validation for chunk size format in GetChunkSizeBytes
- Normalize and validate numeric input to prevent parsing issues
- <a href="https://github.com/VatsalSy/CloudPull/commit/21d9645e7c367ac1185956f06aef348899f824d3">21d9645</a>: fix: address gosec security findings G302 and G304

- Change log file permissions from 0666 to 0600 (G302)
- Sanitize log output path with filepath.Clean (G304)
- Add defer app.Stop() in example_usage.go to fix G104
- Use consistent error wrapping in API client and progress tracker
- Remove redundant error type handling in error handler


Created by <a href="https://github.com/my-badges/my-badges">My Badges</a>