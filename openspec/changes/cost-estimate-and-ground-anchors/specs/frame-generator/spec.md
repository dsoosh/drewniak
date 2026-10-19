## MODIFIED Requirements

### Requirement: Base frame and floor
The generator SHALL build a base frame of 100×100 beams: two longitudinal beams along the
length and transverse beams, hung on the longitudinal beams with beam hangers. The frame SHALL
stand on ground anchors: anchor lines run under both longitudinal beams, under every bearing
wall and, where a gap between lines exceeds the configured maximum anchor spacing (default
2500 mm), at evenly spaced intermediate lines; along each line anchors are spaced evenly at no
more than that maximum. Transverse beams SHALL be spaced evenly at no more than the configured
maximum and so that a transverse beam lies over every anchor position. A longitudinal beam
longer than the stock length SHALL be joined only over the axis of a transverse beam. Rim
joists 45×95 SHALL run across both ends under the gable walls. Floor joists 45×95 on edge SHALL
run along the length between the rim joists at a spacing not larger than the configured
maximum, with an extra joist under every floor-sheet seam and under every partition parallel to
the joists. A joist SHALL be one piece when it fits the stock length; longer joists SHALL be
joined only over a transverse beam. The floor sheet thickness SHALL be one of 18, 22, 25 or
30 mm and the wall sheathing thickness one of 12, 15, 18, 22, 25 or 30 mm.

#### Scenario: Default shed
- **WHEN** the shed is 3101×2500 with beam spacing ≤ 1500, anchors ≤ 2500 and joists ≤ 600
- **THEN** it stands on 6 anchors in 2 lines of 3, has 2 longitudinal and 3 transverse beams, 2 rim joists, and every floor joist is one 3011 mm piece

#### Scenario: Wide building
- **WHEN** the building is 6500 mm wide
- **THEN** there are intermediate anchor lines so no gap between lines exceeds 2500 mm

#### Scenario: Building longer than a beam
- **WHEN** the building is 9000 mm long and 100×100 is sold in 6500 mm pieces
- **THEN** each longitudinal beam is two pieces joined over a transverse beam
