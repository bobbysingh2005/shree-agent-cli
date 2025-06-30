import inquirer from 'inquirer';
import axios from 'axios';
import chalk from 'chalk';
import { loadConfig, saveConfig } from '../utils/configHelper.js';

const OLLAMA_URL = 'http://localhost:11434';

export async function startChat() {
  console.log(chalk.yellow('\nOllama Chat Interface\n'));

  // 1. Fetch available models
  let modelList: string[] = [];
  try {
    const res = await axios.get(`${OLLAMA_URL}/api/tags`);
    modelList = res.data.models.map((m: { name: string }) => m.name);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error fetching models: ${error.message}`);
    } else {
      console.error('Unknown error fetching models.');
    }
    return;
  }

  const config = loadConfig();
  const defaultModel = config.chatModel && modelList.includes(config.chatModel)
    ? config.chatModel
    : modelList[0];

  // 2. Let user select model with accessible list
  const { selectedModel } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedModel',
      message: 'Select an Ollama model to use:',
      choices: modelList,
      default: defaultModel
    }
  ]);

  saveConfig({ chatModel: selectedModel });

  // 3. Begin chat loop
  const history: { role: string; content: string }[] = [];

  while (true) {
    const { userInput } = await inquirer.prompt([
      {
        type: 'input',
        name: 'userInput',
        message: 'You:'
      }
    ]);

    const trimmed = userInput.trim().toLowerCase();
    if (trimmed === 'exit' || trimmed === 'quit' || trimmed === 'back') {
      console.log(chalk.cyan('\nReturning to main menu...\n'));
      break;
    }

    history.push({ role: 'user', content: userInput });

    try {
      const res = await axios.post(`${OLLAMA_URL}/api/chat`, {
        model: selectedModel,
        messages: history
      });

      const response = res.data.message.content.trim();
      history.push({ role: 'assistant', content: response });

      console.log(chalk.greenBright(`\nAssistant:\n${response}\n`));
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error(`Error: ${e.message}`);
      } else {
        console.error('Unknown error occurred during chat.');
      }
    }
  }
}
