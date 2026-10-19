## MODIFIED Requirements

### Requirement: Linear stock cutting
For each timber section the optimizer SHALL pack all cut lengths into stock pieces of the
configured length with the configured kerf, using first-fit decreasing and randomised
best-fit runs, minimising the number of stock pieces and then concentrating the offcut.
Pieces longer than the stock SHALL be reported separately. The result SHALL be deterministic
for the same input. The default stock lengths SHALL be 6000 mm for 45×95, 5400 mm for 50×50
battens and 6500 mm for 100×100 beams, which are sold as halves of 13 m beams.

#### Scenario: Default stock lengths
- **WHEN** the default shed is computed with 45×95 in 6 m, 50×50 in 5.4 m and 100×100 in 6.5 m
- **THEN** every 45×95 piece is placed in a 6 m bar and the 100×100 beams need 3 pieces of 6.5 m
