<img src="https://my-badges.github.io/my-badges/fix-6.png" alt="I did 6 sequential fixes." title="I did 6 sequential fixes." width="128">
<strong>I did 6 sequential fixes.</strong>
<br><br>

Commits:

- <a href="https://github.com/VatsalSy/CloudPull/commit/795a64fff76f0ecbad3fafa2794de36323600b6e">795a64f</a>: Fix goroutine shutdown, config issues, and improve error handling

- Add cancellable context to monitorResumeProgress to prevent goroutine leaks
- Fix .golangci.yml 'excludes' key to 'exclude' for proper rule exclusion
- Add tilde expansion for credentials file paths in init command
- Update parseChunkSize to return errors instead of silently failing
- Add InitializeForAuth() helper method to simplify initialization
- <a href="https://github.com/VatsalSy/CloudPull/commit/16c428a6e817adbceb363a456ae143ebe657577e">16c428a</a>: Fix hard-coded redirect URL configuration

- Extract redirect URL from Google credentials JSON file
- Support both 'installed' and 'web' application credentials
- Fall back to localhost if extraction fails
- Update CLI to display correct redirect URL
- Add comprehensive test coverage for redirect URL extraction
- <a href="https://github.com/VatsalSy/CloudPull/commit/b8048b151b0806d167e5be012a6f56ea9eee0684">b8048b1</a>: Fix token revocation to revoke both access and refresh tokens

- Revoke both access and refresh tokens with separate API calls
- Replace file deletion with overwriting empty token to prevent race conditions
- Continue revocation attempts even if one token fails
- <a href="https://github.com/VatsalSy/CloudPull/commit/bf6e9d1fc884e5ac50ef91637bab273619bea4de">bf6e9d1</a>: Fix test race conditions and improve signal handling tests

- Fix viper configuration race condition in tests:
  - Add LoadFromViper() function to load config from specific viper instance
  - Update setupTestConfig() to return local viper instance instead of using global
  - Add WithConfigLoader option to App for dependency injection
  - Update Config struct methods to use instance viper when available

- Fix signal handling test to use real OS signals:
  - Send actual SIGINT signal using syscall.Kill() instead of canceling context
  - Test now properly verifies the app's signal handler behavior
  - Added syscall import for signal testing

- Added new authentication methods to support OAuth2 flow:
  - InitializeForAuth() combines initialization steps
  - GetAuthURL() and GetRedirectURL() for OAuth2 flow
  - ExchangeAuthCode() to complete authentication
- <a href="https://github.com/VatsalSy/CloudPull/commit/8dc908afe38b6626cac21b34b670b4eb836e4808">8dc908a</a>: Fix division by zero in progress calculation and update dependencies

- Add guard condition in resume.go to prevent panic when TotalFiles is 0
- Update Go version from 1.21 to 1.24 for compatibility and security
- Fix redundant "CLI Interface" terminology in technical design docs
- <a href="https://github.com/VatsalSy/CloudPull/commit/e1f7a503dbe163a3ed84fbc7b02f047b77630da6">e1f7a50</a>: Fix tilde expansion and progress monitor bugs in full_sync_example

- Remove tilde from default outputDir flag and add proper home directory expansion
- Fix progress monitor comparison by creating struct copy instead of pointer assignment
- Add missing article 'the' in README FAQ section


Created by <a href="https://github.com/my-badges/my-badges">My Badges</a>