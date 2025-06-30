# shreeAgentCli

**A smart, accessible CLI tool powered by Ollama AI models to help developers plan, generate, and test full-stack projects with ease.**

Command: `taskAgent`

---

## 📦 Features

1. **Chat with Ollama**
   - General-purpose conversation with any local Ollama model.

2. **Project Discussion**
   - Create a full project plan by answering questions.
   - Stores plan as a JSON file in root directory.

3. **Project Generation**
   - Selects a `.json` plan from project root.
   - Asks Ollama to:
     - Generate folder and file structure.
     - Write source code in each file.

4. **Project Validation**
   - Checks if generated files exist and steps match the plan.

---

## ✅ Requirements

- Node.js version 18 or higher
- TypeScript (for development)
- Ollama running locally (`http://localhost:11434`)
- Ollama model installed (e.g., `llama3`, `codellama`, `gemma`, etc.)

---

## 🔧 Installation (Development Mode)

1. Clone this repository:

```
git clone https://github.com/bobbysingh2005/shree-agent-cli.git
cd shreeAgentCli
```
2. 
Install dependencies:
```
npm install
```
3. 
Build project:
```
npm run build
```
4. 
Link CLI command globally:
```
npm link
```
5. 
Now you can run:
```
taskAgent
```


## How to Contribute

We welcome your contributions to improve the CLI!

1. Fork the repository
2. Create a new branch:
   git checkout -b feature/your-feature-name
3. Make changes and add tests
4. Commit and push:
   git commit -m "Add your message"
   git push origin feature/your-feature-name
5. Open a pull request

Please follow the existing file structure and naming conventions.
