## MODIFIED Requirements

### Requirement: Openings are edited on the wall elevations
Each wall SHALL have an elevation view seen from outside and, on a toggle, from inside,
showing framing and, on demand, the sheathing pieces of that face with labels. The inside view
SHALL be the mirror image and SHALL show a banana standing on the floor inside. The user SHALL
add a door, window or opening with a button, drag it horizontally (and vertically for windows),
resize it by its edges, edit its numbers in a panel and delete it, in either view. Positions
snap to 10 mm. While dragging, only the active drawing SHALL be redrawn; the summary, tables and
layouts SHALL update after the drag settles.

#### Scenario: Add a window
- **WHEN** the user clicks "Okno" on the front wall view
- **THEN** a window appears in a free place and the framing around it is rebuilt

#### Scenario: Drag without lag
- **WHEN** the user drags a window across the wall
- **THEN** the elevation follows the pointer and the cut list is recomputed once after release

#### Scenario: Drag in the inside view
- **WHEN** the user drags a window to the right in the inside view
- **THEN** the window follows the pointer to the right on screen

### Requirement: 3D model
The page SHALL show an orbitable 3D model with toggles for frame, floor, walls, sheathing,
roof timber and covering, and presets for "szkielet" and "całość". Every drawing and the 3D
model SHALL include a banana for scale that cannot be hidden and is never mentioned in text;
the 3D model SHALL have one banana on the ground outside and one on the floor inside.

#### Scenario: Skeleton preset
- **WHEN** the user picks "szkielet"
- **THEN** sheathing and covering are hidden and timber is shown

### Requirement: Parameters update everything live
The page SHALL offer inputs for dimensions, base frame, floor, walls (including interior
sheathing and the opening width from which openings get double studs), roof, covering sheet,
stock lengths and prices, and loads, and SHALL rebuild the model, drawings, cut list and
materials without a submit button. The saw kerf SHALL be a hidden parameter (default 3 mm),
not shown in the form. Typing in a number field SHALL rebuild only after a short pause (about
450 ms without keystrokes) or immediately when the field is committed (Enter or leaving the
field), so intermediate values are not computed.

#### Scenario: Change of pitch
- **WHEN** the user changes the pitch
- **THEN** wall heights, rafters, battens, sheets and the cut list update

#### Scenario: Typing a multi-digit value
- **WHEN** the user types "135" into a field without pausing
- **THEN** the model is rebuilt once, for 135
