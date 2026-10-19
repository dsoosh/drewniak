## Why

Belki 100×100 mają w składzie 13 m, ale sprzedawane są po 6,5 m (połówka belki). Konfigurator
liczy je w sztukach po 13 m, więc zamówienie wychodzi w złych jednostkach i z za dużym odpadem
(np. 2 × 13 m zamiast 3 × 6,5 m).

## What Changes

- Domyślna długość handlowa belki 100×100: 6500 mm; w zestawieniu dopisek, że to połowa belki 13 m.
- Belki podłużne dłuższe niż sztuka handlowa łączone nad belką poprzeczną (podporą), nie w
  dowolnym miejscu.

## Capabilities

### New Capabilities

### Modified Capabilities
- `frame-generator`: łączenie belek podłużnych tylko nad podporą.
- `cutting-optimizer`: domyślne długości handlowe w scenariuszu (100×100 po 6,5 m).

## Impact

- `szkielet/js/model.js` (domyślna długość), `szkielet/js/build.js` (podział belek podłużnych),
  `szkielet/js/report.js` (opis pozycji), `tests/build.test.js`.
- Zapisane konfiguracje z 13000 zachowują swoją wartość (pole jest edytowalne).
