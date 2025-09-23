import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import axios from 'axios';
import chalk from 'chalk';
// import { loadConfig, saveConfig } from '../utils/configHelper.js';
import { loadModelConfig } from '../utils/modelConfig.js';
import { getPlanReviewPrompt } from './aiPrompts.js';

const OLLAMA_URL = 'http://localhost:11434';

export async function generateProject() {
  // Declare plan and filePath at the top so they are accessible after all plan creation logic
  let plan: {
    name?: string;
    outputFolder?: string;
    referenceFile?: string;
    [key: string]: unknown;
  } = {};
  let filePath: string = '';

  // --- All plan and filePath assignment logic above this point ---

  // Step 1.5: AI plan review and improvement (after plan/filePath are set)
  // Uses centralized prompt helper from aiPrompts.ts
  // This block must come after both plan creation paths so plan and filePath are always defined.
  if (plan && filePath && typeof plan.name === 'string' && typeof plan.outputFolder === 'string') {
    try {
      console.log(chalk.cyan('\n🤖 Reviewing project plan with AI for missing or unclear info...'));
      // Use centralized prompt helper
      const reviewPrompt = getPlanReviewPrompt(plan);
      const res = await axios.post(`${OLLAMA_URL}/api/generate`, {
        model: 'llama3', // or use selected model
        prompt: reviewPrompt,
        stream: false,
        options: { temperature: 0.1 },
        keep_alive: '2m',
      });
      const aiResponse = res.data?.response?.trim();
      let improvedPlan = null;
      if (aiResponse) {
        // Try to extract JSON from response
        const jsonMatch = aiResponse.match(/```json([\s\S]*?)```/i);
        let jsonText = '';
        if (jsonMatch) {
          jsonText = jsonMatch[1];
        } else {
          // fallback: try to parse whole response
          jsonText = aiResponse;
        }
        try {
          improvedPlan = JSON.parse(jsonText);
        } catch {
          // ignore if not valid JSON
        }
      }
      if (improvedPlan && JSON.stringify(improvedPlan) !== JSON.stringify(plan)) {
        console.log(chalk.yellow('\nAI suggests an improved project plan:'));
        console.log(improvedPlan);
        const { aiPlanAction } = await inquirer.prompt([
          {
            type: 'list',
            name: 'aiPlanAction',
            message: 'Do you want to replace the existing plan, save as a new file, or skip?',
            choices: [
              { name: 'Replace existing', value: 'replace' },
              { name: 'Save as new file', value: 'new' },
              { name: 'Skip (keep current)', value: 'skip' },
            ],
          },
        ]);
        if (aiPlanAction === 'replace') {
          fs.writeFileSync(filePath, JSON.stringify(improvedPlan, null, 2), 'utf-8');
          plan = improvedPlan;
          console.log(chalk.green('Project plan replaced with improved version.'));
        } else if (aiPlanAction === 'new') {
          const newFile = filePath.replace(/\.json$/, '_improved.json');
          fs.writeFileSync(newFile, JSON.stringify(improvedPlan, null, 2), 'utf-8');
          console.log(chalk.green(`Improved plan saved as ${path.basename(newFile)}`));
        } else {
          console.log(chalk.gray('Keeping current plan.'));
        }
      } else {
        console.log(chalk.green('AI found no improvements needed.'));
      }
    } catch (e: unknown) {
      console.log(chalk.gray('AI plan review skipped (error or no response).'));
    }
  }
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
        { name: 'Create new project plan (JSON)', value: 'new' },
      ],
    },
  ]);

  // plan and filePath are declared at the top of the function

  if (planSource === 'existing') {
    const files = fs
      .readdirSync(process.cwd())
      .filter(
        (f) =>
          (f.endsWith('.json') || f.endsWith('.md') || f.endsWith('.txt')) &&
          fs.statSync(f).isFile(),
      );

    if (files.length === 0) {
      console.error(
        chalk.red('❌ No .json, .md, or .txt project info files found in this folder.'),
      );
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
    let planRaw: { [key: string]: unknown } = {};
    if (ext === '.json') {
      try {
        planRaw = JSON.parse(fileRaw);
      } catch {
        console.error(chalk.red('❌ Invalid JSON format in selected file.'));
        return;
      }
    } else {
      // For .md/.txt: extract info
      const nameMatch = fileRaw.match(/name\s*[:-]\s*(.+)/i);
      const folderMatch = fileRaw.match(/outputFolder\s*[:-]\s*(.+)/i);
      const descMatch = fileRaw.match(/description\s*[:-]\s*([\s\S]+?)(?:\n|$)/i);
      let steps: string[] = [];
      const stepsMatch = fileRaw.match(/steps\s*[:-][\s\S]+?(\d+\..+|-.+|\*.+)/i);
      if (stepsMatch && stepsMatch[1]) {
        steps = fileRaw
          .split(/\r?\n/)
          .filter((line) => /^([0-9]+\.|-|\*)/.test(line))
          .map((line) => line.replace(/^([0-9]+\.|-|\*)/, '').trim());
      }
      planRaw = {
        name: nameMatch && nameMatch[1] ? nameMatch[1].trim() : '',
        outputFolder: folderMatch && folderMatch[1] ? folderMatch[1].trim() : '',
        description: descMatch && descMatch[1] ? descMatch[1].trim() : '',
        steps,
        referenceFile: path.basename(filePath),
      };
    }
    // Prompt only for missing fields
    const prompts = [];
    if (!planRaw.language) {
      prompts.push({
        type: 'list',
        name: 'language',
        message: 'Select project language:',
        choices: [
          'JavaScript',
          'TypeScript',
          'Python',
          'PHP',
          '.NET',
          'Go',
          'Rust',
          'Java',
          'C++',
          'Other...',
        ],
      });
    }
    if (!planRaw.name) {
      prompts.push({ type: 'input', name: 'name', message: 'Enter project name:' });
    }
    if (!planRaw.outputFolder) {
      prompts.push({ type: 'input', name: 'outputFolder', message: 'Enter output folder name:' });
    }
    if (!planRaw.description) {
      prompts.push({ type: 'input', name: 'description', message: 'Enter project description:' });
    }
    if (
      !planRaw.steps ||
      (Array.isArray(planRaw.steps) && planRaw.steps.length === 0) ||
      (typeof planRaw.steps === 'string' && planRaw.steps.trim().length === 0)
    ) {
      prompts.push({
        type: 'editor',
        name: 'steps',
        message: 'Enter project steps (one per line):',
      });
    }
    let filled: { [key: string]: unknown } = {};
    if (prompts.length) {
      filled = await inquirer.prompt(prompts);
    }
    plan = {
      ...planRaw,
      ...filled,
      steps: filled.steps
        ? typeof filled.steps === 'string'
          ? filled.steps
              .split(/\r?\n/)
              .map((s) => s.trim())
              .filter(Boolean)
          : planRaw.steps
        : planRaw.steps,
    };
    // Save to .json file
    const fileName = `${plan.name!.replace(/\s+/g, '_')}.json`;
    const planPath = path.resolve(fileName);
    fs.writeFileSync(planPath, JSON.stringify(plan, null, 2), 'utf-8');
    filePath = planPath;
    console.log(
      chalk.green(
        `\nProject plan saved as ${fileName}${plan.referenceFile ? ` (references ${plan.referenceFile})` : ''}`,
      ),
    );

    // Always send to AI for refinement
    try {
      console.log(
        chalk.cyan('\n🤖 Refining project plan with AI for structure and completeness...'),
      );
      const reviewPrompt = getPlanReviewPrompt(plan);
      const res = await axios.post(`${OLLAMA_URL}/api/generate`, {
        model: 'llama3',
        prompt: reviewPrompt,
        stream: false,
        options: { temperature: 0.1 },
        keep_alive: '2m',
      });
      const aiResponse = res.data?.response?.trim();
      let improvedPlan = null;
      if (aiResponse) {
        const jsonMatch = aiResponse.match(/```json([\s\S]*?)```/i);
        let jsonText = '';
        if (jsonMatch) {
          jsonText = jsonMatch[1];
        } else {
          jsonText = aiResponse;
        }
        try {
          improvedPlan = JSON.parse(jsonText);
        } catch {
          // ignore if not valid JSON
        }
      }
      if (improvedPlan && JSON.stringify(improvedPlan) !== JSON.stringify(plan)) {
        fs.writeFileSync(filePath, JSON.stringify(improvedPlan, null, 2), 'utf-8');
        plan = improvedPlan;
        console.log(chalk.green('Project plan replaced with AI-refined version.'));
      } else {
        console.log(chalk.green('AI found no improvements needed.'));
      }
    } catch (e: unknown) {
      console.log(chalk.gray('AI plan review skipped (error or no response).'));
    }
    // Proceed directly to development (no redundant prompts)
  } else {
    // Create new project plan
    const { name, description, outputFolder, steps, language } = await inquirer.prompt([
      { type: 'input', name: 'name', message: 'Project name:' },
      { type: 'input', name: 'description', message: 'Project description:' },
      { type: 'input', name: 'outputFolder', message: 'Output folder name:' },
      { type: 'editor', name: 'steps', message: 'Project steps (one per line):' },
      {
        type: 'list',
        name: 'language',
        message: 'Select project language:',
        choices: [
          'JavaScript',
          'TypeScript',
          'Python',
          'PHP',
          '.NET',
          'Go',
          'Rust',
          'Java',
          'C++',
          'Other...',
        ],
      },
    ]);
    plan = {
      name,
      description,
      outputFolder,
      language,
      steps: steps
        .split(/\r?\n/)
        .map((s: string) => s.trim())
        .filter(Boolean),
    };
    // Save to .json file
    const fileName = `${name.replace(/\s+/g, '_')}.json`;
    filePath = path.resolve(fileName);
    fs.writeFileSync(filePath, JSON.stringify(plan, null, 2), 'utf-8');
    console.log(chalk.green(`\nProject plan saved as ${fileName}`));
    // Ask user if they want to review the generated plan before continuing
    const { reviewPlan } = await inquirer.prompt({
      type: 'confirm',
      name: 'reviewPlan',
      message:
        'Do you want to review/edit the generated project JSON file before starting development?',
      default: false,
    });
    if (reviewPlan) {
      console.log(chalk.yellow(`\nOpen and review: ${filePath}`));
      return;
    }
  }

  // Step 1.5: AI plan review and improvement (after plan/filePath are set)
  if (plan && filePath && plan.name && plan.outputFolder) {
    try {
      console.log(chalk.cyan('\n🤖 Reviewing project plan with AI for missing or unclear info...'));
      const reviewPrompt = `Review this project plan for missing or unclear steps, tasks, or description. If anything is missing or could be improved, return a complete, improved plan as JSON.\n\n${JSON.stringify(plan, null, 2)}`;
      const res = await axios.post(`${OLLAMA_URL}/api/generate`, {
        model: 'llama3', // or use selected model
        prompt: reviewPrompt,
        stream: false,
        options: { temperature: 0.1 },
        keep_alive: '2m',
      });
      const aiResponse = res.data?.response?.trim();
      let improvedPlan = null;
      if (aiResponse) {
        // Try to extract JSON from response
        const jsonMatch = aiResponse.match(/```json([\s\S]*?)```/i);
        let jsonText = '';
        if (jsonMatch) {
          jsonText = jsonMatch[1];
        } else {
          // fallback: try to parse whole response
          jsonText = aiResponse;
        }
        try {
          improvedPlan = JSON.parse(jsonText);
        } catch {
          // ignore if not valid JSON
        }
      }
      if (improvedPlan && JSON.stringify(improvedPlan) !== JSON.stringify(plan)) {
        console.log(chalk.yellow('\nAI suggests an improved project plan:'));
        console.log(improvedPlan);
        const { aiPlanAction } = await inquirer.prompt([
          {
            type: 'list',
            name: 'aiPlanAction',
            message: 'Do you want to replace the existing plan, save as a new file, or skip?',
            choices: [
              { name: 'Replace existing', value: 'replace' },
              { name: 'Save as new file', value: 'new' },
              { name: 'Skip (keep current)', value: 'skip' },
            ],
          },
        ]);
        if (aiPlanAction === 'replace') {
          fs.writeFileSync(filePath, JSON.stringify(improvedPlan, null, 2), 'utf-8');
          plan = improvedPlan;
          console.log(chalk.green('Project plan replaced with improved version.'));
        } else if (aiPlanAction === 'new') {
          const newFile = filePath.replace(/\.json$/, '_improved.json');
          fs.writeFileSync(newFile, JSON.stringify(improvedPlan, null, 2), 'utf-8');
          console.log(chalk.green(`Improved plan saved as ${path.basename(newFile)}`));
        } else {
          console.log(chalk.gray('Keeping current plan.'));
        }
      } else {
        console.log(chalk.green('AI found no improvements needed.'));
      }
    } catch (e: unknown) {
      console.log(chalk.gray('AI plan review skipped (error or no response).'));
    }
  }

  // Fallback: prompt user for missing info
  if (!plan.description) {
    const { desc } = await inquirer.prompt({
      type: 'input',
      name: 'desc',
      message: 'Enter project description:',
    });
    plan.description = desc;
  }
  if (!plan.outputFolder) {
    const { folder } = await inquirer.prompt({
      type: 'input',
      name: 'folder',
      message: 'Enter output folder name:',
    });
    plan.outputFolder = folder;
  }
  if (!plan.name) {
    const { pname } = await inquirer.prompt({
      type: 'input',
      name: 'pname',
      message: 'Enter project name:',
    });
    plan.name = pname;
  }

  console.log(chalk.gray(`\n📦 Project: ${plan.name || 'Unnamed'} → Folder: ${plan.outputFolder}`));

  // Step 2: Fetch Ollama models
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
      default:
        modelConfig.analysis && modelList.includes(modelConfig.analysis)
          ? modelConfig.analysis
          : modelList[0],
    },
  ]);

  const { devModel } = await inquirer.prompt([
    {
      type: 'list',
      name: 'devModel',
      message: 'Select model for code generation:',
      choices: modelList,
      default:
        modelConfig.development && modelList.includes(modelConfig.development)
          ? modelConfig.development
          : modelList[0],
    },
  ]);

  // Step 3: Ask Ollama to generate structure
  const promptStructure = `
You are an AI assistant. Based on this project description:
"""
${plan.description}
"""
  Target language: ${plan.language || 'JavaScript'}
  Generate a list of all important files (with relative paths) required to implement this project in the selected language.
Return only a JSON array like: ["src/index.js", "src/routes/user.js", "README.md"]
Do NOT return code or explanation.
make sure folder and file structure is validate with project requirements.
`;

  console.log('Project description: ', plan.description);
  console.log(`\n📁 Generating folder structure using model: ${structureModel}...`);
  let fileList: string[] = [];

  try {
    const res = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: structureModel,
      prompt: promptStructure,
      stream: false,
      options: { temperature: 0.7 },
    });

    let response = res.data.response.trim();
    console.log('project folder structure with file names: ', response);
    if (response.startsWith('```')) {
      response = response
        .replace(/```[a-z]*\n?/gi, '')
        .replace(/```$/, '')
        .trim();
    }

    fileList = JSON.parse(response);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(chalk.red(`❌ Failed to get structure: ${error.message}`));
    } else {
      console.error(chalk.red(`❌ Failed to get structure: ${error}`));
    }
    return;
  }

  const base = path.resolve(process.cwd(), plan.outputFolder!);
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
  Target language: ${plan.language || 'JavaScript'}
  Only return valid code.
also make sure file content and context is valid and code is well formatted.`;

    console.log(
      chalk.gray(
        `\n💡 Generating (${index}/${fileList.length}): ${relPath} using model: ${devModel}`,
      ),
    );

    try {
      const res = await axios.post(`${OLLAMA_URL}/api/generate`, {
        model: devModel,
        prompt: filePrompt,
        stream: false,
        options: { temperature: 0.02 },
      });

      let code = res.data.response.trim();
      if (code.startsWith('```')) {
        code = code
          .replace(/```[a-z]*\n?/gi, '')
          .replace(/```$/, '')
          .trim();
      }

      fs.writeFileSync(fullPath, code);
      console.log(chalk.green(`✅ Saved: ${relPath}`));
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(chalk.red(`❌ Failed on ${relPath}: ${error.message}`));
      } else {
        console.error(chalk.red(`❌ Failed on ${relPath}: ${error}`));
      }
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
