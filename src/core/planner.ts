import fs from 'fs';
// import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';

export async function discussProject() {
  console.log('\n📋 Project Planning (Step 1)');

  // Ask for project name and description
  const { name, description } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: '📝 Project name:',
    },
    {
      type: 'input',
      name: 'description',
      message: '📄 Describe your project:',
    },
  ]);

  // Ask for output folder
  const defaultFolder = name.replace(/\s+/g, '_');
  const { outputFolder } = await inquirer.prompt([
    {
      type: 'input',
      name: 'outputFolder',
      message: '📁 Output folder name:',
      default: defaultFolder,
    },
  ]);

  // Ask if user wants to enter steps
  const { wantsSteps } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'wantsSteps',
      message: '🧩 Do you want to enter step-by-step instructions?',
      default: true,
    },
  ]);

  let steps = '';
  if (wantsSteps) {
    console.log('🪜 Enter each step. Type "done" or leave blank to finish.\n');
    const allSteps: string[] = [];

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { step } = await inquirer.prompt([
        {
          type: 'input',
          name: 'step',
          message: `➕ Step ${allSteps.length + 1}:`,
        },
      ]);

      if (!step || step.toLowerCase() === 'done') break;
      allSteps.push(step);
    }

    steps = allSteps.join('\n');
  }

  const projectPlan = { name, description, steps, outputFolder };

  const fileName = `${defaultFolder}.json`;
  fs.writeFileSync(fileName, JSON.stringify(projectPlan, null, 2));
  console.log(chalk.green(`\n✅ Project plan saved to: ${fileName}\n`));
}
