## MODIFIED Requirements

### Requirement: Openings are framed automatically
Doors, windows and plain openings SHALL be defined by wall, position from the outer left
corner seen from outside, width, height and sill height. Openings narrower than the configured
threshold (default 1200 mm) whose flat header passes the deflection check SHALL get a single
stud on each side, the header fixed between those studs and a single sill for windows; a grid
stud whose face is within 30 mm outside an opening edge SHALL be reused as that side stud. Wider
openings, or openings whose header must stand on edge, SHALL get a full stud and a stud under
the header on each side with the header resting on the studs under it. In both cases grid studs
inside the opening are removed, short studs are placed above the header and below the sill on
the stud grid, and the bottom plate is interrupted for openings that start at the floor. A
nogging row that lies within 30 mm of the sill or of the header underside SHALL not get a
separate nogging across the opening bay. The header SHALL be the first of 2×45×95 laid flat
(openings up to 1200 mm), 2×45×95, 2×45×145 and 2×45×195 on edge with a 5 mm spacer that passes
the deflection check for the roof load on that wall; when none passes, 2×45×195 with a warning.
Every loaded header SHALL appear in the deflection checks. The generator SHALL warn when an
opening hits the corner studs, overlaps another opening, a partition ends at it, or its header
does not fit under the top plate.

#### Scenario: Moving a window
- **WHEN** the user drags a window along the wall
- **THEN** studs, short studs, noggings and sheathing are recomputed for the new position

#### Scenario: Wide door
- **WHEN** a 2000 mm door is placed in an eaves wall
- **THEN** its header stands on edge on studs under the header and its deflection check passes

#### Scenario: Small window next to a grid stud
- **WHEN** a 1000 mm window starts 20 mm right of a grid stud
- **THEN** that stud is its left side stud, only one new stud is added on the right and there are no studs under the header

#### Scenario: Header grows with the load
- **WHEN** a 2400 mm door is placed in the eaves wall of a 7000 mm wide building
- **THEN** its header is 2×45×145 or 2×45×195 on edge and passes the check

## ADDED Requirements

### Requirement: Member sections are selectable
The generator SHALL support timber 45×95, 45×145 and 45×195 (6 m) and beams 100×100 and 150×150
(13 m beams sold in 6.5 m halves), each with a default price. Rafters and ties
SHALL use the configured rafter section, which sets the rafter top, battens, birdsmouth limit
(one third of the section), splices and the deflection check. The base frame SHALL use the
configured beam section, which sets the floor level and the beam checks. Walls stay 95 mm deep.

#### Scenario: Deep rafters
- **WHEN** rafters are 45×195 on a 7000 mm wide gable roof at 30°
- **THEN** the rafter check passes without bearing walls and the battens sit on the 195 mm rafter top

#### Scenario: Heavy frame
- **WHEN** the frame uses 150×150
- **THEN** the floor is 50 mm higher than with 100×100 and the beams are ordered as 150×150 halves

### Requirement: Tall gable walls are split at the eaves
A gable-end wall whose tallest stud would exceed 3000 mm SHALL be built as a lower wall up to the
eaves height with a double top plate, and a separate gable triangle on it with studs up to the
sloped top plate. An unsplit stud longer than 3000 mm SHALL produce a warning.

#### Scenario: House gable
- **WHEN** a gable roof at 30° over a 7000 mm width has 2600 mm walls
- **THEN** each gable wall has a double plate at 2600 mm and no stud longer than 3000 mm

### Requirement: Ties are checked and kept free of partitions
Gable-roof ties SHALL be named "Ściąg" and checked for deflection between their supports (eaves
plates and bearing walls) under their own weight and a light ceiling of 0.3 kN/m². When that
check fails, the check SHALL be shown for their own weight only, stating that no ceiling or
storage may hang on them. A non-bearing partition whose top is closer to the tie underside than the tie deflection over
the partition plus 5 mm (at least 10 mm) SHALL produce a warning with the height that leaves that
gap; a partition with that gap reaching within 100 mm of the ties SHALL add sliding connectors to
the hardware list (one per tie crossed, or every 600 mm along a partition parallel to the ties).

#### Scenario: Partition under the ties
- **WHEN** a non-bearing partition in a gable building is as tall as the walls
- **THEN** a warning gives the gap needed for the tie deflection at that place or asks to make it bearing

### Requirement: Joints of battens and frame beams
Batten joints SHALL be placed only over rafters from the third one inward on each side, so the
end piece over the gable overhang rests on at least two rafters. Transverse frame beams longer
than the purchase unit of their beam (6.5 m half) SHALL be joined over an intermediate anchor
line so each piece fits in one unit.

#### Scenario: House cross beams
- **WHEN** the frame is 7000 mm wide in 150×150
- **THEN** each cross beam consists of pieces no longer than 6500 mm joined over an anchor
