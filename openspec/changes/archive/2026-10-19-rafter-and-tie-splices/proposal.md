## Why

Krokwie i legary poddasza (ściągi) liczone są jako jednolite kawałki: krokiew 3,2–4,4 m albo
ściąg 7 m zabiera całą kantówkę 6 m, a resztka często idzie w odpad. Na budowie łączy się je
z dwóch kawałków nad podporą — nakładkami z kantówki, na zakład obok siebie albo płytką
kolczastą — co pozwala zużyć krótsze odcinki i zmniejsza odpad.

## What Changes

- Nowy parametr **łączenie krokwi i legarów poddasza**: brak / nakładki z kantówki (2 × 600 mm,
  po obu stronach) / na zakład (600 mm, kawałki obok siebie) / płytka kolczasta (para na styk).
- **Krokwie** łączone tylko nad ścianą nośną (podpora) — tam, gdzie generator ma ją pod krokwią;
  styk w przęśle bez podpory zrobiłby przegub.
- **Legary poddasza / ściągi** łączone nad ścianą nośną, jeśli stoi pod nimi, a bez niej
  w środku rozpiętości (pracują na rozciąganie).
- Łączenie jest wybierane tylko wtedy, gdy zmniejsza liczbę kupowanych kantówek (albo gdy
  element jest dłuższy niż materiał); nakładki trafiają do listy cięć, płytki do zestawienia.
- Model 3D i rzuty pokazują kawałki, nakładki i zakłady.

## Capabilities

### New Capabilities

### Modified Capabilities
- `frame-generator`: łączenie krokwi i ściągów (miejsca styków, rodzaje połączeń, wybór wg odpadu).
- `frame-editor`: pole wyboru rodzaju łączenia.

## Impact

- `szkielet/js/model.js` (`roof.splice`), `build.js` (krokwie, ściągi), `report.js` (płytki),
  `app.js` (pole), testy.
