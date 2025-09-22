> 🚀 **Feature Request**: Add a new feature to the `taskAgent` CLI that allows users to assign specific Ollama models to different agent tasks. This helps optimize performance, cost, and quality by using the right model for each function.
>
> ---
>
> ### 🎯 Objective:
>
> Enable `taskAgent` users to **assign different Ollama models** to each core task category:
>
> * `analysis`
> * `development`
> * `documentation`
> * `testing`
> * `suggestions`
> * `chat`
>
> ---
>
> ### 🔧 Implementation Requirements:
>
> 1. **Create or update a persistent config file**:
>
>    * Path: `~/.taskagent/config.json`
>    * Structure:
>
>      ```json
>      {
>        "models": {
>          "analysis": "llama2:2b",
>          "development": "llama2:7b",
>          "documentation": "llama2:14b",
>          "testing": "codellama:7b",
>          "suggestions": "phi:2b",
>          "chat": "llama3:8b"
>        }
>      }
>      ```
>
> 2. **Add a CLI command** to configure these model preferences:
>
>    ```bash
>    taskAgent configure models
>    ```
>
>    This should launch an interactive prompt where users can select a model for each task, with sensible defaults (e.g. `llama2:7b`).
>
> 3. **Update task execution logic** to:
>
>    * Read `~/.taskagent/config.json`
>    * Extract the correct model for the current task
>    * Use that model name in the `model` field of the **Ollama REST API**:
>
>      ```http
>      POST http://localhost:11434/api/generate
>      Content-Type: application/json
>
>      {
>        "model": "<model_from_config>",
>        "prompt": "<your_prompt_here>"
>      }
>      ```
>
> 4. **Fallback behavior**:
>
>    * If no config file exists, use default model: `llama2:7b`
>    * If a task is missing in the config, fall back to the default model
>
> 5. **Optional override per command**:
>
>    * Allow users to override the model per run with a flag:
>
>      ```bash
>      taskAgent doc generate --model llama2:14b
>      ```
>    * This override should take precedence over config.
>
> ---
>
> ### 💡 Notes:
>
> * The list of supported model names should be flexible to match what's available in the user's Ollama setup, such as:
>
>   * `llama2:2b`
>   * `llama2:7b`
>   * `llama2:14b`
>   * `codellama:7b`
>   * `phi:2b`
>   * `llama3:8b`
> * Ensure the config file is created if it doesn't exist, and offer the user a way to reset or edit it later.
>
> ---
>
> ### 📌 Summary:
>
> Implement a "task-to-model mapping" feature in `taskAgent` via a config file, an interactive CLI setup, and REST integration with Ollama models. This should give users full control over which models are used for each task the agent performs.

