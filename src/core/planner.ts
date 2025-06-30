import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';

export async function discussProject() {
  const { name, description, steps } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Project Name:',
      validate: (val) => val.trim().length > 0 || 'Please enter a name'
    },
    {
      type: 'input',
      name: 'description',
      message: 'Project Description:',
      validate: (val) => val.trim().length > 10 || 'Please enter a longer description'
    },
    {
      type: 'editor',
      name: 'steps',
      message: 'Steps to implement (one per line):'
    }
  ]);

  const stepsArray = steps.split('\n').filter((line: string) => line.trim() !== '');

  const plan = {
    name,
    description,
    steps: stepsArray
  };

  const filename = `${name.replace(/\s+/g, '_')}.json`;
  fs.writeFileSync(filename, JSON.stringify(plan, null, 2));
  console.log(`Project plan saved to ${filename}`);
}
