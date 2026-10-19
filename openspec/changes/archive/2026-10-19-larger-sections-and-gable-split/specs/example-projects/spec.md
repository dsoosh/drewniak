## MODIFIED Requirements

### Requirement: Examples are structurally consistent
Every example SHALL build without failing deflection checks and without warnings other than
informational ones about joined long members, with no member longer than its stock; the house
example SHALL use deep rafters and loft joists, a 150×150 frame and split gables, and SHALL
state that its 95 mm walls are a summer-house shell, that only the timber structure is
estimated and that a building design is still required.

#### Scenario: House example
- **WHEN** the 70 m² house is loaded
- **THEN** all deflection checks pass, no stud is longer than 3000 mm and its cost is described as structure only
