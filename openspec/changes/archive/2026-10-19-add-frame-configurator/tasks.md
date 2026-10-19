## 1. Generator

- [x] 1.1 `szkielet/js/model.js`: stan domyślny (zbudowana wiata), normalizacja, kodowanie linku
- [x] 1.2 `szkielet/js/build.js`: rama, legary, podłoga, ściany, otwory, ścianki działowe
- [x] 1.3 Dach jedno- i dwuspadowy: krokwie z wrębem, ściągi, łaty, siatka pokrycia, świetlik
- [x] 1.4 Poszycie ścian i podłogi z wycięciami i pomijaniem wąskich pasków
- [x] 1.5 Kontrola ugięć i ostrzeżenia

## 2. Rozkrój

- [x] 2.1 `szkielet/js/cut.js`: rozkrój 1D, rozkrój płyt MaxRects, grupowanie listy cięć
- [x] 2.2 `tests/build.test.js`: konfiguracja domyślna, dwuspadowy ze ścianką, przypadki brzegowe

## 3. Interfejs

- [x] 3.1 `szkielet/index.html` + `app.css`: układ, formularz parametrów, motyw jasny/ciemny
- [x] 3.2 `szkielet/js/draw.js`: rzut podłogi, widoki ścian, rzut dachu, banan, wymiary
- [x] 3.3 Edycja: otwory na widokach ścian, ścianki na rzucie, płyty przezroczyste na dachu
- [x] 3.4 `szkielet/js/view3d.js`: model 3D z warstwami i bananem
- [x] 3.5 Podsumowanie zamówienia, lista cięć, rozkrój sztuk i płyt, kontrole
- [x] 3.6 Zapis w localStorage, link `#s=`, eksport/import JSON, reset

## 4. Dokumenty

- [x] 4.1 `szkielet/js/pdf.js`: PDF z rysunkami (svg2pdf), tabelami i fontem z polskimi znakami
- [x] 4.2 Arkusz stylów do druku jako zapas

## 5. Strona i publikacja

- [x] 5.1 `index.html` w katalogu głównym, `tools/serve.js`, README
- [x] 5.2 Recenzja agenta `mistrz-ciesielski`, poprawki, wpis w design.md
- [x] 5.3 `openspec validate add-frame-configurator --strict`, archiwizacja
- [x] 5.4 Commit, push, GitHub Pages, notatka projektu w vaulcie
