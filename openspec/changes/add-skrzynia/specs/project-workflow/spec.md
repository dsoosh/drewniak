## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Shared woodworking rules live in a skill
The repo SHALL contain the skill `ciesielka-i-stolarka` with framing and joinery rules and
their sources, plus project skills `nowa-konstrukcja` and `wydanie`, available to Claude
Code (`.claude/`) and to Copilot (`.github/`), together with the review agents
`mistrz-ciesielski` and `mistrz-rzemieslnik`.

#### Scenario: Copilot user
- **WHEN** a Copilot agent works in the repo
- **THEN** it finds the same skills and both review agents under `.github/`
