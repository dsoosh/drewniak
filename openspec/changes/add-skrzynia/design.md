## Context

Skrzynka (`skrzynka/`) to jeden plik HTML z inline'owym skryptem i three.js r128: dobór
wymiarów z desek użytkownika, rozkrój typu „cięcie w poprzek na odcinki → cięcie wzdłuż na
pasy → cięcie w poprzek pasów”, liczenie cięć wzdłuż. Szkielet (`szkielet/js/`) to ES
modules z czystym `build()`, three.js 0.160, banan w `draw.js` i `view3d.js`, PDF przez
jsPDF + svg2pdf.js. Zasady repo wymagają czystego generatora testowanego w Node, więc
skrzynia idzie drogą szkieletu, nie skrzynki.

## Goals / Non-Goals

**Goals:**
- Czysty `build(state)` w `skrzynia/js/build.js`: wymiary, elementy, rozkrój, kontrole,
  ostrzeżenia, okucia, plan pracy. Testowany w `tests/skrzynia.test.js`.
- Konstrukcja, która przenosi ciężar narzędzi przy podnoszeniu za uchwyty.

**Non-Goals:**
- Przepisywanie skrzynki na moduły ani wspólny rozkrój dla obu stron. Skrzynka zostaje
  bez zmian. Wspólny moduł to osobna zmiana.
- Jaskółki, połączenia na czopy, płyciny w wieku, zamki i okucia narożne.
- Dobór z długości handlowych. Liczymy tylko z desek, które użytkownik ma.

## Decisions

### Droga obciążenia

Przy podnoszeniu za uchwyty: narzędzia → tace → prowadnice → ściany przód/tył; narzędzia
na dnie → deski dna (przęsło przód–tył, wzdłuż słojów) → gwoździe wbite przez przód i tył
w czoła desek dna, które pracują **na ścinanie** → ściany przód/tył → wczepy w narożnikach
(klej na bocznych powierzchniach wczepów, long-grain do long-grain) → boki → klocki uchwytów (klej
na długich włóknach, wkręty od środka na ścinanie) → dłonie.

Przy stawianiu na podłodze: dno i ściany → cokół (klej long-grain i gwoździe) → podłoga.
Cokół zasłania czoła dna i trzyma dolne krawędzie ścian.

Żaden łącznik na tej drodze nie pracuje na wyrywanie. Dlatego odrzucamy dno przybite od
spodu (gwoździe na wyrywanie pod ciężarem narzędzi) i uchwyty przykręcone przez bok
w drewno czołowe.

### Wczepy proste w narożnikach

Wczepy proste (finger joint) zamiast wrębów: każdy wczep daje dwie powierzchnie
klejenia wzdłuż włókien, więc narożnik trzyma sam klej, bez gwoździ w drewnie czołowym.
Głębokość = grubość deski + 0,5 mm na zestruganie. Liczba wczepów nieparzysta, szerokość
1–1,5 × T: `n` = najmniejsza nieparzysta liczba, przy której `H / n ≤ 1,5 T`. Wtedy przód
i tył trzymają skrajne wczepy u góry i u dołu, a boki nie mają krótkiego drewna przy
krawędzi. Wczepy przodu i tyłu zakładają się na boki, więc przód i tył mają długość
zewnętrzną, a boki głębokość zewnętrzną. Wnętrze to wymiar zewnętrzny minus 2T.

Ściana klejona z pasów: najpierw klejenie i wyrównanie, potem trasowanie wczepów. Układ
zależy tylko od wysokości ściany, szew może wypaść w środku wczepu, bo jest już pełnym
złączem wzdłuż włókien. Tace i fartuch wieka mają te same wczepy: fartuch 60 mm daje
3 wczepy, taca 100 mm z desek 12 mm daje 7.

Wczepy robi się piłą grzbietnicą i dłutem, z szablonu albo trasowane cyrklem. To
trudniejsze niż wręby: poziom trudności 4, bo 40 i więcej wczepów musi pasować na sucho.
Plan pracy każe zrobić najpierw jeden narożnik próbny na odpadzie.

### Wieko

Deski wieka wzdłuż długości, sklejone na krawędziach albo luźne. Dwie listwy poprzeczne
przykręcone przez otwory podłużne, bez kleju, bo wieko pracuje w poprzek słojów o 2–3%.
Fartuch z trzech stron, narożniki na wczepy jak w skrzyni. Przedni fartuch ma słoje
równolegle do wieka, więc jest przyklejony i przybity do jego krawędzi. Boczne fartuchy
leżą w poprzek słojów wieka: klej tylko na 50 mm od przodu, dalej wkręty przez otwory
podłużne, żeby wieko mogło pracować do tyłu. Zawiasy pasowe na tylnej krawędzi. Ogranicznik (łańcuszek albo linka) chroni zawiasy przed
wyrwaniem wkrętów przy przewróceniu wieka do tyłu.

### Rozkrój

Ten sam algorytm co w skrzynce (odcinki → pasy → elementy, kilka kolejności sortowania,
wynik z najmniejszą liczbą desek, potem cięć wzdłuż), przeniesiony do
`skrzynia/js/boards.js` jako czysta funkcja. Kopia, a nie import, bo skrzynka nie jest
modułem. Ujednolicenie zostawiamy osobnej zmianie (patrz Non-Goals).

### Szukanie wymiarów

Siatka 10 mm: długość zewnętrzna 400–1400, głębokość 250–700, wysokość 250–700, z
dodatkowymi wartościami „wysokość ściany = k × szerokość deski”, żeby ściany wychodziły
bez cięcia wzdłuż. Kandydaci sortowani po celu, rozkrój liczony od najlepszego aż do
pierwszego, który się mieści. Liczba kandydatów kontrolowana testem czasu (< 1 s w Node
dla domyślnych desek).

### Kontrole ugięć

- Deska dna: belka swobodnie podparta, rozpiętość = głębokość wewnętrzna, szerokość = szerokość
  deski dna, obciążenie równomierne = 60 kg × 9,81 / powierzchnia dna, E = 11 000 MPa, L/300.
- Wieko: belka o szerokości całego wieka, rozpiętość = długość wewnętrzna, siła 1 kN w środku,
  L/200. Bez kleju liczymy tylko jedną deskę przy listwie (przypadek pesymistyczny).
To kontrola rozsądku, nie wymiarowanie. Strona to mówi.

### Uchwyty

Górna krawędź uchwytu 20–40 mm pod fartuchem wieka. Środek ciężkości załadowanej skrzyni
jest wtedy pod dłońmi i skrzynia nie przechyla się przy niesieniu.

### Strona

`skrzynia/index.html` + `skrzynia/js/app.js` (DOM, SVG, three.js 0.160 przez import map,
PDF). Banan: import `banana` z `szkielet/js/draw.js` do rzutów i siatka banana do 3D
(eksport `bananaMesh` z `view3d.js` albo jego kopia, jeśli eksport ciągnie zależności
szkieletu). Stan w localStorage i w `#hash` (base64 JSON, jak `encodeState` w szkielecie).

## Risks / Trade-offs

- [Kopia algorytmu rozkroju rozjedzie się ze skrzynką] → testy rozkroju w `tests/skrzynia.test.js`; ujednolicenie jako następna zmiana.
- [Za dużo kandydatów przy 12 deskach spowolni stronę] → ucinanie po pierwszym pasującym rozkroju i test czasu.
- [Wczepy, które nie pasują, dają szczeliny i słaby klej] → narożnik próbny w planie pracy, tolerancja 0,5 mm na zestruganie; cokół i fartuch dodatkowo spinają narożniki.
- [Tace z desek skrzyni są ciężkie] → osobne deski na tace (domyślnie 12 mm), a gdy ich brak, strona pokazuje dodatkową masę.
- [Uproszczona kontrola wieka] → przypadek pesymistyczny dla wieka bez kleju i jawne zastrzeżenie.
