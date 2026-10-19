# Drewniak — instrukcje dla agentów

Drewniak to zestaw stron WWW, które z kilku parametrów generują konstrukcje z drewna:
model 3D, rzuty z wymiarami, listę cięć, rozkrój materiału i PDF do wydruku. Strony są
statyczne (HTML + ES modules, three.js z CDN), serwowane przez GitHub Pages z `main`.

## Każda zmiana wymaga speca (OpenSpec)

**Żadna zmiana kodu, treści strony ani zachowania nie wchodzi bez zmiany OpenSpec.**
Dotyczy to także drobiazgów: poprawki literówki w etykiecie, zmiany domyślnej wartości,
nowego ostrzeżenia. Przebieg zawsze ten sam:

1. `/opsx:propose` → `openspec/changes/<nazwa>/` z `proposal.md`, `design.md`, `tasks.md`
   i deltami w `specs/<capability>/spec.md` (ADDED / MODIFIED / REMOVED Requirements,
   każde wymaganie ze scenariuszem WHEN/THEN).
2. `openspec validate <nazwa> --strict` przechodzi, zanim zaczniesz kod.
3. `/opsx:apply` — implementacja zgodnie z `tasks.md`, odhaczanie zadań na bieżąco.
4. `/opsx:archive` — dopiero gdy wszystkie zadania są zrobione, testy przechodzą, a
   zmiana dotykająca geometrii przeszła recenzję agenta `mistrz-ciesielski`.

Specyfikacje obowiązującego stanu leżą w `openspec/specs/`. Jeśli kod i spec się
rozjeżdżają, najpierw zmiana OpenSpec, potem kod.

## Zasady merytoryczne

- Przed zmianą logiki konstrukcji wczytaj skill `ciesielka-i-stolarka`
  (`.github/skills/ciesielka-i-stolarka/SKILL.md`). Generator nie może proponować
  konstrukcji, która się rozjedzie: łączniki na ścinanie, styki nad podporami, każda
  krawędź płyty podparta, nadproża nad otworami, ściągi w dachu dwuspadowym.
- Na każdym rysunku i w modelu 3D stoi **banan do skali**. Banan nie pojawia się w
  opisach, legendach, liście materiałów ani w tekstach strony, i nie ma przełącznika,
  który by go ukrywał.
- Strona pokazuje wyniki kontroli ugięć i zastrzeżenie, że to nie jest projekt budowlany.

## Konwencje kodu

- Kod, nazwy, komentarze i docstringi po angielsku. Teksty w UI, specy i dokumentacja
  dla użytkownika po polsku.
- Bez kroku budowania i bez zależności npm w runtime. Biblioteki tylko z CDN z
  przypiętą wersją.
- Generatory to czyste funkcje bez DOM (`build(state)`), testowane w Node:
  `node tests/build.test.js`.
- Podgląd lokalny: `node tools/serve.js` → http://127.0.0.1:5182/.
- Wymiary w milimetrach, kąty w stopniach.

## Skille i agenci w repo

- `openspec-propose`, `openspec-apply-change`, `openspec-archive-change`, `openspec-explore`
  — praca ze zmianami OpenSpec.
- `nowa-konstrukcja` — jak dodać nowy typ konstrukcji.
- `wydanie` — testy, push, GitHub Pages, notatka w vaulcie.
- `ciesielka-i-stolarka` — zasady konstrukcyjne i źródła.
- Agent `mistrz-ciesielski` — recenzja konstrukcji przed archiwizacją zmiany.
