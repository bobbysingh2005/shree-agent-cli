import inquirer from 'inquirer';
import axios from 'axios';
import chalk from 'chalk';
import { loadConfig, saveConfig } from '../utils/configHelper.js';

const OLLAMA_URL = 'http://localhost:11434';

export async function chatWithOllama() {
  console.log(chalk.yellow('\n🗣️ Chat with Ollama\n'));

  let modelList: string[] = [];

  try {
    const res = await axios.get(`${OLLAMA_URL}/api/tags`);
    modelList = res.data.models.map((m: { name: string }) => m.name);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(chalk.red(`❌ Failed to fetch models: ${error.message}`));
    } else {
      console.error(chalk.red(`❌ Failed to fetch models: ${error}`));
    }
    return;
  }

  if (modelList.length === 0) {
    console.error(chalk.red('❌ No models found. Please run: ollama pull <model-name>'));
    return;
  }

  const config = loadConfig();
  const defaultModel =
    config.chatModel && modelList.includes(config.chatModel) ? config.chatModel : modelList[0];

  console.log('\nAvailable models:');
  modelList.forEach((model, index) => {
    const isDefault = model === defaultModel ? ' (default)' : '';
    console.log(`${index + 1}. ${model}${isDefault}`);
  });

  const { modelIndex } = await inquirer.prompt([
    {
      type: 'input',
      name: 'modelIndex',
      message: `Enter model number to use (1–${modelList.length}):`,
      validate: (input) => {
        const n = Number(input);
        return (
          (n >= 1 && n <= modelList.length) ||
          `Please enter a number between 1 and ${modelList.length}`
        );
      },
    },
  ]);

  const selectedModel = modelList[Number(modelIndex) - 1];
  saveConfig({ chatModel: selectedModel });

  console.log(chalk.gray(`\n🧠 Using model: ${selectedModel}`));
  console.log(chalk.gray(`Type ':menu' or 'exit' anytime to return to main menu.\n`));

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { userInput } = await inquirer.prompt([
      {
        type: 'input',
        name: 'userInput',
        message: chalk.cyan('You:'),
      },
    ]);

    const input = userInput.trim().toLowerCase();

    if (['exit', 'quit', ':exit', ':menu', ':back'].includes(input)) {
      console.log(chalk.green('\n👋 Exiting chat. Returning to main menu...\n'));
      return; // ✅ Return to main menu
    }

    try {
      const res = await axios.post(`${OLLAMA_URL}/api/chat`, {
        model: selectedModel,
        messages: [{ role: 'user', content: userInput }],
        stream: false,
      });

      const reply = res.data.message?.content || '[No response from model]';
      console.log(chalk.magentaBright(`\n🧠 Ollama: ${reply}\n`));
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(chalk.red(`❌ Error from Ollama: ${error.message}`));
      } else {
        console.error(chalk.red(`❌ Error from Ollama: ${error}`));
      }
    }
  }
}
