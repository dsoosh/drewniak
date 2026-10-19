## Decisions

- **Przykłady** to funkcje zwracające pełny stan (`normalize(defaultState())` + zmiany), wybierane
  z listy w nagłówku. Wczytanie przykładu nie nadpisuje pliku lokalnego (uchwyt pliku jest
  zapominany), stan trafia do localStorage jak każda zmiana.
  - Szopa na narzędzia 2,0 × 1,5 m: jednospadowy 10°, ściana 2000, drzwi 900 × 1900.
  - Warsztat 4 × 4 m: dwuspadowy 25°, ściana 2400, brama 1800 × 2100, dwa okna, poszycie od środka,
    podłoga 2,0 kN/m², kotwy co 1500.
  - Dom 70 m² (10 × 7 m): dwuspadowy 30°, ściana 2600, poszycie od środka, ściany nośne
    z propozycji generatora, kilka ścianek z drzwiami, okna, podłoga 2,0 kN/m², kotwy co 1500.
    Opis przypomina, że dom na zgłoszenie wymaga projektu budowlanego.
- **Kotwy na rzucie:** okrąg ⌀ 76 (pal) w kwadracie 150 (głowica), numer K1…Kn, wymiary
  rozstawu wzdłuż belki przedniej i między liniami. **W 3D:** głowica 150 × 150 × 8, rura ⌀ 76
  do 1000 mm w głąb i spirala; grunt półprzezroczysty, gdy warstwa kotew jest włączona.
- **Przenikanie:** poszycie ściany zewnętrznej i wewnętrznej sięga najwyżej do spodu krokwi
  w całym zakresie grubości płyty (minimum linii dachu na obu licach płyty). Ścianka dochodząca
  do ściany zewnętrznej wycina w poszyciu od środka pas swojej grubości na całą wysokość.
  Materiały płyt nieprzezroczyste, z `polygonOffset`, żeby stykające się płaszczyzny nie migotały.
- **Okna i drzwi 3D:** ościeżnica 60 mm na grubość ściany (z poszyciem), szyba 6 mm w środku,
  skrzydło drzwi 40 mm z klamką; „otwór” (przejście) bez wypełnienia.
- **Cross-eye:** `THREE.StereoCamera`, rozstaw oczu = 1/30 odległości kamery od celu (scena w mm,
  model kilkumetrowy), lewa połowa ekranu dostaje obraz prawego oka.
- **Limity** w `LIMITS` (model.js) — jedno źródło dla normalizacji, atrybutów `min`/`max` pól
  i komunikatu. Ścianek najwyżej 30, otworów na ścianę najwyżej 20.

## Recenzja mistrza ciesielskiego (2026-10-19, runda 5)

| Uwaga | Decyzja |
|---|---|
| Dom: ściany nośne dawały pokoje 1,55 m, pokój bez drzwi | Ściany nośne w osiach 2400 / 4600 (krokiew przechodzi), korytarz, drzwi do każdego pokoju. |
| Dom: ściany 95 mm to nie dom całoroczny | Nazwa „Dom letniskowy 70 m² (stan surowy)”, opis o izolacji ~200 mm (WT 2021) i projekcie. |
| Poszycie cięte pod krokwiami zachodziło na oczep tylko 15 mm przy 45° | Płyta do wierzchu oczepu z wcięciami na krokwie. |
| Krawędzie wycięcia przy ściance bez słupka | Słupki pod obiema krawędziami wycięcia. |
| Dom: belki poprzeczne 6800 i legary czołowe 7000 dłuższe niż materiał | Belki poprzeczne łączone nad kotwą linii pośredniej, legary czołowe dzielone nad belką; test: żaden element przykładu nie jest dłuższy niż materiał. |
| Nadproże z jednej kantówki | Zawsze co najmniej 2 × 45×95. |
| Warsztat: „dwa okna”, 22 kotwy | Opis „trzy okna”, belki co 1500 → 16 kotew. |
| Szopa: drzwi pod okapem | Wyższa ściana od frontu, dach opada do tyłu. |
| Limity zbyt luźne | Okap szczytowy ≤ 400, łaty ≤ 600, kotwy ≤ 2500, dach ≥ 0,9, podłoga ≥ 1,0 kN/m², rozstaw słupków z listy; ostrzeżenie, gdy płyta podłogi za cienka do rozstawu legarów. |
