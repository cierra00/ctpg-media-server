---
description: "Deploy the CTPG Design System to Cloudflare R2 and push to GitHub. Use when you want to publish changes live."
agent: "agent"
tools: [execute, read]
argument-hint: "Optional: commit message (e.g. 'Add hero section dark mode')"
---

# CTPG Deploy — R2 + GitHub

Deploy current changes to Cloudflare R2 and push to GitHub main.

## Pre-flight Check
1. Check git status to confirm what's changed: `git status`
2. Confirm with user if there are unexpected changes before proceeding.
3. Verify no inline `style=""` attributes were accidentally introduced.

## Step 1: Deploy to Cloudflare R2
```
npm run deploy:r2
```
Wait for confirmation that all files uploaded successfully.
The live URL is: `https://media.cruiseandthemeparkguide.com`

## Step 2: Git Commit and Push
```
git add .
git commit -m "{commit message}"
git push origin main
```
Use the user-provided commit message, or generate a concise one describing the change.

## Commit Message Format
- Keep under 72 characters
- Imperative mood: "Add", "Fix", "Update", "Remove"
- Examples:
  - `Fix horizontal scroll: overflow-x hidden on body`
  - `Add dark mode filter chip styles`
  - `Update stats section: equal-height cards, responsive grid`

## After Deploy
- Report the commit hash and GitHub URL
- Confirm R2 upload succeeded
- Optionally open the live URL to verify

## IMPORTANT
- Never force-push (`--force`) without explicit user approval
- Never amend published commits
- Always confirm before pushing
