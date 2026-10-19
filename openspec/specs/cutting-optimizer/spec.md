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
lengths SHALL be 6000 mm for 45×95 and 5400 mm for 50×50 battens. 100×100 beams SHALL be cut
from 13 m beams and counted and priced in 6.5 m halves: a 13 m beam of which at most 6.5 m is
used counts as one half, otherwise as two; a 100×100 piece MAY be up to 13 m long. The
optimizer SHALL choose the packing that needs the fewest halves. Halves SHALL appear only in
the order and the cost; the cutting layout SHALL show 13 m beams.

#### Scenario: Default stock lengths
- **WHEN** the default shed is computed with 45×95 in 6 m and 50×50 in 5.4 m
- **THEN** every 45×95 piece is placed in a 6 m bar and the 100×100 beams need 3 halves of 6.5 m

#### Scenario: Workshop beams
- **WHEN** the 4 × 4 m workshop needs 2 × 4000 and 4 × 3800 of 100×100
- **THEN** they are cut from two 13 m beams and the order is 4 halves

#### Scenario: Long beam in one piece
- **WHEN** the building is 10 000 mm long
- **THEN** each longitudinal beam is one 10 000 mm piece and the rest of its 13 m beam is used for other pieces

#### Scenario: Offcut after kerf
- **WHEN** pieces of 3101 and 2830 mm are cut from a 6000 mm bar with a 3 mm kerf
- **THEN** the reported offcut is 63 mm

### Requirement: Sheet cutting
Sheet pieces SHALL be packed by bounding box into 2500×1250 sheets with rotation allowed
(MaxRects, best short side fit) and kerf, separately for wall sheathing and floor.

#### Scenario: Gable triangles
- **WHEN** gable-end pieces above the first row are small
- **THEN** several of them share one sheet

