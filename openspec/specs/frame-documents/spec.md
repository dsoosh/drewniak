# frame-documents Specification

## Purpose
Zestawienie zamówienia, lista cięć, rozkroje i PDF konfiguratora szkieletu — wszystko, co trzeba zabrać do składu drewna i na budowę.

## Requirements

### Requirement: Order summary first
The page SHALL start the results with an order summary: number of stock pieces per timber
section, wall and floor sheets, covering and clear sheets, ridge caps for gable roofs,
covering nails, ground anchors with bitumen pads, beam hangers, plate anchors, corner
straps, rafter connectors, ridge gussets (gable) or top-edge flashing (mono-pitch), OSB
fasteners and end-grain preservative.

#### Scenario: Default prices
- **WHEN** the default shed is shown without any price edits
- **THEN** the summary shows an estimated total with the items it is made of and a range from the anchor prices

#### Scenario: Thicker OSB
- **WHEN** the user switches the wall sheathing from 12 to 18 mm
- **THEN** the sheet price and the total follow the 18 mm price unless a price was typed in

### Requirement: Cut list and layouts
The page SHALL list identical cuts grouped by section, length, element name and note
(e.g. sloped top, birdsmouth depth), show each stock bar with its pieces drawn to scale,
and show sheet layouts with piece labels matching the elevations.

#### Scenario: Sloped studs
- **WHEN** a gable wall has sloped studs
- **THEN** the cut list gives their long-side length and the note with the angle

### Requirement: PDF export
The page SHALL generate a downloadable PDF with the order summary, warnings and checks, the
3D view, the floor plan, every wall elevation with sheathing, the roof plan, the cut list
and the bar and sheet layouts, with Polish characters, and with a note that it is not a
building design. When the PDF library or font cannot load, the page SHALL fall back to the
browser print dialog with a print stylesheet that lays out the same content.

#### Scenario: Download
- **WHEN** the user clicks "Pobierz PDF"
- **THEN** a PDF named after the dimensions is downloaded

### Requirement: Bracing and complete sheet order
For roofs longer than 6000 mm the hardware list SHALL include perforated strap for two diagonal
crosses per slope; every gable split at the eaves SHALL add two 45×95 struts between the gable
plate and the ties. The PDF order summary SHALL list interior wall sheets next to exterior wall
sheets, and the summary SHALL state the actual birdsmouth depth of the selected rafter.

#### Scenario: House order
- **WHEN** the 70 m² house is exported
- **THEN** the order lists bracing strap, gable struts and the birdsmouth of the 195 mm rafter

### Requirement: Cost estimate with default prices
The summary SHALL include a cost estimate with default 2026 prices (100×100 × 6.5 m 189 zł,
45×95 × 6 m 69 zł, 50×50 × 5.4 m 22 zł, OSB by thickness, corrugated sheet about 45 zł, ground
anchor 120–150 zł) that the user can override: a total, the share of each priced item, the
anchor price range, and a list of items not included.

#### Scenario: Price typed in
- **WHEN** the user types a price for 45×95 × 6 m
- **THEN** the total and the share of 45×95 use that price, and the list of items not included stays shown
