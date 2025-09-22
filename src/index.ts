#!/usr/bin/env node

import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import { startChat } from './core/chat.js';
import { discussProject } from './core/planner.js';
import { generateProject } from './core/generator.js';
import { validateProject } from './core/validator.js';
import { logCommand } from './utils/logger.js';
import { analyzeProject } from './core/analyze.js';
import { generateSuggestions, writeSuggestionsToFile } from './core/suggestion.js';
import { runHook } from './core/pluginSystem.js';
import { configureModels } from './core/configureModels.js';

export async function runCLI() {
  // Ensure .taskAgent folder exists in project root
  const agentDir = path.join(process.cwd(), '.taskAgent');
  if (!fs.existsSync(agentDir)) {
    fs.mkdirSync(agentDir, { recursive: true });
    fs.mkdirSync(path.join(agentDir, 'logs'), { recursive: true });
    fs.mkdirSync(path.join(agentDir, 'history'), { recursive: true });
      fs.mkdirSync(path.join(agentDir, 'plans'), { recursive: true });
    fs.mkdirSync(path.join(agentDir, 'sessions'), { recursive: true });
    // Optionally, create empty config.json and meta.json
    fs.writeFileSync(path.join(agentDir, 'config.json'), JSON.stringify({}, null, 2));
    fs.writeFileSync(path.join(agentDir, 'meta.json'), JSON.stringify({}, null, 2));
  }
  while (true) {
    const { choice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'choice',
        message: 'What do you want to do?',
        choices: [
          '1. Chat with Ollama',
          '2. Project Discussion',
          '3. Project Generation',
          '4. Project Validation',
          '5. Analysis & Debugging',
          '6. Analyze Project',
          '7. Generate Suggestions',
          '8. Configure Models (select models for each task)',
          '9. Exit'
        ]
      }
    ]);

    if (choice.startsWith('1')) {
      logCommand('Chat with Ollama');
      await startChat();
    } else if (choice.startsWith('2')) {
      logCommand('Project Discussion');
      await discussProject();
    } else if (choice.startsWith('3')) {
      logCommand('Project Generation');
      runHook('onGenerate');
      await generateProject();
    } else if (choice.startsWith('4')) {
      logCommand('Project Validation');
      runHook('onPlan');
      await validateProject();
    } else if (choice.startsWith('5')) {
      logCommand('Analysis & Debugging');
      // Submenu for post-debugging actions
      const { debugAction } = await inquirer.prompt([
        {
          type: 'list',
          name: 'debugAction',
          message: 'What would you like to do after debugging?',
          choices: [
            'Chat about issues/fixes',
            'Generate new code/files',
            'Re-validate project',
            'Back to main menu'
          ]
        }
      ]);
      if (debugAction === 'Chat about issues/fixes') {
        await startChat();
      } else if (debugAction === 'Generate new code/files') {
        await generateProject();
      } else if (debugAction === 'Re-validate project') {
        await validateProject();
      }
      // else: back to main menu
    } else if (choice.startsWith('6')) {
      logCommand('Analyze Project');
      const analysis = analyzeProject();
      const agentDir = path.join(process.cwd(), '.taskAgent');
      fs.writeFileSync(path.join(agentDir, 'meta.json'), JSON.stringify(analysis, null, 2));
      console.log('Project analysis complete. Results saved to .taskAgent/meta.json');
    } else if (choice.startsWith('7')) {
      logCommand('Generate Suggestions');
      const agentDir = path.join(process.cwd(), '.taskAgent');
      const metaPath = path.join(agentDir, 'meta.json');
      if (!fs.existsSync(metaPath)) {
        console.log('Please run Analyze Project first.');
      } else {
        const analysis = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
        const suggestions = generateSuggestions(analysis);
        writeSuggestionsToFile(suggestions);
        console.log('Suggestions generated and saved to .taskAgent/suggestions.md');
      }
    } else if (choice.startsWith('8')) {
      logCommand('Configure Models');
      await configureModels();
    } else {
      logCommand('Exit CLI');
      break;
    }
  }
}
