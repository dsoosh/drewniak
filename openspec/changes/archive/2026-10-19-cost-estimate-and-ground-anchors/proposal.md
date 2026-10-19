## Why

Konfigurator mówi, ile kupić, ale nie ile to kosztuje — ceny trzeba było wpisywać ręcznie, a
pola były puste. Rama stoi na kotwach gruntowych, a generator stawiał podporę pod każdym
skrzyżowaniem belek (12 pod wiatą 3,1 × 2,5 m), podczas gdy na zbudowany przedsionek poszło
6 kotew w rozstawie ok. 1,5–2,5 m. Grubość płyty na ściany jest na sztywno 12 mm.

## What Changes

- **Kosztorys** z domyślnymi cenami (2026, do zmiany): 100×100 × 6,5 m – 189 zł,
  45×95 × 6 m – 69 zł, łata 50×50 × 5,4 m – 22 zł, OSB wg grubości, płyta bitumiczna
  ok. 45 zł, kotwa 120–150 zł. Suma z podziałem na pozycje i widełkami dla kotew; pozycje
  bez ceny (łączniki, impregnat) wymienione jako niewliczone.
- **Grubość OSB na ściany do wyboru:** 12 / 15 / 18 / 22 / 25 / 30 mm, podłoga
  18 / 22 / 25 / 30 mm; cena arkusza z tabeli dla grubości, chyba że wpisana ręcznie.
- **Kalkulator kotew gruntowych:** kotwy w liniach belek podłużnych, ścian nośnych i — gdy
  szerokość przekracza maksymalny rozstaw — w liniach pośrednich; wzdłuż linii co
  ≤ maks. rozstaw (domyślnie 2500 mm), zawsze pod belką poprzeczną. Belki poprzeczne
  rozmieszczane tak, żeby wypadały w osiach kotew. Wiata 3101 × 2500 → 6 kotew, 3 belki
  poprzeczne, jak na budowie.
- Domyślne obciążenie podłogi 1,0 kN/m² (składzik, przedsionek) zamiast 2,0; wartość do zmiany.

## Capabilities

### New Capabilities

### Modified Capabilities
- `frame-generator`: rama i podpory z kalkulatora kotew, grubość poszycia z listy.
- `frame-documents`: kosztorys w podsumowaniu i PDF.
- `frame-editor`: pola cen, wybór grubości OSB, rozstaw kotew.

## Impact

- `szkielet/js/model.js` (ceny, tabela OSB, `base.anchorMax`), `build.js` (rama, kotwy),
  `report.js` (koszt), `app.js`, `pdf.js`, testy.
- Zapisane konfiguracje z `midSupport` zachowują się jak `anchorMax` (pole zostaje zignorowane).
