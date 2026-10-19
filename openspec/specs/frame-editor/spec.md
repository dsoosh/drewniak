# frame-editor Specification

## Purpose
Interfejs konfiguratora szkieletu: parametry, edycja otworów i ścianek na rzutach, model 3D, zapis i udostępnianie konfiguracji.
## Requirements
### Requirement: Parameters update everything live
The page SHALL offer inputs for dimensions, base frame (transverse beam spacing and maximum
ground anchor spacing), floor (sheet thickness from a list), walls (including sheathing
thickness from a list, interior sheathing and the opening width from which openings get double
studs), roof, covering sheet, stock lengths and prices (empty OSB price = price from the
thickness table, anchor price), and loads, and SHALL rebuild the model, drawings, cut list and
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

### Requirement: Partitions are drawn on the floor plan
The floor plan SHALL show the frame, joists, walls and openings. The user SHALL draw a
partition by dragging; it snaps to the x or y axis, to 10 mm and to inner wall faces within
150 mm. A selected partition SHALL be movable, editable (height, sheathing, and for
partitions along the length the bearing flag) and deletable, and its elevation SHALL be
available among the wall views for adding openings. Proposed bearing walls SHALL be drawn as
dashed outlines with a label; clicking one adds it as a bearing partition.

#### Scenario: Draw a partition
- **WHEN** the user drags across the plan near the inner face of the left wall
- **THEN** a partition is created that starts exactly at that face

#### Scenario: Accept a proposed bearing wall
- **WHEN** the rafter check fails and the user clicks the proposed wall on the plan
- **THEN** a bearing partition is added there and the proposal disappears

### Requirement: Roof plan toggles clear sheets
The roof plan SHALL show rafters, battens and the covering grid with laps. Clicking a grid
cell SHALL toggle it between the covering sheet and a clear sheet.

#### Scenario: Skylight
- **WHEN** the user clicks two cells on the roof plan
- **THEN** both are drawn as clear sheets in the plan and the 3D model, and the materials list them separately

### Requirement: 3D model
The page SHALL show an orbitable 3D model with toggles for frame, floor, walls, sheathing,
roof timber and covering, and presets for "szkielet" and "całość". Every drawing and the 3D
model SHALL include a banana for scale that cannot be hidden and is never mentioned in text;
the 3D model SHALL have one banana on the ground outside and one on the floor inside.

#### Scenario: Skeleton preset
- **WHEN** the user picks "szkielet"
- **THEN** sheathing and covering are hidden and timber is shown

### Requirement: Saving and sharing
The configuration SHALL be saved in localStorage, encoded in a shareable link (`#s=`), and
saved to and opened from a local JSON file. Where the browser supports the File System Access
API, "Zapisz" SHALL write back to the file that was opened or saved last, "Zapisz jako…"
SHALL ask for a new file and "Otwórz…" SHALL open one; elsewhere saving downloads the file
and opening uses a file chooser. Ctrl+S, Ctrl+Shift+S and Ctrl+O SHALL do the same. The page
SHALL show the current file name and whether there are unsaved changes. A reset button SHALL
restore the default shed.

#### Scenario: Open a shared link
- **WHEN** someone opens a link with `#s=`
- **THEN** the page shows exactly that configuration

#### Scenario: Save back to the same file
- **WHEN** the user opened `wiata.json`, changed the pitch and pressed Ctrl+S in Chrome
- **THEN** `wiata.json` on disk is overwritten without a dialog and the unsaved-changes mark disappears

