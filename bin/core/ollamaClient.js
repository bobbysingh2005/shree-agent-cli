"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatWithOllama = chatWithOllama;
const inquirer_1 = __importDefault(require("inquirer"));
const axios_1 = __importDefault(require("axios"));
const chalk_1 = __importDefault(require("chalk"));
const configHelper_js_1 = require("../utils/configHelper.js");
const OLLAMA_URL = 'http://localhost:11434';
async function chatWithOllama() {
    console.log(chalk_1.default.yellow('\n🗣️ Chat with Ollama\n'));
    let modelList = [];
    try {
        const res = await axios_1.default.get(`${OLLAMA_URL}/api/tags`);
        modelList = res.data.models.map((m) => m.name);
    }
    catch (error) {
        console.error(chalk_1.default.red(`❌ Failed to fetch models: ${error.message}`));
        return;
    }
    if (modelList.length === 0) {
        console.error(chalk_1.default.red('❌ No models found. Please run: ollama pull <model-name>'));
        return;
    }
    const config = (0, configHelper_js_1.loadConfig)();
    const defaultModel = config.chatModel && modelList.includes(config.chatModel)
        ? config.chatModel
        : modelList[0];
    console.log('\nAvailable models:');
    modelList.forEach((model, index) => {
        const isDefault = model === defaultModel ? ' (default)' : '';
        console.log(`${index + 1}. ${model}${isDefault}`);
    });
    const { modelIndex } = await inquirer_1.default.prompt([
        {
            type: 'input',
            name: 'modelIndex',
            message: `Enter model number to use (1–${modelList.length}):`,
            validate: (input) => {
                const n = Number(input);
                return n >= 1 && n <= modelList.length || `Please enter a number between 1 and ${modelList.length}`;
            }
        }
    ]);
    const selectedModel = modelList[Number(modelIndex) - 1];
    (0, configHelper_js_1.saveConfig)({ chatModel: selectedModel });
    console.log(chalk_1.default.gray(`\n🧠 Using model: ${selectedModel}`));
    console.log(chalk_1.default.gray(`Type ':menu' or 'exit' anytime to return to main menu.\n`));
    while (true) {
        const { userInput } = await inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'userInput',
                message: chalk_1.default.cyan('You:')
            }
        ]);
        const input = userInput.trim().toLowerCase();
        if (['exit', 'quit', ':exit', ':menu', ':back'].includes(input)) {
            console.log(chalk_1.default.green('\n👋 Exiting chat. Returning to main menu...\n'));
            return; // ✅ Return to main menu
        }
        try {
            const res = await axios_1.default.post(`${OLLAMA_URL}/api/chat`, {
                model: selectedModel,
                messages: [{ role: 'user', content: userInput }],
                stream: false
            });
            const reply = res.data.message?.content || '[No response from model]';
            console.log(chalk_1.default.magentaBright(`\n🧠 Ollama: ${reply}\n`));
        }
        catch (error) {
            console.error(chalk_1.default.red(`❌ Error from Ollama: ${error.message}`));
        }
    }
}
