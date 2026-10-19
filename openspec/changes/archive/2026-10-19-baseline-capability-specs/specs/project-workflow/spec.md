## ADDED Requirements

### Requirement: Every change goes through OpenSpec
Every change to code, page content or behaviour SHALL be made through an OpenSpec change
(propose, apply, archive), including small fixes. Agent instructions for Claude Code
(`CLAUDE.md`) and GitHub Copilot (`.github/copilot-instructions.md`) SHALL state this.

#### Scenario: Small fix
- **WHEN** someone wants to change a default value or a label
- **THEN** they first create an OpenSpec change with a delta spec and only then edit code

### Requirement: Construction changes are reviewed by the master carpenter agent
A change that alters geometry, connections or material lists SHALL be reviewed by the
`mistrz-ciesielski` agent before it is archived, and its structural defects SHALL be fixed
or recorded as accepted in `design.md`.

#### Scenario: Archiving a geometry change
- **WHEN** a change touching a construction generator is ready to archive
- **THEN** a review report exists and its defects are resolved or explicitly accepted

### Requirement: Shared woodworking rules live in a skill
The repo SHALL contain the skill `ciesielka-i-stolarka` with framing and joinery rules and
their sources, plus project skills `nowa-konstrukcja` and `wydanie`, available to Claude
Code (`.claude/`) and to Copilot (`.github/`).

#### Scenario: Copilot user
- **WHEN** a Copilot agent works in the repo
- **THEN** it finds the same skills and the same review agent under `.github/`

### Requirement: Banana for scale on every drawing
Every drawing and 3D model SHALL include a banana for scale. The banana SHALL NOT appear in
descriptions, legends, material lists or page text, and there SHALL be no control to hide it.

#### Scenario: Wall elevation
- **WHEN** a wall elevation is drawn
- **THEN** a banana stands on the floor line and no label mentions it

### Requirement: Static site without a build step
Pages SHALL be static HTML with ES modules and CDN libraries pinned to exact versions,
served by GitHub Pages from `main`. Code, identifiers and comments SHALL be in English;
UI text and user-facing specs in Polish.

#### Scenario: Deploy
- **WHEN** a commit lands on `main`
- **THEN** GitHub Pages serves it without any build step
