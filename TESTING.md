# Testing PDF to Booklet

## Manual Testing Instructions

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Sample PDF files for testing

### Test Cases

#### 1. Test with Valid PDF File
**Action:** Select a standard PDF file (e.g., a research paper, document, etc.)

**Expected Result:**
- Progress bar appears
- Status messages show: "Reading PDF file...", "Processing PDF...", "Processing X pages...", etc.
- A booklet PDF downloads automatically with "-booklet-" prefix
- Success message appears
- Original filename is preserved in download

#### 2. Test with Small PDF (1-4 pages)
**Action:** Select a PDF with 1-4 pages

**Expected Result:**
- Processing completes quickly
- Booklet is created with proper page arrangement
- No blank pages needed (or minimal padding for 4-page multiples)

#### 3. Test with Large PDF (50+ pages)
**Action:** Select a large PDF file

**Expected Result:**
- Progress indicators update smoothly
- Processing completes successfully
- Message indicates number of pages and any blank pages added
- Booklet downloads correctly

#### 4. Test Error Handling - No File Selected
**Action:** Click "Convert to Booklet" without selecting a file

**Expected Result:**
- Error message: "Please select a PDF file"
- No processing occurs

#### 5. Test Error Handling - Invalid File Type
**Action:** Attempt to select a non-PDF file (e.g., .jpg, .txt, .docx)

**Expected Result:**
- File picker should filter to PDF files only
- If a non-PDF is somehow selected, error message appears

#### 6. Test Error Handling - Corrupted PDF
**Action:** Select a corrupted or invalid PDF file

**Expected Result:**
- Error message about invalid PDF
- Processing stops gracefully
- No download occurs

#### 7. Test File Selection Change
**Action:** Select a file, then change to a different file before converting

**Expected Result:**
- Previous status messages clear
- New file is properly recognized
- Conversion uses the latest selected file

### Visual Checks

1. **UI Appearance:**
   - Purple gradient background
   - White card with content
   - File input with styled "Choose File" button
   - Responsive design (test on mobile/tablet)
   - Proper typography and spacing

2. **File Input:**
   - File input button has gradient styling
   - Hover effect on file selector button
   - Clear indication when file is selected (filename display)

3. **Interaction:**
   - Button hover effect (lift animation)
   - Button disabled state during processing
   - Clear visual feedback during all stages

4. **Progress Indicators:**
   - Progress bar animates smoothly
   - Progress text updates appropriately
   - Status messages appear/disappear correctly

### Booklet Verification

After downloading a booklet PDF:

1. Open the PDF in a viewer
2. Verify:
   - Pages are in landscape orientation
   - Two original pages per sheet
   - Page order is correct for booklet printing
   - Original content is preserved
   - No quality loss

### Printing Test

1. Download a booklet
2. Print double-sided (flip on short edge)
3. Fold the printed sheets in the middle
4. Verify page order creates a readable booklet

### Privacy Verification

1. Check browser network tab during conversion
2. Verify:
   - No network requests are made during PDF processing
   - All processing happens locally
   - No data is sent to external servers

## Browser Compatibility Testing

Test on multiple browsers:
- Chrome/Edge (Chromium)
- Firefox
- Safari (macOS/iOS)

Verify:
- File input works correctly
- PDF processing completes
- Downloads trigger properly
- UI renders correctly

## Automated Testing

Currently, this is a client-side only application with no automated tests.
Future improvements could include:
- Unit tests for utility functions (validatePdfSignature, calculateBookletOrder)
- Integration tests using Puppeteer or Playwright
- E2E tests for full conversion workflow with sample PDFs
