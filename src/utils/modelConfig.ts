import fs from 'fs';
import path from 'path';

export type TaskModelMap = {
  analysis?: string;
  development?: string;
  documentation?: string;
  testing?: string;
  suggestions?: string;
  chat?: string;
};

const CONFIG_PATH = path.join(process.env.HOME || process.env.USERPROFILE || '.', '.taskagent', 'config.json');

export function loadModelConfig(): TaskModelMap {
  if (!fs.existsSync(CONFIG_PATH)) return {};
  try {
    const content = fs.readFileSync(CONFIG_PATH, 'utf-8');
    const parsed = JSON.parse(content);
    return parsed.models || {};
  } catch {
    return {};
  }
}

export function saveModelConfig(models: TaskModelMap) {
  let config: any = {};
  if (fs.existsSync(CONFIG_PATH)) {
    config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  }
  config.models = models;
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}
