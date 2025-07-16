# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a GitHub profile README repository for Vatsal Sanjay, a fluid dynamicist and researcher. The repository contains:
- A comprehensive README.md showcasing research interests, statistics, and activity
- GitHub Actions workflows for automated profile updates
- Badge generation and tracking

## GitHub Actions Workflows

The repository uses several automated workflows that run on schedule:

### 1. GitHub Stats Update (`.github/workflows/github-stats.yml`)
- **Schedule**: Every 4 hours
- **Purpose**: Updates commit statistics and activity metrics in README
- **Manual trigger**: Available via workflow_dispatch

### 2. My Badges (`.github/workflows/my-badges.yml`)
- **Schedule**: Daily at midnight
- **Purpose**: Updates achievement badges displayed in the profile
- **Command**: `npx update-my-badges`

### 3. Waka Readme Stats (`.github/workflows/ReadmeWaka.yml`)
- **Schedule**: Every 4 hours
- **Purpose**: Updates WakaTime coding statistics including time spent, languages used, and project activity
- **Dependencies**: Requires WAKATIME_API_KEY secret

### 4. Recent Activity (`.github/workflows/update-readme.yml`)
- **Schedule**: Every 4 hours (10 minutes offset)
- **Purpose**: Updates the "Recent Activity" section with latest GitHub actions

## Architecture

The repository follows a simple structure:
- **README.md**: Main profile page with dynamic sections updated by GitHub Actions
- **my-badges/**: Directory containing badge achievement tracking
- **assets/**: Image and resource storage
- **.github/workflows/**: Automated update workflows

Dynamic sections in README.md are marked with special comment tags:
- `<!--START_SECTION:activity-->` / `<!--END_SECTION:activity-->`
- `<!--START_SECTION:github-stats-->` / `<!--END_SECTION:github-stats-->`
- `<!--START_SECTION:waka-->` / `<!--END_SECTION:waka-->`
- `<!-- my-badges start -->` / `<!-- my-badges end -->`

## Development Notes

- All workflows require appropriate GitHub tokens/secrets configured
- Profile updates are automated - manual edits to dynamic sections will be overwritten
- The repository serves as a living profile that updates with real-time activity data