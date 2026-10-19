## ADDED Requirements

### Requirement: Parameters update everything live
The page SHALL offer inputs for dimensions, base frame, floor, walls, roof, covering sheet,
stock lengths and prices, kerf and loads, and SHALL rebuild the model, drawings, cut list
and materials on every change without a submit button.

#### Scenario: Change of pitch
- **WHEN** the user changes the pitch
- **THEN** wall heights, rafters, battens, sheets and the cut list update immediately

### Requirement: Openings are edited on the wall elevations
Each wall SHALL have an elevation view seen from outside showing framing and, on demand,
sheathing pieces with labels. The user SHALL add a door, window or opening with a button,
drag it horizontally (and vertically for windows), resize it by its edges, edit its numbers
in a panel and delete it. Positions snap to 10 mm.

#### Scenario: Add a window
- **WHEN** the user clicks "Okno" on the front wall view
- **THEN** a window appears in a free place and the framing around it is rebuilt

### Requirement: Partitions are drawn on the floor plan
The floor plan SHALL show the frame, joists, walls and openings. The user SHALL draw a
partition by dragging; it snaps to the x or y axis, to 10 mm and to inner wall faces within
150 mm. A selected partition SHALL be movable, editable (height, sheathing) and deletable,
and its elevation SHALL be available among the wall views for adding openings.

#### Scenario: Draw a partition
- **WHEN** the user drags across the plan near the inner face of the left wall
- **THEN** a partition is created that starts exactly at that face

### Requirement: Roof plan toggles clear sheets
The roof plan SHALL show rafters, battens and the covering grid with laps. Clicking a grid
cell SHALL toggle it between the covering sheet and a clear sheet.

#### Scenario: Skylight
- **WHEN** the user clicks two cells on the roof plan
- **THEN** both are drawn as clear sheets in the plan and the 3D model, and the materials list them separately

### Requirement: 3D model
The page SHALL show an orbitable 3D model with toggles for frame, floor, walls, sheathing,
roof timber and covering, and presets for "szkielet" and "całość". Every drawing and the 3D
model SHALL include a banana for scale that cannot be hidden and is never mentioned in text.

#### Scenario: Skeleton preset
- **WHEN** the user picks "szkielet"
- **THEN** sheathing and covering are hidden and timber is shown

### Requirement: Saving and sharing
The configuration SHALL be saved in localStorage, encoded in a shareable link (`#s=`), and
exportable and importable as a JSON file. A reset button SHALL restore the default shed.

#### Scenario: Open a shared link
- **WHEN** someone opens a link with `#s=`
- **THEN** the page shows exactly that configuration
