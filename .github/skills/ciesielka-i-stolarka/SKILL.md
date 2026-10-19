---
name: ciesielka-i-stolarka
description: Dobre praktyki ciesielskie (konstrukcje szkieletowe, więźby, podłogi na ruszcie, poszycie OSB, pokrycia faliste) i stolarskie (drobne konstrukcje z desek robione narzędziami ręcznymi). Wczytaj ZANIM zaprojektujesz, policzysz albo zmienisz logikę jakiejkolwiek konstrukcji w drewniaku (generatory w szkielet/ i skrzynka/), zanim napiszesz spec takiej zmiany i gdy ktoś pyta „czy to się utrzyma”, „jak to połączyć”, „ile tego kupić”.
---

# Ciesielka i stolarka — zasady dla generatorów drewniaka

Ten skill jest listą kontrolną dla kodu, który rysuje i liczy konstrukcje. Generator, który
daje ładny rysunek konstrukcji, która się rozjedzie, jest gorszy niż brak generatora.
Liczby poniżej to reguły warsztatowe i wartości z norm do **wstępnego** doboru. Na stronie
zawsze stoi zastrzeżenie, że to nie jest projekt budowlany.

## 1. Droga obciążenia — zawsze pierwsza

Dla każdej konstrukcji opisz jednym zdaniem, którędy ciężar schodzi do gruntu, i sprawdź
każde połączenie na tej drodze:

- **Wkręt i gwóźdź pracują na ścinanie, nie na wyrywanie.** Element, który wisi na łącznikach
  wkręconych wzdłuż siły (półka na wkrętach od spodu, dno przybite od dołu), z czasem odpadnie.
- **Czoło drewna nie trzyma.** Gwóźdź w czoło trzyma tylko na ścinanie i wbity na skos;
  klej na czole praktycznie nie działa.
- Oparcie (element leży na elemencie) jest zawsze lepsze niż zawieszenie na łącznikach.
  Gdy musi wisieć: wieszak belki albo łącznik kątowy, przybity gwoździami do okuć (anchor).

Typowe drogi w szkielecie: pokrycie → łaty → krokwie → oczep → słupki → podwalina →
legary → belki ramy → podpory (bloczki, kotwy, stopy). Każdy otwór w ścianie przerywa
słupki, więc obciążenie z góry musi obejść otwór przez nadproże i słupki pod nadprożem.

## 2. Ściany szkieletowe

- **Rozstaw słupków z modułu płyty.** OSB 1250 mm → rozstaw 625 (albo 417, 312,5).
  Każda pionowa krawędź płyty musi leżeć na słupku. Standard w budownictwie: 400–600 mm osiowo.
- **Podwalina** na całej długości ściany, przerwana tylko w otworach drzwiowych.
- **Oczep podwójny** na ścianach, na których leżą krokwie; styki warstw przesunięte,
  górna warstwa zakłada się na narożnik i wiąże ściany.
- **Narożnik:** ściana długa przechodzi na całą długość; ściana krótka między nimi.
  W ścianie długiej podwójny słupek narożny, żeby było w co przykręcić krótką.
- **Otwór:** słupek pełny (king) + słupek pod nadprożem (trimmer) z każdej strony,
  nadproże na trimmerach, krótkie słupki nad nadprożem i pod podokiennikiem w rytmie siatki.
  Nadproże 2×45×95 płasko to minimum dla otworów ~1 m w ścianie lekkiej. Szersze otwory
  albo duże obciążenie z dachu: nadproże na sztorc (2×45×145 i więcej) i sprawdzenie ugięcia.
- **Rygle (przewiązki)** co ~80 cm wysokości i obowiązkowo na każdym poziomym styku płyt.
  Usztywniają słupki na wyboczenie i dają podparcie płytom. Montaż na mijankę ułatwia
  wkręcanie na wprost przez słupek.
- **Ściany działowe** dostają w ścianie, do której dochodzą, dodatkowy słupek (albo rygle),
  w który da się przykręcić ich słupek skrajny. Pod ścianką równoległą do legarów: legar pod nią.

## 3. Poszycie z płyt

- OSB/3 na zewnątrz (klasa wilgotna). 12 mm na ściany przy rozstawie 625; podłoga 22–25 mm
  pióro-wpust, dłuższą krawędzią w poprzek legarów, krótkie krawędzie na legarach.
- **Szczelina 3 mm** między płytami (praca materiału), ~10 mm przy fundamencie i wieńcu.
- Łączniki (gwoździe pierścieniowe/spiralne lub wkręty): **co 150 mm na krawędziach płyty,
  co 300 mm na podporach pośrednich**, nie bliżej niż ~10 mm od krawędzi.
- Płyta zewnętrzna zakłada się ~50 mm na ramę podłogi: zakrywa styk ściany z podłogą
  i spina je ze sobą.
- Rozkrój: pełne płyty tam, gdzie się da; generator ma liczyć płyty z uwzględnieniem
  ścinków, a paski węższe niż ~60 mm pomijać (szczelina pod okapem jest wentylacją).

## 4. Dach

- **Jednospadowy:** krokwie na dwóch ścianach różnej wysokości, siła pionowa, brak rozporu.
  Wysoka ściana od strony, z której ma nie lecieć woda (np. przy innym budynku).
- **Dwuspadowy rozpycha ściany.** Przy niskim spadku rozpór jest duży; każda para krokwi
  musi być spięta ściągiem w dolnej części (na poziomie oczepu), albo kalenica musi być
  belką nośną na słupach. Jętka wysoko pod kalenicą rozporu nie usuwa.
- **Wcięcie krokwi (wrąb)** na oczepie: siedzisko na pełnej szerokości oczepu, głębokość
  ≤ 1/4–1/3 wysokości krokwi. Krokiew mocowana do oczepu łącznikiem krokwiowym albo
  kątownikiem — wiatr podrywa lekkie dachy.
- **Okap** 25–30 cm chroni ściany i podwalinę przed deszczem. Okap od strony szczytu robią
  łaty wysunięte za skrajne krokwie.
- **Płyta bitumiczna falista (np. Onduline 2000×950):** fale wzdłuż spadku; zakład boczny
  1 fala, zakład podłużny ~200 mm (większy przy niskim spadku). Producent podaje minimum
  ok. 5–7°, typowo ≥ 10°. Przy niskich spadkach łaty gęściej (≤ 45 cm), przy większych
  rzadziej (do ~60 cm) — **sprawdź kartę konkretnego producenta**. Gwoździe z podkładką
  w grzbiet fali, ~20 na płytę, otwory nie na siłę. Na kalenicy gąsiory.
- Łaty 40×50 / 45×45 / 50×50, styki zawsze na krokwi i na mijankę (nie dwa sąsiednie rzędy
  na tej samej krokwi). **Pod każdym zakładem podłużnym arkuszy musi leżeć łata** — gwoździe
  w zakładzie bez podparcia dają przecieki i łopotanie. Rozstaw łat licz od siatki arkuszy.
- Wrąb nie głębszy niż 1/3 wysokości krokwi; przy dużym spadku krótsze siedzisko + łącznik.

## 5. Podłoga na ruszcie

- Rama z belek 100×100 na podporach (bloczki, kotwy gruntowe, stopy). Rozstaw podpór
  i belek dobierz z ugięcia; belka 100×100 na 2,5 m pod podłogą potrzebuje podpory w środku.
- Legary 45×95 na sztorc, co ≤ 60 cm; styki tylko nad belką.
- **Drewno nad gruntem:** nic nie leży na ziemi; przewiew pod podłogą; podwalina i rama
  impregnowane ciśnieniowo (klasa użytkowania 3–4 wg EN 335), czoła po cięciu domalowane.
- Odległość od gruntu ~30 cm albo opaska żwirowa przeciw bryzgom.

## 6. Materiał i łączniki

- Drewno konstrukcyjne C24, suszone komorowo (15–18%). Wilgotne drewno skręca się po montażu.
- Na zewnątrz łączniki ocynkowane ogniowo albo nierdzewne (klasa korozyjności C3/C4 przy wodzie).
- Okucia (kątowniki, wieszaki, łączniki krokwiowe) przybijać gwoździami do okuć, nie
  wkrętami do płyt — nośność połączenia zależy od łącznika.
- Długość gwoździa ≈ 2,5–3 × grubość przybijanego elementu; przy końcach nawiercić.

## 7. Obciążenia do wstępnego doboru

- Śnieg wg PN-EN 1991-1-3: strefa 2 ma sk = 0,9 kN/m², strefa 1 zależy od wysokości n.p.m.
  (≥ 0,7), strefa 3 ≥ 1,2, strefa 4 = 1,6. Dach jednospadowy i dwuspadowy do 30°: μ = 0,8.
- Kryterium ugięcia w generatorze: belka swobodnie podparta, C24 E = 11 000 MPa, L/300.
  To jest kontrola rozsądku, nie wymiarowanie wg Eurokodu 5 (brak nośności, docisku, wyboczenia).
- Domyślnie: podłoga 2,0 kN/m², dach 1,3 kN/m² (śnieg + ciężar własny).

## 8. Stolarka ręczna (drobne konstrukcje, skrzynka)

Dla konstrukcji z desek robionych **wyłącznie narzędziami ręcznymi**:
- Długość w liście cięć = wzdłuż słojów; krótkie słoje w uchwytach i przy otworach to wada.
- Szerokie elementy pracują w poprzek słojów (2–3%); nie klej ich krzyżowo.
- Cięcie wzdłuż to najdroższa operacja: projektuj pod szerokość deski i licz cięcia wzdłuż.
- Dno, blat, półka z jednego kawałka; gdy szersze od deski — kawałki pełnej szerokości
  ucięte w poprzek i sklejone (reszta ≥ 40 mm).
- Długości cięć okrągłe, co 10 mm.
- Skala trudności 1–5: najtrudniejsza technika, +1 gdy ≥ 4 techniki na poziomie ≥ 2.

## 9. Przepisy (Polska, stan 2026)

- Budynki gospodarcze, wiaty, altany do 35 m² — zgłoszenie (nie pozwolenie); nowelizacja
  Prawa budowlanego z 7.01.2026 rozszerzyła listę obiektów bez formalności, ale budynek
  gospodarczy wymaga co najmniej zgłoszenia. Urząd ma 21 dni.
- Przy granicy działki albo 1,5 m od niej: długość do 7 m i wysokość do 3,5 m, o ile plan
  miejscowy pozwala. Generator pokazuje maksymalną wysokość, żeby dało się to sprawdzić.

## Lista kontrolna przed pokazaniem konstrukcji

- [ ] Opisana droga obciążenia; żaden łącznik na niej nie pracuje na wyrywanie.
- [ ] Każda krawędź płyty ma podparcie (słupek, rygiel, legar).
- [ ] Każdy otwór ma nadproże na słupkach; ostrzeżenie, gdy nadproże się nie mieści.
- [ ] Dach dwuspadowy ma ściągi albo nośną kalenicę.
- [ ] Styki elementów długich tylko nad podporą.
- [ ] Ugięcia legarów, belek, krokwi, łat i nadproży sprawdzone, wynik widoczny na stronie.
- [ ] Rozkrój liczy zapas na rzaz i pokazuje odpad.
- [ ] Drewno nie dotyka gruntu, łączniki zewnętrzne odporne na korozję.

## Źródła

- [Inżynier Budownictwa: podstawowe wymagania dla budownictwa szkieletowego](https://inzynierbudownictwa.pl/podstawowe-wymagania-dla-drewnianego-budownictwa-szkieletowego-konstrukcja-budynku/)
- [Inżynier Budownictwa: ściany szkieletowe, zasady konstruowania](https://inzynierbudownictwa.pl/?p=43018)
- [Murator: dom szkieletowy, fundament i ściany](https://muratordom.pl/budowa/domy-drewniane/dom-szkieletowy-fundament-i-konstrukcja-scian-aa-cNQw-CEd7-sz1U.html)
- [Basic wood framing (Grand Rapids, MN)](https://cityofgrandrapidsmn.com/sites/default/files/fileattachments/community_development/page/2524/basic_wood_framing.pdf)
- [JLC: Rafter ties and shallow-pitch roofs](https://www.jlconline.com/how-to/framing/rafter-ties-and-shallow-pitch-roofs_o)
- [kb.pl: płyta bitumiczna na dach](https://kb.pl/dachy/inne-pokrycia-dachowe/plyta-bitumiczna-na-dach-rodzaje-ceny-opinie-porady-praktyczne/)
- [Murator: ondulina na dach](https://muratordom.pl/budowa/dach/ondulina-na-dach-lekkie-i-tanie-pokrycie-dachowe-aa-RELb-cszu-XUCB.html)
- [Murator: płyta OSB, rodzaje i zastosowanie](https://muratordom.pl/wnetrza/prace-wykonczeniowe/plyta-osb-rodzaje-wymiary-cena-zastosowanie-plyt-osb-aa-N458-CHDK-3vit.html)
- [Inżynier Budownictwa: obciążenie śniegiem wg PN-EN 1991-1-3](https://inzynierbudownictwa.pl/obciazenie-sniegiem-wg-eurokodu-1-norma-pn-en-1991-1-3/)
- [Murator: łączniki i okucia ciesielskie do więźby](https://muratordom.pl/budowa/dach/laczniki-ciesielskie-okucia-ciesielskie-do-wiezby-jak-laczyc-elementy-wiezby-aa-ZzYd-k88V-Jv7U.html)
- [Inżynier Budownictwa: złącza ciesielskie, błędy w montażu](https://inzynierbudownictwa.pl/zlacza-ciesielskie-rodzaje-bledy-w-montazu/)
- [cenauslug.pl: drewno na więźbę, C24, suszenie, impregnacja](https://cenauslug.pl/poradniki/jakie-drewno-na-wiezbe-dachowa-wybrac-przewodnik-po-klasach-c24-suszeniu-i-impregnacji)
- [Murator: wiata, altana, garaż bez pozwolenia](https://muratordom.pl/prawo/formalnosci-budowlane/wiata-altana-czy-garaz-bez-pozwolenia-te-roznice-moga-kosztowac-wlasciciela-tysiace-zlotych-aa-eEE4-Y95w-CeHM.html)
