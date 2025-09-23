import path from 'path';
import fs from 'fs';

export type PluginHook = 'onPlan' | 'onGenerate';
export type Plugin = {
  name: string;
  hooks: Partial<Record<PluginHook, (...args: unknown[]) => void>>;
};

export function loadPlugins(): Plugin[] {
  const configPath = path.join(process.cwd(), '.taskAgent', 'config.json');
  if (!fs.existsSync(configPath)) return [];
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  const pluginPaths: string[] = config.plugins || [];
  const plugins: Plugin[] = [];
  for (const pluginPath of pluginPaths) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const plugin: Plugin = require(path.resolve(pluginPath));
      plugins.push(plugin);
    } catch (e) {
      // Ignore plugin load errors for now
    }
  }
  return plugins;
}

export function runHook(hook: PluginHook, ...args: unknown[]) {
  const plugins = loadPlugins();
  for (const plugin of plugins) {
    if (plugin.hooks[hook]) {
      try {
        plugin.hooks[hook]?.(...args);
      } catch (e) {
        // Ignore plugin errors for now
      }
    }
  }
}
