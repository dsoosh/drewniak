## Context

Rozkrój 1D pakuje elementy w sztuki o długości `stock.b100.len`. Dla wiaty 3101 × 2500 przy
13 m wychodziły 2 sztuki z 10,6 m odpadu. Przy 6,5 m: 2 × 3101 + 4 × 2300 = 15,4 m elementów
mieści się w 3 sztukach po 6,5 m (19,5 m), odpad 4,1 m.

## Goals / Non-Goals

**Goals:** zamówienie w jednostkach, w jakich skład sprzedaje belki.

**Non-Goals:** mieszanie długości handlowych (6,5 i 13 m naraz) — przy budynkach dłuższych
niż 6,5 m belka podłużna i tak jest łączona nad podporą.

## Decisions

- Zmiana tylko wartości domyślnej, bez nowego pola: użytkownik nadal może wpisać 13000.
- Belka podłużna dłuższa niż sztuka handlowa dzielona `splitAtSupports` w osiach belek
  poprzecznych (dotąd `splitEven` — styk mógł wypaść między podporami).

## Risks / Trade-offs

- Stare linki z 13000 dają nadal 13 m → to świadomy wybór użytkownika, nie nadpisujemy.
