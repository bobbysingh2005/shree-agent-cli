#!/usr/bin/env node

import inquirer from 'inquirer';
import { chatWithOllama } from './core/ollamaClient.js';
import { discussProject } from './core/planner.js';
import { generateProject } from './core/generator.js';
import { validateProject } from './core/validator.js';
import chalk from 'chalk';

async function mainMenu(): Promise<void> {
  console.log(chalk.yellow('\n=== Welcome to ShreeAgent CLI ===\n'));
  console.log('1. Chat with Ollama');
  console.log('2. Project Discussion');
  console.log('3. Project Generation');
  console.log('4. Project Validation');
  console.log('5. Exit\n');

  const { numberChoice } = await inquirer.prompt([
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
      await chatWithOllama();
      break;
    case 2:
      await discussProject();
      break;
    case 3:
      await generateProject();
      break;
    case 4:
      await validateProject();
      break;
    case 5:
    default:
      console.log(chalk.green('\n👋 Goodbye!\n'));
      return;
  }

  await mainMenu(); // repeat menu
}

mainMenu();
