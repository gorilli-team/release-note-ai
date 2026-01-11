# Setup Guide for gorilli-team/release-note-ai

This guide will help you set up and publish the Release Note Generator Action.

## Current Status

✅ Code is complete and built
✅ Dependencies are installed
✅ Repository references updated to `gorilli-team/release-note-ai`
✅ dist/index.js is compiled and ready

## Next Steps

### 1. Create a Release Tag

Create a version tag to allow users to reference your action:

```bash
git tag -a v1 -m "Release v1.0.0"
git push origin v1
```

You can also create a specific version tag:

```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

### 2. Create a GitHub Release

1. Go to https://github.com/gorilli-team/release-note-ai/releases/new
2. Select the tag you just created (v1 or v1.0.0)
3. Set the release title: "v1.0.0 - Initial Release"
4. Add release notes:

```markdown
## Release Note Generator Action v1.0.0

A generic, reusable GitHub Action that extracts structured release notes from merged pull requests.

### Features

- ✅ Extracts structured data from merged PRs
- ✅ Parses PR body sections (What/Why/Impact)
- ✅ Normalizes labels into high-level tags
- ✅ Optional AI-powered summaries via Anthropic
- ✅ Outputs machine-readable JSON
- ✅ Defensive parsing for edge cases
- ✅ Company-agnostic and open source

### Usage

```yaml
- uses: gorilli-team/release-note-ai@v1
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    generate_summary: false
```

See the [README](https://github.com/gorilli-team/release-note-ai#readme) for complete documentation.
```

5. Click "Publish release"

### 3. Test the Action

Create a test workflow in your repository:

```bash
mkdir -p .github/workflows
```

Create `.github/workflows/test-release-notes.yml`:

```yaml
name: Test Release Notes
on:
  pull_request:
    types: [closed]

jobs:
  test-release-notes:
    if: github.event.pull_request.merged == true && github.event.pull_request.base.ref == 'main'
    runs-on: ubuntu-latest
    steps:
      - name: Generate Release Note
        id: release-note
        uses: gorilli-team/release-note-ai@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          generate_summary: false

      - name: Display Output
        run: |
          echo "Release Note Generated:"
          echo '${{ steps.release-note.outputs.release_note }}' | jq .
```

### 4. Update Repository Settings

1. Go to repository settings: https://github.com/gorilli-team/release-note-ai/settings
2. Add a description: "Generic GitHub Action for extracting structured release notes from merged pull requests"
3. Add topics: `github-actions`, `release-notes`, `changelog`, `automation`, `pull-requests`
4. Update the website URL if you have one

### 5. Enable GitHub Actions (if needed)

Ensure GitHub Actions are enabled:
1. Go to Settings → Actions → General
2. Enable "Allow all actions and reusable workflows"

## Using the Action in Other Repositories

Once published, other repositories can use your action:

### Basic Usage

```yaml
name: Generate Release Notes
on:
  pull_request:
    types: [closed]

jobs:
  release-notes:
    if: github.event.pull_request.merged == true && github.event.pull_request.base.ref == 'main'
    runs-on: ubuntu-latest
    steps:
      - name: Generate Release Note
        id: release-note
        uses: gorilli-team/release-note-ai@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

### With AI Summaries

```yaml
- uses: gorilli-team/release-note-ai@v1
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    generate_summary: true
    anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

## Versioning Strategy

- `@v1` - Always points to the latest v1.x.x release (recommended for users)
- `@v1.0.0` - Specific version (use for stability)
- `@main` - Latest code (not recommended for production)

When you make updates:
1. Create a new tag: `v1.1.0`
2. Update the `v1` tag to point to the latest: `git tag -fa v1 -m "Update v1 tag"`
3. Push with force: `git push origin v1 --force`

## Troubleshooting

### Action not found
- Ensure the repository is public or you have access
- Verify the tag exists: https://github.com/gorilli-team/release-note-ai/tags
- Check the action.yml file is in the root directory

### Build out of sync
If you make changes to src files:
```bash
npm run build
git add dist/
git commit -m "Update build artifacts"
git push
```

### Testing locally
Use [act](https://github.com/nektos/act) to test the action locally before publishing:
```bash
brew install act  # macOS
act pull_request --eventpath test-event.json
```

## Support

- Issues: https://github.com/gorilli-team/release-note-ai/issues
- Discussions: https://github.com/gorilli-team/release-note-ai/discussions
- Documentation: https://github.com/gorilli-team/release-note-ai#readme
