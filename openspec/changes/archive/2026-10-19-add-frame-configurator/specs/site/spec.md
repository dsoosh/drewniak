## ADDED Requirements

### Requirement: Home page lists constructions
The repository root SHALL contain `index.html` that links to every construction page
(`szkielet/`, `skrzynka/`) with a short description.

#### Scenario: Visit the site root
- **WHEN** someone opens https://dsoosh.github.io/drewniak/
- **THEN** they see cards for the frame configurator and the toolbox calculator

### Requirement: Local preview server
`tools/serve.js` SHALL serve the repository root on http://127.0.0.1:5182/ with correct
content types for HTML, JS, CSS, JSON and SVG and no caching.

#### Scenario: Preview
- **WHEN** a developer runs `node tools/serve.js`
- **THEN** both construction pages work locally as on GitHub Pages
