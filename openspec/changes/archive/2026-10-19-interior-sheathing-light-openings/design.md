## Context

Otwór dziś: usuwa słupki w strefie `[o0 − 90, o1 + 90]`, stawia słupek pełny i słupek pod
nadprożem z każdej strony, nadproże leży na słupkach pod nadprożem. Poszycie: tylko na zewnątrz
ścian zewnętrznych, ścianki działowe obłożone z obu stron albo wcale.

## Droga obciążenia (otwór pojedynczy)

Nadproże między słupkami bocznymi, przykręcone przez słupki w czoło nadproża — łączniki
pracują na ścinanie. Dlatego tylko do progu szerokości (domyślnie 1200 mm) i tylko gdy
nadproże płaskie przechodzi ugięcie; inaczej wraca układ z słupkiem pod nadprożem, na którym
nadproże **leży** (oparcie zamiast łączników). Nad nadprożem krótkie słupki jak dotąd.

## Decisions

- **Wybór układu otworu:** `pojedynczy` gdy `w < walls.doubleFrom` i nadproże płasko
  przechodzi; w przeciwnym razie `podwójny` (dotychczasowy). Próg w formularzu.
- **Wykorzystanie słupka z siatki:** jeśli słupek siatki ma lico w odległości ≤ 30 mm od
  krawędzi otworu (po jego zewnętrznej stronie), zostaje słupkiem bocznym; szczelinę wypełnia
  ościeżnica / klin. Inaczej nowy słupek przy krawędzi.
- **Wykorzystanie rygla:** rząd rygli, który wypada w paśmie ±30 mm od podokiennika albo
  spodu nadproża, w polu otworu nie dostaje osobnego rygla — jego rolę pełni podokiennik /
  nadproże (bez dublowania). Poza otworem rząd biegnie normalnie.
- **Poszycie od środka:** płyty od wierzchu podłogi do wierzchu oczepu (szczytowe: do linii
  oczepu skośnego), w świetle ścian: podłużne między licami ścian szczytowych, szczytowe
  między licami ścian podłużnych. Etykiety `Fw1…`, osobny rozkrój „od środka”.
- **Widok od środka:** ten sam rysunek lustrzanie (U → U0 + U1 − U), poszycie wewnętrzne,
  banan na podłodze przy ścianie. Przeciąganie w lustrze odwraca znak przesunięcia; uchwyty
  krawędzi opisują krawędź w układzie U, więc lewa/prawa krawędź na ekranie działa poprawnie.
- **Ścianki:** `sheathe: 'none' | 'a' | 'b' | 'both'`; strona A = strona o mniejszej
  współrzędnej (przód albo lewa). Stare `true` → `'both'`.
- **Rzaz:** pozostałość = długość − użyte − rzaz (jeśli coś zostaje). Pole znika z formularza.

## Risks / Trade-offs

- Pojedynczy słupek przy drzwiach dostaje uderzenia skrzydła → w liście cięć uwaga,
  żeby ościeżnicę kotwić w słupek co ≤ 50 cm (informacyjne, nie blokuje).

## Recenzja mistrza ciesielskiego (2026-10-19, runda 3)

| Uwaga | Decyzja |
|---|---|
| Dwa otwory na wspólnym słupku: słupek znikał | Słupek może być bokiem kilku otworów; słupek boczny otworu jest też do wykorzystania przez sąsiedni otwór i powstaje raz. |
| Nadproże między słupkami trzyma się na wkrętach w czoło | Reakcja ≤ 0,5 kN na warstwę: wkręty; do 4 kN: 2 kątowniki na koniec (w zestawieniu); powyżej: słupki pod nadprożem. |
| Rygiel na styku płyt znikał nad nadprożem | Rząd na styku płyt pomijany tylko, gdy styk leży w obrysie podokiennika/nadproża (10 mm zapasu). |
| Poszycie od środka nie trafiało w słupki | Kolumny z siatki słupków, styk poziomy na wysokości zewnętrznego (2550), trzeci słupek w narożniku ścian podłużnych. |
| Poszycie od środka ściany wysokiej wchodziło w krokwie | Cięte do spodu krokwi przy licu wewnętrznym. |
| Słupek narożny nie był wykorzystywany | Narożny też może być bokiem otworu; próg ostrzeżenia o narożniku liczony od faktycznego słupka bocznego. |
| Komunikat „przesuń” wpychał okno na drugi słupek | Gdy przesunięcie nie mieści się, komunikat mówi o zwężeniu otworu. |
| Rozpiętość nadproża w+T, kontrola mieszczenia 90 mm | Rozpiętość między słupkami, kontrola z rzeczywistej wysokości nadproża. |
| Drzwi na pojedynczych słupkach | Uwaga w liście cięć: ościeżnicę kotwić co ≤ 50 cm. |
