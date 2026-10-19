# frame-generator Specification

## Purpose
Geometria budynku szkieletowego na ramie 100×100 (rama, podłoga, ściany, otwory, ścianki działowe, dach, poszycie, pokrycie) i kontrola ugięć.
## Requirements
### Requirement: Base frame and floor
The generator SHALL build a base frame of 100×100 beams: two longitudinal beams along the
length and transverse beams, hung on the longitudinal beams with beam hangers. The frame SHALL
stand on ground anchors: anchor lines run under both longitudinal beams, under every bearing
wall and, where a gap between lines exceeds the configured maximum anchor spacing (default
2500 mm), at evenly spaced intermediate lines. Under the longitudinal beams anchors are spaced
evenly at no more than that maximum; on intermediate and bearing-wall lines there SHALL be an
anchor under every transverse beam. The generator SHALL estimate the load on the most loaded
anchor and warn above about 10 kN. Transverse beams SHALL be spaced evenly at no more than the configured
maximum and so that a transverse beam lies over every anchor position. A longitudinal beam
longer than the stock length SHALL be joined only over an anchor. Rim
joists 45×95 SHALL run across both ends under the gable walls. Floor joists 45×95 on edge SHALL
run along the length between the rim joists at a spacing not larger than the configured
maximum, with an extra joist under every floor-sheet seam and under every partition parallel to
the joists. A joist SHALL be one piece when it fits the stock length; longer joists SHALL be
joined only over a transverse beam. The floor sheet thickness SHALL be one of 18, 22, 25 or
30 mm (default 30 mm, as built) and the wall sheathing thickness one of 12, 15, 18, 22, 25 or
30 mm.

#### Scenario: Default shed
- **WHEN** the shed is 3101×2500 with beam spacing ≤ 1500, anchors ≤ 2500 and joists ≤ 600
- **THEN** it stands on 6 anchors in 2 lines of 3, has 2 longitudinal and 3 transverse beams, 2 rim joists, and every floor joist is one 3011 mm piece

#### Scenario: Wide building
- **WHEN** the building is 6500 mm wide
- **THEN** there are intermediate anchor lines so no gap between lines exceeds 2500 mm

#### Scenario: Building longer than a beam
- **WHEN** the building is 9000 mm long and 100×100 is sold in 6500 mm pieces
- **THEN** each longitudinal beam is two pieces joined over an anchor

### Requirement: Walls are framed for the sheet module
Each wall SHALL have a bottom plate, studs 45×95 centred on a grid measured from the outer
edge of its sheathing with the configured spacing (625, 417 or 312.5 mm), corner studs
(doubled in the long walls), and either a double top plate (flat walls) or a sloped top plate
following the rafter underside (gable-end walls). When a plate is longer than the stock, its
joints SHALL lie on studs, and the joints of the upper top plate SHALL be at least one stud bay
away from those of the lower one, with a warning. Rows of noggings, laid with the 95 mm side
across the wall and flush with both stud faces, SHALL be placed every configured step
(default ~800 mm) and at every horizontal sheet seam. By default noggings SHALL be staggered:
in neighbouring bays they alternate above and below the row line so both ends can be screwed
straight through the studs. Rows at a horizontal sheet seam SHALL stay in line.

#### Scenario: High wall of the default shed
- **WHEN** the high wall is framed
- **THEN** it has three nogging rows and a row centred on the horizontal sheet seam

#### Scenario: Staggered noggings
- **WHEN** a wall is framed with default settings
- **THEN** noggings in neighbouring bays of a regular row are at different heights, and noggings on the sheet seam row are all at the seam

#### Scenario: Long wall
- **WHEN** the building is 7200 mm long
- **THEN** the top plate joints of the two layers are on different studs and a warning tells to strap them

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

### Requirement: Deflection checks
The generator SHALL check floor joists, transverse beams, the longitudinal beams under the
eaves walls, rafters, battens and every loaded header as simply supported beams of C24
(E = 11 000 MPa) against L/300 under the configured floor and roof loads, and report span,
deflection, limit and a hint when the check fails. The rafter span SHALL be the longest
horizontal span between supports: outer wall plates, bearing walls and, for a gable roof, the
ridge. When the rafter check fails, the generator SHALL propose bearing walls along the length
that split every too-long span evenly into spans within the limit, and SHALL warn with their
positions.

#### Scenario: Wide shed without mid supports
- **WHEN** the mid support is switched off for a 2500 mm wide shed
- **THEN** the transverse beam check fails and suggests a support under the middle

#### Scenario: Wide mono-pitch building
- **WHEN** a mono-pitch building is 5000 mm wide and the rafter check fails
- **THEN** one or more bearing walls are proposed and, once added, the rafter check passes

