# frame-generator Specification

## Purpose
Geometria budynku szkieletowego na ramie 100×100 (rama, podłoga, ściany, otwory, ścianki działowe, dach, poszycie, pokrycie) i kontrola ugięć.

## Requirements

### Requirement: Base frame and floor
The generator SHALL build a base frame of 100×100 beams: two longitudinal beams along the
length and transverse beams, hung on the longitudinal beams with beam hangers. Transverse beams
SHALL be spaced evenly at no more than the configured maximum and so that a transverse beam lies
over every anchor position. A longitudinal beam longer than the stock length SHALL be joined
only over an anchor.

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
following the rafter underside (gable-end walls).

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
corner seen from outside, width, height and sill height. Grid studs inside an opening SHALL be
removed, short studs placed above the header and below the sill on the stud grid, and the bottom
plate interrupted for openings that start at the floor.

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

### Requirement: Partitions
Partitions SHALL be axis-aligned segments on the floor plan with their own height and
openings, framed like walls with a flat double top plate. Where a partition ends at an outer
wall or at another partition, that wall SHALL get an extra stud on the partition axis. A
partition's sheathing SHALL be none, side A (the side towards the front or the left), side B or
both sides.

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
with pitch between 5° and 45°, eave overhang and gable overhang. Rafters 45×95 SHALL be spaced
evenly along the length at no more than the configured maximum, with a birdsmouth seat on every
wall plate that never cuts deeper than one third of the rafter, plumb-cut ends, and a warning
when the seat is shorter than two thirds of the plate.

#### Scenario: Default roof
- **WHEN** the roof is mono-pitch 13.9° with 300 mm overhangs, rafters ≤ 450 and battens ≤ 420
- **THEN** there are 8 rafters and 10 rows of 50×50 battens 3701 mm long, one of them under the sheet lap

#### Scenario: Rafters over a bearing wall
- **WHEN** a mono-pitch roof 6000 mm wide has a bearing wall at mid-width and splicing with scabs
- **THEN** every rafter is two pieces meeting over the bearing wall with two 600 mm scabs, and no rafter is joined anywhere else

#### Scenario: Loft joists over a bearing wall
- **WHEN** a gable roof 7000 mm wide has a bearing wall at 2400 mm and splicing is on
- **THEN** each tie is two pieces joined over that wall

### Requirement: Sheathing and covering
Wall sheathing SHALL be laid as vertical sheets from the configured offset below the frame
top, long walls covering the edges of the gable-end sheathing, cut to openings and the roof
line; strips narrower than 60 mm SHALL be left out. Exterior and interior wall sheets SHALL
reach the top plate and be notched around every rafter that dips below the plate top within
the sheet thickness, so no rafter passes through a sheet and the sheet stays nailed to the plate.

#### Scenario: Door in a gable wall
- **WHEN** a door cuts through a sheet
- **THEN** the sheet piece is drawn with the cut-out and counted once in the sheet layout

#### Scenario: Interior sheathing
- **WHEN** interior sheathing is switched on for the default shed
- **THEN** each outer wall gets inner sheets labelled with "w", and the order lists exterior and interior sheets separately

#### Scenario: Eaves wall under the rafters
- **WHEN** the low eaves wall of a mono-pitch roof is sheathed
- **THEN** its sheets reach the top plate and have a notch at every rafter

#### Scenario: Partition meets a sheathed wall
- **WHEN** a partition ends at an outer wall with interior sheathing
- **THEN** the interior sheet has a gap the width of the partition so the partition frame meets the wall studs

### Requirement: Deflection checks
The generator SHALL check floor joists, transverse beams, the longitudinal beams under the
eaves walls, rafters, battens and every loaded header as simply supported beams of C24
(E = 11 000 MPa) against L/300 under the configured floor and roof loads, and report span,
deflection, limit and a hint when the check fails.

#### Scenario: Wide shed without mid supports
- **WHEN** the mid support is switched off for a 2500 mm wide shed
- **THEN** the transverse beam check fails and suggests a support under the middle

#### Scenario: Wide mono-pitch building
- **WHEN** a mono-pitch building is 5000 mm wide and the rafter check fails
- **THEN** one or more bearing walls are proposed and, once added, the rafter check passes

### Requirement: Input values are limited
The model SHALL clamp every numeric parameter to a defined range (among others length
1000–15000 mm, width 1000–10000 mm, wall height 1500–3500 mm, pitch 5–45°, gable overhang
≤ 400 mm, battens ≤ 600 mm apart, anchors ≤ 2500 mm apart, roof load ≥ 0.9 and floor load
≥ 1.0 kN/m², stud spacing one of 625 / 417 / 312.5 mm) and SHALL keep at most 30 partitions and 20 openings per wall, so no input can
make the generator run away.

#### Scenario: Absurd length
- **WHEN** a configuration with length 80000 mm is loaded or typed
- **THEN** the length becomes 15000 mm and the page stays responsive

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
storage may hang on them.

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

### Requirement: Ground anchors under the frame
The frame SHALL stand on ground anchors: anchor lines run under both longitudinal beams, under
every bearing wall and, where a gap between lines exceeds the configured maximum anchor spacing
(default 2500 mm), at evenly spaced intermediate lines. Under the longitudinal beams anchors are
spaced evenly at no more than that maximum; on intermediate and bearing-wall lines there SHALL
be an anchor under every transverse beam.

#### Scenario: Bearing wall line
- **WHEN** a bearing partition runs along the length
- **THEN** there is an anchor under every transverse beam on that line

### Requirement: Anchor load is estimated
The generator SHALL estimate the load on the most loaded anchor and warn above about 10 kN.

#### Scenario: Heavy anchor
- **WHEN** the most loaded anchor carries more than about 10 kN
- **THEN** the page warns about that anchor load

### Requirement: Floor joists
Rim joists 45×95 SHALL run across both ends under the gable walls. Floor joists 45×95 on edge
SHALL run along the length between the rim joists at a spacing not larger than the configured
maximum, with an extra joist under every floor-sheet seam and under every partition parallel to
the joists. A joist SHALL be one piece when it fits the stock length; longer joists SHALL be
joined only over a transverse beam.

#### Scenario: Sheet seam between joists
- **WHEN** a floor-sheet seam falls between two regular joists
- **THEN** an extra joist is placed under the seam

### Requirement: Floor and wall sheet thicknesses
The floor sheet thickness SHALL be one of 18, 22, 25 or 30 mm (default 30 mm, as built) and the
wall sheathing thickness one of 12, 15, 18, 22, 25 or 30 mm.

#### Scenario: Default floor
- **WHEN** the user keeps the default floor
- **THEN** the floor sheets are 30 mm

### Requirement: Plate joints
When a plate is longer than the stock, its joints SHALL lie on studs, and the joints of the
upper top plate SHALL be at least one stud bay away from those of the lower one, with a warning.

#### Scenario: Plate longer than the stock
- **WHEN** a bottom plate is longer than the stock length
- **THEN** its joints lie on studs

### Requirement: Nogging rows
Rows of noggings, laid with the 95 mm side across the wall and flush with both stud faces, SHALL
be placed every configured step (default ~800 mm) and at every horizontal sheet seam. By default
noggings SHALL be staggered: in neighbouring bays they alternate above and below the row line so
both ends can be screwed straight through the studs. Rows at a horizontal sheet seam SHALL stay
in line.

#### Scenario: Nogging step
- **WHEN** a wall is framed with the default step
- **THEN** regular rows are about 800 mm apart and there is a row at every horizontal sheet seam

### Requirement: Narrow openings get single side studs
Openings narrower than the configured threshold (default 1200 mm) whose flat header passes the
deflection check SHALL get a single stud on each side, the header fixed between those studs and
a single sill for windows; a grid stud whose face is within 30 mm outside an opening edge SHALL be
reused as that side stud.

#### Scenario: Narrow window
- **WHEN** a 900 mm window is placed away from grid studs
- **THEN** it gets one stud on each side, the header between them and a single sill

### Requirement: Wide openings stand on studs under the header
Wider openings, or openings whose header must stand on edge, SHALL get a full stud and a stud
under the header on each side with the header resting on the studs under it.

#### Scenario: Door over the threshold
- **WHEN** a door wider than the threshold is placed
- **THEN** each side has a full stud and a stud under the header

### Requirement: Noggings next to sills and headers
A nogging row that lies within 30 mm of the sill or of the header underside SHALL not get a
separate nogging across the opening bay.

#### Scenario: Row just under a sill
- **WHEN** a nogging row lies 20 mm below a window sill
- **THEN** no separate nogging is placed across that opening bay

### Requirement: Header size from the deflection check
The header SHALL be the first of 2×45×95 laid flat (openings up to 1200 mm), 2×45×95,
2×45×145 and 2×45×195 on edge with a 5 mm spacer that passes the deflection check for the roof
load on that wall; when none passes, 2×45×195 with a warning. Every loaded header SHALL appear in
the deflection checks.

#### Scenario: No header passes
- **WHEN** no header size passes the check for an opening
- **THEN** 2×45×195 on edge is used and the page warns

### Requirement: Opening conflicts are warned
The generator SHALL warn when an opening hits the corner studs, overlaps another opening, a
partition ends at it, or its header does not fit under the top plate.

#### Scenario: Overlapping openings
- **WHEN** two openings on one wall overlap
- **THEN** the page warns about the overlap

### Requirement: Partition warnings
The generator SHALL warn when a non-bearing partition is taller than the rafter underside above
it or when a partition ends at an opening.

#### Scenario: Too tall partition
- **WHEN** a non-bearing partition is taller than the rafter underside above it
- **THEN** the page warns

### Requirement: Bearing partitions
A partition along the length MAY be bearing: its top plate SHALL then lie on the rafter underside
with a birdsmouth seat like the outer plates, its height SHALL be derived from the roof, the
rafters SHALL rest on it, and every transverse beam SHALL get a support on its axis.

#### Scenario: Height from the roof
- **WHEN** a partition along the length is marked bearing
- **THEN** its height follows the rafter underside instead of a typed value

### Requirement: Gable roofs get ties
A gable roof SHALL get a tie (loft joist) on the top plates next to every inner rafter pair, and
a warning when ties are switched off.

#### Scenario: Ties switched off
- **WHEN** the user switches ties off on a gable roof
- **THEN** the page warns

### Requirement: Rafter and tie splice methods
Rafters and ties MAY be spliced with the configured method, which SHALL be one of: two 600 mm
45×95 scabs, a 600 mm lap with bolts (ties only; rafters stay in the roof plane and use scabs),
or a pair of nail plates. A rafter SHALL be spliced only over a bearing wall under it, a tie over
the bearing wall nearest its middle or, without one, at mid-span.

#### Scenario: Tie without a bearing wall
- **WHEN** a tie is spliced and no bearing wall is under it
- **THEN** the splice is at mid-span

### Requirement: When rafters and ties are spliced
The generator SHALL splice when that needs fewer stock pieces for those members or when the
member is longer than the stock; with the method "none" rafters are never spliced (a too long
rafter is a warning) and a tie longer than the stock is lapped and bolted.

#### Scenario: No splicing
- **WHEN** the method is "none" and a rafter is longer than the stock
- **THEN** the rafter stays one piece and the page warns

### Requirement: Tie ends and bearing walls
Tie ends SHALL be cut along the rafter top, and bearing walls SHALL keep studs and noggings out
of the zone of the tie and its scabs.

#### Scenario: Tie over a bearing wall
- **WHEN** a tie with scabs crosses a bearing wall
- **THEN** no stud or nogging of that wall lies in the zone of the tie and its scabs

### Requirement: Roof battens
Battens SHALL be placed at the eave, under the middle of every end lap of the covering and at
the top, with the gaps divided evenly at no more than the configured maximum; they run over the
gable overhang, are joined only on a rafter, never on the same rafter in two neighbouring rows,
and are closed by verge boards at both gables.

#### Scenario: Batten joints
- **WHEN** battens are longer than the stock
- **THEN** their joints are on rafters and never on the same rafter in two neighbouring rows

### Requirement: Interior sheathing of the outer walls
When interior sheathing is enabled, the inner faces of the outer walls SHALL be sheathed from
the floor to the top plate, between the inner faces of the adjoining walls, cut to openings and
to a full-height strip where a partition meets the wall (with a stud under each edge of the
strip), and laid out separately from the exterior sheets.

#### Scenario: Studs under the strip
- **WHEN** a partition meets an outer wall with interior sheathing
- **THEN** there is a stud under each edge of the full-height strip

### Requirement: Floor and roof covering
The floor SHALL be sheathed with sheets across the joists. The roof covering SHALL be laid as a
grid of sheets with the configured end lap and side lap, and any grid cell MAY be marked as a
clear sheet. Below 10° the generator SHALL warn that corrugated sheets need full decking and a
~300 mm end lap.

#### Scenario: Low pitch
- **WHEN** the pitch is below 10°
- **THEN** the page warns that corrugated sheets need full decking and a ~300 mm end lap

### Requirement: Rafter span between supports
The rafter span SHALL be the longest horizontal span between supports: outer wall plates,
bearing walls and, for a gable roof, the ridge.

#### Scenario: Bearing wall under the rafters
- **WHEN** a mono-pitch roof has a bearing wall at mid-width
- **THEN** the rafter check uses the longer of the two horizontal spans between the plates and the wall

### Requirement: Bearing walls are proposed when rafters fail
When the rafter check fails, the generator SHALL propose bearing walls along the length
that split every too-long span evenly into spans within the limit, and SHALL warn with their
positions.

#### Scenario: Positions in the warning
- **WHEN** the rafter check fails
- **THEN** the warning gives the positions of the proposed bearing walls

### Requirement: Partitions keep clear of the ties
A non-bearing partition whose top is closer to the tie underside than the tie deflection over
the partition plus 5 mm (at least 10 mm) SHALL produce a warning with the height that leaves that
gap; a partition with that gap reaching within 100 mm of the ties SHALL add sliding connectors to
the hardware list (one per tie crossed, or every 600 mm along a partition parallel to the ties).

#### Scenario: Sliding connectors
- **WHEN** a partition across the ties keeps the gap and reaches within 100 mm of them
- **THEN** the hardware list has one sliding connector per tie crossed

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
