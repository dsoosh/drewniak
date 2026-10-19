## Decisions

- **Sekcje:** `f145` 45×145, `f195` 45×195 (6 m, 105 i 142 zł — proporcjonalnie do 45×95
  za 69 zł, zgodne z cenami netto 15,50 i 20,50 zł/mb + VAT), `b150` 150×150 (13 m, połówki
  6,5 m, 425 zł — proporcjonalnie do 100×100).
- **Krokiew:** `roof.rafterSec`; wysokość krokwi wchodzi w wierzch krokwi (łaty, pokrycie),
  wrąb ≤ 1/3 wysokości krokwi, kontrolę ugięcia i nakładki. Legary poddasza (ściągi) mają
  ten sam przekrój. Ściana zostaje 95 mm, oczep 95 mm szeroki.
- **Rama:** `base.beamSec`; wysokość belki zmienia poziom podłogi i ścian; kontrole belek z
  przekroju; zakład płyty ściany na ramę liczony od wierzchu belki.
- **Nadproża:** kandydaci w kolejności 2×45×95 płasko (tylko otwory ≤ 1200), 2×45×95 na sztorc,
  2×45×145, 2×45×195 na sztorc; pierwszy, który przechodzi L/300; gdy żaden — 2×45×195
  i ostrzeżenie. Otwory pojedyncze (między słupkami) jak dotąd tylko z 2×45×95 płasko.
- **Szczyt:** ściana szczytowa, której najwyższy słupek przekracza 3000 mm, dostaje podwójny
  oczep na wysokości okapu (jak ściany podłużne); nad nim osobny trójkąt: podwalina szczytu
  (= górny oczep), słupki do oczepu skośnego, bez rygli poniżej 400 mm. Otwory w szczycie
  powyżej oczepu nie są obsługiwane (ostrzeżenie).
- **Dom 70 m²:** 10 × 7 m, 30°, krokwie 45×195 co ≤ 600 (przęsło połowy dachu bez podpory),
  ściągi 45×195 bez ściany nośnej (poddasze nieużytkowe), rama 150×150, kotwy
  co ≤ 2500, ściany 2600, bez OSB od środka, drzwi wejściowe na słupkach pod nadprożem, z kątownikami.

## Recenzja mistrza (runda 8)

| uwaga | rozwiązanie |
|---|---|
| wrąb w podsumowaniu liczony z 95 mm | podsumowanie bierze rzeczywisty wrąb z generatora |
| PDF bez płyt od środka w zamówieniu | wiersz „od środka i ścianki" w podsumowaniu |
| nadproże drzwi w ścianie nośnej tylko na wkrętach | drzwi w ścianie obciążonej zawsze z kątownikami (trzaskanie) |
| ściągi nazywane legarami poddasza bez kontroli | nazwa „Ściąg", kontrola: ciężar własny + sufit 0,3 kN/m², a gdy nie przechodzi — tylko ciężar własny z dopiskiem „bez sufitu i składowania" |
| ścianki działowe domu dochodzą do ściągów | ostrzeżenie, gdy luz < ugięcie ściągu nad ścianką + 5 mm; w domu ścianki 2570 mm (30 mm luzu, ugięcie 22 mm) na łącznikach przesuwnych, poddasze nieużytkowe |
| (runda 9) 15 mm luzu przy ugięciu 21,8 mm | luz liczony z ugięcia ściągu w miejscu ścianki; ściana nośna w osi odrzucona, bo sięgałaby do kalenicy (słupki 4,6 m) |
| (runda 9) opis nakładki ściągu dwuznaczny | „4 śruby M12 po każdej stronie styku” |
| łata nad okapem szczytowym na 1 krokwi | styki łat od trzeciej krokwi |
| belka poprzeczna 6,7 m z dwóch połówek | belki poprzeczne dłuższe niż połówka łączone nad kotwą pośrednią |
| brak stężeń dachu | taśma perforowana na 2 krzyże na połać (dach > 6 m), 2 zastrzały na każdy dzielony szczyt |
