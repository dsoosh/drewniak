## MODIFIED Requirements

### Requirement: 3D model
The page SHALL show an orbitable 3D model with toggles for frame, floor, walls, exterior
sheathing, interior sheathing, roof timber, covering, windows and doors, and ground anchors,
and views "szkielet", "całość" and "wizualizacja" (everything with windows and doors). Sheets
SHALL be opaque. Windows SHALL show a frame and glass, doors a frame and a leaf. Ground
anchors SHALL be shown as piles with heads below a semi-transparent ground. A cross-eye stereo
mode SHALL show two views side by side, the left one for the right eye. Every drawing and the 3D
model SHALL include a banana for scale that cannot be hidden and is never mentioned in text;
the 3D model SHALL have one banana on the ground outside and one on the floor inside.

#### Scenario: Skeleton preset
- **WHEN** the user picks "szkielet"
- **THEN** sheathing and covering are hidden and timber is shown

#### Scenario: Visualisation
- **WHEN** the user picks "wizualizacja"
- **THEN** sheathing, covering, windows and doors are shown

#### Scenario: Cross-eye
- **WHEN** the user switches the cross-eye mode on
- **THEN** the viewer shows two images of the model side by side for cross-eyed viewing

### Requirement: Partitions are drawn on the floor plan
The floor plan SHALL show the frame, joists, walls, openings and ground anchors (symbol,
number and spacing dimensions). The user SHALL draw a partition by dragging; it snaps to the x
or y axis, to 10 mm and to inner wall faces within 150 mm, and is sheathed on both sides by
default. A selected partition SHALL be movable, editable (height, sheathing, and for
partitions along the length the bearing flag) and deletable, and its elevation SHALL be
available among the wall views for adding openings. Proposed bearing walls SHALL be drawn as
dashed outlines with a label; clicking one adds it as a bearing partition.

#### Scenario: Draw a partition
- **WHEN** the user drags across the plan near the inner face of the left wall
- **THEN** a partition is created that starts exactly at that face and is sheathed on both sides

#### Scenario: Accept a proposed bearing wall
- **WHEN** the rafter check fails and the user clicks the proposed wall on the plan
- **THEN** a bearing partition is added there and the proposal disappears

#### Scenario: Anchors on the plan
- **WHEN** the default shed is shown on the floor plan
- **THEN** six anchors K1–K6 are drawn with their spacing dimensioned

### Requirement: Parameters update everything live
The page SHALL offer inputs for dimensions, base frame (transverse beam spacing and maximum
ground anchor spacing), floor (sheet thickness from a list), walls (including sheathing
thickness from a list, interior sheathing and the opening width from which openings get double
studs), roof, covering sheet, stock lengths and prices (empty OSB price = price from the
thickness table, anchor price), and loads, and SHALL rebuild the model, drawings, cut list and
materials without a submit button. Number inputs SHALL carry the model limits as min and max,
and a value outside them SHALL be clamped with a short message naming the limit. The saw kerf
SHALL be a hidden parameter (default 3 mm), not shown in the form. Typing in a number field
SHALL rebuild only after a short pause (about 450 ms without keystrokes) or immediately when the
field is committed (Enter or leaving the field), so intermediate values are not computed.

#### Scenario: Change of pitch
- **WHEN** the user changes the pitch
- **THEN** wall heights, rafters, battens, sheets and the cut list update

#### Scenario: Typing a multi-digit value
- **WHEN** the user types "135" into a field without pausing
- **THEN** the model is rebuilt once, for 135

#### Scenario: Value above the limit
- **WHEN** the user types 80000 into the length
- **THEN** the length is set to 15000 and a message says that 15 m is the maximum
