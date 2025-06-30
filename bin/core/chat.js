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
    // Step 1: Fetch model list
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
            console.error('Unknown error fetching models.');
        }
        return;
    }
    const config = (0, configHelper_js_1.loadConfig)();
    const defaultModel = config.chatModel && modelList.includes(config.chatModel)
        ? config.chatModel
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
    (0, configHelper_js_1.saveConfig)({ chatModel: selectedModel });
    // Step 2: Chat loop
    const history = [];
    const exitCommands = ['exit', 'quit', 'back', 'menu', ':exit', ':quit', ':menu'];
    while (true) {
        const { userInput } = await inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'userInput',
                message: 'You:'
            }
        ]);
        const trimmed = userInput.trim().toLowerCase();
        if (exitCommands.includes(trimmed)) {
            console.log(chalk_1.default.cyan('\nReturning to main menu...\n'));
            break;
        }
        history.push({ role: 'user', content: userInput });
        let responseText = '';
        try {
            const res = await axios_1.default.post(`${OLLAMA_URL}/api/chat`, {
                model: selectedModel,
                messages: history
            });
            const messageObj = res.data.message;
            if (messageObj && messageObj.content) {
                responseText = messageObj.content.trim();
            }
            else {
                // fallback to /api/generate
                const fallback = await axios_1.default.post(`${OLLAMA_URL}/api/generate`, {
                    model: selectedModel,
                    prompt: userInput,
                    stream: false
                });
                responseText = fallback.data.response.trim();
            }
        }
        catch (e) {
            if (e instanceof Error) {
                console.error(`Error: ${e.message}`);
            }
            else {
                console.error('Unknown error occurred.');
            }
            continue;
        }
        history.push({ role: 'assistant', content: responseText });
        console.log(chalk_1.default.greenBright(`\nAssistant:\n${responseText}\n`));
    }
}
