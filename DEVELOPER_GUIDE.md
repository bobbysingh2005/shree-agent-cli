# Developer Documentation: shreeAgentCli

## Overview
shreeAgentCli is an accessible, AI-powered CLI for developers, supporting project planning, generation, validation, chat, suggestions, and plugin extension using local Ollama models.

## .taskAgent Workspace
- `.taskAgent/` is auto-created in your project root.
- Stores: `config.json`, `meta.json`, `history/`, `plans/`, `sessions/`, `logs/`, `suggestions.md`.

## Per-Task Model Selection
- Assign different Ollama models to each agent task (analysis, development, documentation, testing, suggestions, chat).
- Use the CLI menu option "Configure Models" for interactive setup.
- Config is saved in `.taskAgent/modelConfig.json` (or `config.json`).
- Example:
  ```json
  {
    "analysis": "llama2:7b",
    "development": "codellama:13b",
    "documentation": "llama3:8b",
    "testing": "llama2:7b",
    "suggestions": "llama2:7b",
    "chat": "llama3:8b"
  }
  ```

## Plugin Authoring
- Add plugin paths to `plugins` in `.taskAgent/config.json`.
- Plugins can hook into `onPlan` and `onGenerate` events.
- Example:
  ```js
  module.exports = {
    name: "MyPlugin",
    hooks: {
      onPlan: () => { console.log("Planning started!"); },
      onGenerate: () => { console.log("Generation started!"); }
    }
  };
  ```

## Analysis & Debugging Menu

The CLI provides an **Analysis & Debugging** menu to streamline post-debugging workflows:

- **Chat about issues/fixes**: Continue the conversation with the agent about new problems or solutions after debugging.
- **Generate new code/files**: Use the generator to add or update files after manual changes.
- **Re-validate project**: Run validation again to check your fixes or new code.

This menu helps users quickly iterate after each debug cycle, keeping the project and agent in sync.

## Development Setup
- Clone repo, run `npm install`.
- Source code in `src/`.
- Build with `npm run build`.
- Test with `npm test` (Jest, all core features covered).
- Use `npm link` for local CLI testing.

## Testing
- Tests in `src/core/__tests__/` and `src/utils/__tests__/`.
- Mock external API calls for reliability.

## Accessibility
- Fully screen-reader compatible.
- All prompts and outputs are designed for accessibility.

## Contributing
- Fork, install, build, and test as above.
- Submit PRs for bug fixes, features, or accessibility improvements.

## Contact
Smart Topper — blind developer advocate for accessible tools ❤️
