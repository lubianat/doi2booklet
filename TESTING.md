# Testing DOI to Booklet

## Manual Testing Instructions

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection

### Test Cases

#### 1. Test with Direct PDF URL
**Input:** `https://pmc.ncbi.nlm.nih.gov/articles/PMC4851331/pdf/pone.0154556.pdf`

**Expected Result:**
- Progress bar appears
- Status messages show: "Resolving DOI...", "Fetching PDF...", "Processing pages...", etc.
- A booklet PDF downloads automatically
- Success message appears

#### 2. Test with DOI
**Input:** `10.1371/journal.pone.0154556`

**Expected Result:**
- Similar to above
- DOI is resolved to PDF URL
- Booklet is created and downloaded

#### 3. Test with DOI URL
**Input:** `https://doi.org/10.1371/journal.pone.0154556`

**Expected Result:**
- DOI is extracted from URL
- Booklet is created and downloaded

#### 4. Test Error Handling - Invalid Input
**Input:** `not-a-valid-doi`

**Expected Result:**
- Error message: "Invalid DOI format. Please enter a valid DOI or PDF URL."
- No download occurs

#### 5. Test Error Handling - Non-existent DOI
**Input:** `10.1234/nonexistent`

**Expected Result:**
- Appropriate error message about failed PDF fetch
- No download occurs

### Visual Checks

1. **UI Appearance:**
   - Purple gradient background
   - White card with content
   - Responsive design (test on mobile/tablet)
   - Proper typography and spacing

2. **Interaction:**
   - Input field focus state (blue border)
   - Button hover effect (lift animation)
   - Button disabled state during processing

3. **Progress Indicators:**
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

### Printing Test

1. Download a booklet
2. Print double-sided (flip on short edge)
3. Fold the printed sheets in the middle
4. Verify page order creates a readable booklet

## Known Limitations

1. **CORS Restrictions:**
   - Some publishers may block direct PDF access
   - The CORS proxy is a workaround with security implications
   
2. **Open Access Only:**
   - Tool works best with freely accessible PDFs
   - Paywalled content won't be accessible

3. **Browser Compatibility:**
   - Requires modern browser with ES6+ support
   - PDF.js and pdf-lib must be supported

## Automated Testing

Currently, this is a client-side only application with no automated tests.
Future improvements could include:
- Unit tests for utility functions (extractDOI, calculateBookletOrder)
- Integration tests using Puppeteer or Playwright
- E2E tests for full conversion workflow
