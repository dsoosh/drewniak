## ADDED Requirements

### Requirement: Plates are joined when it saves stock
When plate joining is on, the generator SHALL also build a variant in which each bottom plate,
top plate layer and rim joist that fits the 45×95 stock but is longer than half of it is made
of two pieces, and SHALL keep that variant only when it needs fewer 45×95 stock pieces; on a tie
the members stay whole. The switch SHALL NOT join studs, ties or rafters (those keep their own
splice rules).

#### Scenario: Workshop plates
- **WHEN** the 4 × 4 m workshop is computed with 6 m stock and plate joining on
- **THEN** it needs at most 57 pieces of 45×95 instead of 64 and less than 10 m of offcut, and every tie is one piece

#### Scenario: Joining switched off
- **WHEN** plate joining is off
- **THEN** a plate that fits the stock is one piece

#### Scenario: No saving
- **WHEN** joining would not reduce the number of 45×95 stock pieces
- **THEN** all plates and rim joists stay whole

### Requirement: Joints of joined plates
A joined plate SHALL have its joint on the stud nearest its middle with both pieces at least
600 mm long, and a joined rim joist at its middle over the transverse beam. In one wall line
every such joint SHALL be more than one stud bay from every other joint (rim joist, bottom
plate, both top plate layers, gable plate); without such a stud the plate stays whole.

#### Scenario: Staggered joints in the workshop
- **WHEN** the workshop plates are joined
- **THEN** each joint lies on a stud centre and no two joints in one wall are closer than one stud bay
