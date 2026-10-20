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
- Konstrukcja, która przenosi ciężar narzędzi przy podnoszeniu za uchwyty, przeżyje
  postawienie z rozmachem i nie zakleszczy się, gdy drewno popracuje.
- Forma według `mistrz-rzemieslnik`: ozdobą są wczepy, bez profili i ornamentów.

**Non-Goals:**
- Przepisywanie skrzynki na moduły ani wspólny rozkrój dla obu stron. Skrzynka zostaje
  bez zmian. Wspólny moduł to osobna zmiana.
- Jaskółki, czopy, płyciny w wieku, zamki i okucia narożne.
- Dobór z długości handlowych. Liczymy tylko z desek, które użytkownik ma.

## Decisions

### Droga obciążenia

Przy podnoszeniu za uchwyty:
- narzędzia na tacach → tace → prowadnice (klej long-grain + wkręty na ścinanie) → przód
  i tył;
- narzędzia na dnie → deski dna (przęsło przód–tył, wzdłuż słojów) **leżą** na listwach
  nośnych → listwy (klej long-grain + wkręty na ścinanie) → przód i tył;
- przód i tył → wczepy w narożnikach (klej na bocznych powierzchniach wczepów, long-grain
  do long-grain) → boki → uchwyty (klej long-grain i wkręty od środka albo śruby M6 na
  wylot z klockiem podkładowym) → dłonie.

Przy stawianiu: ściany → cokół (klej long-grain, gwoździe ≤ 2T − 3 mm, narożniki na
wczepy) → podłoga. Cokół wystaje 4 mm pod korpus, więc dno i czoła ścian nie leżą na
betonie i nie podciągają wilgoci.

Żaden łącznik nie pracuje na wyrywanie i żaden gwóźdź nie niesie ciężaru w drewnie
czołowym. Gwoździe dna wbite z góry w listwy tylko ustalają deski.

### Wczepy proste

Każdy wczep daje dwie powierzchnie klejenia wzdłuż włókien, więc narożnik trzyma sam klej.
Głębokość T + 0,5 mm na zestruganie. Reguła: najmniejsze nieparzyste n ≥ 3, przy którym
H / n ≤ 1,5T, i wynik musi być ≥ T. Nie każda wysokość ma taki układ (np. 91–99 mm przy
T = 20: n = 3 daje > 30 mm, n = 5 daje < 20 mm), więc szukanie wymiarów pomija takie
wysokości, a zablokowaną wysokość bez układu odrzucamy z podpowiedzią najbliższych.
Przód i tył trzymają skrajne wczepy, więc mają długość zewnętrzną, a boki głębokość
zewnętrzną. Wnętrze = wymiar zewnętrzny − 2T.

Ściana klejona z pasów: najpierw klejenie i fugowanie (2 mm zapasu na krawędź), potem
trasowanie. Szew może wypaść w środku wczepu, bo jest już pełnym złączem wzdłuż włókien.

Domyślnie (T = 20, H = 400, jedna taca): 60 wczepów korpusu, 12 cokołu, 28 tacy i 6
fartucha, razem 106. Klejenie korpusu naraz przekracza czas otwarty zwykłego PVA: klej o
czasie otwartym ≥ 15 min, montaż na sucho, ściski z przekładkami, kontrola przekątnych.
Szacunek czasu: 10 min na wczep z trasowaniem i dopasowaniem, pokazywany na stronie.

### Wieko

- Deski wzdłuż długości, sklejone (z klejeniem) albo na zakładkę (bez klejenia).
- Fartuch z przodu i po bokach, wysokość mierzona od wierzchu wieka.
- Luz: 3 mm na bokach, z przodu 3 mm + 1% głębokości wieka. Tył trzymają zawiasy, więc
  cała praca wieka w poprzek słojów idzie do przodu.
- Fartuch przedni ma słoje równolegle do wieka: klej i gwoździe. Boczne fartuchy leżą w
  poprzek słojów wieka: bez kleju, wczep z fartuchem przednim i 2–3 wkręty 5×60 w czoło
  wieka przez otwory podłużne ≥ 1,5% głębokości wieka.
- Listwy: wkręt stały przy przodzie (tam, gdzie fartuch przedni), otwory podłużne do tyłu.
- Zawiasy wpuszczane, wkręty ≤ T − 3 mm. Łańcuszek do boku, wkręty na ścinanie.

### Tace

- Prowadnica: wysokość ≥ 20 mm, wysięg ≥ grubość ścianki tacy + 6 mm.
- Dwie tace stopniowane: dolna węższa o dwa wysięgi górnych prowadnic i 4 mm, dolne
  prowadnice wystają o wysięg górnych + ściankę tacy + 4 mm, więc dolna taca przechodzi
  między górnymi prowadnicami.
- Dno tacy na listewkach 10×15 klejonych w tacy, przegródka we wpuście T/3, otwór na dłoń w
  każdej ściance czołowej z ≥ 25 mm drewna nad nim.
- Wierzch najwyższej tacy ≥ grubość listwy wieka + 5 mm pod krawędzią ścian.

### Kontrole

Belka swobodnie podparta, E = 9000 MPa (sosna bez klasy, wartość ostrożna), oznaczone na
stronie jako kontrola rozsądku.
- Wieko: deska środkowa, oparta tylko na bokach (przód i tył mają podparcie ciągłe, a
  listwy przy końcach nie pomagają w środku przęsła). Rozpiętość = długość wewnętrzna + T,
  1 kN w środku, szerokość całego wieka przy klejeniu, jednej deski przy zakładce. L/200
  i σ ≤ 14 MPa. Domyślne wieko sklejone: 3,6 mm i 6,4 MPa. Na zakładkę: 8,2 mm i
  14,6 MPa → ostrzeżenie.
- Dno: jedna deska, 1 kN w środku (ktoś wejdzie do skrzyni), L/300.
- Listwy nośne: wkręty na 2 × ciężar załadowanej skrzyni (narzędzia domyślnie 80 kg),
  0,5 kN na wkręt.
- Masa pustej skrzyni przy 500 kg/m³.

### Rozkrój

Ten sam algorytm co w skrzynce (odcinki → pasy → elementy, kilka kolejności sortowania,
wynik z najmniejszą liczbą desek, potem cięć wzdłuż), przeniesiony do
`skrzynia/js/boards.js` jako czysta funkcja i uruchamiany osobno dla desek skrzyni i
desek tac. Kopia, a nie import, bo skrzynka nie jest modułem.

### Szukanie wymiarów

Siatka 10 mm, wysokości z poprawnym układem wczepów, plus wartości „wysokość ściany =
k × szerokość deski”, żeby ściany wychodziły bez cięcia wzdłuż. Kandydaci sortowani po
celu, rozkrój liczony od najlepszego do pierwszego, który się mieści. Test czasu < 1 s w
Node dla domyślnych desek.

### Skrzynia pod stołem

Opcjonalna wolna wysokość pod stołem ogranicza wysokość całkowitą (ściany + wieko +
4 mm cokołu). Wieko otwiera się na wysokość ściany + głębokość wieka, więc pod stołem
zwykle trzeba skrzynię wysunąć. Strona to mówi, zamiast udawać, że się otworzy.

### Forma

Recenzja agenta `mistrz-rzemieslnik`: wnioski w sekcji „Forma — recenzja rzemieślnika”
niżej. Zasada repo: ozdobą jest połączenie, krawędzie złamane 1–2 mm, bez profili.

### Strona

`skrzynia/index.html` + `skrzynia/js/app.js` (DOM, SVG, three.js 0.160 przez import map,
PDF). Banan: import `banana` z `szkielet/js/draw.js` do rzutów i siatka banana do 3D
(eksport `bananaMesh` z `view3d.js` albo jego kopia, jeśli eksport ciągnie zależności
szkieletu). Stan w localStorage i w `#hash` (base64 JSON, jak `encodeState` w szkielecie).

## Risks / Trade-offs

- [Kopia algorytmu rozkroju rozjedzie się ze skrzynką] → testy rozkroju w `tests/skrzynia.test.js`; ujednolicenie jako następna zmiana.
- [Za dużo kandydatów przy 12 deskach spowolni stronę] → ucinanie po pierwszym pasującym rozkroju i test czasu.
- [Wczepy, które nie pasują, dają szczeliny i słaby klej] → narożnik próbny, tolerancja 0,5 mm na zestruganie, montaż na sucho, klej z długim czasem otwartym.
- [106 wczepów to dużo pracy] → strona pokazuje liczbę i szacunek czasu, poziom trudności 4.
- [Uproszczone kontrole] → ostrożne E, przypadek pesymistyczny, jawne zastrzeżenie.
- [Wieko otwiera się tylko po wysunięciu spod stołu] → komunikat na stronie, cokół wystający 4 mm ułatwia przesuwanie.
