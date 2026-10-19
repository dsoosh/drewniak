## ADDED Requirements

### Requirement: Dimensions are optimised from the board the user owns
The calculator SHALL take the board length, width, thickness and count, kerf and end trim,
and search box dimensions that can be cut from those boards, scoring either "proportions
like the reference photo" or "capacity". Each of length, width and side height MAY be
locked to a fixed value.

#### Scenario: Default board
- **WHEN** the user enters a 1800×200×18 mm board and goal "proportions"
- **THEN** the page shows the best box that fits, its outer dimensions and how the board is cut

#### Scenario: Board too small
- **WHEN** no combination fits the boards
- **THEN** the page hides the results and lists what to change

### Requirement: Rip cuts are counted and can be avoided
The calculator SHALL count rip (lengthwise) cuts and offer the modes "avoid" (fewest rips
wins) and "free". Without gluing the minimum is 1 (bottom), 2 with a slat handle; with
gluing it can reach 0. The box width SHALL NOT exceed 0.75 of its length.

#### Scenario: Avoid rips
- **WHEN** the mode is "avoid"
- **THEN** among valid boxes the one with the fewest rip cuts is chosen

### Requirement: Box construction follows hand-tool joinery rules
Ends SHALL sit outside the sides, the bottom SHALL sit between sides and ends and be nailed
through them so the nails work in shear. The bottom SHALL be one piece or, when gluing is on
and it is wider than the board, a panel glued from full-width cross-cut pieces plus one
remainder of at least 40 mm. Cross-cut lengths SHALL be on a 10 mm grid.

#### Scenario: Bottom wider than the board with gluing on
- **WHEN** the bottom is wider than the board and gluing is enabled
- **THEN** the cut list shows full-width pieces cut across and one remainder of at least 40 mm

### Requirement: Handle options
The calculator SHALL offer a bought dowel, a round slat made from the board and a flat slat
set into a housing.

#### Scenario: Flat handle
- **WHEN** the user picks the flat slat
- **THEN** the ends get a housing and the cut list contains the slat

### Requirement: Outputs for the workshop
The page SHALL show a 3D model, orthographic views with dimensions and a banana for scale,
the board layout with cut order, the cut list with sketches, a hand-tool-only work plan,
materials, tools, and a difficulty level 1–5 with the list of techniques.

#### Scenario: Results visible
- **WHEN** a valid box is found
- **THEN** all of the above sections are shown for it

### Requirement: Settings persist per browser
The page SHALL save the inputs in localStorage and restore them on the next visit.

#### Scenario: Reopen
- **WHEN** the user reloads the page
- **THEN** the previous inputs are restored
