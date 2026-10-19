## MODIFIED Requirements

### Requirement: Sheathing and covering
Wall sheathing SHALL be laid as vertical sheets from the configured offset below the frame
top, long walls covering the edges of the gable-end sheathing, cut to openings and the roof
line; strips narrower than 60 mm SHALL be left out. Exterior and interior wall sheets SHALL
reach the top plate and be notched around every rafter that dips below the plate top within
the sheet thickness, so no rafter passes through a sheet and the sheet stays nailed to the plate. When interior sheathing is enabled, the inner faces of the outer walls SHALL
be sheathed from the floor to the top plate, between the inner faces of the adjoining walls,
cut to openings and to a full-height strip where a partition meets the wall (with a stud under
each edge of the strip), and laid out
separately from the exterior sheets. The floor SHALL be sheathed with sheets across the joists.
The roof covering SHALL be laid as a grid of sheets with the configured end lap and side lap,
and any grid cell MAY be marked as a clear sheet. Below 10° the generator SHALL warn that
corrugated sheets need full decking and a ~300 mm end lap.

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

## ADDED Requirements

### Requirement: Input values are limited
The model SHALL clamp every numeric parameter to a defined range (among others length
1000–15000 mm, width 1000–10000 mm, wall height 1500–3500 mm, pitch 5–45°, gable overhang
≤ 400 mm, battens ≤ 600 mm apart, anchors ≤ 2500 mm apart, roof load ≥ 0.9 and floor load
≥ 1.0 kN/m², stud spacing one of 625 / 417 / 312.5 mm) and SHALL keep at most 30 partitions and 20 openings per wall, so no input can
make the generator run away.

#### Scenario: Absurd length
- **WHEN** a configuration with length 80000 mm is loaded or typed
- **THEN** the length becomes 15000 mm and the page stays responsive
