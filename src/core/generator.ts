import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import axios from 'axios';
import chalk from 'chalk';
import { loadConfig, saveConfig } from '../utils/configHelper.js';
import { loadModelConfig } from '../utils/modelConfig.js';

const OLLAMA_URL = 'http://localhost:11434';

export async function generateProject() {
  console.log('\n🧠 Smart Project Generator');
  const modelConfig = loadModelConfig();



  // Step 1: Ask user if they want to use an existing file or create new
  const { planSource } = await inquirer.prompt([
    {
      type: 'list',
      name: 'planSource',
      message: 'Do you want to use an existing project info file or create a new one?',
      choices: [
        { name: 'Use existing (.json, .md, .txt)', value: 'existing' },
        { name: 'Create new project plan (JSON)', value: 'new' }
      ]
    }
  ]);

  let plan: any = {};
  let filePath = '';

  if (planSource === 'existing') {
    const files = fs
      .readdirSync(process.cwd())
      .filter((f) => (f.endsWith('.json') || f.endsWith('.md') || f.endsWith('.txt')) && fs.statSync(f).isFile());

    if (files.length === 0) {
      console.error(chalk.red('❌ No .json, .md, or .txt project info files found in this folder.'));
      return;
    }

    const { selectedFile } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedFile',
        message: '📄 Select a project info file:',
        choices: files,
      },
    ]);

    filePath = path.resolve(selectedFile);
    const ext = path.extname(filePath).toLowerCase();
    const fileRaw = fs.readFileSync(filePath, 'utf-8');

    if (ext === '.json') {
      try {
        plan = JSON.parse(fileRaw);
      } catch {
        console.error(chalk.red('❌ Invalid JSON format in selected file.'));
        return;
      }
    } else {
      // For .md/.txt: prompt for missing info, then create a .json plan referencing the file
      let name = '';
      let outputFolder = '';
      const nameMatch = fileRaw.match(/name\s*[:\-]\s*(.+)/i);
      if (nameMatch && nameMatch[1]) {
        name = nameMatch[1].trim();
      }
      if (!name) {
        const resp = await inquirer.prompt({ type: 'input', name: 'name', message: 'Enter project name:' });
        name = resp.name;
      }
      const folderMatch = fileRaw.match(/outputFolder\s*[:\-]\s*(.+)/i);
      if (folderMatch && folderMatch[1]) {
        outputFolder = folderMatch[1].trim();
      }
      if (!outputFolder) {
        const resp = await inquirer.prompt({ type: 'input', name: 'outputFolder', message: 'Enter output folder name:' });
        outputFolder = resp.outputFolder;
      }
      plan = {
        name,
        outputFolder,
        referenceFile: path.basename(filePath)
      };
      // Save to .json file
      const fileName = `${name.replace(/\s+/g, '_')}.json`;
      const planPath = path.resolve(fileName);
      fs.writeFileSync(planPath, JSON.stringify(plan, null, 2), 'utf-8');
      filePath = planPath;
      console.log(chalk.green(`\nProject plan saved as ${fileName} (references ${plan.referenceFile})`));
    }
  } else {
    // Create new project plan
    const { name, description, outputFolder, steps } = await inquirer.prompt([
      { type: 'input', name: 'name', message: 'Project name:' },
      { type: 'input', name: 'description', message: 'Project description:' },
      { type: 'input', name: 'outputFolder', message: 'Output folder name:' },
      { type: 'editor', name: 'steps', message: 'Project steps (one per line):' }
    ]);
    plan = {
      name,
      description,
      outputFolder,
      steps: steps.split(/\r?\n/).map((s: string) => s.trim()).filter(Boolean)
    };
    // Save to .json file
    const fileName = `${name.replace(/\s+/g, '_')}.json`;
    filePath = path.resolve(fileName);
    fs.writeFileSync(filePath, JSON.stringify(plan, null, 2), 'utf-8');
    console.log(chalk.green(`\nProject plan saved as ${fileName}`));
  }

  // Fallback: prompt user for missing info
  if (!plan.description) {
    const { desc } = await inquirer.prompt({ type: 'input', name: 'desc', message: 'Enter project description:' });
    plan.description = desc;
  }
  if (!plan.outputFolder) {
    const { folder } = await inquirer.prompt({ type: 'input', name: 'folder', message: 'Enter output folder name:' });
    plan.outputFolder = folder;
  }
  if (!plan.name) {
    const { pname } = await inquirer.prompt({ type: 'input', name: 'pname', message: 'Enter project name:' });
    plan.name = pname;
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

  if (modelList.length === 0) {
    console.error(chalk.red('❌ No Ollama models found. Please run: ollama pull <model-name>'));
    return;
  }

  // Prompt user to select models for structure and code generation
  const { structureModel } = await inquirer.prompt([
    {
      type: 'list',
      name: 'structureModel',
      message: 'Select model for folder structure generation:',
      choices: modelList,
      default: modelConfig.analysis && modelList.includes(modelConfig.analysis) ? modelConfig.analysis : modelList[0],
    },
  ]);

  const { devModel } = await inquirer.prompt([
    {
      type: 'list',
      name: 'devModel',
      message: 'Select model for code generation:',
      choices: modelList,
      default: modelConfig.development && modelList.includes(modelConfig.development) ? modelConfig.development : modelList[0],
    },
  ]);

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
  console.log(`\n📁 Generating folder structure using model: ${structureModel}...`);
  let fileList: string[] = [];

  try {
    const res = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: structureModel,
      prompt: promptStructure,
      stream: false,
      options:{ temperature: 0.7 }
    });

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
  } // endFor

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

    console.log(chalk.gray(`\n💡 Generating (${index}/${fileList.length}): ${relPath} using model: ${devModel}`));

    try {
      const res = await axios.post(`${OLLAMA_URL}/api/generate`, {
        model: devModel,
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
  // Show plan file name if available
  if (filePath) {
    console.log(chalk.cyan(`📄 Plan File: ${path.basename(filePath)}`));
  }
  console.log(chalk.cyan(`🤖 Folder Structure Model: ${structureModel}`));
  console.log(chalk.cyan(`🤖 Development Model: ${devModel}`));
  console.log(chalk.cyan(`📝 Files Created: ${fileList.length}`));
  if (plan.steps && Array.isArray(plan.steps)) {
    console.log(chalk.cyan(`🪜 Steps Defined: ${plan.steps.length}`));
  }
  console.log(chalk.greenBright(`\n🎉 Your project is ready!\n`));
}
// End of generateProject
