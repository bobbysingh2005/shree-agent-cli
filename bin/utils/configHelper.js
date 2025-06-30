"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = loadConfig;
exports.saveConfig = saveConfig;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const CONFIG_DIR = path_1.default.join(os_1.default.homedir(), '.shreeAgentCli');
const CONFIG_PATH = path_1.default.join(CONFIG_DIR, 'config.json');
function loadConfig() {
    try {
        if (fs_1.default.existsSync(CONFIG_PATH)) {
            return JSON.parse(fs_1.default.readFileSync(CONFIG_PATH, 'utf-8'));
        }
    }
    catch {
        return {};
    }
    return {};
}
function saveConfig(newConfig) {
    if (!fs_1.default.existsSync(CONFIG_DIR)) {
        fs_1.default.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    const current = loadConfig();
    const updated = { ...current, ...newConfig };
    fs_1.default.writeFileSync(CONFIG_PATH, JSON.stringify(updated, null, 2));
}
