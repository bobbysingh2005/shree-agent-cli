import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import axios from 'axios';
import chalk from 'chalk';
import { loadConfig, saveConfig } from '../utils/configHelper.js';

const OLLAMA_URL = 'http://localhost:11434';

export async function startChat() {
  console.log(chalk.yellow('\nOllama Chat Interface\n'));

  // Fetch available models
  console.log('Loading available models from Ollama...');
  let modelList: string[] = [];
  try {
    const res = await axios.get(`${OLLAMA_URL}/api/tags`);
    modelList = res.data.models.map((m: any) => m.name);
    console.log('Models loaded successfully.\n');
  } catch (error) {
    console.log('Error: Failed to fetch models from Ollama.');
    return;
  }

  const modelChoices = modelList.map((name, i) => `${i + 1}. ${name}`);
  const { selectedModelLabel } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedModelLabel',
      message: 'Select an Ollama model to use:',
      choices: modelChoices
    }
  ]);

  const model = selectedModelLabel.split('. ')[1];
  saveConfig({ chatModel: model });

  while (true) {
    const { input } = await inquirer.prompt([
      {
        type: 'input',
        name: 'input',
        message: 'You:',
      }
    ]);

    const userInput = input.trim().toLowerCase();
    if (userInput === ':menu') return;
    if (userInput === ':exit') process.exit();

    console.log('🔁 Sending message to Ollama...\n');

    try {
      const res = await axios.post(`${OLLAMA_URL}/api/generate`, {
        model,
        prompt: input,
        stream: true
      }, {
        responseType: 'stream'
      });

      console.log(chalk.green('💬 Ollama:\n'));

      let buffer = '';
      res.data.on('data', (chunk: Buffer) => {
        const lines = chunk.toString().split('\n').filter(Boolean);
        for (const line of lines) {
          try {
            const json = JSON.parse(line);
            if (json.response) {
              process.stdout.write(json.response);
              buffer += json.response;
            }
          } catch (err) {
            // skip bad JSON line
          }
        }
      });

      await new Promise<void>((resolve) => {
        res.data.on('end', () => {
          console.log('\n');
          resolve();
        });
      });

    } catch (e) {
      console.log('❌ Error: Failed to get response from Ollama.\n');
    }
  }
}
