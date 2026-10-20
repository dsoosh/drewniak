## Why

Skrzynka na narzędzia jest otwarta i mała: mieści kilka narzędzi do przeniesienia, nie
zastąpi warsztatowej skrzyni. Taka skrzynia stoi pod stołem, zamyka się wiekiem, ma
wyjmowane tace i uchwyty na bokach. Zrobi ją ktoś, kto ma kilka zwykłych desek i
narzędzia ręczne, ale ten ktoś musi wiedzieć, jaka skrzynia wyjdzie z desek, które już ma,
i jak ją połączyć, żeby nie rozpadła się przy pierwszym podniesieniu.

## What Changes

- Nowa strona `skrzynia/`: kalkulator skrzyni warsztatowej z wiekiem na zawiasach.
- Wymiary skrzyni są dobierane z desek, które ma użytkownik (długość, szerokość, grubość,
  liczba). Długość, głębokość i wysokość można zablokować. Jest minimalna długość
  wewnętrzna, na przykład na piłę.
- Konstrukcja: wszystkie narożniki (korpus, cokół, fartuch wieka, tace) na wczepy
  proste (finger joint), tylko na klej. Dno leży między
  ścianami i jest przybite przez ściany, więc gwoździe pracują na ścinanie. Do tego
  cokół, wieko z listwami poprzecznymi i fartuchem, ogranicznik otwarcia wieka,
  0–2 wyjmowane tace z cieńszych desek (domyślnie 12 mm) na prowadnicach i uchwyty
  na bokach tuż pod fartuchem wieka.
- Wyniki: model 3D, rzuty z wymiarami, rozkrój desek z kolejnością cięć, lista cięć,
  okucia i łączniki, plan pracy narzędziami ręcznymi, poziom trudności, kontrola ugięć
  dna i wieka, masa skrzyni i PDF. Na rysunkach i w 3D stoi banan do skali.
- Strona główna dostaje kartę skrzyni.

## Capabilities

### New Capabilities
- `tool-chest-calculator`: kalkulator skrzyni warsztatowej z wiekiem, tacami i cokołem,
  dobieranej z desek użytkownika i robionej narzędziami ręcznymi.

### Modified Capabilities
- `site`: strona główna linkuje także do skrzyni warsztatowej.

## Impact

- Nowe pliki: `skrzynia/index.html`, `skrzynia/js/build.js` (czysty generator bez DOM),
  `skrzynia/js/app.js`, `tests/skrzynia.test.js`.
- `index.html`: nowa karta. `szkielet/js/` bez zmian zachowania, najwyżej importy.
- Bez nowych zależności: three.js, jsPDF i svg2pdf.js z CDN w tych samych przypiętych
  wersjach co w szkielecie.
- Skrzynka (`skrzynka/`) bez zmian.
