## Context

Krokiew sprawdzana jest jak belka swobodnie podparta na całej rozpiętości (jednospadowy:
od oczepu do oczepu, dwuspadowy: od oczepu do kalenicy). Ścianki działowe mają płaską górę
na zadanej wysokości i nic nie niosą.

## Droga obciążenia (ściana nośna)

Pokrycie → łaty → krokiew → oczep ściany nośnej (wrąb jak na ścianie zewnętrznej) → słupki →
podwalina → legar pod ścianką (dodawany już dziś dla ścianek wzdłuż legarów) → belki
poprzeczne → **podpora pod każdą belką poprzeczną w osi ściany** (dodawana przez tę zmianę).

## Decisions

- **Tylko ścianki wzdłuż długości (oś x) mogą być nośne** — krokwie biegną w poprzek, więc
  ścianka w poprzek byłaby do nich równoległa.
- **Wysokość ściany nośnej z dachu:** oczep na linii spodu krokwi, siedzisko liczone jak na
  oczepach zewnętrznych (od niższej krawędzi, maks. 1/3 krokwi). Pole wysokości jest wtedy
  wyliczane, nie edytowane.
- **Przęsła krokwi:** podpory to osie oczepów zewnętrznych, osie ścian nośnych i (dwuspadowy)
  kalenica. Kontrola bierze najdłuższe przęsło. Wspornik okapu pomijany jak dotąd.
- **Propozycje:** dopuszczalne przęsło poziome z L/300:
  `Ls_max = ∛(384·E·I / (1500·q⊥))`, `Lh_max = Ls_max·cos α`. Każde przęsło dłuższe niż
  `Lh_max` dzielone równo na `ceil(przęsło / Lh_max)` części; wynik zaokrąglony do 5 mm,
  ściana od lica do lica ścian szczytowych. Propozycja nie zmienia stanu, dopóki użytkownik
  jej nie kliknie.
- **Rygle na mijankę:** przesunięcie ±(T/2 + 5) w kolejnych polach, żeby oba końce rygla
  dało się przykręcić na wprost przez słupek. Rząd na styku płyt zostaje w linii (krawędzie
  obu płyt muszą mieć ciągłe podparcie). Domyślnie włączone.
- **Responsywność:** pola liczbowe — przeliczenie po 450 ms bez zmian albo natychmiast na
  `change` (Enter, wyjście z pola). Przeciąganie — przebudowa geometrii i rysunek aktywnego
  widoku najwyżej co klatkę; podsumowanie, tabele i rozkrój (najdroższy: kilkaset przebiegów
  pakowania) po 300 ms spokoju.

## Risks / Trade-offs

- Ściana nośna na podłodze obciąża legar między belkami → pod nią legar podwójny (sprawdzany
  na ugięcie) i podpory pod belkami poprzecznymi w jej osi.
- Propozycje ścian nie omijają otworów w ścianach szczytowych; gdy ściana trafia w drzwi,
  generator ostrzega i trzeba ją przesunąć ręcznie.

## Recenzja mistrza ciesielskiego (2026-10-19, runda 2)

| Uwaga | Decyzja |
|---|---|
| Ściana nośna na styku płyt podłogi miała jeden legar | Legar podwójny pod ścianą nośną ma pierwszeństwo: kolidujące legary siatki i styku są usuwane. |
| Ściana pod kalenicą: krokiew opierała się krawędzią | Oczep na linii kalenicy, wrąb w obu połówkach krokwi. |
| Ściągi dachu dwuspadowego przechodziły przez słupki i rygle ściany nośnej | Słupki odsuwane od ściągów, brak rygli w pasie ściągów, ostrzeżenie gdy oczep ściany wypada na wysokości ściągu. |
| Krokiew dłuższa niż kantówka, ostrzeżenie powtarzane | Styk krokwi na ścianie nośnej najbliższej środka (nakładki + śruby w zestawieniu), jedno ostrzeżenie. |
| Brak łączników krokwi na ścianie nośnej i kotew jej podwaliny | Dopisane do zestawienia. |
| Propozycja pomijana, gdy stoi tam ścianka nienośna | Ostrzeżenie „oznacz ją jako nośną”. |
| Podpory pośrednie nakładały się na osie ścian | Najpierw osie ścian nośnych, potem podpory rozłożone między nimi. |
| Belka podłużna i nadproża ścian okapowych liczone z W/2 mimo ścian nośnych | Obciążenie z przęsła przy ścianie okapowej (gdy są ściany nośne). |
| Nadproże w ścianie nośnej zaniżone | Współczynnik 1,25 dla podpory pośredniej krokwi ciągłej. |
| Brak kontroli legara pod ścianą nośną | Kontrola legara podwójnego dodana. |
| Ściana nośna z poszyciem bez rygla na styku płyt | Rzędy styku liczone także dla obłożonych ścianek. |
