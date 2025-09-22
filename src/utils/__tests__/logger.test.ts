import fs from 'fs';
import path from 'path';
import { logError, logCommand } from '../logger';

describe('logger', () => {
  const logDir = path.join(process.cwd(), '.taskAgent', 'logs');
  const errorLog = path.join(logDir, 'errors.log');
  const commandLog = path.join(logDir, 'commands.log');
  beforeEach(() => {
    fs.rmSync(logDir, { recursive: true, force: true });
  });
  it('should log errors', () => {
    logError('test error');
    const content = fs.readFileSync(errorLog, 'utf-8');
    expect(content).toMatch(/test error/);
  });
  it('should log commands', () => {
    logCommand('test command');
    const content = fs.readFileSync(commandLog, 'utf-8');
    expect(content).toMatch(/test command/);
  });
});
