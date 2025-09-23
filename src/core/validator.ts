import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';

export async function validateProject() {
  console.log('\n🔍 Project Validator');

  const jsonFiles = fs.readdirSync(process.cwd()).filter((f) => f.endsWith('.json'));
  if (jsonFiles.length === 0) {
    console.error(chalk.red('❌ No .json project plan files found.'));
    return;
  }

  const { selectedPlan } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedPlan',
      message: '📄 Select a project plan file:',
      choices: jsonFiles,
    },
  ]);

  const planPath = path.resolve(selectedPlan);
  const plan = JSON.parse(fs.readFileSync(planPath, 'utf-8'));

  // Use outputFolder from plan if present, else fallback to name
  const outputFolder = plan.outputFolder || plan.name.replace(/\s+/g, '_');
  const base = path.resolve(process.cwd(), outputFolder);
  if (plan.language) {
    console.log(chalk.cyan(`Project language: ${plan.language}`));
  }

  if (!fs.existsSync(base)) {
    console.error(chalk.red('❌ Project folder not found.'));
    return;
  }

  let stepsArray: string[] = [];
  if (plan.steps && Array.isArray(plan.steps)) {
    stepsArray = plan.steps;
  } else if (plan.steps && typeof plan.steps === 'string') {
    stepsArray = plan.steps.split('\n').filter((line: string) => line.trim() !== '');
  } else if (plan.referenceFile) {
    // Try to extract steps from referenced file (md/txt)
    const refPath = path.resolve(process.cwd(), plan.referenceFile);
    if (fs.existsSync(refPath)) {
      const refRaw = fs.readFileSync(refPath, 'utf-8');
      // Try to extract steps as numbered or bulleted list
      const stepLines = refRaw.match(/^([0-9]+\.|-|\*)\s+.+/gm);
      if (stepLines) {
        stepsArray = stepLines.map((l: string) => l.replace(/^([0-9]+\.|-|\*)\s*/, '').trim());
      }
    }
  }

  if (!stepsArray.length) {
    console.error(
      chalk.red(
        '❌ No steps found in project plan or referenced file. Please add steps as a list in your plan or referenced file.',
      ),
    );
    return;
  }

  let allPassed = true;
  const missing: string[] = [];

  for (const step of stepsArray) {
    // Accept both numbered and plain steps
    const stepName = step.replace(/^\d+\.\s*/, '').trim();
    const fileName = stepName.replace(/\s+/g, '-').toLowerCase() + '.md';
    const filePath = path.join(base, fileName);

    if (!fs.existsSync(filePath)) {
      console.log(chalk.red(`❌ Missing file: ${fileName}`));
      missing.push(fileName);
      allPassed = false;
    } else {
      console.log(chalk.green(`✅ Found: ${fileName}`));
    }
  }

  if (allPassed) {
    console.log(chalk.greenBright('\n🎉 All project files are present and correct.\n'));
  } else {
    console.log(chalk.yellow('\n⚠️ Some issues found during validation.'));

    const { wantsHelp } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'wantsHelp',
        message: '💬 Do you want to chat with Ollama about the missing files?',
        default: true,
      },
    ]);

    if (wantsHelp) {
      const { chatWithFileContext } = await import('./chatFileContext.js');
      await chatWithFileContext(plan, missing);
    }
  }
}
