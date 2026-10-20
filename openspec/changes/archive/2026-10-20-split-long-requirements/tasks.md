## 1. Podział wymagań

- [x] 1.1 Delty MODIFIED/ADDED dla `cutting-optimizer`, `frame-documents`, `frame-editor`, `frame-generator`; każde zdanie z dawnych opisów jest w nowych wymaganiach (sprawdzone skryptem), żaden opis nie przekracza 500 znaków
- [x] 1.2 Purpose `example-projects` zamiast szablonu; `openspec validate split-long-requirements --strict` przechodzi
- [x] 1.3 Archiwizacja zmiany, potem `openspec validate --all --strict` przechodzi, `node tests/build.test.js` przechodzi (kod bez zmian)
