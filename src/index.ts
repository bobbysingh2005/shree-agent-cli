#!/usr/bin/env node

import inquirer from 'inquirer';
import { Command } from 'commander';
import { startChat } from './core/chat.js';
import { discussProject } from './core/planner.js';
import { generateProject } from './core/generator.js';
import { validateProject } from './core/validator.js';

const program = new Command();

program
  .name('taskAgent')
  .description('Smart CLI Agent for Project Planning, Code Generation and Validation using Ollama.')
  .version('1.0.0');

program
  .option('--help', 'Display help menu')
  .action(async () => {
    while (true) {
      const { choice } = await inquirer.prompt([
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

      if (choice.startsWith('1')) await startChat();
      else if (choice.startsWith('2')) await discussProject();
      else if (choice.startsWith('3')) await generateProject();
      else if (choice.startsWith('4')) await validateProject();
      else break;
    }
  });

program.parse();
