## MODIFIED Requirements

### Requirement: Mono-pitch and gable roofs
The roof SHALL be mono-pitch (high side front or back) or gable (ridge along the length),
with pitch between 5° and 45°, eave overhang and gable overhang. Rafters 45×95 SHALL be
spaced evenly along the length at no more than the configured maximum, with a birdsmouth
seat on every wall plate that never cuts deeper than one third of the rafter, plumb-cut ends,
and a warning when the seat is shorter than two thirds of the plate. A gable roof SHALL get a
tie (loft joist) on the top plates next to every inner rafter pair, and a warning when ties
are switched off. Rafters and ties MAY be spliced with the configured method — two 600 mm
45×95 scabs, a 600 mm lap with bolts (ties only; rafters stay in the roof plane and use scabs),
or a pair of nail plates: a rafter only over a bearing wall under it, a tie over the bearing
wall nearest its middle or, without one, at mid-span. The generator SHALL splice when that
needs fewer stock pieces for those members or when the member is longer than the stock; with
the method "none" rafters are never spliced (a too long rafter is a warning) and a tie longer
than the stock is lapped and bolted. Tie ends SHALL be cut along the rafter top, and bearing
walls SHALL keep studs and noggings out of the zone of the tie and its scabs. Battens SHALL be placed at the eave, under the middle of every end lap of the
covering and at the top, with the gaps divided evenly at no more than the configured maximum;
they run over the gable overhang, are joined only on a rafter, never on the same rafter in two
neighbouring rows, and are closed by verge boards at both gables.

#### Scenario: Default roof
- **WHEN** the roof is mono-pitch 13.9° with 300 mm overhangs, rafters ≤ 450 and battens ≤ 420
- **THEN** there are 8 rafters and 10 rows of 50×50 battens 3701 mm long, one of them under the sheet lap

#### Scenario: Rafters over a bearing wall
- **WHEN** a mono-pitch roof 6000 mm wide has a bearing wall at mid-width and splicing with scabs
- **THEN** every rafter is two pieces meeting over the bearing wall with two 600 mm scabs, and no rafter is joined anywhere else

#### Scenario: Loft joists over a bearing wall
- **WHEN** a gable roof 7000 mm wide has a bearing wall at 2400 mm and splicing is on
- **THEN** each tie is two pieces joined over that wall
