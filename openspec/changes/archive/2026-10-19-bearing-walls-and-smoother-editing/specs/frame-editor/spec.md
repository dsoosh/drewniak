## MODIFIED Requirements

### Requirement: Parameters update everything live
The page SHALL offer inputs for dimensions, base frame, floor, walls, roof, covering sheet,
stock lengths and prices, kerf and loads, and SHALL rebuild the model, drawings, cut list
and materials without a submit button. Typing in a number field SHALL rebuild only after a
short pause (about 450 ms without keystrokes) or immediately when the field is committed
(Enter or leaving the field), so intermediate values are not computed.

#### Scenario: Change of pitch
- **WHEN** the user changes the pitch
- **THEN** wall heights, rafters, battens, sheets and the cut list update

#### Scenario: Typing a multi-digit value
- **WHEN** the user types "135" into a field without pausing
- **THEN** the model is rebuilt once, for 135

### Requirement: Openings are edited on the wall elevations
Each wall SHALL have an elevation view seen from outside showing framing and, on demand,
sheathing pieces with labels. The user SHALL add a door, window or opening with a button,
drag it horizontally (and vertically for windows), resize it by its edges, edit its numbers
in a panel and delete it. Positions snap to 10 mm. While dragging, only the active drawing
SHALL be redrawn; the summary, tables and layouts SHALL update after the drag settles.

#### Scenario: Add a window
- **WHEN** the user clicks "Okno" on the front wall view
- **THEN** a window appears in a free place and the framing around it is rebuilt

#### Scenario: Drag without lag
- **WHEN** the user drags a window across the wall
- **THEN** the elevation follows the pointer and the cut list is recomputed once after release

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
