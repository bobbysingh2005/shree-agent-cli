import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import axios from 'axios';
import chalk from 'chalk';
import { loadConfig, saveConfig } from '../utils/configHelper.js';

const OLLAMA_URL = 'http://localhost:11434';

export async function generateProject() {
  console.log(chalk.yellow('\nSmart Project Generator'));

  // 1. List available .json plans
  const files = fs.readdirSync(process.cwd()).filter(f => f.endsWith('.json'));
  if (files.length === 0) {
    console.error(chalk.red('No .json project plan files found.'));
    return;
  }

  const { selectedFile } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedFile',
      message: 'Select a project plan file:',
      choices: files
    }
  ]);

  const plan = JSON.parse(fs.readFileSync(path.resolve(selectedFile), 'utf-8'));

  // 2. Fetch model list
  let modelList = [];
  try {
    const res = await axios.get(`${OLLAMA_URL}/api/tags`);
    modelList = res.data.models.map((m: any) => m.name);
  } catch (error: any) {
    console.error(`Failed to fetch models: ${error.message}`);
    return;
  }

  const config = loadConfig();
  const defaultModel = config.generateModel && modelList.includes(config.generateModel)
    ? config.generateModel
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

  saveConfig({ generateModel: selectedModel });

  // 3. Ask Ollama for structure
  const promptStructure = `
You are an AI assistant. Based on this project description:
"""
${plan.description}
"""
Generate a list of all important files (with relative paths) required to implement this project.
Return only a JSON array like: ["src/index.ts", "src/routes/user.ts", "README.md"]
Do NOT return code or explanation.
`;

  console.log('\nGenerating folder structure...');
  let fileList: string[] = [];
  try {
    const res = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: selectedModel,
      prompt: promptStructure,
      stream: false
    });
    fileList = JSON.parse(res.data.response);
  } catch (error: any) {
    console.error(`Failed to generate structure: ${error.message}`);
    return;
  }

  const base = path.resolve(process.cwd(), plan.name.replace(/\s+/g, '_'));
  if (!fs.existsSync(base)) fs.mkdirSync(base);

  for (const relPath of fileList) {
    const fullPath = path.join(base, relPath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, '// Placeholder for AI-generated code');
  }

  console.log(`Created ${fileList.length} files.`);

  // 4. Generate content for each file
  for (const relPath of fileList) {
    const filePrompt = `Generate complete code for file: ${relPath}.
It is part of this project: ${plan.description}
Only return valid code.`;

    try {
      const res = await axios.post(`${OLLAMA_URL}/api/generate`, {
        model: selectedModel,
        prompt: filePrompt,
        stream: false
      });
      const code = res.data.response.trim();
      const fullPath = path.join(base, relPath);
      fs.writeFileSync(fullPath, code);
      console.log(`Generated: ${relPath}`);
    } catch (error: any) {
      console.error(`Failed on ${relPath}: ${error.message}`);
    }
  }

  console.log(`\nProject created in: ${base}\n`);
}
