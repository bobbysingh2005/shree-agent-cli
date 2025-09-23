# User Guide: Agentic CLI Toolbox & Chat

## Overview

shree-agent-cli is an agentic CLI for project generation, validation, chat, and model selection. It supports .json/.md/.txt project info files, agentic tool-calling, session persistence, and human-in-the-loop safety.

The agentic CLI supports direct project actions from chat mode. On first run, it will automatically analyze and index your project for better context and smarter AI actions. You can list files, read/write files, generate code, validate, and analyze your project—all from the chat interface.

## Features

- **Project Creation**: Guided prompts for language, framework, and plan. Supports .json, .md, .txt files.
- **Validation**: Validates project plans and generated code.
- **Agentic Tool-Calling**: Toolbox exposes safe file and project actions for the agent/AI.
- **Session Persistence**: Auto-resume previous sessions, save chat and plan state.
- **AI Plan Review**: AI reviews and improves project plans with user approval.
- **Human-in-the-Loop**: All agentic actions require user confirmation.
- **Language/Framework Selection**: Detects and prompts for language/framework.
- **Automated Versioning**: Uses semantic-release for versioning and changelog.
- **Commit Linting**: Enforces Conventional Commits with commitlint and Husky.
- **Pre-commit Lint/Format**: ESLint and Prettier run automatically before every commit.

## Available Commands

| Command                   | Description                                 |
| ------------------------- | ------------------------------------------- |
| `:ls`                     | List files and folders in current directory |
| `:cat <file>`             | Show contents of a file                     |
| `:write <file> <content>` | Write content to a file                     |
| `:gen <prompt>`           | Generate code for a prompt (model-based)    |
| `:validate`               | Run project validation                      |
| `:analyze`                | Run project analysis                        |
| `:save <name>`            | Save chat session                           |
| `:load <name>`            | Load chat session                           |
| `:sessions`               | List saved sessions                         |
| `exit`                    | Return to main menu                         |

## Usage Examples

```
:ls
:cat README.md
:write notes.txt This is a note
:gen Create a Fastify route for /users
:validate
:analyze
```

## Project Creation: New or Existing

When generating a project, you can:

- Select any existing `.json`, `.md`, or `.txt` file as your project plan (the CLI will extract info automatically)
- Or, choose to create a new project plan by answering prompts (name, description, output folder, steps, **language**)
- New plans are saved as `.json` for easy reuse

### Language Selection

You will be prompted to select the target programming language (JavaScript, TypeScript, Python, PHP, .NET, Go, Rust, Java, C++, etc.).

- The selected language is saved in your plan and used for all code generation and validation.
- The agentic CLI and AI will generate code and folder structure for your chosen language.

**Tip:** Use Markdown or text files for brainstorming, then convert to a structured plan when ready.

## Toolbox Actions

- List files/folders
- Read/write files (with confirmation)
- Generate code (via model)
- Validate/analyze project

## Best Practices

- All actions are restricted to the current working directory for safety.
- For write actions, double-check file names and content before confirming.
- Use `:validate` and `:analyze` to keep your project healthy after changes.

## Session Persistence

- All chat and plan sessions are auto-saved in `.taskAgent/`.
- Use `:save <name>` and `:load <name>` to manage sessions.
- The CLI will auto-resume your last session on restart.

## Code Quality & Linting

All code is linted and formatted automatically before every commit. Commits and builds will fail if any lint errors remain.

- Run `npm run lint` to check for errors and warnings.
- Run `npm run lint -- --fix` to auto-fix simple issues.
- Run `npm run format` to apply Prettier formatting.
- Fix any remaining errors manually in your code.

**Note:** Avoid using `any` types. Use specific types and interfaces for all variables and function signatures. See `DEVELOPER_GUIDE.md` for more details.

## Contributing

See `CONTRIBUTING.md` for workflow, commit, and release guidelines.

## Troubleshooting

- If you encounter issues, check the logs in `.taskAgent/`.
- For model/API errors, ensure Ollama is running at `http://localhost:11434`.
- For lint/format errors, run `npm run lint` and `npm run format`.

## Example Flows

- **New Project**: Select language, framework, and plan file. Agent reviews and improves plan, then generates structure and code.
- **Validation**: Validate plan and generated code, with AI suggestions.
- **Chat**: Use chat for agentic help, tool-calling, and plan review.

## More Info

- See `README.md` for a feature summary.
- See `CONTRIBUTING.md` for development workflow.
- Open issues or contact the maintainer for help.

---
