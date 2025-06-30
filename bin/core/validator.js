"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateProject = validateProject;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const inquirer_1 = __importDefault(require("inquirer"));
async function validateProject() {
    console.log('Validating Project Files');
    const files = fs_1.default.readdirSync(process.cwd()).filter(f => f.endsWith('.json'));
    if (files.length === 0) {
        console.error('No .json project plans found.');
        return;
    }
    const { selectedFile } = await inquirer_1.default.prompt([
        {
            type: 'list',
            name: 'selectedFile',
            message: 'Select project plan to validate:',
            choices: files
        }
    ]);
    const plan = JSON.parse(fs_1.default.readFileSync(path_1.default.resolve(selectedFile), 'utf-8'));
    const base = path_1.default.resolve(process.cwd(), plan.name.replace(/\s+/g, '_'));
    if (!fs_1.default.existsSync(base)) {
        console.error(`Project folder not found: ${base}`);
        return;
    }
    const allFiles = [];
    function collectFiles(dir) {
        for (const file of fs_1.default.readdirSync(dir)) {
            const fullPath = path_1.default.join(dir, file);
            const stat = fs_1.default.statSync(fullPath);
            if (stat.isDirectory()) {
                collectFiles(fullPath);
            }
            else {
                allFiles.push(fullPath);
            }
        }
    }
    collectFiles(base);
    let hasError = false;
    for (const step of plan.steps) {
        const expectedFile = step.replace(/\s+/g, '-').toLowerCase() + '.md';
        const expectedPath = path_1.default.join(base, expectedFile);
        if (!fs_1.default.existsSync(expectedPath)) {
            console.log(`Missing file: ${expectedFile}`);
            hasError = true;
        }
    }
    if (!hasError) {
        console.log('All expected files found.');
    }
    else {
        console.log('Some issues found during validation.');
    }
}
