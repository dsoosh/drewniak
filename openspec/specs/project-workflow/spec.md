# project-workflow Specification

## Purpose
Zasady pracy w repo drewniaka: zmiany przez OpenSpec, recenzja mistrza ciesielskiego, wspólne skille, banan do skali, strona bez kroku budowania.

## Requirements

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
Code (`.claude/`) and to Copilot (`.github/`), together with the review agents
`mistrz-ciesielski` and `mistrz-rzemieslnik`.

#### Scenario: Copilot user
- **WHEN** a Copilot agent works in the repo
- **THEN** it finds the same skills and both review agents under `.github/`

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

### Requirement: Form changes are reviewed by the master craftsman agent
A change that alters how a construction looks (proportions, divisions, visible joints,
edges, hardware, finish) SHALL be reviewed by the `mistrz-rzemieslnik` agent before it is
archived. Its form defects SHALL be fixed or recorded as accepted in `design.md`; where
form and structure conflict, the structural rules of `mistrz-ciesielski` win.

#### Scenario: Archiving a new construction
- **WHEN** a change adding a construction is ready to archive
- **THEN** review reports from both `mistrz-ciesielski` and `mistrz-rzemieslnik` exist and their defects are resolved or explicitly accepted

### Requirement: Joinery is the only ornament
Constructions SHALL NOT use routed profiles, mouldings, carving, inlay or applied
ornament. Edges SHALL be broken with a chamfer or radius of 1–2 mm, larger only where it
has a function, and visible joints SHALL be laid out evenly.

#### Scenario: Edge treatment
- **WHEN** a generator describes edges in its work plan
- **THEN** it gives one 1–2 mm chamfer or radius for all edges and no profile
