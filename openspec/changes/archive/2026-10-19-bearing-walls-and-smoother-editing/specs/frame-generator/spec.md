## MODIFIED Requirements

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

### Requirement: Partitions
Partitions SHALL be axis-aligned segments on the floor plan with their own height and
openings, framed like walls with a flat double top plate. Where a partition ends at an outer
wall or at another partition, that wall SHALL get an extra stud on the partition axis. The
generator SHALL warn when a non-bearing partition is taller than the rafter underside above
it or when a partition ends at an opening. Partitions MAY be sheathed on both sides.
A partition along the length MAY be bearing: its top plate then lies on the rafter underside
with a birdsmouth seat like the outer plates, its height is derived from the roof, the rafters
rest on it, and every transverse beam gets a support on its axis.

#### Scenario: Partition across the width
- **WHEN** a partition runs from the front wall to the back wall
- **THEN** both walls get an extra stud on its axis

#### Scenario: Bearing wall
- **WHEN** a partition along the length at y = 2000 is marked bearing
- **THEN** its top plate meets the rafter underside, rafters are notched over it and each transverse beam has a support at y = 2000

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
