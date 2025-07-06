import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import axios from 'axios';
import chalk from 'chalk';
import { loadConfig, saveConfig } from '../utils/configHelper.js';

const OLLAMA_URL = 'http://localhost:11434';

export async function generateProject() {
  console.log('\n🧠 Smart Project Generator');

  // Step 1: List .json project files in current folder
  const files = fs
    .readdirSync(process.cwd())
    .filter((f) => f.endsWith('.json') && fs.statSync(f).isFile());

  if (files.length === 0) {
    console.error(chalk.red('❌ No .json project plan files found in this folder.'));
    return;
  }

  const { selectedFile } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedFile',
      message: '📄 Select a project plan file:',
      choices: files,
    },
  ]);

  const planRaw = fs.readFileSync(path.resolve(selectedFile), 'utf-8');
  let plan: any;

  try {
    plan = JSON.parse(planRaw);
  } catch {
    console.error(chalk.red('❌ Invalid JSON format in selected file.'));
    return;
  }

  if (!plan.description || !plan.outputFolder) {
    console.error(chalk.red('❌ Project plan must include "description" and "outputFolder".'));
    return;
  }

  console.log(chalk.gray(`\n📦 Project: ${plan.name || 'Unnamed'} → Folder: ${plan.outputFolder}`));

  // Step 2: Fetch Ollama models
  let modelList: string[] = [];
  try {
    const res = await axios.get(`${OLLAMA_URL}/api/tags`);
    modelList = res.data.models.map((m: any) => m.name);
  } catch (error: any) {
    console.error(chalk.red(`❌ Failed to fetch models: ${error.message}`));
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
      message: '🤖 Select an Ollama model:',
      choices: modelList,
      default: defaultModel,
    },
  ]);

  saveConfig({ generateModel: selectedModel });

  // Step 3: Ask Ollama to generate structure
  const promptStructure = `
You are an AI assistant. Based on this project description:
"""
${plan.description}
"""
Generate a list of all important files (with relative paths) required to implement this project.
Return only a JSON array like: ["src/index.js", "src/routes/user.js", "README.md"]
Do NOT return code or explanation.
make sure folder and file structure is validate with project requirements.
`;

console.log('Project description: ', plan.description)
  console.log('\n📁 Generating folder structure...');
  let fileList: string[] = [];

  try {
    const res = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: selectedModel,
      prompt: promptStructure,
      stream: false,
      options:{ temperature: 0.7 }
    });//endResponseFolderStructure

    let response = res.data.response.trim();
    console.log('project folder structure with file names: ',response)
    if (response.startsWith('```')) {
      response = response.replace(/```[a-z]*\n?/gi, '').replace(/```$/, '').trim();
    }

    fileList = JSON.parse(response);
  } catch (error: any) {
    console.error(chalk.red(`❌ Failed to get structure: ${error.message}`));
    return;
  }

  const base = path.resolve(process.cwd(), plan.outputFolder);
  if (!fs.existsSync(base)) fs.mkdirSync(base, { recursive: true });

  for (const relPath of fileList) {
    const fullPath = path.join(base, relPath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, '// Placeholder');
  };//endFor

  console.log(chalk.green(`📂 Created ${fileList.length} files.`));

  // Step 4: Generate file contents
  let index = 0;
  for (const relPath of fileList) {
    index++;
    const fullPath = path.join(base, relPath);
    const filePrompt = `Generate complete code for file: ${relPath}.
It is part of this project: ${plan.description}
Only return valid code.
also make sure file content and context is valid and code is well formatted.`;

    console.log(chalk.gray(`\n💡 Generating (${index}/${fileList.length}): ${relPath}`));

    try {
      const res = await axios.post(`${OLLAMA_URL}/api/generate`, {
        model: selectedModel,
        prompt: filePrompt,
        stream: false,
        options:{ temperature: 0.02 }
      });

      let code = res.data.response.trim();
      if (code.startsWith('```')) {
        code = code.replace(/```[a-z]*\n?/gi, '').replace(/```$/, '').trim();
      }

      fs.writeFileSync(fullPath, code);
      console.log(chalk.green(`✅ Saved: ${relPath}`));
    } catch (error: any) {
      console.error(chalk.red(`❌ Failed on ${relPath}: ${error.message}`));
    }
  }

  // Step 5: Summary
  console.log(chalk.bold('\n📋 Project Generation Summary:'));
  console.log(chalk.green(`📁 Output Folder: ${base}`));
  console.log(chalk.cyan(`📄 Plan File: ${selectedFile}`));
  console.log(chalk.cyan(`🤖 Model Used: ${selectedModel}`));
  console.log(chalk.cyan(`📝 Files Created: ${fileList.length}`));
  if (plan.steps && Array.isArray(plan.steps)) {
    console.log(chalk.cyan(`🪜 Steps Defined: ${plan.steps.length}`));
  }
  console.log(chalk.greenBright(`\n🎉 Your project is ready!\n`));
}
