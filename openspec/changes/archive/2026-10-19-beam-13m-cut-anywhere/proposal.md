## Why

Belka 100×100 leży w składzie jako 13 m i jest cięta na życzenie; płaci się za połówki
6,5 m. Konfigurator liczył ją jak osobne sztuki 6,5 m, więc np. w warsztacie 4 × 4 m
(2 × 4000 + 4 × 3800) wychodziło 6 połówek, choć 4000 + 4000 + 3800 i 3 × 3800 mieszczą się
w dwóch belkach 13 m, czyli w 4 połówkach. Belka podłużna 10 m też była niepotrzebnie
dzielona na dwa kawałki.

## What Changes

- 100×100 rozkrajana z belek 13 m, a liczona i wyceniana w połówkach 6,5 m: belka 13 m, z której
  wykorzystano najwyżej 6,5 m, to jedna połówka, w przeciwnym razie dwie.
- Kawałek 100×100 może mieć dowolną długość do 13 m (np. belka podłużna 10 m w jednym kawałku);
  dłuższe łączone nad kotwą jak dotąd.
- Rozkrój pokazuje belki 13 m z kawałkami i resztą; połówki liczą się tylko w zestawieniu i koszcie.

## Capabilities

### New Capabilities

### Modified Capabilities
- `cutting-optimizer`: rozkrój 100×100 z belek 13 m z rozliczeniem w połówkach.

## Impact

- `szkielet/js/model.js` (`stock.b100`: długość 13000, jednostka 6500), `cut.js` (pakowanie
  z jednostkami), `report.js`, rysunki rozkroju w `app.js` i `pdf.js`, testy.
- Zapisane konfiguracje z długością 6500 przechodzą na 13000 z jednostką 6500.
