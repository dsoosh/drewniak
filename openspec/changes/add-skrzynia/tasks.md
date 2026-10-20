## 1. Zasady i agenci

- [x] 1.1 Agent `mistrz-rzemieslnik` w `.claude/agents/` i kopia w `.github/agents/` (`node tools/sync-agents.js`); plik istnieje w obu miejscach
- [x] 1.2 Skill `ciesielka-i-stolarka`: łączniki przy cienkich deskach, gwóźdź w drewnie czołowym, dno i wieko dużych skrzyń, wczepy proste, fugowanie i wilgotność; skopiowany do `.github/skills/`
- [x] 1.3 `CLAUDE.md`, `.github/copilot-instructions.md` i skill `nowa-konstrukcja`: recenzja obu mistrzów i zasada „ozdobą jest połączenie”
- [x] 1.4 Recenzja speca przez `mistrz-rzemieslnik` i ponowna przez `mistrz-ciesielski`; wnioski w specu albo w `design.md` jako przyjęte, `openspec validate add-skrzynia --strict` przechodzi

## 2. Generator

- [x] 2.1 `skrzynia/js/boards.js`: rozkrój z desek użytkownika, osobno deski skrzyni i deski tac (odcinki → pasy → elementy, liczenie cięć wzdłuż); testy w `tests/skrzynia.test.js` na zapas na rzaz, obcięcie końców i liczbę cięć wzdłuż przechodzą
- [x] 2.2 Reguła wczepów (najmniejsze nieparzyste n ≥ 3 z H/n ≤ 1,5T i ≥ T, najbliższe poprawne wysokości); siatka w dla linii poziomych; testy: 400/20 → 15 po 26,7, cokół 84 → 3 po 28, fartuch 73,3 → 3 po 24,4, taca 110/12 → 7 po 15,7, taca 75/16 odrzucona z 70 i 80, T = 28 i 32 dają poprawną skrzynię, wszystkie T 12–32 × H 250–700 mają układ, bez klejenia krawędzi 2 deski po 7 wczepów
- [x] 2.3 `skrzynia/js/build.js`: `defaultState()`, walidacja zakresów, geometria (korpus z naddatkiem 1 mm, ściany klejone albo z desek na sobie, szwy na siatce, dno na listwach ze szczelinami i gwoździami w środkowej ⅓, cokół k·w + 4, wieko z luzami, fartuchem 2w + T i listwami T × 50, tace stopniowane z listwą prowadzącą, dnem na listewkach, przegródką i otworem na siatce, uchwyty 2w); testy: brak NaN, brak ostrzeżeń w domyślnej, 14 narożników przy jednej tacy, ściana 330 = 198 + 132, dno 3 × 200 + 148, luz wieka 23/28 mm, listwa 385 mm, dolna taca z luzem 2 mm do listwy prowadzącej, uchwyt 253,3–306,7 × 220 mm, otwór 31,4 × 90
- [x] 2.4 Szukanie wymiarów: cele, blokady, minimalna długość wewnętrzna, głębokość ≤ 0,75 długości, klejenie krawędzi albo ściany z desek na sobie (wysokość k × szerokość deski), wolna wysokość pod stołem; testy scenariuszy ze speca (blokada wysokości 400, min. 700 mm, bez klejenia krawędzi → ściany 400 z dwóch desek, za wąska deska z podpowiedzią, proporcje liczone na obrysie, za małe deski z podpowiedziami, skrzynia pod stołem) i test czasu < 1 s
- [x] 2.5 Łączniki per połączenie (≤ głębokość materiału wzdłuż łącznika − 3 mm, nawiercanie w krawędź i czoło, zawiasy ≤ T − 3), okucia, kontrole (wieko: ugięcie i σ, dno 1 kN, wkręty listew), masa, liczba wczepów i czas, poziom trudności, narzędzia i plan pracy; okucia z jednego materiału, linie gwoździ, fazki, dobór desek i wykończenie w planie pracy, miejsce za skrzynią na wieko; testy: gwoździe cokołu ≤ 37 mm na 40 mm co ≤ 150, wieko na zakładkę ≈ 9,2 mm z podpowiedzią, wieko klejone < 3,9 mm i < 14 MPa, dno 148 mm ≈ 1,2 mm < 1,85, 3 zawiasy przy 900 mm, M6 z nakrętkami kołpakowymi przy uchwytach kupnych, ≈ 100 mm za skrzynią

## 3. Strona

- [x] 3.1 `skrzynia/index.html` + `skrzynia/js/app.js`: formularz (deski skrzyni, deski tac, klejenie krawędzi, cel, blokady, tace i ich wysokość, uchwyty, obciążenie, wysokość pod stołem, wykończenie; cokół i fartuch liczone z siatki), wyniki, ostrzeżenia, zastrzeżenie „to nie jest projekt”, localStorage i `#hash`; w `node tools/serve.js` link odtwarza tę samą skrzynię, konsola czysta
- [x] 3.2 Rzuty przód/bok/góra z wymiarami, wczepami, cokołem, tacami i bananem; rozkrój obu kompletów desek z kolejnością cięć; lista cięć ze szkicami; sprawdzić wizualnie na domyślnej skrzyni i na 2 tacach
- [x] 3.3 Model 3D (three.js 0.160) z otwieranym wiekiem, wczepami i bananem; zrzut ekranu z Playwright
- [x] 3.4 PDF (jsPDF + svg2pdf.js, font DejaVu ze szkieletu) z rzutami, rozkrojem, listą cięć, okuciami, planem pracy, kontrolami i zastrzeżeniem; plik się pobiera i ma wszystkie sekcje

## 4. Strona główna i dokumentacja

- [x] 4.1 Karta skrzyni w `index.html` i wpis w `README.md` (z `node tests/skrzynia.test.js`); link działa lokalnie

## 5. Integracja

- [x] 5.1 `node tests/build.test.js` i `node tests/skrzynia.test.js` przechodzą, `openspec validate --all --strict` przechodzi
- [x] 5.2 Recenzja `mistrz-ciesielski` i `mistrz-rzemieslnik` na wygenerowanej skrzyni (domyślna, najmniejsza, największa, 2 tace, bez kleju); wady poprawione albo przyjęte w `design.md`

## Workflow follow-up

- `/opsx:archive` po recenzjach obu mistrzów i odhaczeniu wszystkich zadań.
- Wydanie skillem `wydanie`.
