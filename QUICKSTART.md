# Quick Start Guide

Get up and running with the Release Note Generator Action in 5 minutes.

## Step 1: Add the Action to Your Repository

Create `.github/workflows/release-notes.yml`:

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
        uses: yourusername/release-note-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          generate_summary: false

      - name: Display Output
        run: echo '${{ steps.release-note.outputs.release_note }}' | jq .
```

## Step 2: Structure Your Pull Requests

Use this template for your PR descriptions:

```markdown
## What was done

- List your changes here
- Each change as a bullet point

## Why

Explain the motivation for these changes

## User Impact

Describe how this affects end users (not technical details)
```

## Step 3: Merge a PR

When you merge a PR to `main`, the action will:
1. Extract PR metadata (number, title, labels, authors)
2. Parse the PR body into structured sections
3. Normalize labels into tags
4. Output a JSON object with all the data

## Step 4: Use the Output

The action outputs a JSON object you can:
- Send to your backend API
- Save as a file artifact
- Use in GitHub Releases
- Transform with other workflow steps

Example output:
```json
{
  "title": "Improved user authentication",
  "description": "Users can now log in with OAuth",
  "changes": ["Added OAuth 2.0 support", "..."],
  "tags": ["feature", "security"],
  "pr": {
    "number": 123,
    "url": "https://github.com/owner/repo/pull/123",
    "authors": ["developer1"],
    "mergedAt": "2024-01-15T10:30:00Z"
  },
  "raw": {
    "title": "Original PR title",
    "body": "Full PR body...",
    "labels": ["enhancement", "security"]
  }
}
```

## Optional: Enable AI Summaries

To generate user-friendly summaries with AI:

1. Get an Anthropic API key from https://console.anthropic.com/
2. Add it to your repository secrets as `ANTHROPIC_API_KEY`
3. Update your workflow:

```yaml
- name: Generate Release Note
  uses: yourusername/release-note-action@v1
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    generate_summary: true
    anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

## Next Steps

- See [README.md](README.md) for complete documentation
- Check [examples/](examples/) for more workflow examples
- Read [CONTRIBUTING.md](CONTRIBUTING.md) to contribute
