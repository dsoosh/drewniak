## Why

Konsultacja mistrza ciesielskiego odrzuciła dom 70 m²: krokwie 45×95 na granicy ugięcia,
słupki szczytów 45×95 do 4,1 m (od wiatru ok. L/130), nadproża w ścianach nośnych na granicy,
56 kotew pod ramą 100×100. Generator zna tylko 45×95 i 100×100 i stawia ściany szczytowe
z jednego słupka. Większe budynki potrzebują większych przekrojów tam, gdzie pracują.

## What Changes

- Nowe przekroje: kantówka 45×145 i 45×195 (6 m), belka 150×150 (13 m, połówki 6,5 m), z cenami.
- Wybór przekroju krokwi i legarów poddasza (45×95 / 45×145 / 45×195) i belek ramy (100×100 / 150×150).
- Nadproża dobierane automatycznie: 2×45×95 płasko, potem na sztorc 2×45×95, 2×45×145,
  2×45×195 — najmniejsze, które przechodzi ugięcie.
- Ściana szczytowa wyższa niż 3 m dzielona na oczepie na wysokości okapu: dolna ściana
  z podwójnym oczepem i osobny trójkąt szczytu na nim; ostrzeżenie dla niedzielonych słupków
  dłuższych niż 3 m.
- Dom letniskowy 70 m² przeprojektowany: krokwie 45×195, legary poddasza 45×195 łączone nad
  jedną ścianą nośną w środku, rama 150×150, kotwy rzadziej, szczyty dzielone, bez poszycia od
  środka; opis „tylko konstrukcja, nie projekt”.

## Capabilities

### New Capabilities

### Modified Capabilities
- `frame-generator`: przekroje, nadproża, dzielenie szczytu.
- `example-projects`: dom 70 m² buduje się bez wad.
- `frame-editor`: pola przekrojów.

## Impact

- `model.js` (SECTIONS, stock, ceny), `build.js` (przekrój krokwi, belki ramy, nadproża,
  szczyt), `report.js`, `draw.js` (wysokości ramy z modelu), `view3d.js` (kolory), `app.js`,
  `examples.js`, testy.
