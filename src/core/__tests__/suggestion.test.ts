import { generateSuggestions } from '../suggestion';

describe('generateSuggestions', () => {
  it('should suggest creating missing folders', () => {
    const analysis = { stack: [], frameworks: [], totalLines: 10, missingFolders: ['bin'] };
    const suggestions = generateSuggestions(analysis);
    expect(suggestions[0]).toMatch(/Create missing folders/);
  });
  it('should suggest splitting large files', () => {
    const analysis = { stack: [], frameworks: [], totalLines: 3000, missingFolders: [] };
    const suggestions = generateSuggestions(analysis);
    expect(suggestions.some(s => s.includes('splitting large files'))).toBe(true);
  });
  it('should suggest using a framework', () => {
    const analysis = { stack: [], frameworks: [], totalLines: 10, missingFolders: [] };
    const suggestions = generateSuggestions(analysis);
    expect(suggestions.some(s => s.includes('framework'))).toBe(true);
  });
});
