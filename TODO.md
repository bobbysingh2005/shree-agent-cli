# Project TODO List

This file tracks the step-by-step progress of all planned features for the Agentic CLI project.

---

- [ ] **Implement .taskAgent folder creation**
  - Develop functionality to automatically create a `.taskAgent/` folder on the first run. This folder will store configurations, logs, and chat sessions.

- [ ] **Add centralized config system**
  - Introduce a `config.json` file to manage settings like selected models for chat, generation, and validation.

- [ ] **Implement logging system**
  - Create a logging system to save errors and commands in `.taskAgent/logs/`.

- [ ] **Develop chat session management**
  - Enable saving and loading of chat sessions with commands like `:save`, `:load`, and `:exit`.

- [ ] **Add project analysis command**
  - Create a `taskAgent analyze` command to scan the project and detect stack, frameworks, and missing folders.

- [ ] **Generate suggestions based on analysis**
  - Develop a feature to propose improvements based on project analysis and save them to `.taskAgent/suggestions.md`.

- [ ] **Design plugin system**
  - Allow developers to extend CLI functionality with custom plugins. Include hooks like `onPlan` and `onGenerate`.

- [ ] **Integrate unit and integration tests**
  - Set up Jest or Vitest for testing. Mock external API calls for reliable test coverage.

- [ ] **Prepare for npm release**
  - Publish the CLI as `task-agent` on npm. Include semantic versioning and auto-changelog.

- [ ] **Write developer documentation**
  - Provide detailed guides for `.taskAgent` usage, plugin authoring, and development setup.

---

Update this file as you make progress on each feature.
