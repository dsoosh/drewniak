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
separate nogging across the opening bay. The header SHALL be laid flat when the opening is at
most 1200 mm and the flat header passes the deflection check for the roof load on that wall;
otherwise it SHALL stand on edge with a 5 mm spacer. Every loaded header SHALL appear in the
deflection checks. The generator SHALL warn when an opening hits the corner studs, overlaps
another opening, a partition ends at it, or its header does not fit under the top plate.

#### Scenario: Moving a window
- **WHEN** the user drags a window along the wall
- **THEN** studs, short studs, noggings and sheathing are recomputed for the new position

#### Scenario: Wide door
- **WHEN** a 2000 mm door is placed in an eaves wall
- **THEN** its header stands on edge on studs under the header and its deflection check passes

#### Scenario: Small window next to a grid stud
- **WHEN** a 1000 mm window starts 20 mm right of a grid stud
- **THEN** that stud is its left side stud, only one new stud is added on the right and there are no studs under the header

### Requirement: Partitions
Partitions SHALL be axis-aligned segments on the floor plan with their own height and
openings, framed like walls with a flat double top plate. Where a partition ends at an outer
wall or at another partition, that wall SHALL get an extra stud on the partition axis. The
generator SHALL warn when a non-bearing partition is taller than the rafter underside above
it or when a partition ends at an opening. A partition's sheathing SHALL be none, side A (the
side towards the front or the left), side B or both sides.
A partition along the length MAY be bearing: its top plate then lies on the rafter underside
with a birdsmouth seat like the outer plates, its height is derived from the roof, the rafters
rest on it, and every transverse beam gets a support on its axis.

#### Scenario: Partition across the width
- **WHEN** a partition runs from the front wall to the back wall
- **THEN** both walls get an extra stud on its axis

#### Scenario: Bearing wall
- **WHEN** a partition along the length at y = 2000 is marked bearing
- **THEN** its top plate meets the rafter underside, rafters are notched over it and each transverse beam has a support at y = 2000

#### Scenario: One-sided partition sheathing
- **WHEN** a partition is sheathed on side B only
- **THEN** sheets are generated on that face only

### Requirement: Sheathing and covering
Wall sheathing SHALL be laid as vertical sheets from the configured offset below the frame
top, long walls covering the edges of the gable-end sheathing, cut to openings and the roof
line; strips narrower than 60 mm SHALL be left out. When interior sheathing is enabled, the
inner faces of the outer walls SHALL be sheathed from the floor to the top plate, between the
inner faces of the adjoining walls, cut to openings, and laid out separately from the exterior
sheets. The floor SHALL be sheathed with sheets across the joists. The roof covering SHALL be
laid as a grid of sheets with the configured end lap and side lap, and any grid cell MAY be
marked as a clear sheet. Below 10° the generator SHALL warn that corrugated sheets need full
decking and a ~300 mm end lap.

#### Scenario: Door in a gable wall
- **WHEN** a door cuts through a sheet
- **THEN** the sheet piece is drawn with the cut-out and counted once in the sheet layout

#### Scenario: Interior sheathing
- **WHEN** interior sheathing is switched on for the default shed
- **THEN** each outer wall gets inner sheets labelled with "w", and the order lists exterior and interior sheets separately
