import inquirer from 'inquirer';
import { loadModelConfig, saveModelConfig, TaskModelMap } from '../utils/modelConfig.js';

const TASKS = [
  { key: 'analysis', label: 'Analysis' },
  { key: 'development', label: 'Development' },
  { key: 'documentation', label: 'Documentation' },
  { key: 'testing', label: 'Testing' },
  { key: 'suggestions', label: 'Suggestions' },
  { key: 'chat', label: 'Chat' },
];

// Example available models; in real use, fetch from Ollama
const AVAILABLE_MODELS = [
  { name: 'llama2:2b', desc: 'Fast, small' },
  { name: 'llama2:7b', desc: 'Balanced, default' },
  { name: 'llama2:14b', desc: 'High quality, slow' },
  { name: 'codellama:7b', desc: 'Code generation' },
  { name: 'phi:2b', desc: 'Lightweight' },
  { name: 'llama3:8b', desc: 'Latest, large' },
];

export async function configureModels() {
  const current = loadModelConfig();
  const answers: TaskModelMap = {};
  for (const task of TASKS) {
    const { model } = await inquirer.prompt([
      {
        type: 'list',
        name: 'model',
        message: `Select model for ${task.label}:`,
        choices: AVAILABLE_MODELS.map((m) => ({ name: `${m.name} (${m.desc})`, value: m.name })),
        default: current[task.key as keyof TaskModelMap] || 'llama2:7b',
      },
    ]);
    answers[task.key as keyof TaskModelMap] = model;
  }
  saveModelConfig(answers);
  console.log('Model preferences saved!');
}
