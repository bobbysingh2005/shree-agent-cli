# 🧠 shreeAgentCli

A fully accessible AI-powered CLI tool for developers.  
It helps with brainstorming, planning, generating, and validating complete projects using local Ollama models.
A powerful AI-powered CLI tool to generate, validate, and interact with code projects using Ollama models — fully screen-reader accessible.

## 📦 Features

- ✅ Chat with Ollama models (streaming real-time)
- ✅ Project Discussion (plan name, description, and steps)
- ✅ Project Generation (generate structure + code)
- ✅ Project Validation (check all expected files exist)
- ✅ File-based context chat after validation
- ✅ Stores config per feature (chat model, gen model, etc.)
- ✅ CLI Help via `taskAgent --help`
- ✅ Fully screen-reader compatible
- ✅ Interactive project steps via CLI (no external editor)

---

## 🚀 CLI Usage

Run the CLI from any terminal:

```sh
taskAgent
````

You'll be prompted with 5 options:

1. Chat with Ollama
2. Project Discussion
3. Project Generation
4. Project Validation
5. Exit

---

## 📁 Project Discussion Flow

Creates a JSON file like `my_project.json`.

You'll be asked for:

* Project name
* Description
* Output folder name (where project will be generated)
* Steps (one-by-one in terminal)

This project plan is reused for generation and validation.

---

## 🧠 Project Generation Flow

* Select an existing JSON plan
* Select Ollama model from list
* AI generates project structure first (as file list)
* Then it generates each file’s content using the model
* Saves files into the `outputFolder` defined earlier

---

## ✅ Validation Flow

Checks that all the files in your step plan or AI-generated structure exist.

Also allows chatting with Ollama based on missing/incomplete files.

---

## 💬 Chat Mode

* Choose model
* Start chatting (streaming enabled)
* Type `:menu` or `:exit` to return to main menu

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

* Node.js (TypeScript)
* Inquirer.js
* Axios
* Chalk
* Ollama (via local REST API)

---

## 🧑‍💻 Author

Smart Topper — blind developer advocate for accessible tools ❤️

```

