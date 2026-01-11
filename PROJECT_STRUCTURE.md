# Project Structure

```
release-note-action/
│
├── .github/
│   ├── workflows/
│   │   └── ci.yml                    # CI pipeline for linting and building
│   └── pull_request_template.md      # Template for contributors
│
├── examples/
│   ├── basic-workflow.yml            # Workflow without AI summary
│   ├── ai-summary-workflow.yml       # Workflow with AI summary
│   ├── pr-template.md                # Suggested PR body structure
│   └── sample-output.json            # Example of action output
│
├── src/
│   ├── index.ts                      # Main entrypoint & orchestration
│   ├── types.ts                      # TypeScript type definitions
│   ├── parser.ts                     # PR parsing & label normalization
│   └── summarizer.ts                 # AI summarization via Anthropic API
│
├── dist/                             # Compiled output (generated, committed)
│   ├── index.js                      # Bundled action code
│   ├── index.js.map                  # Source map
│   └── licenses.txt                  # Dependency licenses
│
├── action.yml                        # GitHub Action metadata
├── package.json                      # Node.js dependencies & scripts
├── tsconfig.json                     # TypeScript compiler configuration
├── .eslintrc.json                    # ESLint rules
├── .prettierrc.json                  # Prettier formatting rules
├── .gitignore                        # Git ignore patterns
│
├── LICENSE                           # MIT License
├── README.md                         # Main documentation
├── QUICKSTART.md                     # 5-minute getting started guide
├── CONTRIBUTING.md                   # Contribution guidelines
├── DEVELOPMENT.md                    # Developer documentation
└── PROJECT_STRUCTURE.md              # This file
```

## File Descriptions

### Core Action Files

- **action.yml** - Defines inputs, outputs, and runtime for the GitHub Action
- **src/index.ts** - Main entrypoint that orchestrates the entire workflow
- **dist/index.js** - Compiled and bundled code (auto-generated, must be committed)

### Source Code

- **src/types.ts** - TypeScript interfaces for all data structures
- **src/parser.ts** - Functions to parse PR bodies and normalize labels
- **src/summarizer.ts** - AI summarization logic using Anthropic API

### Configuration

- **package.json** - Dependencies, scripts, and project metadata
- **tsconfig.json** - TypeScript compiler settings (strict mode enabled)
- **.eslintrc.json** - Linting rules for code quality
- **.prettierrc.json** - Code formatting rules
- **.gitignore** - Files to exclude from version control

### Documentation

- **README.md** - User-facing documentation with usage examples
- **QUICKSTART.md** - Quick start guide for new users
- **DEVELOPMENT.md** - Technical guide for contributors
- **CONTRIBUTING.md** - How to contribute to the project
- **PROJECT_STRUCTURE.md** - This file, documenting the structure

### Examples

- **examples/basic-workflow.yml** - Example without AI summarization
- **examples/ai-summary-workflow.yml** - Example with AI features
- **examples/pr-template.md** - Suggested PR body template
- **examples/sample-output.json** - Example of the JSON output

### CI/CD

- **.github/workflows/ci.yml** - Automated testing, linting, and build verification
- **.github/pull_request_template.md** - Template for pull request descriptions

## Key Design Principles

1. **Separation of Concerns** - Parsing, summarization, and orchestration are separate modules
2. **Type Safety** - Strict TypeScript for all code
3. **Defensive Coding** - Handles missing data, empty sections, malformed input
4. **No Dependencies on Build** - All deps bundled into dist/index.js
5. **Generic & Reusable** - No company-specific logic or hardcoded values
6. **Preservation of Raw Data** - Always includes original PR data in output
