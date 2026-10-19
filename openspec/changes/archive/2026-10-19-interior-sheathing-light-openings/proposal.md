## Why

Budynki, które Darek stawia, mają też poszycie od środka, a konfigurator rysuje i liczy tylko
płyty zewnętrzne i ścianki obłożone zawsze z obu stron. Przy otworach generator zawsze stawia
podwójne słupki (pełny + pod nadprożem), choć w przedsionku małe okna i drzwi osadzono na
pojedynczych słupkach, często tych, które i tak stały w siatce. Pozostałość po rozkroju nie
odejmuje ostatniego rzazu, więc „zostaje 66 mm” jest w rzeczywistości o 3 mm krótsze.

## What Changes

- **Poszycie od środka** ścian zewnętrznych (włączane), liczone i rozkrajane osobno od zewnętrznego.
- **Widok ściany od środka** (przełącznik na widoku ścian) z poszyciem wewnętrznym; w środku
  na podłodze stoi banan, także w modelu 3D.
- **Ścianki działowe:** poszycie wybierane — brak, strona A, strona B albo obie.
- **Lżejsze otwory:** otwory węższe niż próg (domyślnie 1200 mm) i z nadprożem płaskim
  dostają po jednym słupku z każdej strony i nadproże między słupkami; gdy krawędź otworu
  wypada przy słupku z siatki (≤ 30 mm), ten słupek jest wykorzystany zamiast nowego.
  Podwójne słupki (pełny + pod nadprożem) od progu albo gdy nadproże musi stać na sztorc.
  Rygiel, który wypada na wysokości podokiennika albo nadproża, zastępuje ten element.
- **Rzaz** odejmowany od pozostałości na każdej sztuce; pole rzazu znika z formularza
  (parametr zostaje w stanie, domyślnie 3 mm).

## Capabilities

### New Capabilities

### Modified Capabilities
- `frame-generator`: otwory z pojedynczymi słupkami i wykorzystaniem słupków/rygli, poszycie od środka, strony poszycia ścianek.
- `frame-editor`: widok od środka, banan w środku, ukryty rzaz, wybór stron poszycia ścianki, próg podwójnych słupków.
- `cutting-optimizer`: pozostałość po odjęciu ostatniego rzazu.

## Impact

- `szkielet/js/build.js`, `model.js`, `cut.js`, `report.js`, `draw.js`, `view3d.js`, `app.js`, `pdf.js`, testy.
- Zapisane konfiguracje: `sheathe: true` ścianki → „obie strony”.
