## Why

W warsztacie 4 × 4 m wychodziło 51,7 m odpadu kantówki 45×95 (64 sztuki po 6 m, wykorzystane
332 m). Oczepy, podwaliny i legary czołowe mają po 3,8–4,0 m: dwa takie nie mieszczą się
w jednej 6-metrówce, więc każdy zajmował osobną sztukę i zostawiał ~2 m, w które nie wchodzi
ani słupek (2,27 m), ani krokiew (2,54 m). Generator łączył oczepy i podwaliny tylko wtedy,
gdy ściana była dłuższa niż kantówka.

## What Changes

- Oczep (obie warstwy), podwalina i legar czołowy mogą być z dwóch kawałków także wtedy, gdy
  mieszczą się w kantówce, jeśli dzięki temu trzeba kupić mniej sztuk. Generator liczy oba
  warianty (w całości i łączone) i bierze ten z mniejszą liczbą kantówek; przy remisie zostają
  w całości.
- Styk oczepu i podwaliny tylko na słupku, legaru czołowego nad belką ramy. Styki w jednej linii
  ściany (podwalina, oczep dolny, oczep górny, podwalina szczytu, legar czołowy pod nią) są
  rozsunięte co najmniej o jedno pole słupków.
- Przełącznik nie dotyczy słupków, ściągów ani krokwi (te mają własne zasady łączenia).
- Nowy przełącznik „Łącz oczepy i podwaliny, gdy mniej odpadu”, domyślnie włączony.
- Warsztat 4 × 4 m: 57 zamiast 64 kantówek 6 m, odpad 9,7 m zamiast 51,7 m.

## Capabilities

### New Capabilities

### Modified Capabilities
- `frame-generator`: łączenie oczepów, podwalin i legarów czołowych, gdy mniej odpadu.
- `frame-editor`: przełącznik łączenia w parametrach ścian.

## Impact

- `szkielet/js/build.js` (dwa warianty, wybór po liczbie kantówek, rozsunięte styki),
  `model.js` (`walls.splitPlates: true`), `app.js` (przełącznik), testy.
- Zapisane konfiguracje bez pola dostają domyślne `true`; ich lista materiałów może się zmienić.
