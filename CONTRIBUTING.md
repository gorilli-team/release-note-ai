# Contributing to Release Note Generator Action

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## Development Setup

1. Fork and clone the repository
2. Install dependencies:
   ```bash
   yarn install
   ```

3. Make your changes in the `src/` directory

4. Build the action:
   ```bash
   yarn build
   ```

5. Test your changes locally using [act](https://github.com/nektos/act)

## Code Style

- This project uses TypeScript with strict type checking
- Run `yarn lint` to check for linting issues
- Run `yarn format` to format code with Prettier
- Follow existing patterns for consistency

## Pull Request Process

1. Create a new branch from `main`
2. Make your changes with clear, descriptive commit messages
3. Ensure the build passes: `yarn build`
4. Ensure linting passes: `yarn lint`
5. Update documentation if needed (README.md, code comments)
6. Submit a pull request with:
   - Clear description of the changes
   - Motivation for the changes
   - Any breaking changes noted

## Testing

Since this is a GitHub Action:
- Manual testing requires a GitHub repository with pull requests
- Use [act](https://github.com/nektos/act) for local testing
- Test both with and without AI summarization enabled
- Test edge cases: empty PR bodies, missing sections, etc.

## Commit the Build

This action requires the compiled `dist/index.js` to be committed:
- Always run `yarn build` before committing
- Commit the updated `dist/` folder with your changes
- The CI workflow will verify the build is up to date

## Questions?

Open an issue for questions, bugs, or feature requests.
