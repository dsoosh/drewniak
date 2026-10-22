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
- **Rozsunięcie styków.** Dla każdej ściany listy styków per warstwa (w U). Rozsuwane tylko
  warstwy, które się stykają: legar czołowy – podwalina, oczep dolny – oczep górny, oba oczepy –
  podwalina szczytu. Podwalina i oczep są 2,3 m od siebie i ich nie rozsuwamy. Brak słupka:
  bieg w całości.
- **Słupek styku** tylko pełnej wysokości (nie nad nadprożem, nie pod nadprożem) i co najmniej
  T od pionowego styku płyt, żeby płyta przechodziła nad stykiem w całości.
- **Górny oczep** wiąże ścianę: jego kawałki co najmniej dwa pola słupków (1250 mm) od końców.
- **Mocowanie.** Płaskownik perforowany 40×300 na każdy styk oczepu w zestawieniu; zbicie warstw
  (2 rzędy gwoździ co 150 mm na 600 mm z każdej strony) i łączniki podwaliny w ostrzeżeniu.
- **Legar czołowy** leży na całej długości na belce poprzecznej, więc styk jest zawsze nad
  belką; wypada w połowie pola między legarami najbliżej środka (nie na czole legara).
- **Bez słupków, ściągów i krokwi.** Słupek pracuje na wyboczenie, więc zawsze w całości;
  ściągi i krokwie mają własne łączenie (`roof.splice`, nad podporą) i ta zmiana go nie rusza.
- **Legary podłogi** zostają przy dotychczasowej opcji: w warsztacie łączenie ich nic nie daje.

## Risks / Trade-offs

- Poza zakresem (stan sprzed zmiany, osobna zmiana): górny oczep nie zakłada się na narożnik
  (ściany podłużne i szczytowe mają obie warstwy na tej samej długości), a w ścianach dłuższych
  niż kantówka podwalina szczytu może mieć styk nad stykiem oczepu dolnego.

- Więcej styków (w warsztacie +15) to więcej pracy i płaskowników na oczepach — dlatego
  przełącznik i remis na korzyść całych elementów.
