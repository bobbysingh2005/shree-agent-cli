import fs from 'fs';
import path from 'path';
import { saveSession, loadSession, listSessions } from '../sessionManager';

describe('sessionManager', () => {
  const sessionsDir = path.join(process.cwd(), '.taskAgent', 'sessions');
  beforeEach(() => {
    fs.rmSync(sessionsDir, { recursive: true, force: true });
    fs.mkdirSync(sessionsDir, { recursive: true });
  });
  afterEach(() => {
    fs.rmSync(sessionsDir, { recursive: true, force: true });
  });
  it('should save and load a session', () => {
    saveSession('test', ['msg1', 'msg2']);
    const loaded = loadSession('test');
    expect(loaded).toEqual(['msg1', 'msg2']);
  });
  it('should list sessions', () => {
    saveSession('test1', []);
    saveSession('test2', []);
    const sessions = listSessions();
    expect(sessions).toEqual(expect.arrayContaining(['test1', 'test2']));
  });
});
