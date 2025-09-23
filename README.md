# 🧠 shreeAgentCli

A fully accessible AI-powered CLI tool for developers.  
It helps with brainstorming, planning, generating, and validating complete projects using local Ollama models.
A powerful AI-powered CLI tool to generate, validate, and interact with code projects using Ollama models — fully screen-reader accessible.

## 📦 Features

- ✅ Chat with Ollama models (streaming real-time)
- ✅ Project Discussion (plan name, description, steps, and language)
- ✅ Project Generation (generate structure + code, language-aware)
- ✅ Project Validation (check all expected files exist)
- ✅ File-based context chat after validation
- ✅ Stores config per feature (chat model, gen model, etc.)
- ✅ CLI Help via `taskAgent --help`
- ✅ Fully screen-reader compatible
- ✅ Interactive project steps via CLI (no external editor)
- ✅ Project Analysis (scan stack, frameworks, missing folders)
- ✅ Suggestions based on analysis
- ✅ Plugin system for custom hooks
- ✅ Unit and integration tests (Jest/Vitest)
- ✅ NPM release with semantic versioning

---

## 🌐 Multi-Language Project Support

When creating a new project or using an existing plan, you can now select the target programming language (JavaScript, TypeScript, Python, PHP, .NET, Go, Rust, Java, C++, etc.).

- The selected language is saved in your project plan and used for all code generation, validation, and analysis.
- The agentic CLI and AI model will generate code, folder structure, and suggestions tailored to your chosen language.

**Example:**

1. Run `taskAgent` and select **Project Generation**.
2. Choose to create a new plan or use an existing file.
3. When prompted, select your project language (e.g., Python).
4. The CLI and AI will generate a Python project structure and code.

This makes the CLI suitable for any tech stack and helps you build, debug, and improve projects in your preferred language.

---

## 🏗️ Works with Existing Projects

You can use shreeAgentCli with both new and existing projects. For existing codebases, the CLI lets you:

- Analyze the current structure and stack
- Chat about your code, issues, or improvements
- Generate new files or code for the existing project
- Validate the current project for missing or misconfigured files
- Use the "Analysis & Debugging" menu to iterate after manual changes or debugging
- Get suggestions and extend with plugins

### Example: Using shreeAgentCli with an Existing Project

Suppose you have a Node.js project and want to:

- Analyze the current structure
- Chat about a bug or missing feature
- Generate a new route file
- Validate the project after manual fixes

**Workflow:**

1. Run `taskAgent` in your project folder.
2. Choose **"Analysis & Debugging"** from the menu.
3. Select **"Analyze Project"** to scan your codebase and get a summary.
4. Select **"Chat about issues/fixes"** to discuss bugs or improvements with the agent.
5. Select **"Generate new code/files"** to add a new route or feature (the agent will use your project context).
6. After editing or debugging manually, use **"Re-validate project"** to check for missing or broken files.
7. Repeat as needed—this workflow helps you iterate quickly and keep your project healthy.

This approach works for any existing codebase, not just new projects!

---

## 🚀 CLI Usage

Run the CLI from any terminal:

```sh
taskAgent
```

You'll be prompted with options:

1. Chat with Ollama
2. Project Discussion
3. Project Generation
4. Project Validation
5. Analysis & Debugging
6. Analyze Project
7. Generate Suggestions
8. Configure Models
9. Exit

---

## �️ Agentic Toolbox & Chat Commands

In chat mode, you can now use agentic commands to interact with your project directly:

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

**Examples:**

```
:ls
:cat README.md
:write notes.txt This is a note
:gen Create a Fastify route for /users
:validate
:analyze
```

All actions are performed in the current working directory for safety.

---

---

## �🐞 Analysis & Debugging Workflow

After debugging or making manual changes to your project, use the **Analysis & Debugging** menu:

- **Chat about issues/fixes**: Continue the conversation with the agent about new problems or solutions.
- **Generate new code/files**: Use the generator to add or update files after debugging.
- **Re-validate project**: Run validation again to check your fixes or new code.

This workflow helps you iterate quickly after each debug cycle, keeping your project in sync with the agent.

---

## 🤖 Per-Task Model Selection

You can now assign different Ollama models to each agent task (analysis, development, documentation, testing, suggestions, chat) for maximum flexibility and performance.

- Use the CLI menu option **"Configure Models"** to interactively set which model is used for each step.
- The mapping is saved in `.taskAgent/config.json` (or `.taskAgent/modelConfig.json` if present).
- When you generate a project, the generator will use your selected models for each step (e.g., a smaller model for folder structure, a larger one for code generation).

**Example config:**

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

You can edit this file directly or use the CLI for a guided setup.

---

## 🗂 .taskAgent Workspace & Project Indexing

When you run the CLI for the first time, a `.taskAgent/` folder is created in your project root. The CLI will automatically analyze and index your project, saving the results to `.taskAgent/meta.json`.

This gives both you and the agentic CLI app immediate project context for smarter AI actions, suggestions, and code generation.

The `.taskAgent/` folder stores all your plans, history, sessions, configuration, logs, and analysis.

```
.taskAgent/
├── config.json           # CLI and AI model settings
├── meta.json             # Project analysis output
├── history/              # Command usage logs
├── plans/                # Saved project plans
├── sessions/             # Chat sessions
├── logs/                 # Error and debug logs
├── suggestions.md        # Project improvement suggestions
```

You can customize `config.json` like this:

```json
{
  "defaultChatModel": "llama3",
  "defaultGenModel": "codellama",
  "enableLogs": true,
  "plugins": ["./myPlugin.js"]
}
```

---

## 🧩 Plugin System

- Add plugin paths to `.taskAgent/config.json` under `plugins`.
- Plugins can hook into `onPlan` and `onGenerate` events.
- Example plugin:

```js
module.exports = {
  name: 'MyPlugin',
  hooks: {
    onPlan: () => {
      console.log('Planning started!');
    },
    onGenerate: () => {
      console.log('Generation started!');
    },
  },
};
```

---

## 🧪 Testing

- Unit and integration tests are written using Jest.
- To run tests:

```sh
npm install
npm test
```

All core features are covered by automated tests in the `src/core/__tests__` and `src/utils/__tests__` folders.

---

## 📦 NPM Release & Versioning

- To publish: update the version in `package.json` and run:

```sh
npm publish --access public
```

- Semantic versioning is recommended. Use tools like `semantic-release` for automated changelogs and version bumps.

---

## 📝 Developer Guide

- Use `:save <name>`, `:load <name>`, and `:sessions` in chat to manage sessions.
- Use "Analyze Project" to scan your codebase and "Generate Suggestions" for improvements.
- Extend with plugins for custom automation.
- Run tests with `npm test` to verify core features.
- See `src/core/__tests__` and `src/utils/__tests__` for test coverage examples.

---

## 💬 Chat Mode

- Choose model
- Start chatting (streaming enabled)
- Type `:menu` or `:exit` to return to main menu

---

## 🛠 Help

```sh
taskAgent --help
```

---

## 🙌 Contributing

1. Fork the repo
2. Run `npm install`
3. Make changes in `src/`
4. Build with `npm run build`
5. Test via `npm link`

You're welcome to contribute bug fixes, improvements, or accessibility enhancements!

---

## 🧱 Built With

- Node.js (TypeScript)
- Inquirer.js
- Axios
- Chalk
- Ollama (via local REST API)

---

## 🧑‍💻 Author

Smart Topper — blind developer advocate for accessible tools ❤️

---

## ⚡ Code Quality, Linting, and Pre-commit Hooks

shreeAgentCli enforces strict code quality using ESLint and Prettier. All code must pass linting and formatting checks before it can be committed or built.

- **Pre-commit hooks**: ESLint and Prettier run automatically before every commit (via Husky and lint-staged).
- **No lint errors allowed**: Commits and builds will fail if any lint errors remain. Fix all reported issues before pushing changes.
- **How to fix lint errors**:
  - Run `npm run lint` to see all errors and warnings.
  - Run `npm run lint -- --fix` to auto-fix simple issues.
  - Run `npm run format` to apply Prettier formatting.
  - Address any remaining errors manually in your code.
- **TypeScript strictness**: Avoid using `any` types. Use specific types and interfaces for all variables and function signatures.
- **CI/CD**: Linting and tests are enforced in CI pipelines.

**Developer workflow:**

1. Write or update code in `src/`.
2. Run `npm run lint` and `npm run format`.
3. Run `npm run build` and `npm test`.
4. Commit only after all lint, build, and test steps pass.
5. If you see lint errors, fix them before retrying commit/build.

See `DEVELOPER_GUIDE.md` for more details on contributing and code standards.

---

## 🆕 Flexible Project Generation

When you select **Project Generation** from the menu, you can now:

- **Use an existing project info file**: Select any `.json`, `.md`, or `.txt` file in your folder. The CLI will extract project details automatically.
- **Create a new project plan**: Answer prompts for project name, description, output folder, and steps. The CLI will save your plan as a `.json` file for future use.

This makes it easy to start new projects or reuse/iterate on existing plans.

**Example workflow:**

1. Run `taskAgent` and select **Project Generation**.
2. Choose to create a new plan or use an existing file.
3. If creating new, fill in the prompts (steps can be entered in your editor, one per line).
4. The CLI saves your plan and continues with model selection and project generation.
