# Drewniak

Kalkulatory konstrukcji z drewna: model 3D, rzuty z wymiarami, lista cięć, rozkrój na
długości handlowe i PDF. Strona: https://dsoosh.github.io/drewniak/

- **[Szkielet](szkielet/)** — budynek szkieletowy (wiata, szopa, domek gospodarczy) na ramie
  100×100: dach jedno- lub dwuspadowy, drzwi, okna i ścianki działowe wstawiane na rzutach,
  poszycie OSB, pokrycie z płyt falistych, kontrola ugięć, PDF.
- **[Skrzynka na narzędzia](skrzynka/)** — skrzynka z jednej deski, robiona narzędziami ręcznymi.

## Praca z repo

Każda zmiana przechodzi przez [OpenSpec](https://github.com/Fission-AI/OpenSpec):
`/opsx:propose` → `/opsx:apply` → `/opsx:archive`. Zasady dla agentów:
[.github/copilot-instructions.md](.github/copilot-instructions.md).

```sh
node tools/serve.js          # podgląd na http://127.0.0.1:5182/
node tests/build.test.js     # testy generatora i rozkroju
node tools/build-skrzynka.js # składa skrzynka/index.html z body.html
node tools/sync-agents.js    # kopiuje skille i agenta z .claude/ do .github/
openspec validate --all --strict
```

Bez kroku budowania: HTML + ES modules, three.js, jsPDF i svg2pdf.js z CDN (przypięte wersje).
Font DejaVu Sans w `szkielet/fonts/` (licencja Bitstream Vera / DejaVu, wolna).

Wyniki to wstępny dobór konstrukcji, nie projekt budowlany.
