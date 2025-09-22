import fs from 'fs';
import path from 'path';

const SESSIONS_DIR = path.join(process.cwd(), '.taskAgent', 'sessions');

export function saveSession(sessionName: string, messages: string[]) {
  if (!fs.existsSync(SESSIONS_DIR)) {
    fs.mkdirSync(SESSIONS_DIR, { recursive: true });
  }
  const filePath = path.join(SESSIONS_DIR, `${sessionName}.json`);
  fs.writeFileSync(filePath, JSON.stringify(messages, null, 2));
}

export function loadSession(sessionName: string): string[] | null {
  const filePath = path.join(SESSIONS_DIR, `${sessionName}.json`);
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

export function listSessions(): string[] {
  if (!fs.existsSync(SESSIONS_DIR)) return [];
  return fs.readdirSync(SESSIONS_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));
}
