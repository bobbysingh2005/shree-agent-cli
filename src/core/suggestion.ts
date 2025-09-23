import fs from 'fs';
import path from 'path';
import { ProjectAnalysis } from './analyze.js';

export function generateSuggestions(analysis: ProjectAnalysis): string[] {
  const suggestions: string[] = [];
  if (analysis.missingFolders.length > 0) {
    suggestions.push(`Create missing folders: ${analysis.missingFolders.join(', ')}`);
  }
  if (analysis.totalLines > 2000) {
    suggestions.push('Consider splitting large files or modules for maintainability.');
  }
  if (analysis.frameworks.length === 0) {
    suggestions.push('No major frameworks detected. Consider using a framework for scalability.');
  }
  // Add more rules as needed
  return suggestions;
}

export function writeSuggestionsToFile(suggestions: string[], rootDir: string = process.cwd()) {
  const agentDir = path.join(rootDir, '.taskAgent');
  const filePath = path.join(agentDir, 'suggestions.md');
  fs.writeFileSync(
    filePath,
    '# Project Suggestions\n\n' + suggestions.map((s) => `- ${s}`).join('\n'),
  );
}
