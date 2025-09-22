import fs from 'fs';
import path from 'path';
import { loadConfig, saveConfig } from '../configHelper';

describe('configHelper', () => {
  const configPath = path.join(process.cwd(), '.taskAgent', 'config.json');
  beforeEach(() => {
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify({}));
  });
  afterEach(() => {
    fs.rmSync(path.dirname(configPath), { recursive: true, force: true });
  });
  it('should save and load config', () => {
    saveConfig({ chatModel: 'test-model' });
    const config = loadConfig();
    expect(config.chatModel).toBe('test-model');
  });
});
