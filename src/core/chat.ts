import fs from 'fs';
import path from 'path';
import axios from 'axios';
import inquirer from 'inquirer';
import readline from 'readline';
import { loadConfig, saveConfig } from '../utils/configHelper.js';

const OLLAMA_URL = 'http://localhost:11434';

export async function startChat() {
  const modelList = await getModelList();
  if (modelList.length === 0) {
    console.error('No models found from Ollama.');
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

  console.log(`\nOllama Chat Interface - Model: ${selectedModel}\n`);
  console.log(`Type your message below. Type 'exit' to return to the main menu.\n`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  while (true) {
    const userInput = await new Promise<string>(resolve => {
      rl.question('You: ', resolve);
    });

    if (userInput.toLowerCase() === 'exit') {
      rl.close();
      break;
    }

    try {
      // const res = await axios.post(`${OLLAMA_URL}/api/chat`, {
        const res = await axios.post(`${OLLAMA_URL}/api/generate`, {
        model: selectedModel,
        prompt: userInput,
        // prompt: `You are a helpful code assistant,\n ${userInput}`,
        // messages: [{ "role": "system", "content": "You are a helpful code assistant." }, { "role": "user", "content": userInput }],
        stream: false,
        // "format": "json",
        "options": {
          "temperature": 0.02,
          // "top_p": 0.9,
          // "repeat_penalty": 1.1,
          // "stop": ["\n\n"]
          // "num_ctx": 2048
        },
        "keep_alive": "5m"
      });

      // const response = res.data?.message?.content?.trim();
      const response = res.data?.response?.trim();
      if (response) {
        console.log(`\nOllama: ${response}\n`);
      } else {
        console.log('\n⚠️ No response from Ollama.\n');
      }
    } catch (e: any) {
      console.error('Error:', e.message);
    }
  }
}

export async function chatWithFileContext(filePath: string) {
  const modelList = await getModelList();
  const config = loadConfig();
  const selectedModel = config.chatModel || modelList[0];

  const content = fs.readFileSync(filePath, 'utf-8');

  const prompt = `This is the content of a file with issues:\n\n${content}\n\nPlease provide suggestions to fix or improve this file.`;

  try {
    const res = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: selectedModel,
      prompt,
      stream: false
    });

    const response = res.data?.response?.trim();
    if (response) {
      console.log('\nOllama Suggestion:\n');
      console.log(response);
    } else {
      console.log('\n⚠️ No suggestion received.\n');
    }
  } catch (e: any) {
    console.error('Chat error:', e.message);
  }
}

async function getModelList(): Promise<string[]> {
  try {
    const res = await axios.get(`${OLLAMA_URL}/api/tags`);
    return res.data.models.map((m: any) => m.name);
  } catch (e: any) {
    console.error('Error fetching models:', e.message);
    return [];
  }
}
