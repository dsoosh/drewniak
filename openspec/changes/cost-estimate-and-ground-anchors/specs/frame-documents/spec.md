## MODIFIED Requirements

### Requirement: Order summary first
The page SHALL start the results with an order summary: number of stock pieces per timber
section, wall and floor sheets, covering and clear sheets, ridge caps for gable roofs,
covering nails, ground anchors with bitumen pads, beam hangers, plate anchors, corner
straps, rafter connectors, ridge gussets (gable) or top-edge flashing (mono-pitch), OSB
fasteners and end-grain preservative. The summary SHALL include a cost estimate with default
2026 prices (100×100 × 6.5 m 189 zł, 45×95 × 6 m 69 zł, 50×50 × 5.4 m 22 zł, OSB by thickness,
corrugated sheet about 45 zł, ground anchor 120–150 zł) that the user can override: a total,
the share of each priced item, the anchor price range, and a list of items not included.

#### Scenario: Default prices
- **WHEN** the default shed is shown without any price edits
- **THEN** the summary shows an estimated total with the items it is made of and a range from the anchor prices

#### Scenario: Thicker OSB
- **WHEN** the user switches the wall sheathing from 12 to 18 mm
- **THEN** the sheet price and the total follow the 18 mm price unless a price was typed in
