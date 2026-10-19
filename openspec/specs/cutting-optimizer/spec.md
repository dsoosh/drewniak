# cutting-optimizer Specification

## Purpose
Rozkrój elementów prętowych na długości handlowe i kawałków płyt na arkusze, tak żeby kupić jak najmniej materiału.
## Requirements
### Requirement: Linear stock cutting
For each timber section the optimizer SHALL pack all cut lengths into stock pieces of the
configured length with the configured kerf, using first-fit decreasing and randomised
best-fit runs, minimising the number of stock pieces and then concentrating the offcut.
The offcut reported for a stock piece SHALL be its length minus the pieces and one kerf per
cut, including the cut that separates the offcut. Pieces longer than the stock SHALL be
reported separately. The result SHALL be deterministic for the same input. The default stock
lengths SHALL be 6000 mm for 45×95, 5400 mm for 50×50 battens and 6500 mm for 100×100 beams,
which are sold as halves of 13 m beams.

#### Scenario: Default stock lengths
- **WHEN** the default shed is computed with 45×95 in 6 m, 50×50 in 5.4 m and 100×100 in 6.5 m
- **THEN** every 45×95 piece is placed in a 6 m bar and the 100×100 beams need 3 pieces of 6.5 m

#### Scenario: Offcut after kerf
- **WHEN** pieces of 3101 and 2830 mm are cut from a 6000 mm bar with a 3 mm kerf
- **THEN** the reported offcut is 63 mm

### Requirement: Sheet cutting
Sheet pieces SHALL be packed by bounding box into 2500×1250 sheets with rotation allowed
(MaxRects, best short side fit) and kerf, separately for wall sheathing and floor.

#### Scenario: Gable triangles
- **WHEN** gable-end pieces above the first row are small
- **THEN** several of them share one sheet

