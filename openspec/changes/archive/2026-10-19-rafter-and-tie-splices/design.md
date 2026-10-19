## Decisions

- **Gdzie styk:**
  - krokiew — tylko w osi ściany nośnej, która stoi pod tą połową krokwi (najbliżej środka
    długości krokwi); bez ściany nośnej krokiew zostaje w całości (albo ostrzeżenie, gdy jest
    dłuższa niż materiał — jak dotąd);
  - ściąg / legar poddasza — w osi ściany nośnej najbliższej środka, a bez ściany nośnej
    w połowie szerokości.
- **Jak:**
  - `scab` — kawałki stykają się czołami w osi podpory, dwie nakładki 45×95 × 600 po bokach,
    po 6 gwoździ / 4 śruby na stronę styku;
  - `lap` — kawałki zachodzą 600 mm (po 300 za oś podpory), drugi kawałek przesunięty o grubość
    obok pierwszego, skręcone śrubami 2 × M12;
  - `plate` — czoła w osi podpory, para płytek kolczastych (zestawienie);
  - `none` — bez łączenia (poza ściągiem dłuższym niż materiał, który i tak łączymy na zakład).
- **Kiedy:** dla krokwi i dla ściągów osobno liczona jest liczba sztuk 6 m potrzebnych na
  same te elementy (FFD) w wariancie całym i dzielonym (z nakładkami); dzielimy, gdy wychodzi
  mniej, albo gdy element nie mieści się w materiale. Domyślnie `scab`.
- **Domyślna wiata** nie ma ścian nośnych, więc krokwie zostają w całości (wynik bez zmian).

## Risks / Trade-offs

- Zakład przesuwa drugi kawałek o grubość — dopuszczalne dla ściągu, nie dla krokwi (połać);
  dlatego krokwie zawsze nakładkami albo płytkami.

## Recenzja mistrza ciesielskiego (2026-10-19, runda 7)

| Uwaga | Decyzja |
|---|---|
| Zakład krokwi rozsuwa płaszczyznę połaci (para przy kalenicy, ściąg, styki łat) | Zakład tylko dla ściągów; krokwie przy wyborze „na zakład” łączone nakładkami. |
| Nakładki / zakład ściągu wchodzą w słupki ściany nośnej | Strefa bez słupków i rygli obejmuje krokiew, ściąg i obie nakładki (x0…x0+3T). |
| „Bez łączenia”: ściąg dostawał nakładki, krokiew za długa była łączona | Ściąg dłuższy niż materiał na zakład ze śrubami (w zestawieniu), krokiew zostaje w całości z ostrzeżeniem. |
| Łączniki krokwiowe i nakładki kalenicowe liczone z kawałków | Liczone z krokwi (pozycji), nie z kawałków. |
| Ściąg wystawał ponad krokiew przy okapie | Końce ściągu ścięte po wierzchu krokwi. |
