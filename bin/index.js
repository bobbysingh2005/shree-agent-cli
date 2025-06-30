#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer_1 = __importDefault(require("inquirer"));
const commander_1 = require("commander");
const chat_js_1 = require("./core/chat.js");
const planner_js_1 = require("./core/planner.js");
const generator_js_1 = require("./core/generator.js");
const validator_js_1 = require("./core/validator.js");
const program = new commander_1.Command();
program
    .name('taskAgent')
    .description('Smart CLI Agent for Project Planning, Code Generation and Validation using Ollama.')
    .version('1.0.0');
program
    .option('--help', 'Display help menu')
    .action(async () => {
    while (true) {
        const { choice } = await inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'choice',
                message: 'What do you want to do?',
                choices: [
                    '1. Chat with Ollama',
                    '2. Project Discussion',
                    '3. Project Generation',
                    '4. Project Validation',
                    '5. Exit'
                ]
            }
        ]);
        if (choice.startsWith('1'))
            await (0, chat_js_1.startChat)();
        else if (choice.startsWith('2'))
            await (0, planner_js_1.discussProject)();
        else if (choice.startsWith('3'))
            await (0, generator_js_1.generateProject)();
        else if (choice.startsWith('4'))
            await (0, validator_js_1.validateProject)();
        else
            break;
    }
});
program.parse();
