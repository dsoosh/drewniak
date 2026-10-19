## Why

Przy większych budynkach krokwie 45×95 nie przechodzą ugięcia, a konfigurator tylko to
zgłasza i nie mówi, gdzie postawić podparcie. Rygle w jednej linii utrudniają montaż, bo
drugi koniec rygla da się przykręcić tylko skośnie. Do tego każdy wpisany znak przelicza
całość: wpisanie „135” liczy po kolei 1, 13 i 135, a przeciąganie otworu laguje.

## What Changes

- Ściany działowe wzdłuż długości mogą być **nośne**: oczep pod krokwiami (wysokość z linii
  dachu), krokiew oparta na nich, podpory pod ramą w ich osi. Ugięcie krokwi liczone z
  najdłuższego przęsła między podporami.
- Gdy krokiew nie przechodzi, generator **proponuje ściany nośne** w miejscach, które
  skracają przęsła do dopuszczalnych; propozycja jest na rzucie i dodaje się ją kliknięciem.
- Rygle domyślnie **na mijankę** (wyżej–niżej w kolejnych polach), z wyjątkiem rzędów na
  poziomym styku płyt, które zostają w jednej linii, bo podpierają krawędzie obu płyt.
- Pola liczbowe przeliczają po przerwie w pisaniu (debounce) albo od razu po Enter/wyjściu
  z pola; przeciąganie przelicza i rysuje tylko aktywny widok, a tabele i rozkrój po puszczeniu.
- Zapis do **pliku lokalnego**: „Zapisz” nadpisuje otwarty plik (File System Access API,
  Chrome/Edge), „Zapisz jako…”, „Otwórz…”, skróty Ctrl+S / Ctrl+Shift+S / Ctrl+O, nazwa pliku
  i znacznik niezapisanych zmian; w innych przeglądarkach pobieranie i zwykły wybór pliku.

## Capabilities

### New Capabilities

### Modified Capabilities
- `frame-generator`: ścianki nośne, propozycje ścian nośnych, kontrola krokwi z przęseł, rygle na mijankę.
- `frame-editor`: debounce przeliczania, lekkie odświeżanie przy przeciąganiu, propozycje na rzucie, pole „nośna”.

## Impact

- `szkielet/js/build.js`, `model.js`, `draw.js`, `app.js`, `tests/build.test.js`.
- Zapisane konfiguracje bez pola `bearing` działają jak dotąd (ścianka nienośna).
