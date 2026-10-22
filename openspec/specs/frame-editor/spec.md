# frame-editor Specification

## Purpose
Interfejs konfiguratora szkieletu: parametry, edycja otworów i ścianek na rzutach, model 3D, zapis i udostępnianie konfiguracji.

## Requirements

### Requirement: Parameters update everything live
The page SHALL offer inputs for dimensions, base frame, floor, walls, roof, covering sheet,
stock lengths and prices, and loads, and SHALL rebuild the model, drawings, cut list and
materials without a submit button.

#### Scenario: Change of pitch
- **WHEN** the user changes the pitch
- **THEN** wall heights, rafters, battens, sheets and the cut list update

#### Scenario: Typing a multi-digit value
- **WHEN** the user types "135" into a field without pausing
- **THEN** the model is rebuilt once, for 135

#### Scenario: Value above the limit
- **WHEN** the user types 80000 into the length
- **THEN** the length is set to 15000 and a message says that 15 m is the maximum

### Requirement: Openings are edited on the wall elevations
Each wall SHALL have an elevation view seen from outside and, on a toggle, from inside,
showing framing and, on demand, the sheathing pieces of that face with labels. The inside view
SHALL be the mirror image and SHALL show a banana standing on the floor inside.

#### Scenario: Add a window
- **WHEN** the user clicks "Okno" on the front wall view
- **THEN** a window appears in a free place and the framing around it is rebuilt

#### Scenario: Drag without lag
- **WHEN** the user drags a window across the wall
- **THEN** the elevation follows the pointer and the cut list is recomputed once after release

#### Scenario: Drag in the inside view
- **WHEN** the user drags a window to the right in the inside view
- **THEN** the window follows the pointer to the right on screen

### Requirement: Partitions are drawn on the floor plan
The floor plan SHALL show the frame, joists, walls, openings and ground anchors (symbol,
number and spacing dimensions). The user SHALL draw a partition by dragging; it snaps to the x
or y axis, to 10 mm and to inner wall faces within 150 mm, and is sheathed on both sides by
default.

#### Scenario: Draw a partition
- **WHEN** the user drags across the plan near the inner face of the left wall
- **THEN** a partition is created that starts exactly at that face and is sheathed on both sides

#### Scenario: Accept a proposed bearing wall
- **WHEN** the rafter check fails and the user clicks the proposed wall on the plan
- **THEN** a bearing partition is added there and the proposal disappears

#### Scenario: Anchors on the plan
- **WHEN** the default shed is shown on the floor plan
- **THEN** six anchors K1–K6 are drawn with their spacing dimensioned

### Requirement: Roof plan toggles clear sheets
The roof plan SHALL show rafters, battens and the covering grid with laps. Clicking a grid
cell SHALL toggle it between the covering sheet and a clear sheet.

#### Scenario: Skylight
- **WHEN** the user clicks two cells on the roof plan
- **THEN** both are drawn as clear sheets in the plan and the 3D model, and the materials list them separately

### Requirement: 3D model
The page SHALL show an orbitable 3D model with toggles for frame, floor, walls, exterior
sheathing, interior sheathing, roof timber, covering, windows and doors, and ground anchors,
and views "szkielet", "całość" and "wizualizacja" (everything with windows and doors).

#### Scenario: Skeleton preset
- **WHEN** the user picks "szkielet"
- **THEN** sheathing and covering are hidden and timber is shown

#### Scenario: Visualisation
- **WHEN** the user picks "wizualizacja"
- **THEN** sheathing, covering, windows and doors are shown

#### Scenario: Cross-eye
- **WHEN** the user switches the cross-eye mode on
- **THEN** the viewer shows two images of the model side by side for cross-eyed viewing

### Requirement: Saving and sharing
The configuration SHALL be saved in localStorage, encoded in a shareable link (`#s=`), and
saved to and opened from a local JSON file. A reset button SHALL restore the default shed.

#### Scenario: Open a shared link
- **WHEN** someone opens a link with `#s=`
- **THEN** the page shows exactly that configuration

#### Scenario: Save back to the same file
- **WHEN** the user opened `wiata.json`, changed the pitch and pressed Ctrl+S in Chrome
- **THEN** `wiata.json` on disk is overwritten without a dialog and the unsaved-changes mark disappears

### Requirement: Parameter inputs in detail
The base frame inputs SHALL be the transverse beam spacing and the maximum ground anchor
spacing; the floor input the sheet thickness from a list; the wall inputs include the
sheathing thickness from a list, interior sheathing and the opening width from which openings
get double studs; the roof inputs include the splice method for rafters and loft joists; the
prices include the anchor price, and an empty OSB price means the price from the thickness table.

#### Scenario: Empty OSB price
- **WHEN** the OSB price field is left empty
- **THEN** the OSB price comes from the thickness table

### Requirement: Number inputs are clamped to the model limits
Number inputs SHALL carry the model limits as min and max, and a value outside them SHALL be
clamped with a short message naming the limit.

#### Scenario: Value below the limit
- **WHEN** the user types a value below the minimum of a field
- **THEN** the field is set to the minimum and a message names that limit

### Requirement: Saw kerf is a hidden parameter
The saw kerf SHALL be a hidden parameter (default 3 mm), not shown in the form.

#### Scenario: Kerf not in the form
- **WHEN** the form is shown
- **THEN** there is no kerf field and the cutting uses 3 mm

### Requirement: Typing rebuilds after a pause
Typing in a number field SHALL rebuild only after a short pause (about 450 ms without
keystrokes) or immediately when the field is committed (Enter or leaving the field), so
intermediate values are not computed.

#### Scenario: Enter commits
- **WHEN** the user types a value and presses Enter
- **THEN** the model is rebuilt at once for that value

### Requirement: Openings are added and dragged on the elevations
The user SHALL add a door, window or opening with a button, drag it horizontally (and
vertically for windows), resize it by its edges, edit its numbers in a panel and delete it, in
either view. Positions snap to 10 mm.

#### Scenario: Resize by an edge
- **WHEN** the user drags the right edge of a door
- **THEN** its width changes in 10 mm steps and the framing follows

### Requirement: Only the active drawing redraws while dragging
While dragging, only the active drawing SHALL be redrawn; the summary, tables and layouts
SHALL update after the drag settles.

#### Scenario: Tables during a drag
- **WHEN** a drag on an elevation is in progress
- **THEN** the summary and tables keep their values until the drag settles

### Requirement: Selected partitions can be edited
A selected partition SHALL be movable, editable (height, sheathing, and for partitions
along the length the bearing flag) and deletable, and its elevation SHALL be available among the
wall views for adding openings.

#### Scenario: Delete a partition
- **WHEN** the user selects a partition and deletes it
- **THEN** it disappears from the plan, the walls and the cut list

### Requirement: Proposed bearing walls are shown on the plan
Proposed bearing walls SHALL be drawn as dashed outlines with a label; clicking one adds it as
a bearing partition.

#### Scenario: Proposal drawn
- **WHEN** the generator proposes a bearing wall
- **THEN** the plan shows it as a dashed outline with a label

### Requirement: 3D model appearance
Sheets SHALL be opaque. Windows SHALL show a frame and glass, doors a frame and a leaf. Ground
anchors SHALL be shown as piles with heads below a semi-transparent ground.

#### Scenario: Anchors in 3D
- **WHEN** ground anchors are switched on in the 3D model
- **THEN** they are piles with heads seen through a semi-transparent ground

### Requirement: Cross-eye stereo mode
A cross-eye stereo mode SHALL show two views side by side, the left one for the right eye.

#### Scenario: Left image for the right eye
- **WHEN** the cross-eye mode is on
- **THEN** the left image is rendered from the right-eye position

### Requirement: Bananas in the drawings and the 3D model
Every drawing and the 3D model SHALL include a banana for scale that cannot be hidden and is
never mentioned in text; the 3D model SHALL have one banana on the ground outside and one on the
floor inside.

#### Scenario: Bananas in 3D
- **WHEN** the 3D model is shown
- **THEN** one banana lies on the ground outside and one on the floor inside, and no toggle hides them

### Requirement: Saving back to the same file
Where the browser supports the File System Access API, "Zapisz" SHALL write back to the file
that was opened or saved last, "Zapisz jako…" SHALL ask for a new file and "Otwórz…" SHALL
open one; elsewhere saving downloads the file and opening uses a file chooser. Ctrl+S,
Ctrl+Shift+S and Ctrl+O SHALL do the same.

#### Scenario: Browser without the API
- **WHEN** the browser has no File System Access API and the user presses "Zapisz"
- **THEN** the configuration is downloaded as a JSON file

### Requirement: File name and unsaved changes are shown
The page SHALL show the current file name and whether there are unsaved changes.

#### Scenario: Change after saving
- **WHEN** the user changes a parameter after saving
- **THEN** the page shows the file name with an unsaved-changes mark

### Requirement: Plate joining switch
The wall inputs SHALL include the switch „Łącz oczepy i podwaliny, gdy mniej odpadu”, on by
default; saved configurations without it SHALL load with it on.

#### Scenario: Default switch
- **WHEN** a new project or an old save is opened
- **THEN** plate joining is on
