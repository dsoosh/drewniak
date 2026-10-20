## Purpose

Kalkulator skrzyni warsztatowej z wiekiem na zawiasach, wyjmowanymi tacami i cokołem,
dobieranej z desek, które użytkownik ma, i robionej wyłącznie narzędziami ręcznymi.

## ADDED Requirements

### Requirement: Dimensions are optimised from the boards the user owns
The calculator SHALL take board length (300–6000), width (60–400), thickness (12–32),
count (1–12), kerf (0–6) and end trim (0–100), and search chest dimensions on a 10 mm grid
whose pieces can be cut from those boards. Goal "capacity" picks the largest inner volume,
goal "proportions" the volume closest to length : depth : height = 1 : 0.55 : 0.6.

#### Scenario: Default boards
- **WHEN** the user enters eight 2500×200×20 mm boards and goal "proportions"
- **THEN** the page shows the chest that fits, its outer and inner dimensions and how each board is cut

#### Scenario: Boards too small
- **WHEN** no chest fits the boards
- **THEN** the page hides the results and lists what to change (more boards, longer boards, lower minimum length, fewer trays)

### Requirement: Dimensions can be locked and bounded
Outer length (400–1400), outer depth (250–700) and outer height (250–700) MAY each be
locked to a fixed value. The user SHALL be able to set the minimum inner length
(default 600 mm, for a hand saw). The depth SHALL NOT exceed 0.75 of the length unless
both are locked.

#### Scenario: Minimum inner length
- **WHEN** the minimum inner length is 700 mm
- **THEN** every proposed chest has an inner length of at least 700 mm

#### Scenario: Locked height
- **WHEN** the outer height is locked to 400 mm
- **THEN** the proposed chest is 400 mm high and only length and depth are searched

### Requirement: Walls wider than a board are edge-glued
A wall, lid or bottom piece wider than the board SHALL be glued along the grain from
full-width strips plus one remainder of at least 40 mm, when gluing is on. When gluing is
off, each carcass wall SHALL be one board width high and the lid and bottom SHALL be made
of separate boards held by the battens and the nails.

#### Scenario: Wall taller than the board
- **WHEN** the board is 200 mm wide, gluing is on and the walls are 330 mm high
- **THEN** the cut list shows each wall as one full-width strip and one 130 mm strip glued edge to edge

#### Scenario: Gluing off
- **WHEN** gluing is off
- **THEN** every carcass wall is a single board width high

### Requirement: Corners are finger-jointed and glued
The four vertical corners SHALL be finger joints (box joints) as deep as the board
thickness plus 0.5 mm, to be planed flush. Each corner SHALL have an odd number of fingers,
each 1–1.5 × board thickness wide, so the front and back start and end with a full finger
at the top and the bottom edge. The joint SHALL be glued without nails.

#### Scenario: Finger layout
- **WHEN** the walls are 400 mm high and the board is 20 mm thick
- **THEN** the drawings show 15 fingers of about 26.7 mm at each corner, the front and back holding the top and bottom fingers

#### Scenario: Pieces at full outer size
- **WHEN** a chest is found
- **THEN** the cut list gives the front and back at the outer length and the ends at the outer depth, and the materials list no nails for the corners

### Requirement: Finger layout ignores the glue seam
A wall glued from strips SHALL be glued and flattened before the fingers are marked, and
the finger layout SHALL depend only on the wall height, not on where the glue seam falls.
The work plan SHALL say so.

#### Scenario: Seam inside a finger
- **WHEN** the glue seam of a 400 mm wall lies at 200 mm
- **THEN** the finger layout is the same as for a one-piece wall and the work plan glues the wall before cutting the fingers

### Requirement: The bottom is carried by nails in shear
The bottom SHALL sit between the four walls, its boards running front to back with
1–2 mm gaps, and SHALL be nailed through the walls into the edges of the bottom boards.
The bottom SHALL NOT hang on nails driven from below.

#### Scenario: Bottom layout
- **WHEN** the inner depth is 380 mm and the board is 200 mm wide
- **THEN** the bottom boards run front to back, each 380 mm long, nailed through front and back walls

### Requirement: Skirt around the base
The chest SHALL have a skirt of 60–120 mm (default 80) nailed and glued around the bottom
of the carcass, long-grain to long-grain, with the front and back skirt pieces running
past the end skirt pieces so no mitres are needed.

#### Scenario: Skirt in the cut list
- **WHEN** a chest is found
- **THEN** the cut list contains two long and two short skirt pieces and the views show the skirt overlapping the end pieces

### Requirement: Lid with battens, apron and a stay
The lid SHALL overhang the carcass by its own thickness on the front and the ends and
carry an apron 40–80 mm high around those three sides. Two battens across the grain SHALL
be screwed through slotted holes, not glued. The lid SHALL hang on two hinges, three when
it is longer than 800 mm, and a stay SHALL limit the opening to about 100°.

#### Scenario: Long lid
- **WHEN** the lid is 900 mm long
- **THEN** the materials list three hinges and a stay chain or cord

#### Scenario: Battens not glued
- **WHEN** the work plan describes the lid
- **THEN** it says the battens are screwed through slotted holes so the lid can move

### Requirement: Removable trays on runners
The user SHALL choose 0, 1 or 2 trays (default 1). A tray SHALL be as deep as the inner
depth minus 4 mm, half the inner length long and 60–150 mm high, and slide on a pair of
runners glued and nailed to the inner front and back walls. A second tray sits on its own
runners above the first. Tray corners SHALL be finger-jointed like the chest.

#### Scenario: Two trays
- **WHEN** the user picks 2 trays
- **THEN** the cut list contains two trays and four runners and the front view shows both levels

#### Scenario: Trays do not fit
- **WHEN** the trays and their runners leave less than 120 mm of free height below them
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
The chest SHALL have a handle on each end, either bought metal handles or wooden blocks
cut from the board, glued with the grain parallel to the end wall and screwed from the
inside. The handle SHALL sit with its top 20–40 mm below the lid apron, so the loaded
chest hangs below the hands and does not tip.

#### Scenario: Handle height
- **WHEN** the walls are 400 mm high and the apron is 60 mm
- **THEN** the top of each handle is 300–320 mm above the bottom of the walls

#### Scenario: Wooden handles
- **WHEN** the user picks wooden handles
- **THEN** the cut list contains two handle blocks and the materials list screws for them

### Requirement: Deflection checks are shown
The page SHALL show the deflection of a bottom board under the tool load (default 60 kg
spread evenly, limit L/300) and of the lid under a person sitting in the middle (1 kN,
limit L/200), with the loads used, and the estimated mass of the empty chest at
500 kg/m³.

#### Scenario: Check visible
- **WHEN** a chest is found
- **THEN** the page shows both deflections against their limits, marked OK or with a warning, and the empty mass in kg

### Requirement: Outputs for the workshop
The page SHALL show a 3D model with an opening lid, front, side and top views with
dimensions, the board layout with cut order and rip count, the cut list with sketches, a
hand-tool-only work plan, hardware and fasteners, tools, and a difficulty level 1–5 with
the list of techniques. A banana for scale SHALL stand in the 3D model and on every view.

#### Scenario: Results visible
- **WHEN** a valid chest is found
- **THEN** all of the above sections are shown and every view and the 3D model contain the banana

### Requirement: Printable PDF
The page SHALL generate a PDF with the views, board layout, cut list, hardware, work plan,
deflection checks and the note that this is a preliminary design.

#### Scenario: Download PDF
- **WHEN** the user clicks "PDF"
- **THEN** a PDF with all listed sections is downloaded

### Requirement: Settings persist and can be shared
The page SHALL save the inputs in localStorage and restore them on the next visit, and
SHALL encode them in the URL so a link reproduces the same chest.

#### Scenario: Shared link
- **WHEN** someone opens a link copied from the page
- **THEN** they see the same inputs and the same chest
