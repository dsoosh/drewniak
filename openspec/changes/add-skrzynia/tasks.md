## 1. Generator

- [ ] 1.1 `skrzynia/js/boards.js`: rozkrój z desek użytkownika (odcinki → pasy → elementy, liczenie cięć wzdłuż); testy w `tests/skrzynia.test.js` na zapas na rzaz, obcięcie końców i liczbę cięć wzdłuż przechodzą
- [ ] 1.2 `skrzynia/js/build.js`: `defaultState()`, walidacja zakresów, geometria (wręby, dno między ścianami, cokół, wieko z listwami i fartuchem, tace z prowadnicami, uchwyty); test domyślnej konfiguracji: brak NaN, brak ostrzeżeń, oczekiwana liczba elementów
- [ ] 1.3 Szukanie wymiarów: cele „pojemność” i „proporcje”, blokady, minimalna długość wewnętrzna, głębokość ≤ 0,75 długości, ściany klejone albo z jednej deski; testy scenariuszy ze speca (blokada wysokości, min. 700 mm, klej wyłączony, za małe deski z listą podpowiedzi) i test czasu < 1 s
- [ ] 1.4 Okucia i łączniki (zawiasy 2/3, ogranicznik, gwoździe 2,5–3 × T, wkręty, klej), kontrole ugięć dna i wieka, masa, ostrzeżenie o niskim miejscu pod tacami, poziom trudności i plan pracy; testy na długie wieko (3 zawiasy), wręb 21×14 i ugięcia w granicach dla domyślnej skrzyni

## 2. Strona

- [ ] 2.1 `skrzynia/index.html` + `skrzynia/js/app.js`: formularz, wyniki, ostrzeżenia, zastrzeżenie „to nie jest projekt”, localStorage i `#hash`; sprawdzić w `node tools/serve.js`, że link odtwarza tę samą skrzynię i konsola jest czysta
- [ ] 2.2 Rzuty przód/bok/góra z wymiarami, wrębami, cokołem, tacami i bananem; rozkrój desek z kolejnością cięć; lista cięć ze szkicami; sprawdzić wizualnie na domyślnej skrzyni i na 2 tacach
- [ ] 2.3 Model 3D (three.js 0.160) z otwieranym wiekiem i bananem; sprawdzić w przeglądarce (Playwright, zrzut ekranu)
- [ ] 2.4 PDF (jsPDF + svg2pdf.js, font DejaVu ze szkieletu) z rzutami, rozkrojem, listą cięć, okuciami, planem pracy, ugięciami i zastrzeżeniem; sprawdzić, że plik się pobiera i ma wszystkie sekcje

## 3. Strona główna i dokumentacja

- [ ] 3.1 Karta skrzyni w `index.html` i wpis w `README.md`; sprawdzić link lokalnie
- [ ] 3.2 Skill `nowa-konstrukcja`/README: dopisać `node tests/skrzynia.test.js` do poleceń; `node tools/sync-agents.js`, jeśli zmienił się skill

## 4. Integracja

- [ ] 4.1 `node tests/build.test.js` i `node tests/skrzynia.test.js` przechodzą, `openspec validate --all --strict` przechodzi
- [ ] 4.2 Recenzja agenta `mistrz-ciesielski` na domyślnej skrzyni i na przypadkach brzegowych; wady konstrukcyjne poprawione

## Workflow follow-up

- `/opsx:archive` po recenzji mistrza i odhaczeniu wszystkich zadań.
- Wydanie skillem `wydanie`.
