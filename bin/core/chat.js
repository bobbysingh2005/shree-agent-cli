"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startChat = startChat;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const inquirer_1 = __importDefault(require("inquirer"));
const axios_1 = __importDefault(require("axios"));
const configHelper_js_1 = require("../utils/configHelper.js");
const OLLAMA_URL = 'http://localhost:11434';
async function startChat() {
    console.log('Chat Mode - Ask anything about your project');
    const files = fs_1.default.readdirSync(process.cwd()).filter(f => f.endsWith('.json'));
    if (files.length === 0) {
        console.error('No .json project plan files found.');
        return;
    }
    const { selectedFile } = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'selectedFile',
            message: 'Select a project plan for context:',
            choices: files
        }
    ]);
    const plan = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(selectedFile), 'utf-8'));
    const projectPath = path_1.default.resolve(process.cwd(), plan.name.replace(/\s+/g, '_'));
    let modelList = [];
    try {
        const res = await axios_1.default.get(`${OLLAMA_URL}/api/tags`);
        modelList = res.data.models.map((m) => m.name);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error fetching models: ${error.message}`);
        }
        else {
            console.error('Unknown error while fetching models.');
        }
        return;
    }
    const config = (0, configHelper_js_1.loadConfig)();
    const defaultModel = config.chatModel && modelList.includes(config.chatModel)
        ? config.chatModel
        : modelList[0];
    const { modelIndex } = await inquirer_1.default.prompt([
        {
            type: 'input',
            name: 'modelIndex',
            message: `Select model number (1 to ${modelList.length}):`,
            validate: (val) => {
                const n = Number(val);
                return n >= 1 && n <= modelList.length || 'Invalid number';
            }
        }
    ]);
    const selectedModel = modelList[Number(modelIndex) - 1];
    (0, configHelper_js_1.saveConfig)({ chatModel: selectedModel });
    let chatHistory = `You are an AI project assistant. This project is described as: ${plan.description}`;
    while (true) {
        const { question } = await inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'question',
                message: 'Ask something (or type exit):'
            }
        ]);
        if (question.toLowerCase() === 'exit')
            break;
        chatHistory += `\nUser: ${question}`;
        try {
            const res = await axios_1.default.post(`${OLLAMA_URL}/api/generate`, {
                model: selectedModel,
                prompt: chatHistory,
                stream: false
            });
            const reply = res.data.response.trim();
            console.log('\nAI:', reply);
            chatHistory += `\nAI: ${reply}`;
            const { insert } = await inquirer_1.default.prompt([
                {
                    type: 'confirm',
                    name: 'insert',
                    message: 'Do you want to insert this into a file?',
                    default: false
                }
            ]);
            if (insert) {
                const allFiles = fs_1.default.readdirSync(projectPath, { withFileTypes: true })
                    .filter(f => f.isFile())
                    .map(f => f.name);
                const { fileChoice } = await inquirer_1.default.prompt([
                    {
                        type: 'list',
                        name: 'fileChoice',
                        message: 'Choose file to insert into:',
                        choices: allFiles
                    }
                ]);
                const fullPath = path_1.default.join(projectPath, fileChoice);
                const { position } = await inquirer_1.default.prompt([
                    {
                        type: 'list',
                        name: 'position',
                        message: 'Where to insert?',
                        choices: ['Top of file', 'Bottom of file']
                    }
                ]);
                const existing = fs_1.default.readFileSync(fullPath, 'utf-8');
                const updated = position === 'Top of file'
                    ? `${reply}\n\n${existing}`
                    : `${existing}\n\n${reply}`;
                fs_1.default.writeFileSync(fullPath, updated);
                console.log(`Inserted into ${fileChoice}`);
            }
        }
        catch (e) {
            if (e instanceof Error) {
                console.error(`Error: ${e.message}`);
            }
            else {
                console.error('Unknown error during chat generation.');
            }
        }
    }
    console.log('Chat session ended.');
}
