---
name: nowa-konstrukcja
description: Jak dodać do drewniaka nową konstrukcję (np. półka, karmnik, taras, garaż) albo duży nowy moduł istniejącej — od speca OpenSpec przez generator, rysunki i rozkrój po stronę w GitHub Pages. Uruchamiaj, gdy ktoś chce „zrobić kalkulator do X”, „dodać nowy typ konstrukcji” albo rozbudować generator o nowy rodzaj elementu.
---

# Nowa konstrukcja w drewniaku

Każda konstrukcja to osobny katalog z własnym `index.html`, podpięty na stronie głównej.
Wspólne rzeczy (rozkrój, banan do skali, PDF) bierzesz z `szkielet/js/`, nie kopiujesz.

## Kolejność

1. **Spec przed kodem.** `/opsx:propose` (skill `openspec-propose`) z nazwą `add-<konstrukcja>`.
   W `specs/<capability>/spec.md` wymagania w formie SHALL + scenariusze WHEN/THEN, w tym:
   parametry wejściowe z zakresami, co generator liczy, jakie ostrzeżenia daje, co jest na
   rysunkach i w PDF.
2. **Zasady drewna.** Wczytaj skill `ciesielka-i-stolarka` i wpisz do `design.md` drogę
   obciążenia oraz połączenia. Konstrukcje ręczne: sekcja o stolarce ręcznej.
3. **Generator jako czysta funkcja** `build(state) → { members, sheets, checks, warnings }`
   w module bez DOM, żeby działał pod Node. Każdy element ma przekrój, długość cięcia,
   nazwę po polsku i kształt do 3D.
4. **Testy** w `tests/<konstrukcja>.test.js`: domyślna konfiguracja + przypadki brzegowe,
   asercje na liczbę elementów, brak NaN, brak ostrzeżeń w konfiguracji domyślnej.
5. **Widoki:** model 3D, rzuty z wymiarami, lista cięć, rozkrój, materiały, PDF.
   Na każdym rysunku i w 3D stoi banan do skali (patrz zasady repo).
6. **Recenzja mistrza.** Agent `mistrz-ciesielski` na gotowej zmianie; jego wady
   konstrukcyjne poprawiasz przed archiwizacją.
7. **Strona główna:** dopisz kartę konstrukcji w `index.html`.
8. `/opsx:apply`, potem `/opsx:archive` dopiero gdy wszystkie zadania odhaczone i
   `openspec validate --strict` przechodzi.

## Kontrola przed zamknięciem

- [ ] `node tests/*.test.js` przechodzi
- [ ] strona działa lokalnie (`node tools/serve.js`), bez błędów w konsoli
- [ ] stan da się udostępnić linkiem i odtworzyć
- [ ] PDF zawiera rysunki, listę cięć i materiały
