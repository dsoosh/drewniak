## Purpose

Kalkulator skrzyni warsztatowej z wiekiem na zawiasach, wyjmowanymi tacami i cokołem,
dobieranej z desek, które użytkownik ma, i robionej wyłącznie narzędziami ręcznymi.

## ADDED Requirements

### Requirement: Dimensions are optimised from the boards the user owns
The calculator SHALL take board length (300–6000), width (60–400), thickness after planing
(12–32), count (1–12), kerf (0–6) and end trim (0–100), and search chest dimensions on a
10 mm grid whose pieces can be cut from those boards. Goal "capacity" picks the largest
inner volume, goal "proportions" the volume closest to length : depth : height = 1 : 0.55 : 0.6.

#### Scenario: Default boards
- **WHEN** the user enters eight 2500×200×20 mm boards and goal "proportions"
- **THEN** the page shows the chest that fits, its outer and inner dimensions and how each board is cut

#### Scenario: Boards too small
- **WHEN** no chest fits the boards
- **THEN** the page hides the results and lists what to change (more boards, longer boards, lower minimum length, fewer trays)

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
With gluing on, a wall or lid wider than the board SHALL be glued along the grain from
full-width strips plus one remainder of at least 40 mm, each glued edge with 2 mm extra
for jointing. With gluing off, each wall SHALL be exactly one board width high, the
height range SHALL start at the board width, and the lid boards SHALL be shiplapped.

#### Scenario: Wall taller than the board
- **WHEN** the board is 200 mm wide, gluing is on and the walls are 330 mm high
- **THEN** the cut list shows each wall as one 202 mm strip and one 132 mm strip, jointed to 330 mm and glued edge to edge

#### Scenario: Gluing off
- **WHEN** gluing is off and the board is 200 mm wide
- **THEN** every carcass wall is 200 mm high and the lid boards are shiplapped

### Requirement: Corners are finger-jointed and glued
The four vertical corners SHALL be finger joints as deep as the board thickness plus
0.5 mm, to be planed flush, glued without nails. The front and back SHALL hold the top and
bottom fingers, so the front and back are cut at the outer length and the ends at the
outer depth.

#### Scenario: Pieces at full outer size
- **WHEN** a chest is found
- **THEN** the cut list gives the front and back at the outer length and the ends at the outer depth, and the materials list no nails for the corners

### Requirement: Finger layout rule
For an element of height H and thickness T the number of fingers n SHALL be the smallest
odd n ≥ 3 for which H / n ≤ 1.5 T, and the finger width H / n SHALL be at least T. Heights
without such n SHALL NOT be proposed; a locked height without one SHALL be rejected with
the nearest valid heights.

#### Scenario: Carcass corner
- **WHEN** the walls are 400 mm high and T is 20 mm
- **THEN** each corner has 15 fingers of 26.7 mm

#### Scenario: Small parts
- **WHEN** T is 20 mm, the skirt is 80 mm and the apron 60 mm, and the trays are 100 mm high from 12 mm boards
- **THEN** the skirt has 3 fingers of 26.7 mm, the apron 3 of 20 mm and the trays 7 of 14.3 mm

#### Scenario: Height without a layout
- **WHEN** a skirt of 95 mm is asked for with T = 20 mm
- **THEN** it is rejected because 5 fingers would be 19 mm, and 90 mm and 100 mm are offered instead

### Requirement: Every corner joint is a finger joint
Every joint where two boards meet at a corner SHALL be a finger joint by the layout rule:
carcass, skirt, lid apron and trays. The page SHALL show the total number of fingers to
cut and an estimate of the time. Other joints are given by their own requirements.

#### Scenario: Joint list
- **WHEN** a chest with one tray is found
- **THEN** the cut list and work plan show finger joints at 14 corners (4 carcass, 4 skirt, 4 tray, 2 apron at the front of the lid), the total finger count and no mitres, rebates or butt corners

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
the cleats. No nail SHALL go through the walls into the bottom. The bottom SHALL NOT be
glued into a panel.

#### Scenario: Bottom layout
- **WHEN** the inner depth is 400 mm and the board is 200 mm wide
- **THEN** the bottom boards are 400 mm long, rest on two cleats and each is nailed with two nails at each end into the cleats

### Requirement: Bottom boards have room to move
Bottom boards SHALL have gaps of 1% of the board width (at least 2 mm) between them and
3 mm at each end wall, and pieces narrower than a board SHALL be at least 40 mm wide.

#### Scenario: Default bottom
- **WHEN** the inner length is 760 mm and the board is 200 mm wide
- **THEN** the bottom has three 200 mm boards and one remainder of 148 mm, with 2 mm gaps and 3 mm at each end

### Requirement: Fastener length fits the joint
Each nail and screw SHALL be no longer than the total thickness of the parts it joins
minus 3 mm, computed per joint, and the materials list SHALL give length and count per
joint. Hinge screws SHALL be at most T − 3 mm long.

#### Scenario: Skirt nails
- **WHEN** the skirt and walls are 20 mm thick
- **THEN** the skirt nails are at most 37 mm long and none comes through into the chest

### Requirement: Skirt around the base
The chest SHALL have a finger-jointed skirt of 60–120 mm (default 80) around the bottom,
standing 4 mm below the carcass so the walls and bottom do not touch the floor. The skirt
SHALL be glued up as a frame 0.5 mm larger than the carcass, then glued and nailed on.

#### Scenario: Skirt in the cut list
- **WHEN** a chest is found
- **THEN** the cut list contains two long skirt pieces at the outer length plus 2T and two short ones at the outer depth plus 2T, and the work plan fits the frame dry before gluing

### Requirement: Lid with apron and clearance
The lid SHALL carry an apron on the front and the ends whose height (40–80 mm, at least 3T,
default 60) is measured from the top of the lid. The overhang SHALL be apron thickness plus
clearance: 3 mm at the ends, 3 mm plus 1% of the lid depth at the front.

#### Scenario: Lid clearance
- **WHEN** the lid is 460 mm deep and the apron 20 mm thick
- **THEN** the lid overhangs 23 mm at the ends and 28 mm at the front

### Requirement: Lid parts are fixed for wood movement
The front apron SHALL be glued and nailed to the lid edge. The side aprons SHALL NOT be
glued; they are held by the finger joint at the front and 2–3 screws into the lid through
slots of at least 1.5% of the lid depth. Two battens SHALL be screwed with a fixed screw at
the front and slotted holes towards the back.

#### Scenario: Battens and side aprons
- **WHEN** the work plan describes the lid
- **THEN** it gives the fixed screw at the front, the slot lengths and says neither the battens nor the side aprons are glued

### Requirement: Hinges and stay
The lid SHALL hang on two mortised hinges, three when it is longer than 800 mm. A chain or
cord SHALL limit the opening to about 100°, fixed to an end wall with screws in shear.

#### Scenario: Long lid
- **WHEN** the lid is 900 mm long
- **THEN** the materials list three hinges with screws of at most T − 3 mm and a stay chain with its screws

### Requirement: Removable trays on runners
The user SHALL choose 0, 1 or 2 trays (default 1), half the inner length long and
60–150 mm high (at least 3 × tray thickness), each on a pair of runners glued and screwed
to the front and back. A runner SHALL be at least 20 mm high and project at least the tray
wall thickness plus 6 mm.

#### Scenario: One tray
- **WHEN** the user picks 1 tray from 12 mm boards
- **THEN** the tray is as deep as the inner depth minus 4 mm and its runners project at least 18 mm

### Requirement: Two trays are stepped
With two trays, the lower tray SHALL be narrower than the gap between the upper runners:
its depth is the inner depth minus twice the upper runner projection minus 4 mm, and the
lower runners project at least the upper projection plus the tray wall thickness plus 4 mm.

#### Scenario: Two trays
- **WHEN** the user picks 2 trays
- **THEN** the cut list contains two trays and four runners, the lower tray passes between the upper runners and the front view shows both levels

### Requirement: Tray construction
Each tray SHALL have a bottom resting on 10×15 mm cleats glued inside the tray, one divider
across the middle set in a housing a third of the tray thickness deep, and a hand hole in
each end with at least 25 mm of wood above it.

#### Scenario: Tray parts
- **WHEN** a chest with one tray is found
- **THEN** the cut list contains the tray walls, bottom, two cleats and the divider, and the views show the hand holes

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
Each end SHALL have a handle whose top is 30–40 mm below the lower edge of the closed
apron. Wooden handles SHALL be two glued layers of board projecting at least 30 mm with an
undercut for the fingers, glued long-grain and screwed from inside. Bought handles SHALL be
bolted through with M6 bolts and washers into a backing block glued inside.

#### Scenario: Handle height
- **WHEN** the walls are 400 mm high, the lid 20 mm and the apron 60 mm
- **THEN** the apron ends 360 mm above the bottom of the walls and the top of each handle is 320–330 mm above it

#### Scenario: Bought handles
- **WHEN** the user picks bought handles
- **THEN** the materials list M6 bolts, washers and two backing blocks

### Requirement: Lid stiffness and strength are checked
The page SHALL check the middle lid board under 1 kN in the middle: span = inner length
+ T, width = whole lid when glued, one board when shiplapped, E = 9000 MPa, limit L/200,
and bending stress at most 14 MPa, warning when either fails.

#### Scenario: Shiplapped lid fails
- **WHEN** gluing is off, the board is 200×20 mm and the inner length 760 mm
- **THEN** the page shows a deflection of about 8.2 mm against 3.9 mm and warns

#### Scenario: Glued lid passes
- **WHEN** the lid is glued to 460 mm with T = 20 mm and the inner length 760 mm
- **THEN** the deflection is under 3.9 mm and the stress under 14 MPa

### Requirement: Bottom and cleats are checked
The page SHALL check one bottom board under 1 kN in the middle (limit L/300, E = 9000 MPa)
and size the cleat screws for twice the loaded chest (tool load default 80 kg, editable)
at 0.5 kN per screw, and show the empty mass at 500 kg/m³ and the loads used.

#### Scenario: Check visible
- **WHEN** a chest is found
- **THEN** the page shows the lid and bottom checks against their limits, the cleat screw count, the loads and the empty mass in kg

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
