## MODIFIED Requirements

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
