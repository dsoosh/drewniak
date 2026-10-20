## Why

Wczepy proste to podstawa skrzyni warsztatowej, a ponad sto wczepów na pierwszy raz to dużo.
Małe pudełko pozwala przećwiczyć trasowanie, piłowanie i dłutowanie na kilkunastu wczepach, z
jednej deseczki, zanim ktoś zabierze się za skrzynię. Każde z czterech zamknięć ćwiczy inną
technikę: obrzeże na wczepach, rowek, odcinanie wieka, listewki pod płaską deseczką.

## What Changes

- Nowa strona `pudelko/`: kalkulator pudełka na wczepach prostych do ćwiczeń.
- Wymiary zewnętrzne można zablokować; te niezablokowane są dobierane z deski, którą ma
  użytkownik (cel: proporcje albo pojemność).
- Cztery zamknięcia do wyboru: pokrywka nasadzana (obrzeże na wczepach), przykrywka wsuwana w
  rowki, wieko odcinane z zamkniętego pudełka na zawiasach, przykrywka płaska nakładana z
  listewkami.
- Dno pływające w rowku. Wczepy według reguły ze skrzyni warsztatowej; linie poziome na siatce
  wczepów.
- Wyniki: model 3D z otwieraniem, rzuty z wymiarami, szablon do trasowania wczepów 1:1 w PDF,
  rozkrój deski, lista cięć, plan pracy narzędziami ręcznymi, narzędzia, poziom trudności. Banan
  do skali na rysunkach i w 3D.
- Strona główna dostaje kartę pudełka.

## Capabilities

### New Capabilities
- `finger-box-calculator`: kalkulator pudełka ćwiczebnego na wczepach prostych z czterema
  rodzajami zamknięcia, z wymiarów albo z deski użytkownika.

### Modified Capabilities
- `site`: strona główna linkuje także do pudełka.

## Impact

- Nowe pliki: `pudelko/index.html`, `pudelko/js/build.js` (czysty generator), `pudelko/js/app.js`,
  `pudelko/js/draw.js`, `pudelko/js/view3d.js`, `pudelko/js/pdf.js`, `tests/pudelko.test.js`.
- Import z `skrzynia/js/build.js` (reguła wczepów) i `skrzynia/js/boards.js` (rozkrój) oraz banana
  ze szkieletu; bez zmian ich zachowania.
- `index.html`, `README.md`. Bez nowych zależności.
- Kolejność: `add-skrzynia` archiwizowana przed tą zmianą (obie zmieniają listę na stronie głównej).
