## Context

Skrzynia warsztatowa (`skrzynia/js/build.js`) ma już regułę wczepów (`fingerLayout`), siatkę linii
poziomych i rozkrój desek użytkownika (`skrzynia/js/boards.js`). Szkielet daje banana (2D i 3D) i
font do PDF. Pudełko jest małe i ćwiczebne, więc konstrukcja jest prostsza, a nacisk leży na
trasowaniu wczepów, stąd szablon 1:1.

## Goals / Non-Goals

**Goals:**
- Czysty `build(state)` w `pudelko/js/build.js` z geometrią prostopadłościanów jak w skrzyni,
  testowany w `tests/pudelko.test.js`.
- Cztery zamknięcia z jednego modelu korpusu.
- Szablon do trasowania 1:1 w PDF.

**Non-Goals:**
- Jaskółki, przegródki, zamki, okucia poza zawiasami wieka odcinanego.
- Wspólny moduł z kalkulatorem skrzynki (`skrzynka/`).

## Decisions

### Droga obciążenia

Pudełko niesione w dłoniach albo za boki: zawartość → dno (leży w rowku, przenosi na docisk w
ściankach) → ścianki → wczepy (klej na długich włóknach) → dłonie. Dno nie jest klejone ani
przybijane, więc nic nie pracuje na wyrywanie. Pokrywka nasadzana opiera się na krawędziach
ścianek i ustala na listewkach wewnętrznych. Przykrywka wsuwana leży w rowkach przodu i tyłu i na
obniżonych bokach. Wieko na zawiasach wisi na wkrętach w krawędzi ścianek (ścinanie).

### Wczepy i siatka

`fingerLayout` importowany ze skrzyni, ta sama reguła i zasada „przód i tył trzymają skrajne” w
korpusie. Linie przecinające narożnik (obrzeże, spód listewek) leżą na granicy k·w; cięcie wieka
w środku pasa. Ścianki, obrzeże i zamknięte pudełko zawsze z jednej szerokości deski — klejenie
ścianki przecięłoby wczepy, a pudełko ćwiczebne tego nie potrzebuje.

### Dno i panele

Rowek z typowego żelaza strugnicy (3, 4, 5, 6, 8, 10 mm, najszersze ≤ T/2), głębokość
max(T/2, luz + 3 mm) (2 mm poniżej T = 10), najwyżej T − 3. Luz w poprzek słojów 1% (miękkie)
albo 1,5% (twarde) + 1 mm, wzdłuż 1 mm. Przy T = 6 rowek nie utrzyma żadnego sensownego dna, więc
deski od 8 mm. Rowek dna w pasie dolnego wczepu, ≥ 4 mm nad spodem, przelotowy w bokach,
zatrzymany T/2 przed końcem w przodzie i tyle (kończy się w gnieździe pod wczepem). Dno z wrębem od
góry: spód panelu na dolnej krawędzi rowka, pudełko stoi na ściankach. Płyty z jednej deski albo
z pasów symetrycznych (dwa równe, albo środek pełny i dwa równe skrajne ≥ 40 mm).

### Zamknięcia (po recenzji obu mistrzów)

- **Pokrywka nasadzana:** obrzeże 3w z 3 wczepami po w, ale skrajne trzymają boki (B P B), więc na
  zamkniętym pudełku przemienność idzie przez styk (rzemieślnik; obrzeże nic nie dźwiga). Tylko
  przy n ≥ 5 w korpusie, bo przy n = 3 pokrywka byłaby równa korpusowi. Listewki T/2 × (w + 6),
  dwie L − 2T i dwie D − 3T, wręb 0,5 mm na wystającej części, fazka 1 mm. Płyta wierzchnia z
  wrębem od spodu, pióro przy wierzchu, wierzch cofnięty o T/4–T/2 (linia cienia). Zlicowanie, o
  które prosił rzemieślnik, wymagałoby wrębu z obu stron i i tak zostawiłoby szczelinę na luz, więc
  przyjęte cofnięcie, które proponował ciesielski.
- **Przykrywka wsuwana:** wierzch równo ze ściankami, pióro przy spodzie (wrąb od góry). Jeden bok
  obniżony do H − T, czyli do spodu przykrywki, drugi bok pełny z rowkiem, w który wchodzi koniec
  przykrywki (ciesielski: przy dwóch niskich bokach klocek więzi przykrywkę). Obniżenie leży w
  górnym pasie, gdzie bok ma gniazdo pod wczep przodu, więc nie przecina wczepu i nie musi być na
  siatce. Rowki przodu i tyłu przelotowe przy niskim boku, zatrzymane przy wysokim. Bez klocka;
  wnęka na palec 24 × 2,5·T/3, T/3 głęboka.
- **Wieko odcinane:** cięcie w środku pasa, który trasujemy na w + rzaz + 1 mm, więc po rzazie i
  struganiu obie połówki mają w/2 i po zamknięciu czytają się jak jeden wczep (ciesielski: cięcie po
  granicy wycina lico klejowe; rzemieślnik: pasy mają wyjść równe). Każda część ≥ 2,5w, czyli dwa
  lica klejowe na narożnik; wieko (k + ½)w, k = max(2, ⌊0,3n⌋); tylko n ≥ 5 i T ≥ 8. Rzaz piły
  ręcznej osobnym parametrem (domyślnie 1 mm). Zawiasy wpuszczane z ogranicznikiem 95° (wieko
  odchylone za pion wyrywałoby wkręty), skrzydełko ≤ T − 2, długość z szeregu najbliżej L/8,
  odsunięte o max(T + w, w + 10) od końca, wkręty ≤ T/4 średnicy, mosiężne. Fazka chwytu 45° T/3
  na środkowej ⅓ przodu wieka.
- **Przykrywka płaska:** wysięg max(4, round(T/2)), listewki T × 1,5T, lica zewnętrzne 1 mm od
  boków od środka (ustala w obu kierunkach), klejone w środkowej ⅓.

### Szukanie wymiarów

Jak w skrzyni: siatka 10 mm, wysokości z poprawnym układem wczepów, kandydaci sortowani po celu,
rozkrój od najlepszego do pierwszego, który się mieści. Obrys proporcji z pokrywką.

### Szablon 1:1

Osobna strona PDF w skali 1:1 (jednostki mm w jsPDF): pasek dla każdej wysokości z układem
wczepów, krzyżyki na odpadzie, linia głębokości T + 0,5 mm i pasek kontrolny 100 mm. Na ekranie
podgląd w zakładce.

### Strona

`pudelko/index.html` w układzie szkieletu i skrzyni (`../szkielet/app.css` +
`../skrzynia/skrzynia.css`), rysunki z geometrii jak w skrzyni, three.js 0.160.

### Po recenzji implementacji (zadanie 4.2)

- **Płyty:** pióro długie na głębokość rowka d, ramiona wrębu c/2 od ścianek (wcześniej 0, płyta
  po spęcznieniu rozpychała narożniki), rowki zatrzymane T − d przed końcem (przy głębszym rowku
  T/2 dawało płytę za długą o 2d − T − 1).
- **Rowek dna:** ≥ 3 mm drewna do linii wczepu; gdy się nie mieści, węższe żelazo (np. 5 mm przy
  w = 12); gdy nawet 3 mm nie wchodzi — odrzucenie z wyjaśnieniem.
- **Wieko odcinane od 7 wczepów** (rzemieślnik: przy 5 wieko i korpus wychodzą równe), wieko
  (k + ½)w najbliżej H/3; spełnia też warunek ciesielski ≥ 2,5w na część. Plan podaje linię
  cięcia i rowek płyty na surowych ściankach.
- **Zawiasy z tabeli typowych skrzydełek** (20/25/30/40/50 → 6/7,5/9/10,5/12,5 mm), najbliżej L/8
  wśród tych, które mieszczą się w T − 2; odsunięcie max(długość, T + 5). Wartości skrzydełek są
  orientacyjne, ze sprawdzeniem w ofercie przy zakupie.
- **Cofnięcie płyt 3–6 mm**, wnęka na palec 24 × 16 mm, przykrywka wsuwana bez schodka 0,5–3 mm
  przy wolnej wysokości, wolna długość w 12–30 T, w sortowaniu najpierw ścianki z jednego pasa.
- **Rysunki:** wymiary z korpusu, zawiasy i fazka chwytu w obrysie, banan za wymiarami; szablon
  z linią cięcia wieka.
- **Diagnoza:** najmniejsza potrzebna szerokość deski, osobne komunikaty dla pasa, zawiasów i
  zbyt małego pudełka.
- **Druga runda:** pokrywka nasadzana przy wolnej wysokości z 5 wczepami dostaje notę (więcej
  deski → 7 wczepów); domyślnie 3 deski, więc domyślna pokrywka ma 7 wczepów. Trzeci zawias
  pośrodku, gdy L/8 przekracza zawias o > 15 mm albo wieko waży > 0,6 kg. Fazka chwytu rysowana
  dwiema liniami, opisy szablonu nie kolidują z linią cięcia, bez mylącej podpowiedzi „za małe”
  przy zbyt wąskiej desce.
- **Nie przyjęte:** zestruganie grubych płyt do T/2 + 4 przy T = 20 (ciesielski zostawił do
  decyzji formy; płyta tej samej grubości upraszcza rozkrój i ćwiczenie).

## Risks / Trade-offs

- [Import z `skrzynia/js/build.js` wiąże pudełko ze skrzynią] → importujemy tylko `fingerLayout`
  i `boards.js`; testy pudełka łapią zmianę reguły.
- [Drukarka skaluje stronę] → pasek kontrolny 100 mm i napis „drukuj w skali 100%”.
- [Rowek przelotowy przykrywki wsuwanej widać na czołach przy niskim boku] → przyjęte, to cecha tego typu pudełka.
- [Deski 8 mm ograniczają szerokość pudełka (rowek)] → strona odrzuca takie pudełko z wyjaśnieniem; od 10 mm ograniczenie znika przy typowych wymiarach.
