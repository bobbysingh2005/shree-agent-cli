// aiPrompts.ts
// Centralized AI prompt templates and helpers for agentic CLI
// All AI prompt logic is defined here for maintainability and clarity.

/**
 * Prompt for AI to review and improve a project plan.
 * @param plan The current project plan object
 * @returns The prompt string to send to the AI model
 */
export function getPlanReviewPrompt(plan: Record<string, unknown>): string {
  return `Review this project plan for missing or unclear steps, tasks, or description. If anything is missing or could be improved, return a complete, improved plan as a pure JSON object only, with no explanation, preamble, or markdown. The CLI will parse your response as JSON.\n\n${JSON.stringify(plan, null, 2)}`;
}

/**
 * Prompt for AI to generate code for a specific task.
 * @param taskDescription The code or feature to generate
 * @param language The programming language
 * @returns The prompt string for the AI model
 */
export function getCodeGenerationPrompt(taskDescription: string, language: string): string {
  return `Generate only the code (no explanation, no markdown) for the following task in ${language}:
"""
${taskDescription}
"""
Return only the code, no comments or extra text.`;
}

/**
 * Prompt for AI to validate a project plan or code.
 * @param plan The project plan object
 * @returns The prompt string for the AI model
 */
export function getValidationPrompt(plan: Record<string, unknown>): string {
  return `Validate the following project plan. If you find issues, return a JSON object with a 'valid' boolean and a 'problems' array. If valid, return { "valid": true, "problems": [] }.\n\n${JSON.stringify(plan, null, 2)}`;
}

/**
 * Prompt for AI to analyze a project and suggest improvements.
 * @param analysis The project analysis object
 * @returns The prompt string for the AI model
 */
export function getAnalysisPrompt(analysis: Record<string, unknown>): string {
  return `Given this project analysis, suggest improvements as a JSON array of suggestions.\n\n${JSON.stringify(analysis, null, 2)}`;
}

/**
 * Prompt for AI to describe available toolbox actions for the agent.
 * @param actions Array of available toolbox actions
 * @returns The prompt string for the AI model
 */
export function getToolboxPrompt(actions: string[]): string {
  return `You can use the following toolbox actions in the CLI agent. When you want to use a tool, respond with a JSON object: { "tool": "<action>", "args": [...] }.\nAvailable actions: ${actions.join(', ')}\nReturn only the JSON object, no explanation.`;
}

/**
 * Prompt for AI chat context (system prompt for agentic chat).
 * @param contextInfo Info about the project, user, or session
 * @returns The prompt string for the AI model
 */
export function getChatSystemPrompt(contextInfo: string): string {
  return `You are an agentic CLI assistant. Always ask for user approval before running any toolbox action. Respond in concise, actionable steps.\nContext: ${contextInfo}`;
}

// Add more prompt helpers here as needed for validation, code generation, etc.
