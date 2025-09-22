import fs from 'fs';
import path from 'path';

export interface ProjectAnalysis {
  stack: string[];
  frameworks: string[];
  totalLines: number;
  missingFolders: string[];
}

export function analyzeProject(rootDir: string = process.cwd()): ProjectAnalysis {
  // Detect stack and frameworks by scanning package.json
  let stack: string[] = [];
  let frameworks: string[] = [];
  const pkgPath = path.join(rootDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    if (pkg.dependencies) {
      stack = Object.keys(pkg.dependencies);
      // Simple heuristic for frameworks
      frameworks = stack.filter(dep => ['react', 'express', 'next', 'vue', 'nestjs'].includes(dep));
    }
  }
  // Count total lines of code in src/
  let totalLines = 0;
  function countLines(dir: string) {
    if (!fs.existsSync(dir)) return;
    for (const file of fs.readdirSync(dir)) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        countLines(fullPath);
      } else if (file.endsWith('.ts') || file.endsWith('.js')) {
        totalLines += fs.readFileSync(fullPath, 'utf-8').split('\n').length;
      }
    }
  }
  countLines(path.join(rootDir, 'src'));
  // Detect missing folders
  const requiredFolders = ['src', 'bin', 'dist'];
  const missingFolders = requiredFolders.filter(f => !fs.existsSync(path.join(rootDir, f)));
  return { stack, frameworks, totalLines, missingFolders };
}
