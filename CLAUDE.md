@.github/copilot-instructions.md

Skille Claude Code leżą w `.claude/skills/`, agenci recenzujący w `.claude/agents/`
(`mistrz-ciesielski` — konstrukcja, `mistrz-rzemieslnik` — forma).
Kopie dla GitHub Copilota w `.github/skills/` i `.github/agents/` — przy zmianie skilla
aktualizuj obie (`node tools/sync-agents.js` kopiuje `.claude` → `.github`).
