"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.discussProject = discussProject;
const fs_1 = __importDefault(require("fs"));
const inquirer_1 = __importDefault(require("inquirer"));
async function discussProject() {
    const { name, description, steps } = await inquirer_1.default.prompt([
        {
            type: 'input',
            name: 'name',
            message: 'Project Name:',
            validate: (val) => val.trim().length > 0 || 'Please enter a name'
        },
        {
            type: 'input',
            name: 'description',
            message: 'Project Description:',
            validate: (val) => val.trim().length > 10 || 'Please enter a longer description'
        },
        {
            type: 'editor',
            name: 'steps',
            message: 'Steps to implement (one per line):'
        }
    ]);
    const stepsArray = steps.split('\n').filter((line) => line.trim() !== '');
    const plan = {
        name,
        description,
        steps: stepsArray
    };
    const filename = `${name.replace(/\s+/g, '_')}.json`;
    fs_1.default.writeFileSync(filename, JSON.stringify(plan, null, 2));
    console.log(`Project plan saved to ${filename}`);
}
