## Why

Skrzynka na narzędzia jest otwarta i mała: mieści kilka narzędzi do przeniesienia, nie
zastąpi warsztatowej skrzyni. Taka skrzynia stoi pod stołem, zamyka się wiekiem, ma
wyjmowane tace i uchwyty na bokach. Zrobi ją ktoś, kto ma kilka zwykłych desek i
narzędzia ręczne, ale ten ktoś musi wiedzieć, jaka skrzynia wyjdzie z desek, które już ma,
i jak ją połączyć, żeby nie rozpadła się przy pierwszym podniesieniu i dobrze wyglądała.

## What Changes

- Nowa strona `skrzynia/`: kalkulator skrzyni warsztatowej z wiekiem na zawiasach.
- Wymiary skrzyni są dobierane z desek, które ma użytkownik. Długość, głębokość i
  wysokość można zablokować. Jest minimalna długość wewnętrzna (na piłę) i opcjonalna
  wolna wysokość pod stołem.
- Konstrukcja:
  - wszystkie narożniki (korpus, cokół, fartuch wieka, tace) na wczepy proste
    (finger joint), tylko na klej, z regułą liczby i szerokości wczepów;
  - dno z desek ze szczelinami, leżące na listwach nośnych;
  - cokół wystający 4 mm pod korpus;
  - wieko z luzem na pracę drewna, fartuchem, listwami na otworach podłużnych,
    zawiasami wpuszczanymi i ogranicznikiem;
  - 0–2 wyjmowane tace z cieńszych desek (domyślnie 12 mm), przy dwóch stopniowane;
  - uchwyty na bokach pod fartuchem;
  - długości łączników liczone dla każdego połączenia.
- Wyniki: model 3D, rzuty z wymiarami, rozkrój desek z kolejnością cięć, lista cięć,
  okucia i łączniki, narzędzia, plan pracy narzędziami ręcznymi, liczba wczepów i czas,
  poziom trudności, kontrole wieka, dna i listew, masa skrzyni i PDF. Na rysunkach i w 3D
  stoi banan do skali.
- Strona główna dostaje kartę skrzyni.
- Nowy agent `mistrz-rzemieslnik`: recenzja formy (lekko nowocześnie, na tradycji, bez
  profili i ornamentów) obok `mistrz-ciesielski`.
- Skill `ciesielka-i-stolarka`: doprecyzowane długości łączników przy cienkich deskach,
  dno i wieko dużych skrzyń, wczepy proste.

## Capabilities

### New Capabilities
- `tool-chest-calculator`: kalkulator skrzyni warsztatowej z wiekiem, tacami i cokołem,
  dobieranej z desek użytkownika i robionej narzędziami ręcznymi.

### Modified Capabilities
- `site`: strona główna linkuje także do skrzyni warsztatowej.
- `project-workflow`: recenzja formy przez `mistrz-rzemieslnik`, zasada „ozdobą jest
  połączenie”, oba agenty recenzujące dostępne dla Claude Code i Copilota.

## Impact

- Nowe pliki: `skrzynia/index.html`, `skrzynia/js/build.js` (czysty generator bez DOM),
  `skrzynia/js/boards.js`, `skrzynia/js/app.js`, `tests/skrzynia.test.js`,
  `.claude/agents/mistrz-rzemieslnik.md` (+ kopia w `.github/agents/`).
- Zmienione: `index.html`, `README.md`, `CLAUDE.md`, `.github/copilot-instructions.md`,
  skille `ciesielka-i-stolarka` i `nowa-konstrukcja` (w obu katalogach).
- Bez nowych zależności: three.js, jsPDF i svg2pdf.js z CDN w tych samych przypiętych
  wersjach co w szkielecie.
- Skrzynka (`skrzynka/`) bez zmian.
