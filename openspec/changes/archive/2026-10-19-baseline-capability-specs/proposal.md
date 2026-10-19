## Why

Drewniak przenosi się z vaulta Obsidiana do repo na GitHubie. Jedyna gotowa konstrukcja
(skrzynka na narzędzia) nie ma żadnego speca, a od teraz każda zmiana ma przechodzić przez
OpenSpec. Potrzebny jest punkt odniesienia: co skrzynka robi dziś i jakie zasady pracy
obowiązują w repo.

## What Changes

- Bazowy spec kalkulatora skrzynki na narzędzia według stanu z 2026-10-14 (wersja z vaulta),
  bez zmian w zachowaniu.
- Skrzynka przenosi się do `skrzynka/` jako strona serwowana przez GitHub Pages.
- Spec zasad pracy w repo: każda zmiana przez OpenSpec, recenzja mistrza ciesielskiego
  przed archiwizacją zmian w geometrii, banan do skali na rysunkach, kod po angielsku i UI
  po polsku, brak kroku budowania.
- Skille i agent w repo (`ciesielka-i-stolarka`, `nowa-konstrukcja`, `wydanie`,
  `mistrz-ciesielski`) dla Claude Code i GitHub Copilota.

## Capabilities

### New Capabilities
- `toolbox-calculator`: kalkulator skrzynki na narzędzia z deski: optymalizacja wymiarów,
  rozkrój, model 3D i plan pracy narzędziami ręcznymi.
- `project-workflow`: zasady wprowadzania zmian, recenzji i publikacji w repo.

### Modified Capabilities

## Impact

- Nowe pliki: `skrzynka/index.html`, `skrzynka/body.html`, `.github/copilot-instructions.md`,
  `CLAUDE.md`, `.claude/skills/*`, `.claude/agents/*`, kopie w `.github/`.
- Kod skrzynki bez zmian funkcjonalnych.
