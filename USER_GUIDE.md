# User Guide: Agentic CLI Toolbox & Chat

## Overview
The agentic CLI now supports direct project actions from chat mode. You can list files, read/write files, generate code, validate, and analyze your project—all from the chat interface.

## Available Commands
| Command         | Description                                 |
|-----------------|---------------------------------------------|
| `:ls`           | List files and folders in current directory  |
| `:cat <file>`   | Show contents of a file                     |
| `:write <file> <content>` | Write content to a file            |
| `:gen <prompt>` | Generate code for a prompt (model-based)    |
| `:validate`     | Run project validation                      |
| `:analyze`      | Run project analysis                        |
| `:save <name>`  | Save chat session                           |
| `:load <name>`  | Load chat session                           |
| `:sessions`     | List saved sessions                         |
| `exit`          | Return to main menu                         |

## Usage Examples
```
:ls
:cat README.md
:write notes.txt This is a note
:gen Create a Fastify route for /users
:validate
:analyze
```

## Best Practices
- All actions are restricted to the current working directory for safety.
- For write actions, double-check file names and content before confirming.
- Use `:validate` and `:analyze` to keep your project healthy after changes.

## Troubleshooting
- If a command fails, check file paths and permissions.
- For code generation, ensure your selected model is available and running.
- For more help, use `taskAgent --help` or see the README.

## Project Creation: New or Existing

When generating a project, you can:
- Select any existing `.json`, `.md`, or `.txt` file as your project plan (the CLI will extract info automatically)
- Or, choose to create a new project plan by answering prompts (name, description, output folder, steps)
- New plans are saved as `.json` for easy reuse

**Tip:** Use Markdown or text files for brainstorming, then convert to a structured plan when ready.

---
