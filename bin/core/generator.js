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
    console.log(chalk_1.default.yellow('\nProject Generation\n'));
    // Step 1: List only .json files from root directory
    const files = fs_1.default.readdirSync(process.cwd()).filter(f => f.endsWith('.json'));
    if (files.length === 0) {
        console.error(chalk_1.default.red('No .json project plan files found in root folder.'));
        return;
    }
    const { selectedFileName } = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'selectedFileName',
            message: 'Select a project plan file:',
            choices: files
        }
    ]);
    const selectedFilePath = path_1.default.resolve(process.cwd(), selectedFileName);
    // Step 2: Read and parse the selected JSON file
    let plan = { description: '' };
    try {
        const raw = fs_1.default.readFileSync(selectedFilePath, 'utf-8');
        plan = JSON.parse(raw);
    }
    catch {
        console.error(chalk_1.default.red('Invalid JSON. Please check your file format.'));
        return;
    }
    if (!plan.description) {
        console.error(chalk_1.default.red('Missing project description in selected file.'));
        return;
    }
    // Step 3: Get Ollama model list
    let modelList = [];
    try {
        const res = await axios_1.default.get(`${OLLAMA_URL}/api/tags`);
        modelList = res.data.models.map((m) => m.name);
    }
    catch (e) {
        if (e instanceof Error) {
            console.error(`Failed to fetch models: ${e.message}`);
        }
        else {
            console.error('Unknown error fetching models.');
        }
        return;
    }
    // Step 3a: Show model list with numbers for accessibility
    const modelChoices = modelList.map((name, i) => `${i + 1}. ${name}`);
    const { selectedModelLabel } = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'selectedModelLabel',
            message: 'Select a model:',
            choices: modelChoices
        }
    ]);
    const selectedModel = selectedModelLabel.split('. ')[1];
    (0, configHelper_js_1.saveConfig)({ generateModel: selectedModel });
    // Step 4: Ask Ollama for file list
    const structurePrompt = `
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
            prompt: structurePrompt,
            stream: false
        });
        fileList = JSON.parse(res.data.response);
    }
    catch (e) {
        if (e instanceof Error) {
            console.error(`Failed to generate structure: ${e.message}`);
        }
        else {
            console.error('Unknown error generating structure.');
        }
        return;
    }
    const baseName = plan.name && typeof plan.name === 'string'
        ? plan.name.replace(/\s+/g, '_')
        : path_1.default.basename(selectedFileName, '.json');
    const base = path_1.default.resolve(process.cwd(), baseName);
    if (!fs_1.default.existsSync(base))
        fs_1.default.mkdirSync(base);
    for (const relPath of fileList) {
        const fullPath = path_1.default.join(base, relPath);
        const dir = path_1.default.dirname(fullPath);
        if (!fs_1.default.existsSync(dir))
            fs_1.default.mkdirSync(dir, { recursive: true });
        fs_1.default.writeFileSync(fullPath, '// Placeholder for AI-generated code');
    }
    console.log(chalk_1.default.green(`Created ${fileList.length} files.`));
    // Step 5: Generate content for each file
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
            console.log(chalk_1.default.green(`✅ ${relPath}`));
        }
        catch (e) {
            if (e instanceof Error) {
                console.error(`❌ Failed on ${relPath}: ${e.message}`);
            }
            else {
                console.error(`❌ Unknown error on file: ${relPath}`);
            }
        }
    }
    console.log(chalk_1.default.greenBright(`\nProject created in folder: ${base}\n`));
}
