# shreeAgentCli - Smart Project Assistant CLI

A powerful CLI tool to discuss, generate, test, and manage full-stack projects using local Ollama models (like Deepseek, Starcoder, etc).
Designed for screen reader users with full keyboard navigation.

---

## Installation

```bash
git clone https://github.com/bobbysingh2005/shree-agent-cli.git
cd shreeAgentCli
npm install
````

---

## Build & Run

```bash
# Compile TypeScript to JavaScript in /bin
npm run build

# Start the CLI
node ./bin/index.js
```

---

## Features

### 1. Chat with Ollama

* General Q\&A about your project.
* After response, option to insert AI reply into a real file (top or bottom).

### 2. Project Discussion

* Define your project name, description, and step list.
* It saves a `.json` file like `my-app.json`.

### 3. Project Generation

* Select `.json` plan file
* Select Ollama model
* AI creates folder structure and files with full code
* All code is saved under folder like `my-app/`

### 4. Project Validation

* Validate if all generated files are:

  * Complete (not placeholders)
  * Exist in correct locations

---

## Ollama Integration

* Works with any local Ollama model
* Auto-fetches available models from:
  [http://localhost:11434/api/tags](http://localhost:11434/api/tags)

---

## Folder Structure

shreeAgentCli/
├── src/
│   ├── index.ts              # Main menu
│   ├── core/
│   │   ├── chat.ts           # Chat + insert
│   │   ├── planner.ts        # Project JSON planner
│   │   ├── generator.ts      # Project generator from plan
│   │   └── validator.ts      # Validate created files
│   └── utils/
│       └── configHelper.ts   # Store model settings
├── bin/                      # Compiled output
├── package.json
├── tsconfig.json
└── README.md

---

## Config Storage

Model selections are stored in:

\~/.shreeAgentCli/config.json

Example content:

{
"chatModel": "deepseek-coder",
"generateModel": "starcoder",
"validateModel": "deepseek-coder"
}

---

## Example Flow

```bash
node ./bin/index.js
```

Choose:

1. Project Discussion → save `my-api.json`
2. Project Generation → select `my-api.json` + model
3. Project Validation → check all generated files
4. Chat → ask questions, insert into files

```
