# Dogfooding: Using release-note-ai on Itself

This repository uses `gorilli-team/release-note-ai` to generate release notes for its own PRs. This ensures the action is battle-tested on real changes and evolves alongside the product.

## High-Level Flow

1. **A PR is merged into main**
2. **GitHub Actions runs this same action**
3. **The action:**
   - Reads PR metadata (title, description, commits, labels)
   - Generates an AI-powered release note
   - Persists it (artifact, comment, or custom endpoint)
4. **The generated release note becomes the canonical changelog entry for that PR**

## Why This Works (Important Concept)

Even though the action lives in the same repo, GitHub Actions always executes **the version referenced by the workflow**, not the working tree.

That means:
- `@v1` → stable, released behavior
- `@main` → bleeding-edge (use only for testing)

**👉 Best practice:**
Use `@v1` for self-integration, update the tag only when releasing.

## Self-Integration Workflow

The workflow at `.github/workflows/release-note.yml` does the following:

```yaml
name: Generate Release Note
on:
  pull_request:
    types: [closed]
    branches: [main]

jobs:
  release-note:
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    steps:
      - uses: gorilli-team/release-note-ai@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          generate_summary: true
          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
```

This workflow:
1. ✅ Generates structured release notes with AI summaries
2. ✅ Saves them as GitHub artifacts
3. ✅ Posts a comment on the PR with the generated note
4. ✅ Uses the stable `@v1` tag (not working tree code)

## Local Development vs Self-Usage

### During Development

If you need to test **unreleased changes**:

```yaml
uses: gorilli-team/release-note-ai@main
```

⚠️ **Never ship this.** Switch back to `@v1` before merging to main.

### For Dogfooding (Production)

Always use a stable tag:

```yaml
uses: gorilli-team/release-note-ai@v1
```

This ensures:
- Predictable behavior
- No breaking changes from untagged commits
- Clear separation between "development" and "production" usage

## Release Process (Recommended)

1. **Merge PR** → action runs on itself using `@v1`
2. **Verify** generated release note is correct
3. **Test new features** by temporarily switching to `@main` in a test PR
4. **Create a GitHub Release** with the new version
5. **Move the v1 tag**:
   ```bash
   git tag -f v1
   git push origin v1 --force
   ```

This keeps:
- `v1` stable and up-to-date
- Consumers safe from breaking changes
- Self-integration deterministic

## What This Enables Long-Term

✅ **Continuous validation** on real PRs
✅ **Zero demo vs prod drift** (we use what we ship)
✅ **Confidence** when shipping new versions
✅ **Strong open-source credibility** ("we use it ourselves")

## Example: Testing a New Feature

Let's say you want to add a new `include_commits` option:

### Step 1: Develop the Feature

```bash
git checkout -b feature/include-commits
# Make changes to src/
npm run build
git add .
git commit -m "Add include_commits option"
git push origin feature/include-commits
```

### Step 2: Test with @main (Optional)

Create a test PR and temporarily update `.github/workflows/release-note.yml`:

```yaml
- uses: gorilli-team/release-note-ai@main  # ⚠️ Testing only
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    include_commits: true  # New feature
```

Merge the test PR and verify the new feature works.

### Step 3: Revert to @v1

Before merging the actual feature PR, change it back:

```yaml
- uses: gorilli-team/release-note-ai@v1
```

### Step 4: Release

```bash
git tag v1.1.0
git push origin v1.1.0
git tag -f v1
git push origin v1 --force
```

Now the action dogfoods the new feature on every subsequent PR.

## Secrets Configuration

To enable AI summaries in the dogfooding workflow, add this secret:

1. Go to https://github.com/gorilli-team/release-note-ai/settings/secrets/actions
2. Add a new repository secret:
   - Name: `ANTHROPIC_API_KEY`
   - Value: Your Anthropic API key from https://console.anthropic.com/

Without this secret, the action will fall back to parsing-only mode (no AI summaries).

## Monitoring Dogfooding Results

### View Generated Release Notes

1. **Artifacts**: Go to Actions → Select a workflow run → Download artifacts
2. **PR Comments**: Check the PR that was merged for the generated note
3. **Logs**: Check the workflow logs for the JSON output

### Analyze Patterns

Over time, you'll see:
- Which PR structures produce the best summaries
- Edge cases that need better handling
- Common label patterns across your repo

This real-world data helps improve the action continuously.

## Best Practices

1. **Always use @v1 in main branch** - Never merge code that references `@main`
2. **Review generated notes** - Check if they make sense before considering them canonical
3. **Update PR templates** - Guide contributors to write better PR descriptions
4. **Iterate on prompts** - If summaries are off, improve the summarization logic
5. **Collect feedback** - Ask team members if the generated notes are useful

## Troubleshooting

### Action not running

- Check that the workflow file exists: `.github/workflows/release-note.yml`
- Verify GitHub Actions are enabled in repository settings
- Ensure PRs are merged to `main` (not just closed)

### No AI summary generated

- Check that `ANTHROPIC_API_KEY` is set in repository secrets
- Verify the secret name matches exactly
- Check workflow logs for error messages

### Using old version

- Verify the workflow references `@v1` not `@v1.0.0`
- Check that you've pushed the updated `v1` tag after releasing

### Generated notes are poor quality

- Improve your PR description templates (see `examples/pr-template.md`)
- Adjust the summarization prompt in `src/summarizer.ts`
- Consider using more structured PR sections

## Future Enhancements

Potential dogfooding improvements:

- [ ] Store release notes in a database
- [ ] Generate a changelog file automatically
- [ ] Trigger downstream systems (Slack, email, etc.)
- [ ] Create GitHub releases automatically
- [ ] Track metrics on release note quality

The dogfooding setup makes all of these easier to develop and test.
