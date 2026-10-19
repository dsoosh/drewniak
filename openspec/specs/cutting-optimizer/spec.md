# cutting-optimizer Specification

## Purpose
Rozkrój elementów prętowych na długości handlowe i kawałków płyt na arkusze, tak żeby kupić jak najmniej materiału.
## Requirements
### Requirement: Linear stock cutting
For each timber section the optimizer SHALL pack all cut lengths into stock pieces of the
configured length with the configured kerf, using first-fit decreasing and randomised
best-fit runs, minimising the number of stock pieces and then concentrating the offcut.
Pieces longer than the stock SHALL be reported separately. The result SHALL be deterministic
for the same input.

#### Scenario: Default stock lengths
- **WHEN** the default shed is computed with 45×95 in 6 m, 50×50 in 5.4 m and 100×100 in 13 m
- **THEN** every 45×95 piece is placed in a 6 m bar and each bar shows its pieces and offcut

### Requirement: Sheet cutting
Sheet pieces SHALL be packed by bounding box into 2500×1250 sheets with rotation allowed
(MaxRects, best short side fit) and kerf, separately for wall sheathing and floor.

#### Scenario: Gable triangles
- **WHEN** gable-end pieces above the first row are small
- **THEN** several of them share one sheet

