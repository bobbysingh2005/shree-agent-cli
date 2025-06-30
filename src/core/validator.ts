import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';

export async function validateProject() {
  console.log('Validating Project Files');

  const files = fs.readdirSync(process.cwd()).filter(f => f.endsWith('.json'));
  if (files.length === 0) {
    console.error('No .json project plans found.');
    return;
  }

  const { selectedFile } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedFile',
      message: 'Select project plan to validate:',
      choices: files
    }
  ]);

  const plan = JSON.parse(fs.readFileSync(path.resolve(selectedFile), 'utf-8'));
  const base = path.resolve(process.cwd(), plan.name.replace(/\s+/g, '_'));

  if (!fs.existsSync(base)) {
    console.error(`Project folder not found: ${base}`);
    return;
  }

  const allFiles: string[] = [];

  function collectFiles(dir: string): void {
    for (const file of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        collectFiles(fullPath);
      } else {
        allFiles.push(fullPath);
      }
    }
  }

  collectFiles(base);

  let hasError = false;
  for (const step of plan.steps) {
    const expectedFile = step.replace(/\s+/g, '-').toLowerCase() + '.md';
    const expectedPath = path.join(base, expectedFile);
    if (!fs.existsSync(expectedPath)) {
      console.log(`Missing file: ${expectedFile}`);
      hasError = true;
    }
  }

  if (!hasError) {
    console.log('All expected files found.');
  } else {
    console.log('Some issues found during validation.');
  }
}
