// osHelper.ts
// Utility to detect OS and provide platform-specific tips or commands

export function getPlatformInfo() {
  const platform = process.platform;
  if (platform === 'win32') {
    return {
      name: 'Windows',
      shell: 'PowerShell or CMD',
      tips: [
        'Use backslashes (\\) in file paths, or forward slashes (/) (Node.js supports both).',
        'All CLI toolbox commands work natively on Windows.',
      ],
    };
  } else if (platform === 'darwin') {
    return {
      name: 'macOS',
      shell: 'Terminal (bash/zsh)',
      tips: [
        'Use forward slashes (/) in file paths.',
        'All CLI toolbox commands work natively on macOS.',
      ],
    };
  } else {
    return {
      name: 'Linux',
      shell: 'Terminal (bash/zsh)',
      tips: [
        'Use forward slashes (/) in file paths.',
        'All CLI toolbox commands work natively on Linux.',
      ],
    };
  }
}
