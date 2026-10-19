## Why

Wiata 2,5 × 3,1 m (projekt z 2026-10-05) została zbudowana z kilkoma zmianami na budowie,
a każdy kolejny budynek szkieletowy liczy się od nowa ręcznie. Potrzebny jest publiczny
konfigurator, w którym każdy wyklika wymiary, dach, drzwi, okna i ścianki działowe, a lista
cięć, rozkrój i płyty przeliczają się na żywo.

## What Changes

- Nowa strona `szkielet/`: konfigurator budynku szkieletowego na ramie z belek 100×100.
- Dach jednospadowy albo dwuspadowy, spadek, okapy, krokwie i łaty z maksymalnego rozstawu,
  pokrycie z płyt falistych z siatką arkuszy i arkuszami przezroczystymi (świetlik).
- Ściany 45×95 z rygli co ~80 cm, otwory (drzwi, okna, przejścia) i ścianki działowe
  wstawiane na rzutach przeciąganiem; nadproża, słupki i rygle docinają się same.
- Poszycie OSB ścian i podłogi przycinane do otworów i skosów, rozkrój płyt.
- Rozkrój 1D na długości handlowe (100×100 – 13 m, 45×95 – 6 m, łata 50×50 – 5,4 m).
- Kontrola ugięć (legary, belki, krokwie, łaty, nadproża) i ostrzeżenia.
- Model 3D, PDF do pobrania i wydruku, link do udostępnienia konfiguracji.
- Strona główna repo z kartami konstrukcji; GitHub Pages.
- Wartości domyślne odtwarzają zbudowaną wiatę: rygle co ~80 cm, okap 30 cm z każdej
  strony, 8 krokwi, 10 łat 50×50, kantówka 45×95 wszędzie, rama 100×100.

## Capabilities

### New Capabilities
- `frame-generator`: geometria budynku szkieletowego (rama, podłoga, ściany, otwory,
  ścianki działowe, dach, poszycie, pokrycie) i kontrola ugięć.
- `frame-editor`: interfejs konfiguratora: parametry, edycja na rzutach, model 3D, zapis
  i udostępnianie.
- `cutting-optimizer`: rozkrój elementów prętowych na długości handlowe i płyt na arkusze.
- `frame-documents`: lista cięć, zestawienie materiałów, PDF.
- `site`: strona główna z listą konstrukcji i publikacja przez GitHub Pages.

### Modified Capabilities

## Impact

- Nowe pliki: `index.html`, `szkielet/**`, `tests/build.test.js`, `tools/serve.js`.
- Zależności z CDN (przypięte wersje): three.js, jsPDF, svg2pdf.js, font IBM Plex Sans (TTF z repo google/fonts).
- GitHub Pages włączone dla `main` / root.
