# Release Note Generator Action

A generic, reusable GitHub Action that extracts structured release notes from merged pull requests. This action parses PR content, normalizes labels, and optionally generates AI-powered summaries suitable for end users.

## Features

- Extracts structured data from merged PRs (title, body, labels, authors, timestamps)
- Parses PR body sections (What was done, Why, User impact, etc.)
- Normalizes labels into high-level tags (feature, fix, refactor, infra, docs)
- Optionally generates AI-powered summaries with user-friendly language
- Outputs machine-readable JSON for downstream processing
- Defensive parsing handles missing sections and empty content
- Company-agnostic and fully open source

## Usage

### Basic Usage (Without AI Summary)

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

      - name: Display Release Note
        run: |
          echo '${{ steps.release-note.outputs.release_note }}'
```

### With AI-Powered Summary

```yaml
name: Generate Release Notes with AI
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
          generate_summary: true
          model: claude-3-5-sonnet-20241022
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}

      - name: Post to API
        run: |
          curl -X POST https://your-api.com/release-notes \
            -H "Content-Type: application/json" \
            -d '${{ steps.release-note.outputs.release_note }}'
```

### Complete Workflow with Downstream Processing

```yaml
name: Release Notes Pipeline
on:
  pull_request:
    types: [closed]

jobs:
  generate-and-publish:
    if: github.event.pull_request.merged == true && github.event.pull_request.base.ref == 'main'
    runs-on: ubuntu-latest
    steps:
      - name: Generate Release Note
        id: release-note
        uses: yourusername/release-note-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          generate_summary: true
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}

      - name: Save to artifact
        run: |
          echo '${{ steps.release-note.outputs.release_note }}' > release-note.json

      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: release-note
          path: release-note.json

      - name: Send to backend
        run: |
          curl -X POST ${{ secrets.BACKEND_URL }}/release-notes \
            -H "Authorization: Bearer ${{ secrets.API_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d '${{ steps.release-note.outputs.release_note }}'
```

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `github_token` | Yes | - | GitHub token for API access (usually `secrets.GITHUB_TOKEN`) |
| `generate_summary` | No | `false` | Whether to generate AI-powered summary |
| `model` | No | `claude-3-5-sonnet-20241022` | AI model to use for summarization (only used if `generate_summary` is true) |
| `anthropic_api_key` | Conditional | - | Anthropic API key (required only if `generate_summary` is true) |

## Outputs

### `release_note`

A JSON string with the following structure:

```json
{
  "title": "User-friendly title (max 80 chars)",
  "description": "Brief one-sentence summary",
  "changes": [
    "First user-facing change",
    "Second user-facing change",
    "Third user-facing change"
  ],
  "tags": ["feature", "fix", "docs"],
  "pr": {
    "number": 123,
    "url": "https://github.com/owner/repo/pull/123",
    "authors": ["username1", "username2"],
    "mergedAt": "2024-01-15T10:30:00Z"
  },
  "raw": {
    "title": "Original PR title",
    "body": "Full PR body content...",
    "labels": ["enhancement", "bug", "documentation"]
  }
}
```

## PR Body Template

For best results, structure your pull request body with these sections:

```markdown
## What was done

- Added new authentication flow
- Updated user profile page
- Fixed session timeout issue

## Why

To improve security and user experience by implementing OAuth 2.0.

## User Impact

Users will now be able to log in using their Google or GitHub accounts.

## Technical Details

- Implemented OAuth 2.0 using `passport.js`
- Added new `/auth` routes
- Updated session management
```

The action will parse these sections and extract relevant information. If sections are missing, it falls back gracefully to parsing the raw PR body.

## Label Normalization

The action normalizes GitHub labels into high-level tags:

| Label | Normalized Tag |
|-------|----------------|
| `bug`, `fix`, `bugfix` | `fix` |
| `feature`, `enhancement`, `feat` | `feature` |
| `refactor`, `refactoring` | `refactor` |
| `infrastructure`, `infra`, `ci`, `deployment` | `infra` |
| `documentation`, `docs` | `docs` |
| `chore`, `maintenance` | `chore` |
| `dependencies`, `deps` | `dependencies` |
| `security` | `security` |
| `breaking`, `breaking-change` | `breaking-change` |

Unrecognized labels are preserved as-is.

## Development

### Prerequisites

- Node.js 20+
- npm or yarn

### Setup

```bash
npm install
```

### Build

```bash
npm run build
```

This compiles TypeScript and bundles the action using `@vercel/ncc`.

### Local Testing

Since this is a GitHub Action, local testing requires:

1. Setting up environment variables that mimic GitHub Actions context
2. Using tools like [act](https://github.com/nektos/act) to run actions locally

Example with `act`:

```bash
act pull_request --secret GITHUB_TOKEN=your_token --eventpath test-event.json
```

## Architecture

```
src/
├── index.ts        # Main entrypoint, orchestrates the workflow
├── types.ts        # TypeScript interfaces and types
├── parser.ts       # PR body parsing and label normalization
└── summarizer.ts   # AI summarization logic (Anthropic API)
```

### Key Design Decisions

1. **Separation of Concerns**: Parsing, summarization, and orchestration are separate modules
2. **Defensive Parsing**: Handles missing sections, empty bodies, and malformed content gracefully
3. **Fallback Strategy**: If AI summarization fails, falls back to parsed content
4. **No External Dependencies**: Only uses official GitHub Actions and Anthropic APIs
5. **Output Preservation**: Always includes raw PR data alongside processed content

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

For issues, questions, or contributions, please open an issue on GitHub.
