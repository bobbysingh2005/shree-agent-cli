import fs from 'fs';
import inquirer from 'inquirer';
import axios from 'axios';
import readline from 'readline';
import { loadConfig, saveConfig } from '../utils/configHelper.js';

export async function chatWithFileContext(plan: any, missingFiles: string[]) {
  const config = loadConfig();

  let modelList: string[] = [];
  try {
    const res = await axios.get('http://localhost:11434/api/tags');
    modelList = res.data.models.map((m: any) => m.name);
  } catch (err: any) {
    console.error('❌ Failed to load models:', err.message);
    return;
  }

  const defaultModel = config.chatContextModel && modelList.includes(config.chatContextModel)
    ? config.chatContextModel
    : modelList[0];

  const { model } = await inquirer.prompt([
    {
      type: 'list',
      name: 'model',
      message: '🤖 Select model for file context discussion:',
      choices: modelList,
      default: defaultModel
    }
  ]);

  saveConfig({ chatContextModel: model });

  console.log('\n💬 Starting context-aware chat...\n');
  console.log('📁 Project:', plan.name);
  console.log('❌ Missing files:', missingFiles.join(', '), '\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  while (true) {
    const userMessage = await new Promise<string>(resolve => {
      rl.question('? You: ', resolve);
    });

    if (userMessage.toLowerCase() === ':exit') break;

    const prompt = `
Project Description:
${plan.description}

Missing Files:
${missingFiles.join('\n')}

User Message:
${userMessage}

Now respond as a helpful assistant and give suggestions or solutions.
`;

    try {
      const res = await axios.post('http://localhost:11434/api/generate', {
        model,
        prompt,
        stream: false
      });

      const reply = res.data.response.trim();
      console.log('\n🤖 Ollama:\n' + reply + '\n');
    } catch (e: any) {
      console.error('❌ Chat failed:', e.message);
    }
  }

  rl.close();
}
