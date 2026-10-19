## Context

Podpory dziś: pod każdą belką poprzeczną na obu belkach podłużnych + pośrednie, gdy W > 2 m.
Ceny: puste pola, suma tylko z wpisanych. Przedsionek 3,1 × 2,5 m stoi na 6 kotwach
(2 linie po 3), z trzema belkami poprzecznymi.

## Decisions

- **Linie kotew w poprzek (oś y):** belki podłużne (y = 50 i W − 50), osie ścian nośnych,
  a każdy odstęp większy niż `anchorMax` dzielony równo. Linie pośrednie potrzebują belki
  poprzecznej nad kotwą, więc kotwy linii pośrednich stoją pod belkami poprzecznymi.
- **Kotwy wzdłuż (oś x):** `nA = ceil((L − 100) / anchorMax) + 1` pozycji równo od końca
  do końca. Belki poprzeczne: `nT − 1` = najmniejsza wielokrotność `nA − 1`, która daje rozstaw
  ≤ `maxSpan` (z tolerancją 1%), więc każda kotwa ma nad sobą belkę poprzeczną.
  3101 mm: nA = 3, nT = 3 (rozstaw 1500) — tak jak zbudowano.
- **Kontrole** zostają jak były (belka podłużna między kotwami, belka poprzeczna między
  liniami kotew, legar między belkami). Kalkulator nie dokłada kotew z ugięcia — gdy belka
  nie przechodzi, podpowiedź mówi, żeby zmniejszyć rozstaw kotew.
- **Obciążenie podłogi** domyślnie 1,0 kN/m²: przy 2,0 belka 100×100 o rozpiętości 2,3 m
  nie przechodzi L/300 w konfiguracji, która stoi i działa. Pole zostaje z podpowiedzią
  (1,5–2,0 dla pomieszczeń użytkowych).
- **Ceny OSB** (arkusz 2500 × 1250, markety 2026): 12 mm 69 zł, 15 mm 80 zł, 18 mm 98 zł,
  22 mm 124 zł, 25 mm ok. 145 zł, 30 mm ok. 175 zł (25 i 30 mm oszacowane z proporcji,
  podłoga P-W o ~5% drożej). Pole ceny puste = cena z tabeli.
- **Kotwy:** cena 120–150 zł, w sumie liczona średnia 135 zł, widełki pokazane obok.

## Risks / Trade-offs

- Ceny się starzeją → wszystkie są edytowalne, a strona podaje datę cennika (2026).

## Recenzja mistrza ciesielskiego (2026-10-19, runda 4)

| Uwaga | Decyzja |
|---|---|
| Belki poprzeczne bez kotwy w liniach pośrednich przechodziły całą szerokość | W liniach pośrednich i pod ścianami nośnymi kotwa pod każdą belką poprzeczną; co `kT` tylko pod belkami podłużnymi. |
| Styk belki podłużnej w przęśle między kotwami | Styki tylko nad kotwą. |
| Brak oceny obciążenia kotwy | Szacunek dla najbardziej obciążonej kotwy w podsumowaniu, ostrzeżenie od 10 kN (sprawdzić u producenta dla gruntu). |
| 1,0 kN/m² opisane jako „składzik” | „Schowek na narzędzia, przedsionek”, obciążenia kontroli widoczne w podsumowaniu i PDF, skill zaktualizowany. |
| Podpowiedź bez konkretu przy za dużym rozstawie kotew | Podpowiedź podaje rozstaw, przy którym belka podłużna przechodzi. |
