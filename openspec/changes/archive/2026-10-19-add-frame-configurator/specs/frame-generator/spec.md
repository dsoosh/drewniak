## ADDED Requirements

### Requirement: Base frame and floor
The generator SHALL build a base frame of 100×100 beams: two longitudinal beams along the
length and transverse beams at a spacing not larger than the configured maximum, hung on
the longitudinal beams with beam hangers. There SHALL be a support under every beam
crossing and, when the width exceeds 2000 mm (or when forced), enough supports under each
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

### Requirement: Walls are framed for the sheet module
Each wall SHALL have a bottom plate, studs 45×95 centred on a grid measured from the outer
edge of its sheathing with the configured spacing (625, 417 or 312.5 mm), corner studs
(doubled in the long walls), and either a double top plate (flat walls) or a sloped top plate
following the rafter underside (gable-end walls). When a plate is longer than the stock, its
joints SHALL lie on studs, and the joints of the upper top plate SHALL be at least one stud bay
away from those of the lower one, with a warning. Rows of noggings, laid with the 95 mm side
across the wall and flush with both stud faces, SHALL be placed every configured step
(default ~800 mm) and at every horizontal sheet seam, optionally staggered.

#### Scenario: High wall of the default shed
- **WHEN** the high wall is framed
- **THEN** it has three nogging rows and a row centred on the horizontal sheet seam

#### Scenario: Long wall
- **WHEN** the building is 7200 mm long
- **THEN** the top plate joints of the two layers are on different studs and a warning tells to strap them

### Requirement: Openings are framed automatically
Doors, windows and plain openings SHALL be defined by wall, position from the outer left
corner seen from outside, width, height and sill height. For each opening the generator
SHALL remove grid studs in the way and add a full stud and a stud under the header on each
side, a header of two 45×95 pieces, short studs above the header and below the sill on the
stud grid, a sill for windows, and SHALL interrupt the bottom plate for openings that start at
the floor. The header SHALL be laid flat when the opening is at most 1200 mm and the flat
header passes the deflection check for the roof load on that wall; otherwise it SHALL stand on
edge with a 5 mm spacer. Every loaded header SHALL appear in the deflection checks. The
generator SHALL warn when an opening hits the corner studs, overlaps another opening, a
partition ends at it, or its header does not fit under the top plate.

#### Scenario: Moving a window
- **WHEN** the user drags a window along the wall
- **THEN** studs, short studs, noggings and sheathing are recomputed for the new position

#### Scenario: Wide door
- **WHEN** a 2000 mm door is placed in an eaves wall
- **THEN** its header stands on edge and its deflection check passes

### Requirement: Partitions
Partitions SHALL be axis-aligned segments on the floor plan with their own height and
openings, framed like walls with a flat double top plate. Where a partition ends at an outer
wall or at another partition, that wall SHALL get an extra stud on the partition axis. The
generator SHALL warn when a partition is taller than the rafter underside above it or ends at
an opening. Partitions MAY be sheathed on both sides.

#### Scenario: Partition across the width
- **WHEN** a partition runs from the front wall to the back wall
- **THEN** both walls get an extra stud on its axis

### Requirement: Mono-pitch and gable roofs
The roof SHALL be mono-pitch (high side front or back) or gable (ridge along the length),
with pitch between 5° and 45°, eave overhang and gable overhang. Rafters 45×95 SHALL be
spaced evenly along the length at no more than the configured maximum, with a birdsmouth
seat on every wall plate that never cuts deeper than one third of the rafter, plumb-cut ends,
and a warning when the seat is shorter than two thirds of the plate. A gable roof SHALL get a
tie on the top plates next to every inner rafter pair, lapped 600 mm and bolted when longer
than the stock, and a warning when ties are switched off. Battens SHALL be placed at the
eave, under the middle of every end lap of the covering and at the top, with the gaps divided
evenly at no more than the configured maximum; they run over the gable overhang, are
joined only on a rafter, never on the same rafter in two neighbouring rows, and are closed by
verge boards at both gables.

#### Scenario: Default roof
- **WHEN** the roof is mono-pitch 13.9° with 300 mm overhangs, rafters ≤ 450 and battens ≤ 420
- **THEN** there are 8 rafters and 10 rows of 50×50 battens 3701 mm long, one of them under the sheet lap

### Requirement: Sheathing and covering
Wall sheathing SHALL be laid as vertical sheets from the configured offset below the frame
top, long walls covering the edges of the gable-end sheathing, cut to openings and the roof
line; strips narrower than 60 mm SHALL be left out. The floor SHALL be sheathed with sheets
across the joists. The roof covering SHALL be laid as a grid of sheets with the configured
end lap and side lap, and any grid cell MAY be marked as a clear sheet. Below 10° the
generator SHALL warn that corrugated sheets need full decking and a ~300 mm end lap.

#### Scenario: Door in a gable wall
- **WHEN** a door cuts through a sheet
- **THEN** the sheet piece is drawn with the cut-out and counted once in the sheet layout

### Requirement: Deflection checks
The generator SHALL check floor joists, transverse beams, the longitudinal beams under the
eaves walls, rafters, battens and every loaded header as simply supported beams of C24
(E = 11 000 MPa) against L/300 under the configured floor and roof loads, and report span,
deflection, limit and a hint when the check fails.

#### Scenario: Wide shed without mid supports
- **WHEN** the mid support is switched off for a 2500 mm wide shed
- **THEN** the transverse beam check fails and suggests a support under the middle
