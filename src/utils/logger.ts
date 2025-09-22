import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), '.taskAgent', 'logs');
const ERROR_LOG = path.join(LOG_DIR, 'errors.log');
const COMMAND_LOG = path.join(LOG_DIR, 'commands.log');

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

export function logError(message: string) {
  ensureLogDir();
  const entry = `[${new Date().toISOString()}] ERROR: ${message}\n`;
  fs.appendFileSync(ERROR_LOG, entry);
}

export function logCommand(message: string) {
  ensureLogDir();
  const entry = `[${new Date().toISOString()}] COMMAND: ${message}\n`;
  fs.appendFileSync(COMMAND_LOG, entry);
}
