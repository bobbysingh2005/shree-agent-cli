import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';

export async function validateProject() {
  console.log('\n🔍 Project Validator');

  const jsonFiles = fs.readdirSync(process.cwd()).filter(f => f.endsWith('.json'));
  if (jsonFiles.length === 0) {
    console.error(chalk.red('❌ No .json project plan files found.'));
    return;
  }

  const { selectedPlan } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedPlan',
      message: '📄 Select a project plan file:',
      choices: jsonFiles
    }
  ]);

  const planPath = path.resolve(selectedPlan);
  const plan = JSON.parse(fs.readFileSync(planPath, 'utf-8'));

  const outputFolder = plan.name.replace(/\s+/g, '_');
  const base = path.resolve(process.cwd(), outputFolder);

  if (!fs.existsSync(base)) {
    console.error(chalk.red('❌ Project folder not found.'));
    return;
  }

  const stepsArray = plan.steps.split('\n').filter((line: string) => line.trim() !== '');
  let allPassed = true;
  const missing: string[] = [];

  for (const step of stepsArray) {
    const match = step.match(/^\d+\.\s*(.*)$/);
    if (!match) continue;

    const fileName = match[1].trim().replace(/\s+/g, '-').toLowerCase() + '.md';
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
        default: true
      }
    ]);

    if (wantsHelp) {
      const { chatWithFileContext } = await import('./chatFileContext.js');
      await chatWithFileContext(plan, missing);
    }
  }
}
