## Why

`openspec validate --all --strict` nie przechodzi: 15 wymagań w specach szkieletu i rozkroju ma
opis dłuższy niż 500 znaków (kilka zachowań w jednym wymaganiu), a `example-projects` ma Purpose
z szablonu po archiwizacji. Zmiana `add-skrzynia` wymaga przejścia walidacji całego repo.

## What Changes

- Każde za długie wymaganie zostaje (MODIFIED, ten sam nagłówek i wszystkie scenariusze) z opisem
  skróconym do jednego zachowania, bez zmiany znaczenia.
- Każde wycięte zachowanie staje się osobnym wymaganiem (ADDED) z własnym scenariuszem.
- Purpose `example-projects` wpisany bezpośrednio w spec główny.
- Bez zmian w kodzie ani w zachowaniu strony.

## Capabilities

### New Capabilities

### Modified Capabilities
- `cutting-optimizer`: „Linear stock cutting” podzielone na 4 wymagania.
- `frame-documents`: „Order summary first” podzielone na 2.
- `frame-editor`: 5 wymagań podzielonych (parametry, otwory na widokach ścian, ścianki działowe na
  rzucie, model 3D, zapis i udostępnianie).
- `frame-generator`: 8 wymagań podzielonych (rama i podłoga, ściany, otwory, ścianki działowe,
  dachy, poszycie i pokrycie, ugięcia, ściągi).

## Impact

- Tylko `openspec/specs/` (przez archiwizację tej zmiany) i Purpose `example-projects`.
- Kod, testy i strony bez zmian.
