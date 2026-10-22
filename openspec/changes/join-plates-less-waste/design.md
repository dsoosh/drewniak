## Context

`splitAtSupports` dzieli bieg tylko, gdy jest dłuższy niż kantówka. `packBars` pakuje kawałki,
ale nie może zmienić ich długości. Odpad w warsztacie bierze się z geometrii (3,8–4,0 m w 6 m),
nie z pakowania.

## Decisions

- **Dwa przebiegi generatora.** `build(s)` liczy wariant w całości i wariant łączony, pakuje
  45×95 tym samym `packBars` co zestawienie i zwraca ten z mniejszą liczbą sztuk (remis: w
  całości). Decyzja globalna, nie per ściana: prosta, a w przykładach daje pełny zysk. Koszt:
  dwa buildy, kilkadziesiąt ms.
- **Kiedy dzielić.** Bieg, który mieści się w kantówce i jest dłuższy niż jej połowa (krótsze
  i tak dobierają się w pary). Styk na słupku najbliższym środka, oba kawałki ≥ 600 mm.
- **Rozsunięcie styków.** Dla każdej ściany lista styków (w U): legar czołowy pod ścianą
  szczytową, podwalina, oczep dolny, oczep górny, podwalina trójkąta szczytu. Nowy styk musi
  być dalej niż jedno pole słupków od każdego wcześniejszego. Brak takiego słupka: bieg w
  całości.
- **Legar czołowy** leży na całej długości na belce poprzecznej, więc styk w połowie jest nad
  belką; zapisany jako styk ściany szczytowej, żeby podwalina nad nim miała styk gdzie indziej.
- **Bez słupków, ściągów i krokwi.** Słupek pracuje na wyboczenie, więc zawsze w całości;
  ściągi i krokwie mają własne łączenie (`roof.splice`, nad podporą) i ta zmiana go nie rusza.
- **Legary podłogi** zostają przy dotychczasowej opcji: w warsztacie łączenie ich nic nie daje.

## Risks / Trade-offs

- Więcej styków (w warsztacie +15) to więcej pracy i płaskowników na oczepach — dlatego
  przełącznik i remis na korzyść całych elementów.
