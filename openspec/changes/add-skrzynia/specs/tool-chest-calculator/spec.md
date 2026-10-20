## Purpose

Kalkulator skrzyni warsztatowej z wiekiem na zawiasach, wyjmowanymi tacami i cokołem,
dobieranej z desek, które użytkownik ma, i robionej wyłącznie narzędziami ręcznymi.

## ADDED Requirements

### Requirement: Dimensions are optimised from the boards the user owns
The calculator SHALL take board length (300–6000), width (60–400), thickness after planing
(12–32), count (1–12), kerf (0–6) and end trim (0–100), and search chest dimensions on a
10 mm grid whose pieces can be cut from those boards. Goal "capacity" picks the largest
inner volume, goal "proportions" follows the proportion rule.

#### Scenario: Default boards
- **WHEN** the user enters eight 2500×200×20 mm boards and goal "proportions"
- **THEN** the page shows the chest that fits, its outer and inner dimensions and how each board is cut

#### Scenario: Boards too small
- **WHEN** no chest fits the boards
- **THEN** the page hides the results and lists what to change (more boards, longer boards, lower minimum length, fewer trays)

### Requirement: Proportions are judged on the whole outline
Goal "proportions" SHALL pick the chest whose overall outline (length over the aprons,
depth over the skirt, height from the floor to the top of the lid) is closest to
1 : 0.55 : 0.6 within ±0.05; ties go to fewer rip cuts, then to seams placed by the grid.

#### Scenario: Outline, not walls
- **WHEN** two chests have the same wall height but different skirt and lid heights
- **THEN** the proportion is computed on the total height from the floor to the top of the lid

### Requirement: The page says what limits the chest
When the proposed outline is outside ±0.05 of the proportions (giving both ratios against
0.55 and 0.6), when the height over the outline exceeds 0.8 of the length for any goal, or
when a better candidate failed only because of the tray boards, the page SHALL say so. When no chest passes the checks, the proposal SHALL be the one exceeding its
limits the least.

#### Scenario: Tray boards limit the chest
- **WHEN** a larger chest would fit the chest boards but not the tray boards
- **THEN** the page says the tray boards limit the size

### Requirement: Results give the length over the handles
The page SHALL give the overall length over the handles next to the length over the aprons.

#### Scenario: Handles stick out
- **WHEN** the handles project 40 mm and the apron 23 mm
- **THEN** the page shows the length over the handles, 34 mm more than over the aprons

### Requirement: Dimensions can be locked and bounded
Height SHALL mean the height of the carcass walls; the page SHALL also show the total
height with lid and skirt. Outer length (400–1400), outer depth (250–700) and height
(250–700) MAY each be locked. The user SHALL set the minimum inner length (default 600 mm,
for a hand saw). The depth SHALL NOT exceed 0.75 of the length unless both are locked.

#### Scenario: Minimum inner length
- **WHEN** the minimum inner length is 700 mm
- **THEN** every proposed chest has an inner length of at least 700 mm

#### Scenario: Locked height
- **WHEN** the height is locked to 400 mm
- **THEN** the carcass walls are 400 mm high, the total height is shown separately and only length and depth are searched

### Requirement: Clear height under a bench
The user MAY enter the clear height under the workbench. The total height SHALL then not
exceed it, and when the lid cannot open there (height plus lid depth above the clear
height) the page SHALL say the chest must be pulled out to open.

#### Scenario: Chest under a bench
- **WHEN** the clear height is 750 mm and the chest has 420 mm walls and a 470 mm deep lid
- **THEN** the chest is proposed with a note that it opens only when pulled out from under the bench

### Requirement: Walls wider than a board are edge-glued
With edge gluing on, a wall or lid wider than the board SHALL be glued along the grain
from full-width strips plus one remainder of at least 40 mm. Jointing takes 2 mm per glued
edge: full-width strips lose it, the remainder is cut 2 mm wider per glued edge.

#### Scenario: Wall taller than the board
- **WHEN** the board is 200 mm wide, edge gluing is on and the walls are 330 mm high
- **THEN** the cut list shows each wall as one full 200 mm strip jointed to 198 mm and one 134 mm strip jointed to 132 mm, glued to 330 mm

### Requirement: Walls without edge gluing are stacked boards
With edge gluing off, each wall SHALL be k whole boards stacked without glue in the seams,
the height SHALL be k × board width, each board SHALL get its own finger layout, the lid
boards SHALL be shiplapped with 1–2 mm play in each lap, and the option SHALL be labelled
"klejenie krawędzi". Finger joints, cleats and the skirt SHALL be glued in both modes.

#### Scenario: Edge gluing off
- **WHEN** edge gluing is off and the board is 200 mm wide
- **THEN** the walls are 400 mm high from two boards each, every board has 7 fingers of 28.6 mm at each corner and the lid boards are shiplapped

#### Scenario: Board too narrow for stacking
- **WHEN** edge gluing is off and no multiple of the board width fits the height range
- **THEN** the page says which board width or which height lock would work

### Requirement: Stacked boards are tied together
With edge gluing off, each end wall SHALL get a vertical cleat inside over the full
height, with one screw on the axis of every board, so every ring of boards is tied to the
handles. A ring without a connection to the handles SHALL NOT be proposed.

#### Scenario: Three rings
- **WHEN** edge gluing is off and the walls are 600 mm high from three 200 mm boards
- **THEN** the cut list contains two vertical cleats and the materials list three screws per cleat, one on each board axis

### Requirement: Corners are finger-jointed and glued
The four vertical corners SHALL be finger joints as deep as the board thickness plus
0.5 mm, to be planed flush, glued without nails. The front and back SHALL hold the top and
bottom fingers. Finger-jointed pieces SHALL be cut 1 mm longer than the outer size; the
10 mm grid applies to the chest dimensions, not to such allowances.

#### Scenario: Pieces at outer size plus allowance
- **WHEN** a chest of 800 × 440 mm is found
- **THEN** the cut list gives the front and back at 801 mm and the ends at 441 mm, and the materials list no nails for the corners

### Requirement: Finger layout rule
For an element of height H and thickness T the number of fingers n SHALL be the smallest
odd n ≥ 3 for which H / n ≤ 1.5 T, and the finger width H / n SHALL be at least T. Heights
without such n SHALL NOT be proposed; a locked height without one SHALL be rejected with
the nearest valid heights.

#### Scenario: Carcass corner
- **WHEN** the walls are 400 mm high and T is 20 mm
- **THEN** each corner has 15 fingers of 26.7 mm

#### Scenario: Small parts
- **WHEN** H is 400 mm, T is 20 mm and the trays are 110 mm high from 12 mm boards
- **THEN** the skirt (84 mm) has 3 fingers of 28 mm, the apron (73.3 mm) 3 of 24.4 mm and the trays 7 of 15.7 mm

#### Scenario: Thick boards
- **WHEN** T is 28 or 32 mm
- **THEN** the apron and skirt follow from the grid with valid finger layouts and a valid chest is still found

#### Scenario: Height without a layout
- **WHEN** trays of 75 mm are asked for from 16 mm tray boards
- **THEN** the height is rejected because 5 fingers would be 15 mm, and 70 mm and 80 mm are offered instead

### Requirement: Horizontal lines follow the finger grid
Let w be the carcass finger width. Every horizontal line that crosses a carcass corner (top
of the skirt, lower edge of the apron, top and bottom of the handles) SHALL lie on k·w or
(k + ½)·w measured from the bottom of the walls; glue seams follow their own rule.

#### Scenario: Default grid
- **WHEN** H is 400 mm and T is 20 mm (w = 26.7 mm)
- **THEN** the skirt top is at 3w = 80 mm, the apron edge at 13w = 346.7 mm, and with 200 mm boards the wall is glued from three strips (jointing takes 2 mm per glued edge) with seams at 44 mm, hidden behind the skirt, and at 9w = 240 mm on a finger boundary

### Requirement: Glue seams sit on the grid
A wall glue seam SHALL lie on a finger boundary (±0.5 mm), or in the middle third of a
finger, or on the skirt top line, or at least 10 mm below it. Strip widths SHALL set the
seam: each strip at most the board width, the remainder at least 40 mm, a full strip at the top.

#### Scenario: Seam moved by the remainder
- **WHEN** a wall of 3 strips would put a seam outside these positions
- **THEN** the remainder strip is widened by at most w/2, narrowing the top strip, so the seam lands on a valid position, and the extra rip is counted

#### Scenario: Seam near a finger line
- **WHEN** a seam would lie 0.27 w from a finger boundary
- **THEN** that position is rejected

### Requirement: Every corner joint is a finger joint
Every joint where two boards meet at a corner SHALL be a finger joint by the layout rule:
carcass, skirt, lid apron and trays. The page SHALL show the total number of fingers to
cut and an estimate of the time. Other joints are given by their own requirements.

#### Scenario: Joint list
- **WHEN** a chest with one tray is found
- **THEN** the cut list and work plan show finger joints at 14 corners (4 carcass, 4 skirt, 4 tray, 2 apron at the front of the lid), the total finger count and no mitres, rebated corners or butt corners

### Requirement: Finger layout ignores the glue seam
A wall glued from strips SHALL be glued and flattened before the fingers are marked, and
the finger layout SHALL depend only on the wall height, not on where the glue seam falls.
The work plan SHALL say so.

#### Scenario: Seam inside a finger
- **WHEN** the glue seam of a 400 mm wall lies at 200 mm
- **THEN** the finger layout is the same as for a one-piece wall and the work plan glues the wall before cutting the fingers

### Requirement: The bottom bears on cleats
The bottom boards SHALL run front to back and rest on two cleats of at least 20×30 mm
glued long-grain and screwed to the inner front and back, and SHALL be nailed down into
the cleats: one nail per end on the board axis, two within the middle third for boards over
150 mm. No nail SHALL go through the walls. The bottom SHALL NOT be glued into a panel.

#### Scenario: Bottom layout
- **WHEN** the inner depth is 400 mm and the board is 200 mm wide
- **THEN** the bottom boards are 398 mm long, rest on two cleats and each 200 mm board has two nails within its middle third at each end

### Requirement: Inner parts have assembly play
Bottom cleats, runners and guide strips SHALL be the inner length minus 2 mm and bottom
boards the inner depth minus 2 mm, so they do not bind when the carcass is assembled.

#### Scenario: Cleat length
- **WHEN** the inner length is 760 mm and the inner depth 400 mm
- **THEN** the cleats and runners are 758 mm and the bottom boards 398 mm

### Requirement: Bottom boards have room to move
Bottom boards SHALL have gaps of 1% of the board width (at least 2 mm) between them and
3 mm at each end wall; a remainder narrower than half a board SHALL be split with the last
full board into two equal boards, and no board SHALL be narrower than 40 mm.

#### Scenario: Default bottom gaps
- **WHEN** the inner length is 760 mm and the board is 200 mm wide
- **THEN** the bottom has three 200 mm boards and one remainder of 148 mm, with 2 mm gaps and 3 mm at each end

### Requirement: Fastener length fits the joint
Each nail and screw SHALL be no longer than the depth of material along it minus 3 mm,
computed per joint and from T, and the materials list SHALL give length and count per
joint. Screws through cleats and runners SHALL be counterbored so they enter the wall
T − 3 mm. Edges and end grain SHALL be pre-drilled. Hinges SHALL be named with their length.

#### Scenario: Skirt nails
- **WHEN** the skirt and walls are 20 mm thick
- **THEN** the skirt nails are at most 37 mm long and none comes through into the chest

#### Scenario: Thin boards
- **WHEN** T is 12 mm
- **THEN** every fastener has a length, the hinge and chain screws are at most 9 mm, and the cleat screws enter the wall 9 mm through a counterbore

### Requirement: Skirt around the base
The chest SHALL have a finger-jointed skirt of height k·w + 4 mm (k whole or half, k ≥ 2)
with its own valid layout, within 60–150 mm, standing 4 mm below the carcass. Among heights
with h/H in 0.15–0.25 it SHALL pick the skirt finger closest to w (0.85–1.15 w), then the
height closest to H/5; without such a height, the one closest to H/5.

#### Scenario: Skirt in the cut list
- **WHEN** H is 400 mm and T is 20 mm
- **THEN** the skirt is 84 mm with 3 fingers of 28 mm, two long pieces at the outer length plus 2T and two short ones at the outer depth plus 2T

#### Scenario: Skirt rhythm
- **WHEN** H is 530 mm and T is 20 mm (w = 27.9 mm)
- **THEN** the skirt is 3w + 4 = 87.7 mm with 3 fingers of 29.2 mm rather than 101.6 mm with 5 fingers of 20.3 mm

#### Scenario: Heavy skirt warning
- **WHEN** the skirt comes out above 0.27 H, for any T and H (for example T 32, H 320, skirt 118 mm)
- **THEN** the page warns about the proportion

### Requirement: Skirt is fitted as a frame
The skirt SHALL be glued up as a frame whose inside is 0.5 mm larger than the carcass, then
glued and nailed on; the work plan fits it dry first. Its bottom outer edge SHALL get a
3 mm chamfer and oil.

#### Scenario: Skirt frame
- **WHEN** the carcass is 800 mm long and T is 20 mm
- **THEN** the long skirt pieces are cut at 841.5 mm and the work plan fits the frame dry before gluing

### Requirement: Lid with apron and clearance
The lid SHALL carry an apron on the front and the ends, 2w + T high, its top flush with the
top of the lid panel, with 3 fingers at each front corner. The apron SHALL enclose the
panel, so the panel is the lid length minus 2T by the lid depth minus T. The overhang SHALL
be apron thickness plus 3 mm at the ends and 3 mm plus 1% of the lid depth at the front.

#### Scenario: Lid clearance
- **WHEN** the lid is 460 mm deep and the apron 20 mm thick
- **THEN** the lid overhangs 23 mm at the ends and 28 mm at the front

#### Scenario: Apron height
- **WHEN** H is 400 mm and T is 20 mm
- **THEN** the apron is 73.3 mm high with 3 fingers of 24.4 mm and its edge lies at 346.7 mm

#### Scenario: Panel inside the apron
- **WHEN** the carcass is 850 × 460 mm and T is 20 mm
- **THEN** the lid panel is 856 × 467.9 mm, the drawings and the 3D model show the apron around its edges, and the front apron's bottom outer edge has a 45° × 5 mm grip chamfer

### Requirement: Lid parts are fixed for wood movement
The front apron SHALL be glued and nailed to the lid edge. The side aprons SHALL NOT be
glued: held by the front finger joint, a fixed screw near the front and 1–2 screws into the
lid in slots of ≥ 1.5% of the lid depth, ≥ 30 mm from the back. Battens SHALL be fixed at
the front and slotted to the back, slots of 1% of the distance from the fixed screw plus
2 mm; on a shiplapped lid each board gets one fixed screw.

#### Scenario: Battens and side aprons
- **WHEN** the work plan describes the lid
- **THEN** it gives the fixed screws, the slot lengths of the battens and the side aprons, and says neither the battens nor the side aprons are glued

### Requirement: Lid battens
Each batten SHALL be T × 50 mm, as long as the inner depth minus twice (3 mm + 1% of the
lid depth), and sit 30 mm inside each end wall when closed, so the moving lid does not push
it onto the front or back wall.

#### Scenario: Batten length
- **WHEN** the inner depth is 400 mm and the lid 460 mm deep
- **THEN** each batten is 384.8 mm, cut at 385 mm, and clears the front and back walls by at least 7.6 mm

### Requirement: Hinges and stay
The lid SHALL hang on two mortised hinges, three when it is longer than 800 mm. A chain or
cord SHALL limit the opening to about 100°, screwed into the side face of a lid batten and
into an end wall, both in shear. The page SHALL give the free space needed behind the
chest to open the lid (lid depth × sin 10° + T).

#### Scenario: Long lid
- **WHEN** the lid is 900 mm long
- **THEN** the materials list three hinges with leaves of at most T and screws of at most T − 3 mm, and a stay chain with its screws

#### Scenario: Space behind the chest
- **WHEN** the lid is 460 mm deep and T = 20 mm
- **THEN** the page says about 100 mm of free space is needed behind the chest

### Requirement: Removable trays on runners
The user SHALL choose 0, 1 or 2 trays (default 1), half the inner length long and
60–150 mm high (default 110, at least 3 × tray thickness), each on a pair of runners glued and screwed
to the front and back. A runner SHALL be at least 20 mm high and project at least the tray
wall thickness plus 6 mm.

#### Scenario: One tray
- **WHEN** the user picks 1 tray from 12 mm boards
- **THEN** the tray is as deep as the inner depth minus 4 mm and its runners project at least 18 mm

### Requirement: Two trays are stepped
With two trays, the lower tray SHALL be narrower than the gap between the upper runners:
its depth is the inner depth minus twice the upper runner projection minus 4 mm. The lower
runners SHALL project at least the upper projection plus the tray wall thickness plus 4 mm,
and a guide strip with the upper projection SHALL run on each wall between the two runners.

#### Scenario: Two trays
- **WHEN** the user picks 2 trays
- **THEN** the cut list contains two trays, four runners and two guide strips, the lower tray has 2 mm play to each guide and passes between the upper runners, and the front view shows both levels

#### Scenario: Tray levels
- **WHEN** two trays are stacked
- **THEN** the top of the lower tray is at least 5 mm below the top of the upper runners

### Requirement: Tray construction
Each tray SHALL have one divider across the middle in a housing a third of the tray
thickness deep. Each end SHALL have a hand hole whose top lies j = ceil(25 / w_t) tray
fingers below the edge, as high as the smallest multiple of w_t of at least 25 mm, made of
two drilled holes joined by a saw cut, 3 × its height long rounded up to 10 mm and at
least 100 mm, centred.

#### Scenario: Tray parts
- **WHEN** a chest with one tray of 110 mm from 12 mm boards is found
- **THEN** the cut list contains the tray walls, bottom, two cleats and the divider, and each end has a 31.4 × 100 mm hand hole 31.4 mm below the edge

#### Scenario: Low tray
- **WHEN** less than 20 mm would remain between the hand hole and the tray bottom with its cleats
- **THEN** each end gets a cut-out from the top edge instead of a hole

### Requirement: Tray bottom moves freely
The tray bottom SHALL be tray stock, rest on 10×15 mm cleats glued to two opposite tray
walls with its grain spanning between them, have 3 mm plus 1% of its width as clearance at
the other two walls, and be pinned once in the middle of each cleat per bottom board.

#### Scenario: Tray bottom
- **WHEN** the tray bottom is 356 mm wide across the grain
- **THEN** it has about 6.6 mm total clearance across the grain and two pins listed in the materials

### Requirement: Space for trays and tools
The top of the highest tray SHALL be at least the batten thickness plus 5 mm below the top
of the walls. The free height under the lowest runners SHALL be measured from the top of
the bottom boards, and the page SHALL warn when it is below 120 mm.

#### Scenario: Trays too low
- **WHEN** the trays leave less than 120 mm above the bottom boards
- **THEN** the page warns that the space under the trays is too low

### Requirement: Tray stock is thinner than the chest
Trays SHALL be made from separate tray boards (thickness 8–16 mm, default 12, with their
own length, width and count), laid out in their own board layout. When the user leaves
the tray boards empty, the trays SHALL be cut from the chest boards and the page SHALL
show the extra mass this adds.

#### Scenario: Default tray boards
- **WHEN** the user keeps the default tray boards
- **THEN** the tray walls in the cut list are 12 mm thick and the tray boards have their own layout

#### Scenario: No tray boards
- **WHEN** the tray boards are empty
- **THEN** the trays are cut from the chest boards and the page shows how much heavier they are

### Requirement: Handles on the ends
Each end SHALL have a centred handle m·w/2 high (45–70 mm, closest to 55) whose top lies on
the highest grid line at least 40 mm below the closed apron edge, 0.5 × outer depth long
(10 mm steps, 140–240). Wooden handles (default) SHALL be ceil(30 / T) glued layers
projecting ≥ 30 mm, screwed from inside, undercut 45° to min(h/2, projection − 10).

#### Scenario: Handle height
- **WHEN** H is 400 mm, T is 20 mm and the outer depth 440 mm
- **THEN** the apron edge is at 346.7 mm, the handle runs from 253.3 to 306.7 mm (2w), is 220 mm long and made of 2 layers

#### Scenario: Thin and thick boards
- **WHEN** T is 12 mm or 32 mm
- **THEN** the wooden handle is 45–70 mm high, with 3 layers at 12 mm and an undercut that leaves at least 10 mm of the projection

### Requirement: Bought handles
Bought handles SHALL be bolted through with M6 bolts (2T + 6 mm foot + 15 mm, rounded up to
5 mm), washers and cap nuts into a backing block glued inside, at the same height as
wooden ones. Trays SHALL start beyond the backing blocks and cap nuts.

#### Scenario: Bought handles
- **WHEN** the user picks bought handles
- **THEN** the materials list M6 bolts, washers, cap nuts and two backing blocks, the 3D model shows the blocks, and the minimum inner length and the tray length are measured between the cap nuts

### Requirement: Lid stiffness and strength are checked
The page SHALL check the middle lid board under 1 kN in the middle: span = inner length
+ T, width = lid panel depth when glued, one board with I reduced by 10% when shiplapped,
E = 9000 MPa, limit L/200, bending stress at most 14 MPa. A failed check SHALL say what
helps (edge gluing or a thicker board); a stress above 14 MPa SHALL say the board can break.

#### Scenario: Shiplapped lid fails
- **WHEN** edge gluing is off, the board is 200×20 mm and the inner length 760 mm
- **THEN** the page shows a deflection of about 9.2 mm against 3.9 mm and suggests edge gluing or a thicker board

#### Scenario: Glued lid passes
- **WHEN** the lid panel is glued to 440 mm with T = 20 mm and the inner length 760 mm
- **THEN** the deflection is under 3.9 mm and the stress under 14 MPa

### Requirement: Bottom and cleats are checked
The page SHALL check the narrowest bottom board under 1 kN in the middle for deflection and
stress, span = inner depth minus one cleat projection, E = 9000 MPa, limit L/200 (a chest
bottom, not a floor), σ ≤ 14 MPa, size the cleat screws for twice the loaded chest (tool load default 80 kg,
editable) at 0.5 kN per screw, and show the empty mass at 500 kg/m³ and the loads.

#### Scenario: Default bottom
- **WHEN** the inner depth is 400 mm with 30 mm cleats and the narrowest board is 148 mm
- **THEN** the bottom check shows about 1.2 mm against 1.85 mm and passes

#### Scenario: Check visible
- **WHEN** a chest is found
- **THEN** the page shows the lid and bottom checks against their limits, the cleat screw count, the loads and the empty mass in kg

### Requirement: Edges and visible fasteners
All edges SHALL get one 1.5 mm chamfer, also on the finger corners after flushing, and
none along finger joint lines; only the skirt bottom (3 mm) and the front apron grip
(45° × 5 mm) differ. Skirt nails SHALL be one line on the axis of the visible skirt, ≤ 150 mm
apart, the first ≥ 2T from a corner; apron nails and screws one line T/2 below the lid top.

#### Scenario: Skirt nails in line
- **WHEN** the skirt is 84 mm high on an 800 mm front
- **THEN** the work plan places the skirt nails 38 mm above the bottom of the walls, evenly at most 150 mm apart, the outer ones at least 40 mm from the corners

### Requirement: One hardware material
Hinges, screws, chain and visible nails SHALL be one material and colour, blackened steel
by default; visible nails cut or forged. Hinges SHALL sit at equal distances from both ends
and at least 20 mm from a lid batten.

#### Scenario: Hardware list
- **WHEN** the materials list is shown
- **THEN** every metal part is listed as blackened steel and the hinge positions are dimensioned on the top view

### Requirement: Board selection and grain
The work plan SHALL put the best board on the front and the lid, cut the strips of one wall
consecutively from one board with matching grain direction, put the full strip at the top
of each wall and the lid remainder at the back by the hinges, and keep knots at least
T + 20 mm from piece ends and out of hinge mortises.

#### Scenario: Board marks
- **WHEN** the board layout is shown
- **THEN** the front and lid pieces are marked as the show face and the work plan states the knot rule

### Requirement: Finish
The default finish SHALL be hard wax oil outside and shellac or wax inside and on the
trays, without linseed oil inside and without finish on glue surfaces. Milk paint MAY be
chosen, then in one colour on the whole outside including skirt and apron.

#### Scenario: Default finish
- **WHEN** a chest is found
- **THEN** the materials list hard wax oil and shellac or wax, and the work plan finishes before final assembly of the lid hardware

### Requirement: Work plan for hand tools
The work plan SHALL require wood acclimatised to 8–12% moisture, joint and glue the panels
first, cut one test corner on scrap, assemble each glue-up dry with clamps and cauls, use
glue with at least 15 min open time and check the diagonals.

#### Scenario: Carcass glue-up
- **WHEN** the work plan reaches the carcass
- **THEN** it lists a dry run, long open-time glue, at least four clamps longer than the chest plus 50 mm and a diagonal check

### Requirement: Materials, tools and difficulty
The page SHALL list hardware and fasteners per joint, glue, finish, and tools including a
jointer plane, clamps, saws, chisels and drills for pilot holes, and give a difficulty
level 1–5 with the techniques; finger joints make it at least 4.

#### Scenario: Tools listed
- **WHEN** a chest is found
- **THEN** the tools list includes a jointer plane, at least four clamps and pilot drills, and the difficulty is 4 or 5

### Requirement: Outputs for the workshop
The page SHALL show a 3D model with an opening lid, front, side and top views with
dimensions, the board layout with cut order and rip count, the cut list with sketches and
the work plan. A banana for scale SHALL stand in the 3D model and on every view.

#### Scenario: Results visible
- **WHEN** a valid chest is found
- **THEN** all of the above sections are shown and every view and the 3D model contain the banana

### Requirement: Printable PDF
The page SHALL generate a PDF with the views, board layout, cut list, hardware, work plan,
checks and the note that this is a preliminary design.

#### Scenario: Download PDF
- **WHEN** the user clicks "PDF"
- **THEN** a PDF with all listed sections is downloaded

### Requirement: Settings persist and can be shared
The page SHALL save the inputs in localStorage and restore them on the next visit, and
SHALL encode them in the URL so a link reproduces the same chest.

#### Scenario: Shared link
- **WHEN** someone opens a link copied from the page
- **THEN** they see the same inputs and the same chest
