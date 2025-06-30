import inquirer from 'inquirer';
import axios from 'axios';
import chalk from 'chalk';
import { loadConfig, saveConfig } from '../utils/configHelper.js';

const OLLAMA_URL = 'http://localhost:11434';

export async function startChat() {
  console.log(chalk.yellow('\nOllama Chat Interface\n'));

  // Step 1: Fetch model list
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

  // Step 2: Chat loop
  const history: { role: string; content: string }[] = [];
  const exitCommands = ['exit', 'quit', 'back', 'menu', ':exit', ':quit', ':menu'];

  while (true) {
    const { userInput } = await inquirer.prompt([
      {
        type: 'input',
        name: 'userInput',
        message: 'You:'
      }
    ]);

    const trimmed = userInput.trim().toLowerCase();
    if (exitCommands.includes(trimmed)) {
      console.log(chalk.cyan('\nReturning to main menu...\n'));
      break;
    }

    history.push({ role: 'user', content: userInput });

    let responseText = '';

    try {
      const res = await axios.post(`${OLLAMA_URL}/api/chat`, {
        model: selectedModel,
        messages: history
      });

      const messageObj = res.data.message;
      if (messageObj && messageObj.content) {
        responseText = messageObj.content.trim();
      } else {
        // fallback to /api/generate
        const fallback = await axios.post(`${OLLAMA_URL}/api/generate`, {
          model: selectedModel,
          prompt: userInput,
          stream: false
        });
        responseText = fallback.data.response.trim();
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error(`Error: ${e.message}`);
      } else {
        console.error('Unknown error occurred.');
      }
      continue;
    }

    history.push({ role: 'assistant', content: responseText });
    console.log(chalk.greenBright(`\nAssistant:\n${responseText}\n`));
  }
}
