#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer_1 = __importDefault(require("inquirer"));
const ollamaClient_js_1 = require("./core/ollamaClient.js");
const planner_js_1 = require("./core/planner.js");
const generator_js_1 = require("./core/generator.js");
const validator_js_1 = require("./core/validator.js");
const chalk_1 = __importDefault(require("chalk"));
async function mainMenu() {
    console.log(chalk_1.default.yellow('\n=== Welcome to ShreeAgent CLI ===\n'));
    console.log('1. Chat with Ollama');
    console.log('2. Project Discussion');
    console.log('3. Project Generation');
    console.log('4. Project Validation');
    console.log('5. Exit\n');
    const { numberChoice } = await inquirer_1.default.prompt([
        {
            type: 'input',
            name: 'numberChoice',
            message: 'Please type a number (1–5) and press Enter:',
            validate: (input) => {
                const n = Number(input);
                return n >= 1 && n <= 5 || 'Please enter a number between 1 and 5';
            }
        }
    ]);
    switch (Number(numberChoice)) {
        case 1:
            await (0, ollamaClient_js_1.chatWithOllama)();
            break;
        case 2:
            await (0, planner_js_1.discussProject)();
            break;
        case 3:
            await (0, generator_js_1.generateProject)();
            break;
        case 4:
            await (0, validator_js_1.validateProject)();
            break;
        case 5:
        default:
            console.log(chalk_1.default.green('\n👋 Goodbye!\n'));
            return;
    }
    await mainMenu(); // repeat menu
}
mainMenu();
