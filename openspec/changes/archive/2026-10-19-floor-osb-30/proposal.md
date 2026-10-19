## Why

Na budowie podłoga jest z OSB 30 mm, a konfigurator domyślnie liczy 25 mm — zamówienie i
koszt podłogi wychodzą źle, a wysokości ścian od gruntu są o 5 mm za niskie.

## What Changes

- Domyślna grubość płyty podłogi: 30 mm (pióro-wpust). Pozostałe grubości bez zmian.

## Capabilities

### New Capabilities

### Modified Capabilities
- `frame-generator`: domyślna grubość płyty podłogi.

## Impact

- `szkielet/js/model.js`, testy zależne od wysokości podłogi. Zapisane konfiguracje
  zachowują swoją grubość.
