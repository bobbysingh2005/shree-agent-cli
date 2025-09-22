import fs from 'fs';
import path from 'path';
import axios from 'axios';
import inquirer from 'inquirer';
import readline from 'readline';
import { loadConfig, saveConfig } from '../utils/configHelper.js';
import { logError } from '../utils/logger.js';
import { saveSession, loadSession, listSessions } from '../utils/sessionManager.js';

const OLLAMA_URL = 'http://localhost:11434';


export async function startChat() {
  // Show platform info and tips
  const { getPlatformInfo } = await import('./osHelper.js');
  const platform = getPlatformInfo();
  console.log(`\n[Platform: ${platform.name}]  [Shell: ${platform.shell}]`);
  platform.tips.forEach(tip => console.log('•', tip));
  const modelList = await getModelList();
  if (modelList.length === 0) {
    const msg = 'No models found from Ollama.';
    console.error(msg);
    logError(msg);
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
  console.log(`Type your message below. Type ':save <name>' to save, ':load <name>' to load, ':sessions' to list, or 'exit' to return to the main menu.\n`);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // Load last session if exists
  let messages: string[] = [];
  const lastSessions = listSessions();
  if (lastSessions.length > 0) {
    const last = lastSessions[lastSessions.length - 1];
    const loaded = loadSession(last);
    if (loaded) {
      messages = loaded;
      console.log(`\n[Resuming last session: ${last}]\n`);
      messages.forEach((msg, i) => console.log(`${i + 1}: ${msg}`));
    }
  }

  // Toolbox integration
  const { toolbox } = await import('./toolbox.js');

  // System prompt: describe available tools
  const systemPrompt = `You are an agentic CLI assistant. You can use the following tools by responding with <<TOOL:toolName[:arg]>>. Tools: listDir, readFile:<file>, writeFile:<file>:<content>, generateCode:<prompt>, validateProject, analyzeProject. Example: <<TOOL:listDir>> or <<TOOL:readFile:README.md>>.`;

  while (true) {
    const userInput = await new Promise<string>(resolve => {
      rl.question('You: ', resolve);
    });

    if (userInput.toLowerCase() === 'exit') {
      rl.close();
      break;
    }
    if (userInput.startsWith(':save ')) {
      const name = userInput.slice(6).trim();
      saveSession(name, messages);
      console.log(`Session saved as '${name}'.`);
      continue;
    }
    if (userInput.startsWith(':load ')) {
      const name = userInput.slice(6).trim();
      const loaded = loadSession(name);
      if (loaded) {
        messages = loaded;
        console.log(`Session '${name}' loaded. Previous messages:`);
        messages.forEach((msg, i) => console.log(`${i + 1}: ${msg}`));
      } else {
        console.log(`No session found with name '${name}'.`);
      }
      continue;
    }
    if (userInput === ':sessions') {
      const sessions = listSessions();
      if (sessions.length === 0) {
        console.log('No saved sessions.');
      } else {
        console.log('Saved sessions:', sessions.join(', '));
      }
      continue;
    }

    // Default: send to model (with system prompt and history)
    let promptToSend = systemPrompt + '\n';
    messages.forEach(m => { promptToSend += m + '\n'; });
    promptToSend += `You: ${userInput}`;

    try {
      const res = await axios.post(`${OLLAMA_URL}/api/generate`, {
        model: selectedModel,
        prompt: promptToSend,
        stream: false,
        options: { temperature: 0.02 },
        keep_alive: '5m'
      });
      let response = res.data?.response?.trim();
      if (response) {
        // Tool-calling loop
        let toolMatch;
        const toolRegex = /<<TOOL:([\w]+)(?::([^>]+))?>>/g;
        let toolUsed = false;
        while ((toolMatch = toolRegex.exec(response))) {
          toolUsed = true;
          const tool = toolMatch[1];
          const arg = toolMatch[2];
          let toolResult = '';
          // Human-in-the-loop confirmation
          const { confirm } = await inquirer.prompt({
            type: 'confirm',
            name: 'confirm',
            message: `AI wants to run: ${tool}${arg ? ' (' + arg + ')' : ''}. Do you approve?`,
            default: false
          });
          if (!confirm) {
            toolResult = '[Action skipped by user]';
            console.log(`\n[Tool: ${tool}]\nAction skipped by user.\n`);
            messages.push(`Tool: ${tool} ${arg || ''}`);
            messages.push('Result: [Action skipped by user]');
            continue;
          }
          try {
            if (tool === 'listDir') {
              const files = toolbox.listDir();
              toolResult = files.map(f => f.isDirectory ? `[DIR] ${f.name}` : `     ${f.name}`).join('\n');
            } else if (tool === 'readFile' && arg) {
              toolResult = toolbox.readFile(arg);
            } else if (tool === 'writeFile' && arg) {
              const [file, ...rest] = arg.split(':');
              const content = rest.join(':');
              toolbox.writeFile(file, content);
              toolResult = `File '${file}' written.`;
            } else if (tool === 'generateCode' && arg) {
              toolResult = await toolbox.generateCode(arg, selectedModel);
            } else if (tool === 'validateProject') {
              toolResult = await toolbox.validateProject();
            } else if (tool === 'analyzeProject') {
              toolResult = await toolbox.analyzeProject();
            } else {
              toolResult = 'Unknown tool or missing argument.';
            }
          } catch (e: any) {
            toolResult = 'Tool error: ' + e.message;
          }
          // Show tool result and append to messages
          console.log(`\n[Tool: ${tool}]\n${toolResult}\n`);
          messages.push(`Tool: ${tool} ${arg || ''}`);
          messages.push(`Result: ${toolResult}`);
        }
        if (!toolUsed) {
          console.log(`\nOllama: ${response}\n`);
          messages.push(`You: ${userInput}`);
          messages.push(`Ollama: ${response}`);
        }
      } else {
        console.log('\n⚠️ No response from Ollama.\n');
      }
    } catch (e: any) {
      console.error('Error:', e.message);
    }
    // Always save session after each turn
    saveSession('last', messages);
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
