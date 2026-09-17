# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a GitHub profile README repository for Vatsal Sanjay, a fluid dynamicist and researcher. The repository contains:
- A dense academic profile `README.md` (identity, research, featured work, metrics)
- GitHub Actions workflows for automated profile updates
- Historical badge artifacts under `my-badges/` (no longer rendered in the README)

## GitHub Actions Workflows

### 1. GitHub Stats Update (`.github/workflows/github-stats.yml`)
- **Schedule**: Daily at 03:17 UTC
- **Purpose**: Updates bounded default-branch commit statistics in README
- **Manual trigger**: Available via workflow_dispatch

### 2. My Badges (`.github/workflows/my-badges.yml`)
- **Status**: Retired (manual stub only; no schedule)
- **Note**: Do not re-enable scheduled badge injection without restoring the README section

### 3. Recent Activity (`.github/workflows/update-readme.yml`)
- **Schedule**: Every 4 hours (10 minutes offset)
- **Purpose**: Updates the "Recent activity" section with latest GitHub actions

### 4. Featured Repository (`.github/workflows/update-featured-repo.yml`)
- **Schedule**: Every 6 hours
- **Purpose**: Updates the featured repository section and pushes README changes

## Architecture

- **README.md**: Main profile page with dynamic sections updated by GitHub Actions
- **my-badges/**: Historical badge files (not shown on the profile)
- **assets/**: Image and resource storage
- **.github/workflows/**: Automated update workflows

Dynamic sections in README.md are marked with special comment tags:
- `<!--START_SECTION:activity-->` / `<!--END_SECTION:activity-->`
- `<!--START_SECTION:github-stats-->` / `<!--END_SECTION:github-stats-->`
- `<!--START_SECTION:latest-repo-->` / `<!--END_SECTION:latest-repo-->`

## Development Notes

- All workflows require appropriate GitHub tokens/secrets configured
- Profile updates are automated - manual edits to dynamic sections will be overwritten
- WakaTime and my-badges UI surfaces are intentionally gone; do not revive them without an explicit request
