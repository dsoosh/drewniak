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

Ściana klejona z pasów: najpierw klejenie i fugowanie (pas pełny traci 2 mm na krawędzi,
resztówka dostaje 2 mm zapasu), potem trasowanie. Bez klejenia krawędzi ściana to k desek
na sobie bez kleju w szwie, każda deska z własnym układem wczepów (tradycyjna skrzynia
deskowa). Elementy z wczepami cięte o 1 mm dłuższe (T + 0,5 mm z każdej strony). Szew może wypaść w środku wczepu, bo jest już pełnym złączem wzdłuż włókien.

Domyślnie (T = 20, H = 400, jedna taca 110 mm): 60 wczepów korpusu, 12 cokołu, 28 tacy
i 6 fartucha, razem 106. Klejenie korpusu naraz przekracza czas otwarty zwykłego PVA: klej o
czasie otwartym ≥ 15 min, montaż na sucho, ściski z przekładkami, kontrola przekątnych.
Szacunek czasu: 10 min na wczep z trasowaniem i dopasowaniem, pokazywany na stronie.

### Wieko

- Deski wzdłuż długości, sklejone (z klejeniem) albo na zakładkę (bez klejenia).
- Fartuch z przodu i po bokach, wysokość 2w + T od wierzchu wieka (dolna krawędź na
  siatce wczepów korpusu).
- Luz: 3 mm na bokach, z przodu 3 mm + 1% głębokości wieka. Tył trzymają zawiasy, więc
  cała praca wieka w poprzek słojów idzie do przodu.
- Fartuch przedni ma słoje równolegle do wieka: klej i gwoździe. Boczne fartuchy leżą w
  poprzek słojów wieka: bez kleju, wczep z fartuchem przednim i 2–3 wkręty 5×60 w czoło
  wieka przez otwory podłużne ≥ 1,5% głębokości wieka.
- Listwy T × 50, długość = wnętrze − 2 × (3 mm + 1% głębokości wieka), 30 mm od boków.
  Wkręt stały przy przodzie, otwory podłużne do tyłu; wieko na zakładkę: wkręt stały w
  osi każdej deski.
- Zawiasy wpuszczane, skrzydełko ≤ T, wkręty ≤ T − 3 mm. Łańcuszek do bocznej
  powierzchni listwy wieka i do boku skrzyni, oba wkręty na ścinanie. Za skrzynią potrzeba
  głębokość wieka × sin 10° + T wolnego miejsca (≈ 100 mm).

### Tace

- Prowadnica: wysokość ≥ 20 mm, wysięg ≥ grubość ścianki tacy + 6 mm.
- Dwie tace stopniowane: dolna węższa o dwa wysięgi górnych prowadnic i 4 mm, dolne
  prowadnice wystają o wysięg górnych + ściankę tacy + 4 mm. Między prowadnicami listwa
  prowadząca o wysięgu górnej prowadnicy, żeby dolna taca nie zjechała w bok (luz 2 mm).
- Dno tacy na listewkach 10×15 przy dwóch przeciwległych ściankach, słoje między nimi,
  luz 3 mm + 1% przy pozostałych, jeden gwoździk w środku każdej listewki.
- Przegródka we wpuście T/3. Otwór na dłoń na siatce wczepów tacy (patrz Forma); gdy nad
  dnem zostaje < 20 mm, wycięcie od góry. Domyślna taca 110 mm (przy 100 mm zostaje 16 mm).
- Wierzch najwyższej tacy ≥ grubość listwy wieka + 5 mm pod krawędzią ścian.

### Kontrole

Belka swobodnie podparta, E = 9000 MPa (sosna bez klasy, wartość ostrożna), oznaczone na
stronie jako kontrola rozsądku.
- Wieko: deska środkowa, oparta tylko na bokach (przód i tył mają podparcie ciągłe, a
  listwy przy końcach nie pomagają w środku przęsła). Rozpiętość = długość wewnętrzna + T,
  1 kN w środku, szerokość całego wieka przy klejeniu, jednej deski przy zakładce. L/200
  i σ ≤ 14 MPa. Domyślne wieko sklejone: 3,6 mm i 6,4 MPa. Na zakładkę (I − 10% na
  wręb zakładki): ≈ 9,2 mm → ostrzeżenie z podpowiedzią „sklej wieko albo grubsza deska”.
- Dno: najwęższa deska, rozpiętość = wnętrze − wysięg listwy, 1 kN w środku (ktoś wejdzie
  do skrzyni), L/200, bo to dno skrzyni, nie podłoga. Domyślnie resztówka 148 mm: 1,2 mm.
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

Zasada repo: ozdobą jest połączenie, krawędzie złamane 1–2 mm, bez profili. Szczegóły w
sekcji „Forma — recenzja rzemieślnika” niżej.

### Strona

`skrzynia/index.html` + `skrzynia/js/app.js` (DOM, SVG, three.js 0.160 przez import map,
PDF). Banan: import `banana` z `szkielet/js/draw.js` do rzutów i siatka banana do 3D
(eksport `bananaMesh` z `view3d.js` albo jego kopia, jeśli eksport ciągnie zależności
szkieletu). Stan w localStorage i w `#hash` (base64 JSON, jak `encodeState` w szkielecie).

### Forma — recenzja rzemieślnika

Recenzja `mistrz-rzemieslnik` (przeliczona dla wszystkich 966 konfiguracji T 12–32,
H 250–700), przyjęta w specu:

- **Jedna siatka.** w = szerokość wczepu korpusu. Wierzch cokołu, krawędź fartucha, uchwyt
  i szwy leżą na k·w albo (k + ½)·w. Bez tego linie wypadały tuż obok granic wczepów
  (pasek 4 mm drewna czołowego nad cokołem, fartuch z wczepami 20 mm nad wczepami 26,7).
- **Fartuch** 2w + T z 3 wczepami: szerokość (2w + T)/3 zawsze w [T, 4T/3]. Usuwa też
  sprzeczność „40–80 mm i ≥ 3T” dla T ≥ 27.
- **Cokół** k·w + 4 mm z własnym poprawnym układem, 60–150 mm, najbliżej H/5.
- **Uchwyt** 2w wysoki, długość 0,5 głębokości (140–240), z ceil(30/T) warstw (przy T = 12
  dwie warstwy dawały 24 mm wysięgu). Wierzch ≥ 40 mm pod fartuchem — 40 to wymóg
  ciesielski (knykcie w rękawicy), siatkę dokłada rzemieślnik.
- **Proporcje** liczone na obrysie całości, nie na samych ścianach.
- **Cień zamiast profilu.** Cokół i fartuch są nałożone (wymaga tego konstrukcja), jedyną
  linią cienia jest szczelina pod fartuchem. Fazka 1,5 mm wszędzie, funkcyjne tylko na
  spodzie cokołu i chwycie fartucha przedniego.
- **Łączniki w liniach**, jeden materiał okuć (stal czerniona), dobór desek na front i
  wieko, olejowosk na zewnątrz, szelak lub wosk w środku.

Szew klejenia, który przy danych deskach nie trafia w siatkę, przesuwamy resztówką o
≤ w/2 kosztem jednego cięcia wzdłuż; w ocenie kandydatów to rozstrzyga dopiero remis.

### Po recenzji implementacji (zadanie 5.2)

Obaj mistrzowie zbudowali konfiguracje skryptami i znaleźli rozjazdy, przyjęte w specu i kodzie:

- **Wieko:** fartuch obejmuje płytę, wierzchy równo; płyta (LL − 2T) × (LD − T). Wcześniej lista
  cięć i geometria opisywały dwie różne bryły. Kontrola wieka liczy szerokość płyty.
- **Bez klejenia krawędzi:** pionowa listwa od środka na każdym boku, jeden wkręt w oś każdej
  deski. Bez niej środkowy pierścień desek nie był związany z uchwytami.
- **Naprzemienny układ wczepów** (A…A / B…B na kolejnych deskach, propozycja rzemieślnika)
  **odrzucony**: przy parzystej liczbie desek wierzchni wczep ściany przypadałby bokowi, wbrew
  zasadzie, że przód i tył trzymają skrajne wczepy.
- **Cokół** dobierany do rytmu wczepów korpusu (0,85–1,15 w przy h/H 0,15–0,25), **szwy** na
  granicy albo w środkowej trzeciej części wczepu, **uchwyt** m·w/2 w 45–70 mm z podcięciem, które
  zostawia ≥ 10 mm wysięgu.
- **Łączniki od T:** gwoździe od 20 mm, wkręty zawiasów i łańcuszka ≤ T − 3 (od 3×8), wkręty
  fartuchów bocznych 3,5×50 / 5×60 / 5×80, wkręty listew i prowadnic przez pogłębiony otwór, żeby
  weszły w ścianę T − 3. Śruby M6 2T + stopka + 15.
- **Luz montażowy** 2 mm na listwach, prowadnicach i dnie; rama cokołu +0,5 mm; podział resztówki
  dna bez zgubionej szczeliny; przestrugnięcie (do rzazu + 3 mm) nie liczy się jako cięcie wzdłuż.
- **Uchwyty kupne:** tace zaczynają się za nakrętkami kołpakowymi; klocki są w modelu.
- **Kontrole:** naprężenie także w dnie; σ > 14 MPa to „może pęknąć”. Gdy nic nie przechodzi,
  wynik to skrzynia z najmniejszym przekroczeniem, szukana od najkrótszych (przekroczenie rośnie z
  rozpiętością).
- **Szukanie:** limit 600 prawdziwych rozkrojów (odrzucenia z rachunku powierzchni się nie liczą)
  i dominacja tac: taca, która się nie zmieściła, wyklucza każdą dłuższą i głębszą. Strona mówi,
  gdy wymiar ogranicza materiał na tace (sprawdzone: same deski skrzyni zmieściłyby większą), i
  gdy obrys wychodzi poza ±0,05 proporcji. Domyślnie 3 deski na tace.
- **Wymiar przez uchwyty** obok wymiaru przez fartuchy.

## Risks / Trade-offs

- [Kopia algorytmu rozkroju rozjedzie się ze skrzynką] → testy rozkroju w `tests/skrzynia.test.js`; ujednolicenie jako następna zmiana.
- [Za dużo kandydatów przy 12 deskach spowolni stronę] → ucinanie po pierwszym pasującym rozkroju i test czasu.
- [Wczepy, które nie pasują, dają szczeliny i słaby klej] → narożnik próbny, tolerancja 0,5 mm na zestruganie, montaż na sucho, klej z długim czasem otwartym.
- [106 wczepów to dużo pracy] → strona pokazuje liczbę i szacunek czasu, poziom trudności 4.
- [Uproszczone kontrole] → ostrożne E, przypadek pesymistyczny, jawne zastrzeżenie.
- [Siatka wczepów ogranicza wysokości cokołu, fartucha i uchwytu do wartości niecałkowitych (73,3 mm)] → wymiary na rysunkach z dokładnością 0,1 mm, w planie pracy trasowanie od wczepów, nie od miarki.
- [Wieko otwiera się tylko po wysunięciu spod stołu] → komunikat na stronie, cokół wystający 4 mm ułatwia przesuwanie.
