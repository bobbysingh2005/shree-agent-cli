"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateProject = generateProject;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const inquirer_1 = __importDefault(require("inquirer"));
const axios_1 = __importDefault(require("axios"));
const chalk_1 = __importDefault(require("chalk"));
const configHelper_js_1 = require("../utils/configHelper.js");
const OLLAMA_URL = 'http://localhost:11434';
async function generateProject() {
    console.log(chalk_1.default.yellow('\nSmart Project Generator'));
    // 1. List available .json plans
    const files = fs_1.default.readdirSync(process.cwd()).filter(f => f.endsWith('.json'));
    if (files.length === 0) {
        console.error(chalk_1.default.red('No .json project plan files found.'));
        return;
    }
    const { selectedFile } = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'selectedFile',
            message: 'Select a project plan file:',
            choices: files
        }
    ]);
    const plan = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(selectedFile), 'utf-8'));
    // 2. Fetch model list
    let modelList = [];
    try {
        const res = await axios_1.default.get(`${OLLAMA_URL}/api/tags`);
        modelList = res.data.models.map((m) => m.name);
    }
    catch (error) {
        console.error(`Failed to fetch models: ${error.message}`);
        return;
    }
    const config = (0, configHelper_js_1.loadConfig)();
    const defaultModel = config.generateModel && modelList.includes(config.generateModel)
        ? config.generateModel
        : modelList[0];
    const { selectedModel } = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'selectedModel',
            message: 'Select an Ollama model to use:',
            choices: modelList,
            default: defaultModel
        }
    ]);
    (0, configHelper_js_1.saveConfig)({ generateModel: selectedModel });
    // 3. Ask Ollama for structure
    const promptStructure = `
You are an AI assistant. Based on this project description:
"""
${plan.description}
"""
Generate a list of all important files (with relative paths) required to implement this project.
Return only a JSON array like: ["src/index.ts", "src/routes/user.ts", "README.md"]
Do NOT return code or explanation.
`;
    console.log('\nGenerating folder structure...');
    let fileList = [];
    try {
        const res = await axios_1.default.post(`${OLLAMA_URL}/api/generate`, {
            model: selectedModel,
            prompt: promptStructure,
            stream: false
        });
        fileList = JSON.parse(res.data.response);
    }
    catch (error) {
        console.error(`Failed to generate structure: ${error.message}`);
        return;
    }
    const base = path_1.default.resolve(process.cwd(), plan.name.replace(/\s+/g, '_'));
    if (!fs_1.default.existsSync(base))
        fs_1.default.mkdirSync(base);
    for (const relPath of fileList) {
        const fullPath = path_1.default.join(base, relPath);
        const dir = path_1.default.dirname(fullPath);
        if (!fs_1.default.existsSync(dir))
            fs_1.default.mkdirSync(dir, { recursive: true });
        fs_1.default.writeFileSync(fullPath, '// Placeholder for AI-generated code');
    }
    console.log(`Created ${fileList.length} files.`);
    // 4. Generate content for each file
    for (const relPath of fileList) {
        const filePrompt = `Generate complete code for file: ${relPath}.
It is part of this project: ${plan.description}
Only return valid code.`;
        try {
            const res = await axios_1.default.post(`${OLLAMA_URL}/api/generate`, {
                model: selectedModel,
                prompt: filePrompt,
                stream: false
            });
            const code = res.data.response.trim();
            const fullPath = path_1.default.join(base, relPath);
            fs_1.default.writeFileSync(fullPath, code);
            console.log(`Generated: ${relPath}`);
        }
        catch (error) {
            console.error(`Failed on ${relPath}: ${error.message}`);
        }
    }
    console.log(`\nProject created in: ${base}\n`);
}
