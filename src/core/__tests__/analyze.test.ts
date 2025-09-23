import { analyzeProject } from '../analyze';
import fs from 'fs';
import path from 'path';

describe('analyzeProject', () => {
  it('should return analysis for a sample project', () => {
    const tempDir = path.join(__dirname, 'tempProject');
    fs.mkdirSync(tempDir, { recursive: true });
    fs.writeFileSync(
      path.join(tempDir, 'package.json'),
      JSON.stringify({ dependencies: { react: '^18.0.0' } }),
    );
    fs.mkdirSync(path.join(tempDir, 'src'), { recursive: true });
    fs.writeFileSync(path.join(tempDir, 'src', 'index.ts'), 'console.log("Hello");\n');
    const result = analyzeProject(tempDir);
    expect(result.stack).toContain('react');
    expect(result.frameworks).toContain('react');
    expect(result.totalLines).toBeGreaterThan(0);
    expect(result.missingFolders).toContain('bin');
    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});
