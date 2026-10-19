---
name: wydanie
description: Wydanie zmian drewniaka — testy, sprawdzenie OpenSpec, commit, push na main i weryfikacja strony na GitHub Pages, aktualizacja notatki projektu w vaulcie Obsidiana. Uruchamiaj, gdy ktoś mówi „wypuść”, „opublikuj”, „wrzuć na stronę”, „zrób release”, albo po archiwizacji zmiany OpenSpec.
---

# Wydanie

Strona jest serwowana przez GitHub Pages z gałęzi `main`, katalog główny repo. Nie ma
kroku budowania: to, co jest w repo, jest na stronie.

1. **Spec zamknięty.** `openspec list` — zmiana, którą wydajesz, jest zarchiwizowana
   (`openspec archive <nazwa>`), a `openspec validate --all --strict` przechodzi.
   Kodu bez zarchiwizowanej albo przynajmniej zaakceptowanej zmiany nie wydajemy.
2. **Testy.** `node tests/build.test.js` (i pozostałe pliki w `tests/`).
3. **Podgląd.** `node tools/serve.js`, otwórz http://127.0.0.1:5182/ i sprawdź stronę,
   którą zmieniasz: 3D, rzuty, rozkrój, PDF.
4. **Commit i push** na `main` z opisem, który zmianę OpenSpec dotyczy.
5. **Pages.** `gh api repos/dsoosh/drewniak/pages/builds/latest --jq .status` aż `built`,
   potem sprawdź https://dsoosh.github.io/drewniak/.
6. **Vault.** W notatce `3. Projekty/Kalkulator konstrukcji z drewna/` dopisz w „Notatkach
   z postępu” datę i co weszło, zaktualizuj `aktualizacja:` i `następny-krok:`.
