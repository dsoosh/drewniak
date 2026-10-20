## 1. Generator

- [x] 1.1 `pudelko/js/build.js`: `defaultState()`, walidacja, korpus z wczepami (import `fingerLayout`), ścianki z jednej deski, rowki z żelaz strugnicy i głębokością od luzu, dno pływające, płyty symetryczne, cztery zamknięcia według speca; testy w `tests/pudelko.test.js` na wszystkie liczby ze scenariuszy (90/12 → 5 po 18, 241/151, rowek 6 na 6–12, płyta 6 mm pod krawędzią, obrzeże B P B 54 mm, listewki 216/114 × 6 × 24, boki 78/90, wnęka 24×10×4, trasowanie 92 i wieko 45/45, zawiasy 30 mm 30 od końca, przykrywka płaska 252×162 z listewkami 12×18×124, T 8 i 330 odrzucone, T 14 → rowek 6)
- [x] 1.2 Szukanie wymiarów z blokadami i z desek (cel proporcje i pojemność), za mało deski z podpowiedzią; testy: wszystko zablokowane, nic zablokowane w tolerancji, za małe deski, czas < 1 s
- [x] 1.3 Okucia (zawiasy z ogranicznikiem, wkręty ≤ T/4), kontrole dna i panelu wzdłuż słojów, ostrzeżenia L/T, liczba wczepów i czas, trudność dla każdego zamknięcia (+1 przy T 8), narzędzia ze strugnicą i żelazem, plan pracy, geometria; testy: plan wieka odcinanego, dno T 8 500×200 ponad limitem, cięższe ostrzeżenie T 20 L 200, brak NaN

## 2. Strona

- [ ] 2.1 `pudelko/index.html` + `pudelko/js/app.js`: formularz, wyniki, link i localStorage; w `node tools/serve.js` link odtwarza to samo pudełko, konsola czysta
- [ ] 2.2 Rzuty przód/bok/góra z wymiarami i bananem, rozkrój, lista cięć, podgląd szablonu; zrzuty dla czterech zamknięć
- [ ] 2.3 Model 3D z otwieraniem (zawiasy), zdejmowaniem (nasadzana, płaska) i wysuwaniem (wsuwana), z bananem; zrzut z Playwright
- [ ] 2.4 PDF z rzutami, szablonem 1:1 (pasek kontrolny 100 mm sprawdzony w wygenerowanym pliku), rozkrojem, listą cięć i planem

## 3. Strona główna i dokumentacja

- [ ] 3.1 Karta pudełka w `index.html`, wpis w `README.md`; link działa lokalnie

## 4. Integracja

- [ ] 4.1 Wszystkie testy w `tests/` przechodzą, `openspec validate --all --strict` przechodzi
- [ ] 4.2 Recenzja `mistrz-ciesielski` i `mistrz-rzemieslnik` na wygenerowanych pudełkach (cztery zamknięcia, deski 8 i 20 mm); wady poprawione albo przyjęte w `design.md`

## Workflow follow-up

- `/opsx:archive` po `add-skrzynia` i po recenzjach obu mistrzów.
- Wydanie skillem `wydanie`.
