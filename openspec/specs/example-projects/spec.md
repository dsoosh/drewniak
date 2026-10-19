# example-projects Specification

## Purpose
TBD - created by archiving change examples-anchors-visualisation. Update Purpose after archive.
## Requirements
### Requirement: Example projects can be loaded
The page SHALL offer a list of example projects — the built shed 3.1 × 2.5 m, a tool shed,
a 4 × 4 m workshop and a 70 m² summer house (shell only) — and loading one
SHALL replace the current configuration, forget the local file handle and rebuild everything.

#### Scenario: Load the workshop
- **WHEN** the user picks "Warsztat 4 × 4 m"
- **THEN** a 4000 × 4000 gable building with a wide door and three windows is shown

### Requirement: Examples are structurally consistent
Every example SHALL build without failing deflection checks and without warnings other than
informational ones about joined long members, with no member longer than its stock; the house
example SHALL state that its 95 mm walls are a summer-house shell and that a building design is
still required.

#### Scenario: House example
- **WHEN** the 70 m² house is loaded
- **THEN** all deflection checks pass and the bearing walls proposed by the generator are already part of it

