import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.env.HOME || process.env.USERPROFILE || '.', '.shreeAgentCli.json');

export type Config = {
  chatModel?: string;
  generateModel?: string;
  [key: string]: string | undefined; // ✅ This allows dynamic keys
};

export function loadConfig(): Config {
  if (!fs.existsSync(CONFIG_PATH)) return {};
  try {
    const content = fs.readFileSync(CONFIG_PATH, 'utf-8');
    return JSON.parse(content) as Config;
  } catch {
    return {};
  }
}

export function saveConfig(newValues: Partial<Config>) {
  const current = loadConfig();
  const updated = { ...current, ...newValues };
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(updated, null, 2));
}
