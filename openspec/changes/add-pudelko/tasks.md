## 1. Generator

- [ ] 1.1 `pudelko/js/build.js`: `defaultState()`, walidacja, korpus z wczepami (import `fingerLayout`), dno w rowku, cztery zamknięcia, panele klejone, części do listy cięć; testy w `tests/pudelko.test.js`: 90/12 → 5 po 18, 241/151 mm, rowek 6×6 na 6–12 mm zatrzymany w przodzie i tyle, obrzeże 54 mm z 3 wczepami, listewki 6 mm, boki 72 mm przy wsuwanej, linia cięcia 54 mm, przykrywka płaska 246×156 i listewki 124 mm
- [ ] 1.2 Szukanie wymiarów z blokadami i z desek (cel proporcje i pojemność), za mało deski z podpowiedzią; testy: wszystko zablokowane, nic zablokowane w tolerancji, za małe deski, czas < 1 s
- [ ] 1.3 Okucia (zawiasy, wkręty ≤ T − 3), kontrole dna i panelu, liczba wczepów i czas, trudność dla każdego zamknięcia, narzędzia, plan pracy, geometria; testy: plan wieka odcinanego, wkręty 3×8 przy T 12, brak NaN

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
