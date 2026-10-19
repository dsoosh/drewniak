## Context

Wzorem jest artefakt „Wiata 2,5 × 3,1 m”: szkielet 45×95, ściany pod moduł OSB 2500×1250,
dach jednospadowy z płyt bitumicznych na łatach, rama 100×100. Na budowie zmieniono: rygle
co ~80 cm, okap 30 cm dookoła, 8 krokwi, 10 łat 50×50, 45×95 zamiast 45×70.

## Goals / Non-Goals

**Goals:** jeden generator dla wiat, szop i domków gospodarczych na planie prostokąta,
który daje kompletną listę drewna i płyt, rysunki do budowy i PDF.

**Non-Goals:** projekt budowlany wg Eurokodu 5 (nośność, docisk, wyboczenie, wiatr),
fundamenty, izolacja, plany nieprostokątne, dach kopertowy.

## Droga obciążenia

Pokrycie → łaty (styki na krokwiach) → krokwie (wrąb na oczepie) → oczep podwójny (ściany
podłużne) albo oczep skośny (ściany szczytowe) → słupki, nad otworami nadproże na słupkach
pod nadprożem → podwalina → legary 45×95 na sztorc (styki nad belką) → belki poprzeczne
100×100 → podpory. W dachu dwuspadowym rozpór krokwi przejmują ściągi na poziomie oczepu.

## Decisions

- **Układ współrzędnych:** x wzdłuż długości L, y wzdłuż szerokości W, z w górę, zero w
  zewnętrznym narożniku ramy. Ściana ma własną współrzędną U widzianą z zewnątrz od lewego
  narożnika; tak użytkownik podaje położenie otworów.
- **Ściany:** podłużne (przód, tył) na całą długość z podwójnymi słupkami narożnymi,
  szczytowe między nimi. Linia spodu krokwi przechodzi przez górny narożnik oczepu od strony
  wyższej; stąd wysokość ściany wyższej i głębokość wrębu (95·sin α).
- **Ściany szczytowe** mają słupki docinane skośnie i pojedynczy oczep skośny (dwa przy
  dachu dwuspadowym), zamiast osobnej nadstawki — mniej elementów, ta sama sztywność.
- **Rozstaw słupków** z siatki liczonej od krawędzi poszycia (625 / 417 / 312,5), więc styki
  płyt zawsze trafiają w słupek. Rygle w rzędach co `nogStep` i zawsze na poziomym styku płyt.
- **Otwory:** słupek pełny + słupek pod nadprożem z każdej strony, nadproże 2×45×95 płasko,
  krótkie słupki nad i pod w rytmie siatki. Podwalina przerwana tylko przy otworze od podłogi.
- **Poszycie:** każda płyta to siatka komórek między krawędziami otworów i załamaniami
  dachu, przycięta do linii dachu; komórki łączone w kawałki (spójne składowe). Paski
  węższe niż 60 mm pomijane (szczelina pod okapem). Rozkrój kawałków na arkusze: MaxRects.
- **Rozkrój drewna:** FFD + kilkaset losowanych best-fit, kryterium: najmniej sztuk, potem
  najbardziej skupiony odpad. Elementy dłuższe od sztuki handlowej dzielone tylko nad
  podporami (legary nad belką, łaty na krokwi, oczep/podwalina na słupku).
- **Ugięcia:** belka swobodnie podparta, E = 11 000 MPa, L/300, obciążenia z formularza.
- **Ścianki działowe:** odcinki w osiach x/y na rzucie podłogi; w ścianie, do której
  dochodzą, dodatkowy słupek; pod ścianką równoległą do legarów dodatkowy legar.
- **Świetlik:** zaznaczenie komórek siatki pokrycia jako płyt przezroczystych o tym samym
  profilu — konstrukcja bez zmian, zmienia się tylko lista pokrycia.
- **Banan do skali** na każdym rzucie i w 3D, bez wzmianki w tekstach i bez przełącznika.
- **PDF:** jsPDF + svg2pdf.js (wektorowe rysunki), font IBM Plex Sans z polskimi znakami;
  awaryjnie wydruk przeglądarki z arkuszem stylów do druku.
- **Stan:** localStorage + link z konfiguracją w `#s=` (base64url JSON) + eksport/import JSON.

## Risks / Trade-offs

- Kontrola ugięć jest uproszczona → zastrzeżenie na stronie i w PDF.
- Duże budynki (> 6 m) dają długie oczepy i podwaliny łączone na słupkach → ostrzeżenie o stykach.
- Font z CDN może się nie załadować → PDF z fontem standardowym bez polskich znaków jest
  gorszy niż wydruk, więc wtedy strona otwiera wydruk przeglądarki.

## Recenzja mistrza ciesielskiego (2026-10-19)

Agent `mistrz-ciesielski` przejrzał generator na przypadkach brzegowych (drzwi 2 m, spadek
30–45°, budynek 7,2 m, dach dwuspadowy 6 × 6,5 m). Wady konstrukcyjne i co z nimi zrobiono:

| Wada | Decyzja |
|---|---|
| Łaty nie leżały pod zakładem płyt falistych | Łaty liczone z siatki pokrycia: okap, środek każdego zakładu, góra, reszta równo. Domyślny rozstaw ≤ 420 daje 10 rzędów jak na budowie. |
| Nadproże płasko przy szerokich otworach, sprawdzany tylko najszerszy otwór | Płasko do 1200 mm i gdy ugięcie przechodzi, inaczej na sztorc z przekładką; kontrola każdego otworu z obciążeniem jego ściany. |
| Wrąb 95·sin α za głęboki przy dużym spadku | Wrąb ograniczony do 1/3 krokwi, ostrzeżenie gdy siedzisko < 2/3 oczepu. |
| Belka poprzeczna czołem do podłużnej | Wieszaki belek w zestawieniu, notka w liście cięć. |
| Brak legara pod ścianami szczytowymi | Legary czołowe na obu końcach. |
| Styki w jednym miejscu | Styki górnego oczepu o przęsło od dolnego, łaty na mijankę, ostrzeżenie. |
| Ściąg dłuższy niż kantówka, jedna podpora pod szeroką belką | Ściąg z dwóch części na zakład 600 na śruby + ostrzeżenie; liczba podpór z rozpiętości. |
| Za niski spadek | Minimum 5°; 5–10° ostrzeżenie o pełnym deskowaniu i zakładzie 300. |

Braki w zestawieniu (wieszaki, kotwy, taśmy, łączniki OSB, nakładki kalenicowe, wiatrownice,
obróbka, papa, impregnat) dopisane. Opis rygli ujednolicony z geometrią (95 w głąb ściany).
Legary w jednym kawałku, gdy mieszczą się w kantówce. Belka podłużna sprawdzana na ugięcie.

**Świadomie odłożone:** mijanka krótkich krawędzi płyt podłogi (przy szerokości ≤ 2500 jest
jeden rząd płyt) i szczelina 3 mm między płytami (montażowa, nie zmienia ilości materiału).
