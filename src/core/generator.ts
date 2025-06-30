import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import axios from 'axios';
import chalk from 'chalk';
import { loadConfig, saveConfig } from '../utils/configHelper.js';

const OLLAMA_URL = 'http://localhost:11434';

export async function generateProject() {
  console.log(chalk.yellow('\nProject Generation\n'));

  // Step 1: List only .json files from root directory
  const files = fs.readdirSync(process.cwd()).filter(f => f.endsWith('.json'));

  if (files.length === 0) {
    console.error(chalk.red('No .json project plan files found in root folder.'));
    return;
  }

  const { selectedFileName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedFileName',
      message: 'Select a project plan file:',
      choices: files
    }
  ]);

  const selectedFilePath = path.resolve(process.cwd(), selectedFileName);

  // Step 2: Read and parse the selected JSON file
  let plan: { name?: string; description: string } = { description: '' };

  try {
    const raw = fs.readFileSync(selectedFilePath, 'utf-8');
    plan = JSON.parse(raw);
  } catch {
    console.error(chalk.red('Invalid JSON. Please check your file format.'));
    return;
  }

  if (!plan.description) {
    console.error(chalk.red('Missing project description in selected file.'));
    return;
  }

  // Step 3: Get Ollama model list
  let modelList: string[] = [];
  try {
    const res = await axios.get(`${OLLAMA_URL}/api/tags`);
    modelList = res.data.models.map((m: { name: string }) => m.name);
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error(`Failed to fetch models: ${e.message}`);
    } else {
      console.error('Unknown error fetching models.');
    }
    return;
  }

  // Step 3a: Show model list with numbers for accessibility
  const modelChoices = modelList.map((name, i) => `${i + 1}. ${name}`);

  const { selectedModelLabel } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedModelLabel',
      message: 'Select a model:',
      choices: modelChoices
    }
  ]);

  const selectedModel = selectedModelLabel.split('. ')[1];
  saveConfig({ generateModel: selectedModel });

  // Step 4: Ask Ollama for file list
  const structurePrompt = `
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
      prompt: structurePrompt,
      stream: false
    });
    fileList = JSON.parse(res.data.response);
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error(`Failed to generate structure: ${e.message}`);
    } else {
      console.error('Unknown error generating structure.');
    }
    return;
  }

  const baseName = plan.name && typeof plan.name === 'string'
    ? plan.name.replace(/\s+/g, '_')
    : path.basename(selectedFileName, '.json');

  const base = path.resolve(process.cwd(), baseName);
  if (!fs.existsSync(base)) fs.mkdirSync(base);

  for (const relPath of fileList) {
    const fullPath = path.join(base, relPath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, '// Placeholder for AI-generated code');
  }

  console.log(chalk.green(`Created ${fileList.length} files.`));

  // Step 5: Generate content for each file
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
      console.log(chalk.green(`✅ ${relPath}`));
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error(`❌ Failed on ${relPath}: ${e.message}`);
      } else {
        console.error(`❌ Unknown error on file: ${relPath}`);
      }
    }
  }

  console.log(chalk.greenBright(`\nProject created in folder: ${base}\n`));
}
