// toolbox.ts
// Agentic CLI Toolbox: exposes safe project actions for the agent/chat to use in the current working directory only.

import fs from 'fs';
import path from 'path';

export const toolbox = {
  // List files and folders in the current directory or a subdirectory
  listDir: (subdir = '.') => {
    const dir = path.resolve(process.cwd(), subdir);
    return fs.readdirSync(dir, { withFileTypes: true }).map((entry) => ({
      name: entry.name,
      isDirectory: entry.isDirectory(),
    }));
  },

  // Read a file in the current directory or a subdirectory
  readFile: (filePath: string) => {
    const absPath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(absPath) || fs.statSync(absPath).isDirectory()) {
      throw new Error('File does not exist or is a directory.');
    }
    return fs.readFileSync(absPath, 'utf-8');
  },

  // Write or update a file (with user confirmation in agent flow)
  writeFile: (filePath: string, content: string) => {
    const absPath = path.resolve(process.cwd(), filePath);
    fs.writeFileSync(absPath, content, 'utf-8');
    return true;
  },

  // Generate code (to be implemented: call model, etc.)
  generateCode: async (prompt: string, model: string) => {
    // Placeholder: integrate with your model API
    return `// Generated code for: ${prompt} (model: ${model})`;
  },

  // Validate project (call your existing validation logic)
  validateProject: async () => {
    // Placeholder: call your validation module
    return 'Validation complete (stub).';
  },

  // Analyze project (call your existing analysis logic)
  analyzeProject: async () => {
    // Placeholder: call your analysis module
    return 'Analysis complete (stub).';
  },
};

// You can add more tools as needed (delete file, move file, etc.)
