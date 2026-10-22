## ADDED Requirements

### Requirement: Plates are joined when it saves stock
When plate joining is on, the generator SHALL also build a variant in which each bottom plate,
top plate layer and rim joist that fits the 45×95 stock but is longer than half of it is made
of two pieces, and SHALL keep that variant only when it needs fewer 45×95 stock pieces; on a tie
the members stay whole. The switch SHALL NOT join studs, ties or rafters (those keep their own
splice rules).

#### Scenario: Workshop plates
- **WHEN** the 4 × 4 m workshop is computed with 6 m stock and plate joining on
- **THEN** it needs at most 58 pieces of 45×95 instead of 64 and less than 16 m of offcut, and every tie is one piece

#### Scenario: Joining switched off
- **WHEN** plate joining is off
- **THEN** a plate that fits the stock is one piece

#### Scenario: No saving
- **WHEN** joining would not reduce the number of 45×95 stock pieces
- **THEN** all plates and rim joists stay whole

### Requirement: Joints of joined plates
A joined plate SHALL meet on the full-height stud nearest its middle, at least T from a vertical
sheet seam, with pieces ≥ 600 mm (upper top plate ≥ two stud bays from its ends). A joined rim
joist SHALL meet over its beam between two joists. Joints SHALL be more than one stud bay apart
in touching layers: rim joist and bottom plate, the two top plate layers, top plates and gable
plate; else the plate stays whole. Each top plate joint SHALL get a perforated strap.

#### Scenario: Staggered joints in the workshop
- **WHEN** the workshop plates are joined
- **THEN** each joint lies on a full-height stud off the sheet seams, touching layers have joints more than one stud bay apart, the gable plate is named „Podwalina szczytu” and the order lists one strap per top plate joint

#### Scenario: Door in the middle of the wall
- **WHEN** a 4 m wall has a 1.6 m door in its middle
- **THEN** no top plate joint lies over the door
