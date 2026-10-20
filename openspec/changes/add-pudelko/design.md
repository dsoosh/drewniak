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

`fingerLayout` importowany ze skrzyni, ta sama reguła i ta sama zasada „przód i tył trzymają
skrajne”. Wszystkie linie poziome przecinające narożnik (linia cięcia wieka, obniżone boki,
wysokość obrzeża pokrywki) leżą na granicy wczepu k·w, więc cięcie i obniżenie nie przecinają
żadnego wczepu. Wymiar ścianek to wysokość korpusu; dla wieka odcinanego to wysokość zamkniętego
pudełka.

### Dno i panele

Rowek T/2 × T/2 w środku pasa dolnego wczepu: w = T…1,5T, więc rowek mieści się w pasie z
zapasem ≥ T/4 nad i pod. W bokach rowek przelotowy (kończy się w gnieździe pod wczepem przodu),
w przodzie i tyle zatrzymany T/2 od końców, żeby nie wyszedł na czole wczepu. Panel z deski T
z wrębem na krawędziach do pióra T/2. Słoje dna wzdłuż długości, luz 1% + 1 mm w poprzek.
Panele szersze od deski klejone z pasów (reszta ≥ 20 mm, małe pudełko).

### Zamknięcia

- **Pokrywka nasadzana:** obrzeże 3w z 3 wczepami po w (ten sam rytm co korpus), panel w rowku
  pasa górnego obrzeża. Listewki T/2 grube i w + 6 mm wysokie, klejone od środka korpusu na pasie
  górnego wczepu, wystają 6 mm ponad ścianki.
  Przy 2w obrzeże miałoby wczepy 2w/3 < T poza przypadkiem w = 1,5T, więc 3w.
- **Przykrywka wsuwana:** rowki w przodzie i tyle w pasie górnego wczepu, przelotowe (widać je na
  czołach — tak wygląda takie pudełko). Boki kończą się na H − w, czyli na granicy wczepu; górny
  pas narożnika należy do przodu i tyłu, więc obniżenie boków nie zmienia wczepów. Panel ze
  słojami wzdłuż, pióro na krawędziach, wycięcie na palec przy jednym końcu, klocek zatrzymujący
  pod drugim (klejony do panelu, opiera się o bok od środka).
- **Wieko odcinane:** zamknięte pudełko z panelem górnym w rowku pasa górnego wczepu, cięcie
  piłą po granicy k·w (k ≥ 2 najbliżej H/3), rzaz z części wieka, struganie obu powierzchni.
  Zawiasy wpuszczane, skrzydełko ≤ T, wkręty ≤ T − 3 mm (3×8 przy T = 12).
- **Przykrywka płaska:** panel 3 mm większy z każdej strony, dwie listewki w poprzek słojów od
  spodu, wchodzą do środka z luzem 1 mm, klejone tylko w środkowej ⅓ (panel pracuje).

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

## Risks / Trade-offs

- [Import z `skrzynia/js/build.js` wiąże pudełko ze skrzynią] → importujemy tylko `fingerLayout`
  i `boards.js`; testy pudełka łapią zmianę reguły.
- [Drukarka skaluje stronę] → pasek kontrolny 100 mm i napis „drukuj w skali 100%”.
- [Rowek przelotowy przykrywki wsuwanej widać na czołach] → przyjęte, to cecha tego typu pudełka.
