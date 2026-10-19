## MODIFIED Requirements

### Requirement: Base frame and floor
The generator SHALL build a base frame of 100×100 beams: two longitudinal beams along the
length and transverse beams at a spacing not larger than the configured maximum, hung on
the longitudinal beams with beam hangers. A longitudinal beam longer than the stock length
SHALL be joined only over the axis of a transverse beam. There SHALL be a support under every
beam crossing and, when the width exceeds 2000 mm (or when forced), enough supports under each
transverse beam to keep its spans within the configured maximum. Rim joists 45×95 SHALL run
across both ends under the gable walls. Floor joists 45×95 on edge SHALL run along the length
between the rim joists at a spacing not larger than the configured maximum, with an extra joist
under every floor-sheet seam and under every partition parallel to the joists. A joist SHALL be
one piece when it fits the stock length; longer joists SHALL be joined only over a transverse
beam.

#### Scenario: Default shed
- **WHEN** the shed is 3101×2500 with beam spacing ≤ 1500 and joists ≤ 600
- **THEN** the frame has 2 longitudinal and 4 transverse beams, 2 rim joists, and every floor joist is one 3011 mm piece

#### Scenario: Wide building
- **WHEN** the building is 6500 mm wide
- **THEN** each transverse beam gets several intermediate supports so no span exceeds 1500 mm

#### Scenario: Building longer than a beam
- **WHEN** the building is 9000 mm long and 100×100 is sold in 6500 mm pieces
- **THEN** each longitudinal beam is two pieces joined over a transverse beam
