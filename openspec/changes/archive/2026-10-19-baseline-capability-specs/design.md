## Context

Skrzynka powstała 2026-10-14 jako jeden plik HTML publikowany jako artefakt claude.ai.
Plik nie ma własnego szkieletu dokumentu (dokleja go serwer). Repo `dsoosh/drewniak`
było puste; strony mają być dostępne publicznie przez GitHub Pages.

## Goals / Non-Goals

**Goals:** zachować skrzynkę 1:1, opisać jej zachowanie, ustalić zasady pracy w repo.

**Non-Goals:** refaktor skrzynki do wspólnego silnika rozkroju (osobna zmiana).

## Decisions

- **Skrzynka jako `skrzynka/body.html` + `skrzynka/index.html`.** `index.html` to dokument
  ze szkieletem (doctype, meta, reset) i treścią `body.html` wklejoną 1:1. `body.html`
  zostaje źródłem zgodnym z artefaktem, żeby dało się go dalej publikować na claude.ai bez
  przeróbek. `tools/build-skrzynka.js` skleja oba pliki.
- **Skille i agent w `.claude/`, kopie w `.github/`** przez `tools/sync-agents.js`.
  OpenSpec generuje swoje skille dla obu narzędzi sam (`openspec init --tools claude,github-copilot`).

## Risks / Trade-offs

- Dwa pliki skrzynki mogą się rozjechać → `index.html` zawsze generowany skryptem.
