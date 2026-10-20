## Purpose

Kalkulator małego pudełka na wczepach prostych do ćwiczeń, z czterema rodzajami zamknięcia,
dobieranego z wymiarów albo z deski, którą użytkownik ma, i robionego narzędziami ręcznymi.

## ADDED Requirements

### Requirement: Dimensions are given or chosen from the boards
The calculator SHALL take board length (200–3000), width (40–300), thickness after planing
(8–20, default 12), count (1–6, default 3), kerf (0–4), end trim (0–50) and wood (soft or hard). Outer
length (100–500), depth (60–350) and wall height (40–200) MAY each be locked; the others SHALL
be searched on a 10 mm grid among boxes whose parts can be cut from the boards.

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
A free length SHALL stay within 12 T–30 T. Goal "proportions" (default) SHALL pick, among boxes
whose outline with the lid is within ±0.05 of 1 : 0.6 : 0.4, walls from one strip first, then
more fingers per corner, then top panels from one board, then the largest; else the closest.
Goal "capacity" SHALL pick the largest inner volume.

#### Scenario: Proportions on the outline
- **WHEN** the goal is "proportions" and nothing is locked
- **THEN** the outline with the lid has depth and height within 0.05 of 0.6 and 0.4 of the length, or the page says what keeps it out

#### Scenario: Thin board, free length
- **WHEN** T is 8 mm and the length is free
- **THEN** the proposed box is at most 240 mm long and gets no warning that it looks flimsy

### Requirement: Finger layout as in the tool chest
Every corner SHALL be a finger joint glued without nails, laid out by the rule of the tool chest:
the smallest odd n ≥ 3 with h / n ≤ 1.5 T and h / n ≥ T, front and back holding the top and
bottom fingers of the box body, fingers T + 0.5 mm deep, pieces cut 1 mm over the outer size.

#### Scenario: Practice box
- **WHEN** the walls are 90 mm high and T is 12 mm
- **THEN** each corner has 5 fingers of 18 mm, the front and back are cut at 241 mm and the ends at 151 mm for a 240 × 150 box

### Requirement: Walls are one piece
Walls, the lift-off rim and the closed box of the hinged lid SHALL each be cut from one board
width, never glued from strips; heights that need a wider board SHALL NOT be proposed.

#### Scenario: Board too narrow for the walls
- **WHEN** the board is 80 mm wide and the walls are locked at 90 mm
- **THEN** the page says the walls need a board at least 90 mm wide, the smallest width that would work

### Requirement: Horizontal lines on the finger grid
Every horizontal line that crosses a corner (lid rim height, lip strip bottom) SHALL lie on a
finger boundary k·w from the bottom of the walls; the hinged lid cut lies in the middle of a band.

#### Scenario: Grid lines
- **WHEN** w is 18 mm
- **THEN** the lip strips end 18 mm below the wall top and the rim is 54 mm high

### Requirement: Wood movement and groove depth
Panels SHALL have play across the grain of 1% (soft wood) or 1.5% (hard wood) of their width
plus 1 mm, and 1 mm along it. The groove depth SHALL be max(T/2, play + e) with e = 3 mm (2 mm
below T = 10) and at most T − 3 mm; a box that needs more SHALL NOT be proposed.

#### Scenario: Thin board, wide box
- **WHEN** T is 8 mm and the panel is 330 mm wide in soft wood
- **THEN** the box is rejected with the note that the board is too thin for that width

#### Scenario: Practice box
- **WHEN** T is 12 mm and the bottom panel is about 136 mm wide in soft wood
- **THEN** the groove is 6 mm deep and the panel keeps at least 3 mm in the groove when pushed to one side

### Requirement: Groove width from plough irons
The groove width SHALL be the widest common plough iron (3, 4, 5, 6, 8 or 10 mm) of at most T/2
that leaves at least 3 mm of wood between the groove and the finger line of its band.

#### Scenario: Odd thickness
- **WHEN** T is 14 mm
- **THEN** the grooves are 6 mm wide, not 7

#### Scenario: Narrow band
- **WHEN** T is 12 mm and the walls are 60 mm high (w = 12 mm)
- **THEN** the bottom groove is 5 mm wide, from 4 to 9 mm, leaving 3 mm to the finger line

### Requirement: Floating bottom in a groove
The bottom SHALL float, unglued, in a groove in the bottom finger band, its lower edge at least
4 mm above the wall bottom; through in the ends, stopped T − d short of the ends in the front
and back. The panel SHALL be rebated from the top, tongue as long as the groove depth d and
shoulders c/2 clear of the walls.

#### Scenario: Bottom groove
- **WHEN** w is 18 mm and T is 12 mm
- **THEN** the groove is 6 mm wide from 6 to 12 mm above the bottom edge, stopped 6 mm short in the front and back, and the panel underside is 6 mm above the table

#### Scenario: Shoulder play
- **WHEN** the bottom panel of the practice box has 2.4 mm play
- **THEN** its body is 2.4 mm narrower than the inside and stands 1.2 mm clear of the front and the back

#### Scenario: Deep groove
- **WHEN** the groove is 8.9 mm deep in 12 mm boards
- **THEN** the front and back grooves stop 3.1 mm short of the ends so the panel fits

### Requirement: Panels from one board or symmetric strips
Every panel (bottom, lid panels) SHALL be one board when it fits, else two equal strips glued on
the axis, else a full centre strip with two equal edge strips of at least 40 mm, with 2 mm of
jointing allowance per glued edge.

#### Scenario: Flat lid from two strips
- **WHEN** the lid panel is 162 mm wide and the board 120 mm
- **THEN** the cut list shows two equal strips glued with the seam on the axis

### Requirement: Rejections are explained
When a box cannot be made, the page SHALL name the reason: walls wider than the board (smallest
width needed), too few fingers for the lid (nearest height that works), board too thin for the
groove, bottom band too narrow for the groove, box too small, or not enough board.

#### Scenario: Band too narrow
- **WHEN** T is 8 mm and the walls are locked at 40 mm
- **THEN** the page says the bottom finger band is too narrow for the groove and suggests higher walls or a thicker board

### Requirement: Lid type is chosen by the user
The user SHALL choose one closure: lift-off lid, sliding lid, hinged lid cut from the closed box,
or flat lay-on lid. The cut list, drawings, 3D model, work plan, tools and difficulty SHALL follow
the choice.

#### Scenario: Switching the lid
- **WHEN** the user switches from the lift-off lid to the sliding lid
- **THEN** the lid rim and lip strips disappear from the cut list and the lid grooves and the lowered end appear

### Requirement: Lift-off lid
The lift-off lid SHALL be a rim of the box's outer size, 3w high with 3 fingers of w, the ends
holding its outer fingers so the rhythm runs on across the joint, with a top panel in a groove of
its top band (through in the front and back, stopped in the ends). It SHALL need n ≥ 5 in the body;
with a free height the page SHALL say when the boards allow only 5 fingers (rim 3/8 of the height).

#### Scenario: Lift-off lid on the practice box
- **WHEN** w is 18 mm, T is 12 mm and the body has 5 fingers
- **THEN** the rim is 54 mm high with the ends holding its top and bottom fingers

#### Scenario: Body too low
- **WHEN** the body has only 3 fingers
- **THEN** the page says the box is too low for this lid and gives the nearest height with 5 fingers

#### Scenario: Boards allow only 5 fingers
- **WHEN** the height is free and only a box with 5 fingers fits the boards
- **THEN** the page notes that more board would give 7 fingers and a lighter rim

### Requirement: Lip strips of the lift-off lid
The lid SHALL be located by lip strips T/2 thick and w + 6 mm high glued inside the walls on
their top band, standing 6 mm proud, two at L − 2T and two at D − 3T, with a 0.5 mm rebate on the
proud part for play to the rim and a 1 mm chamfer on the top edge.

#### Scenario: Lip strips
- **WHEN** the box is 240 × 150 mm with T = 12 mm and w = 18 mm
- **THEN** the cut list contains two lip strips of 216 mm and two of 114 mm, 6 × 24 mm, rebated 0.5 mm on the top 6 mm

### Requirement: Sliding lid
The sliding lid SHALL run along the length in grooves of the front and back with its top flush
with the walls and its tongue at the underside; one end SHALL stop at H − T under the lid, the
other end SHALL be full height with a groove taking the lid's end. A free height SHALL give
w − T of 0 or at least 3 mm, so the low end does not almost meet a finger line.

#### Scenario: Sliding lid on the practice box
- **WHEN** the walls are 90 mm high and T is 12 mm
- **THEN** the low end is 78 mm high, the high end 90 mm with a groove, and the front and back grooves are through at the low end and stopped T − d short at the high end

#### Scenario: Near miss avoided
- **WHEN** the height is free and T is 12 mm
- **THEN** no proposed box has a low end between 0.5 and 3 mm from a finger line

### Requirement: Sliding lid panel
The lid panel SHALL have its grain along the length, the movement play across it, its outer end
flush with the low end and a shallow finger recess 24 × 16 mm, T/3 deep, T from that end; it
SHALL slide out completely, with no stop block.

#### Scenario: Finger recess
- **WHEN** T is 12 mm
- **THEN** the recess is 24 × 16 mm and 4 mm deep, 12 mm from the end of the lid

### Requirement: Hinged lid cut from the closed box
The hinged lid SHALL be sawn from the glued-up closed box in the middle of one finger band, marked
w + saw kerf + 1 mm wide so both halves are w/2 after planing. It SHALL need n ≥ 7; the lid is
(k + ½)·w with k ≥ 2 closest to H/3, the body the rest, each at least 2.5w. The work plan SHALL
give the marking line and the lid groove on the raw walls.

#### Scenario: Cut line
- **WHEN** the finished walls are 100 mm high, T is 12 mm (7 fingers of 14.3 mm) and the saw kerf 1 mm
- **THEN** the box is marked 102 mm high, the cut runs in the middle of the fifth band at 65.3 mm on the raw walls, and the lid is 35.7 mm and the body 64.3 mm after planing

#### Scenario: Too few fingers
- **WHEN** the walls are locked at 90 mm with T = 12 mm (5 fingers)
- **THEN** the hinged lid is not offered and the page gives 100 mm as the nearest height with 7 fingers

### Requirement: Hinges of the hinged lid
Two mortised hinges with a stop at 95° SHALL be chosen from 20, 25, 30, 40 and 50 mm with typical
leaves of 6, 7.5, 9, 10.5 and 12.5 mm: the length nearest L/8 among those with a leaf of at most
T − 2. Each SHALL stand max(hinge length, T + 5) from the box end; screws at most T/4 thick and at
most the part height − 5 mm long.

#### Scenario: Hinges on the practice box
- **WHEN** the box is 240 mm long with T = 12 mm
- **THEN** the materials list two 30 mm hinges with a 95° stop and 9 mm leaves, placed 30 mm from each end, with 3 mm screws

#### Scenario: Thin board
- **WHEN** T is 8 mm and the box is 240 mm long
- **THEN** the hinges are 20 mm long

### Requirement: Third hinge on a long or heavy lid
A third hinge of the same size SHALL be added in the middle when L/8 exceeds the chosen hinge
length by more than 15 mm or the lid part weighs more than 0.6 kg at 500 kg/m³.

#### Scenario: Long lid
- **WHEN** the box is 500 × 300 × 120 mm with T = 12 mm
- **THEN** the materials list three 30 mm hinges and 12 screws, the third in the middle

### Requirement: Grip of the hinged lid
The hinged lid SHALL get a 45° chamfer T/3 deep on the lower front edge over the middle third of
its length.

#### Scenario: Grip
- **WHEN** T is 12 mm and the box 240 mm long
- **THEN** the drawings show a 4 mm chamfer over the middle 80 mm of the lid front

### Requirement: Flat lay-on lid
The flat lid SHALL overhang the box by max(4, round(T/2)) mm on every side, with two battens
T × 1.5T across the grain underneath, D − 2T − 2 long, their outer faces 1 mm inside the end walls
so the lid locates both ways, glued only in their middle third.

#### Scenario: Flat lid on the practice box
- **WHEN** the box is 240 × 150 mm with T = 12 mm
- **THEN** the lid panel is 252 × 162 mm and the two battens are 12 × 18 × 124 mm, 1 mm inside the ends, glued only in their middle third

### Requirement: Top panels are recessed
Lid panels in a rim (lift-off lid, hinged lid) SHALL be rebated from the underside, the tongue at
their top face, so their top lies (w − g)/2 below the rim edge, kept within 3–6 mm, with an even
shadow line; the work plan SHALL give the groove from the top edge.

#### Scenario: Recess
- **WHEN** w is 18 mm and T is 12 mm
- **THEN** the top panel lies 6 mm below the rim edge and the plan gives the groove 6–12 mm below the top edge

### Requirement: Checks are shown
The page SHALL check the bottom under 10 kg spread evenly and the lid panel under 100 N in the
middle, both spanning along the grain, width = panel width, thickness T, E = 9000 MPa, limit
L/300, and show the results with the loads and the note that this is a preliminary design.

#### Scenario: Thin bottom fails
- **WHEN** T is 8 mm and the box is locked at 500 × 200 mm
- **THEN** the bottom check is shown above its limit with a warning

### Requirement: Proportion warnings for the board thickness
The page SHALL warn when a locked length is more than 30 T (looks flimsy) or less than 12 T (looks
heavy).

#### Scenario: Heavy box
- **WHEN** T is 20 mm and the box is 200 mm long
- **THEN** the page warns that the box looks heavy for that board

### Requirement: Edges, grain and finish
All edges SHALL get one chamfer, 1 mm up to T = 12 and 1.5 mm above; 0.5 mm along the lid joint
or cut; none at groove exits. Walls SHALL be cut in order front, end, back, end from one strip.
Finish: oil or hard wax oil outside, shellac or wax inside, panels finished before assembly.

#### Scenario: Cut list order
- **WHEN** a box is shown
- **THEN** the cut list marks the walls 1–4 in the order front, end, back, end from one strip and the work plan finishes the panels before assembly

### Requirement: Marking template at full scale
The PDF SHALL include a marking template at 1:1 for every finger layout used (walls, lid rim, the
widened band of the hinged lid), with finger boundaries, waste marked with a cross, the depth line
T + 0.5 mm and a 100 mm control bar to check the print scale.

#### Scenario: Print the template
- **WHEN** the user prints the template page at 100%
- **THEN** the 100 mm control bar measures 100 mm and the wall template shows 5 fingers of 18 mm with the waste crossed

#### Scenario: Cut line on the template
- **WHEN** the hinged lid is chosen
- **THEN** the template shows the widened band with a dashed cut line in its middle and its height from the bottom

### Requirement: Practice-oriented work plan
The work plan SHALL be for hand tools only, start with a test corner on scrap, cut the grooves
before the fingers (stopped ends chopped first), give the finger count and a time estimate, and
list the steps for the chosen lid with glue of at least 15 min open time.

#### Scenario: Plan for the hinged lid
- **WHEN** the hinged lid is chosen
- **THEN** the plan glues up the closed box, marks the cut all round, saws from the corners with wedges in the kerf, planes from the corners to the middle and mortises the hinges

### Requirement: Tools and difficulty
The tools SHALL include a plough plane with the groove iron, a chisel or router plane for the
stopped grooves and a fine saw for the cut-off. Difficulty 1–5 SHALL follow the techniques of the
chosen lid, one level more at T = 8 mm.

#### Scenario: Tools for the practice box
- **WHEN** T is 12 mm
- **THEN** the tools list a plough plane with a 6 mm iron and a router plane or 6 mm chisel

### Requirement: Outputs for the workshop
The page SHALL show a 3D model with the lid opening, lifting or sliding, front, side and top views
with dimensions taken from the box (mortised hardware and chamfers never enlarge the outline), the board layout, the cut list, the work plan, tools and difficulty with the
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
