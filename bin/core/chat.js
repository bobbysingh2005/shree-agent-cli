"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startChat = startChat;
const inquirer_1 = __importDefault(require("inquirer"));
const axios_1 = __importDefault(require("axios"));
const chalk_1 = __importDefault(require("chalk"));
const configHelper_js_1 = require("../utils/configHelper.js");
const OLLAMA_URL = 'http://localhost:11434';
async function startChat() {
    console.log(chalk_1.default.yellow('\nOllama Chat Interface\n'));
    // Fetch available models
    console.log('Loading available models from Ollama...');
    let modelList = [];
    try {
        const res = await axios_1.default.get(`${OLLAMA_URL}/api/tags`);
        modelList = res.data.models.map((m) => m.name);
        console.log('Models loaded successfully.\n');
    }
    catch (error) {
        console.log('Error: Failed to fetch models from Ollama.');
        return;
    }
    const modelChoices = modelList.map((name, i) => `${i + 1}. ${name}`);
    const { selectedModelLabel } = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'selectedModelLabel',
            message: 'Select an Ollama model to use:',
            choices: modelChoices
        }
    ]);
    const model = selectedModelLabel.split('. ')[1];
    (0, configHelper_js_1.saveConfig)({ chatModel: model });
    while (true) {
        const { input } = await inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'input',
                message: 'You:',
            }
        ]);
        const userInput = input.trim().toLowerCase();
        if (userInput === ':menu')
            return;
        if (userInput === ':exit')
            process.exit();
        console.log('🔁 Sending message to Ollama...\n');
        try {
            const res = await axios_1.default.post(`${OLLAMA_URL}/api/generate`, {
                model,
                prompt: input,
                stream: true
            }, {
                responseType: 'stream'
            });
            console.log(chalk_1.default.green('💬 Ollama:\n'));
            let buffer = '';
            res.data.on('data', (chunk) => {
                const lines = chunk.toString().split('\n').filter(Boolean);
                for (const line of lines) {
                    try {
                        const json = JSON.parse(line);
                        if (json.response) {
                            process.stdout.write(json.response);
                            buffer += json.response;
                        }
                    }
                    catch (err) {
                        // skip bad JSON line
                    }
                }
            });
            await new Promise((resolve) => {
                res.data.on('end', () => {
                    console.log('\n');
                    resolve();
                });
            });
        }
        catch (e) {
            console.log('❌ Error: Failed to get response from Ollama.\n');
        }
    }
}
