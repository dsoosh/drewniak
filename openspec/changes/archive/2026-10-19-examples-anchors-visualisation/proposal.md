## Why

Nowy użytkownik zaczyna od wiaty 3,1 × 2,5 m i nie widzi, jak generator radzi sobie z innymi
budynkami. Kotwy gruntowe są policzone, ale na rzucie to ledwo widoczne kwadraty, a w 3D ich
nie ma. W modelu 3D kantówki przebijają poszycie: krokwie przechodzą przez płytę ściany
okapowej, ścianki przez poszycie od środka, a półprzezroczyste płyty pokazują szkielet za nimi.
Nie ma okien ani drzwi w wizualizacji. Wpisanie 80000 mm zawiesza przeglądarkę.

## What Changes

- **Projekty przykładowe** do wczytania jednym kliknięciem: wiata 3,1 × 2,5 m (zbudowana),
  szopa na narzędzia, warsztat 4 × 4 m, dom na zgłoszenie 70 m².
- **Kotwy gruntowe na rysunkach:** na rzucie podłogi symbol kotwy z numerem i wymiarami rozstawu;
  w 3D pal z głowicą pod ziemią (grunt półprzezroczysty, warstwa „Kotwy”).
- **Mniej przenikania:** płyty w 3D nieprzezroczyste; poszycie ściany okapowej cięte pod
  spodem krokwi w płaszczyźnie płyty; poszycie od środka z wycięciem tam, gdzie dochodzi ścianka.
- **Poszycie ścianek:** nowe ścianki domyślnie obłożone z obu stron; osobna warstwa 3D
  „Poszycie od środka”.
- **Okna i drzwi w 3D:** ościeżnice, szyby i skrzydła drzwi, warstwa „Okna i drzwi” i widok
  „Wizualizacja” (całość z oknami i drzwiami).
- **Tryb 3D zezem (cross-eye):** dwa obrazy stereo obok siebie, prawy obraz dla lewego oka.
- **Limity wartości:** każde pole ma minimum i maksimum (np. długość 1–15 m, szerokość 1–10 m);
  wartość spoza zakresu jest przycinana z komunikatem, liczba ścianek i otworów ograniczona.

## Capabilities

### New Capabilities
- `example-projects`: gotowe konfiguracje do wczytania.

### Modified Capabilities
- `frame-generator`: cięcie poszycia pod krokwie i przy ściankach, limity w normalizacji.
- `frame-editor`: kotwy na rzucie i w 3D, okna i drzwi w 3D, cross-eye, domyślne poszycie ścianek, limity pól.

## Impact

- `szkielet/js/model.js` (limity, przykłady), `build.js`, `draw.js`, `view3d.js`, `app.js`, `index.html`, testy.
