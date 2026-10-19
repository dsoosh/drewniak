## ADDED Requirements

### Requirement: Order summary first
The page SHALL start the results with an order summary: number of stock pieces per timber
section, wall and floor sheets, covering and clear sheets, ridge caps for gable roofs,
covering nails, supports with anchors and bitumen pads, beam hangers, plate anchors, corner
straps, rafter connectors, ridge gussets (gable) or top-edge flashing (mono-pitch), OSB
fasteners, end-grain preservative, and a total price when prices are filled in.

#### Scenario: Prices empty
- **WHEN** no prices are entered
- **THEN** the summary shows quantities only

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
