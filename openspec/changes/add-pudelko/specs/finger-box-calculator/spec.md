## Purpose

Kalkulator małego pudełka na wczepach prostych do ćwiczeń, z czterema rodzajami zamknięcia,
dobieranego z wymiarów albo z deski, którą użytkownik ma, i robionego narzędziami ręcznymi.

## ADDED Requirements

### Requirement: Dimensions are given or chosen from the boards
The calculator SHALL take board length (200–3000), width (40–300), thickness after planing
(6–20, default 12), count (1–6), kerf (0–4) and end trim (0–50). Outer length (100–500), depth
(60–350) and wall height (40–200) MAY each be locked; the others SHALL be searched on a 10 mm
grid among boxes whose parts can be cut from the boards.

#### Scenario: All locked
- **WHEN** the user locks 240 × 150 × 90 mm and the boards are enough
- **THEN** the page shows exactly that box and how the boards are cut

#### Scenario: Nothing locked
- **WHEN** no dimension is locked
- **THEN** the page proposes the box chosen by the goal and shows its outer and inner dimensions

#### Scenario: Boards too small
- **WHEN** the locked box does not fit the boards
- **THEN** the page hides the results and says how much more board is needed

### Requirement: Goal for the free dimensions
Goal "proportions" (default) SHALL pick the largest box whose outline including the lid is
within ±0.05 of length : depth : height = 1 : 0.6 : 0.4, else the closest; goal "capacity" the
largest inner volume.

#### Scenario: Proportions on the outline
- **WHEN** the goal is "proportions" and nothing is locked
- **THEN** the outline with the lid has depth and height within 0.05 of 0.6 and 0.4 of the length, or the page says what keeps it out

### Requirement: Finger layout as in the tool chest
Every corner SHALL be a finger joint glued without nails, laid out by the rule of the tool chest:
the smallest odd n ≥ 3 with h / n ≤ 1.5 T and h / n ≥ T, front and back holding the top and
bottom fingers, fingers T + 0.5 mm deep, pieces cut 1 mm over the outer size.

#### Scenario: Practice box
- **WHEN** the walls are 90 mm high and T is 12 mm
- **THEN** each corner has 5 fingers of 18 mm, the front and back are cut at 241 mm and the ends at 151 mm for a 240 × 150 box

### Requirement: Horizontal lines on the finger grid
Every horizontal line that crosses a corner (lid cut line, lowered end tops, lid rim height)
SHALL lie on a finger boundary k·w measured from the bottom of the walls.

#### Scenario: Grid lines
- **WHEN** w is 18 mm
- **THEN** every such line lies at a multiple of 18 mm

### Requirement: Floating bottom in a groove
The bottom SHALL be a panel of board T with a rebated tongue T/2 thick, floating in a groove T/2
wide and T/2 deep centred in the bottom finger band, not glued, with 1% plus 1 mm of play across
the grain. The groove SHALL be stopped in the front and back so it does not show at the corners.

#### Scenario: Bottom groove
- **WHEN** w is 18 mm and T is 12 mm
- **THEN** the groove is 6 mm wide and 6 mm deep from 6 to 12 mm above the bottom edge, through in the ends and stopped in the front and back

#### Scenario: Bottom wider than the board
- **WHEN** the bottom is wider than the board
- **THEN** the cut list shows it glued along the grain from full-width strips and a remainder of at least 20 mm

### Requirement: Lid type is chosen by the user
The user SHALL choose one closure: lift-off lid, sliding lid, hinged lid cut from the closed box,
or flat lay-on lid. The cut list, drawings, 3D model, work plan, tools and difficulty SHALL follow
the choice.

#### Scenario: Switching the lid
- **WHEN** the user switches from the lift-off lid to the sliding lid
- **THEN** the lid rim and lip strips disappear from the cut list and the lid grooves and lowered ends appear

### Requirement: Lift-off lid
The lift-off lid SHALL be a rim of the box's outer size, 3w high with 3 fingers of w, with a top
panel floating in a groove centred in its top finger band, located by lip strips T/2 thick glued
inside the box walls and standing 6 mm above them, with 0.5 mm play to the rim.

#### Scenario: Lift-off lid on the practice box
- **WHEN** w is 18 mm and T is 12 mm
- **THEN** the rim is 54 mm high with 3 fingers of 18 mm and the cut list contains four lip strips 6 mm thick standing 6 mm proud

### Requirement: Sliding lid
The sliding lid SHALL run along the length in grooves of the front and back, centred in their top
finger band and through at the ends; both ends SHALL stop at H − w so the lid passes over them.
The lid panel SHALL have its grain along the length, play of 1% plus 1 mm across the grain, a
finger recess at one end and a stop block under the other.

#### Scenario: Sliding lid on the practice box
- **WHEN** the walls are 90 mm high and w is 18 mm
- **THEN** both ends are 72 mm high, the front and back have lid grooves through at both ends, and the cut list contains the lid panel and its stop block

### Requirement: Hinged lid cut from the closed box
The hinged lid SHALL be made by gluing up the closed box with a top panel floating in a groove in
the top finger band and sawing it open on a finger boundary, the lid part k·w high (k ≥ 2,
closest to H/3) with the kerf taken from the lid side, then hung on two mortised hinges.

#### Scenario: Cut line
- **WHEN** the walls are 90 mm high and w is 18 mm
- **THEN** the cut line lies at 54 mm, the lid part is 36 mm before the kerf and the work plan saws it after the glue-up

#### Scenario: Hinges for thin boards
- **WHEN** T is 12 mm
- **THEN** the materials list two hinges with leaves of at most T and screws of at most 9 mm

### Requirement: Flat lay-on lid
The flat lid SHALL be a panel 3 mm over the outer size on every side with two battens across the
grain underneath, fitting inside the walls with 1 mm play and glued only in their middle third.

#### Scenario: Flat lid on the practice box
- **WHEN** the box is 240 × 150 mm with T = 12 mm
- **THEN** the lid panel is 246 × 156 mm and the two battens are 124 mm long and glued only in their middle third

### Requirement: Panels wider than the board are glued
A bottom or lid panel wider than the board SHALL be glued along the grain from full-width strips
plus one remainder of at least 20 mm, with 2 mm of jointing allowance per glued edge.

#### Scenario: Lid panel from two strips
- **WHEN** the lid panel is 156 mm wide and the board 120 mm
- **THEN** the cut list shows one full strip and one remainder strip glued along the grain

### Requirement: Marking template at full scale
The PDF SHALL include a marking template at 1:1 for every finger layout used (walls, lid rim, lid
part), with finger boundaries, waste marked with a cross, the depth line T + 0.5 mm and a 100 mm
control bar to check the print scale.

#### Scenario: Print the template
- **WHEN** the user prints the template page at 100%
- **THEN** the 100 mm control bar measures 100 mm and the wall template shows 5 fingers of 18 mm with the waste crossed

### Requirement: Practice-oriented work plan
The work plan SHALL be for hand tools only and SHALL start with a test corner on scrap, give the
total finger count and a time estimate, and list the steps for the chosen lid.

#### Scenario: Plan for the hinged lid
- **WHEN** the hinged lid is chosen
- **THEN** the plan includes gluing up the closed box, sawing the lid off on the cut line, planing both faces and mortising the hinges

### Requirement: Checks are shown
The page SHALL check the bottom under 10 kg spread evenly and the lid panel under 100 N in the
middle (E = 9000 MPa, limit L/300) and show the results with the loads and the note that this is
a preliminary design.

#### Scenario: Checks visible
- **WHEN** a box is shown
- **THEN** the page shows both checks against their limits

### Requirement: Outputs for the workshop
The page SHALL show a 3D model with the lid opening or lifting, front, side and top views with
dimensions, the board layout, the cut list, the work plan, tools and difficulty 1–5 with the
techniques. A banana for scale SHALL stand in the 3D model and on every view.

#### Scenario: Results visible
- **WHEN** a box is shown
- **THEN** all of the above sections are shown and every view and the 3D model contain the banana

### Requirement: Printable PDF and shareable link
The page SHALL generate a PDF with the views, the marking templates, the board layout, the cut
list and the work plan, and SHALL keep the inputs in localStorage and in the link.

#### Scenario: Shared link
- **WHEN** someone opens a link copied from the page
- **THEN** they see the same inputs and the same box
