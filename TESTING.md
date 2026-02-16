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
- Status messages show: "Resolving URL...", "Fetching PDF...", "Processing pages...", etc.
- A booklet PDF downloads automatically
- Success message appears

#### 2. Test with DOI (Should Fail)
**Input:** `10.1371/journal.pone.0154556`

**Expected Result:**
- Error message: "DOI detected, but automatic DOI-to-PDF resolution is not supported. Please provide a direct PDF URL (e.g., from PubMed Central, bioRxiv, or publisher site)."
- No download occurs

#### 3. Test with DOI URL (Should Fail)
**Input:** `https://doi.org/10.1371/journal.pone.0154556`

**Expected Result:**
- Error message: "DOI detected, but automatic DOI-to-PDF resolution is not supported. Please provide a direct PDF URL (e.g., from PubMed Central, bioRxiv, or publisher site)."
- No download occurs

#### 4. Test Error Handling - Invalid Input
**Input:** `not-a-valid-url`

**Expected Result:**
- Error message: "Invalid input. Please enter a direct PDF URL."
- No download occurs

#### 5. Test Error Handling - Non-PDF URL
**Input:** `https://example.com/page.html`

**Expected Result:**
- Error message about expected PDF but received different content type
- No download occurs

#### 6. Test Error Handling - Non-existent PDF
**Input:** `https://pmc.ncbi.nlm.nih.gov/articles/PMC99999999/pdf/nonexistent.pdf`

**Expected Result:**
- HTTP error message (404 or similar)
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

1. **No DOI Resolution:**
   - Automatic DOI-to-PDF resolution is not supported
   - Users must provide direct PDF URLs
   - DOI resolvers often return HTML landing pages instead of PDFs
   
2. **CORS Restrictions:**
   - Some publishers may block direct PDF access
   - The CORS proxy fallback is a workaround with security implications
   - PDF content may be routed through third-party proxy (corsproxy.io)
   
3. **Open Access Only:**
   - Tool works best with freely accessible PDFs
   - Paywalled content won't be accessible

4. **Browser Compatibility:**
   - Requires modern browser with ES6+ support
   - pdf-lib library must be supported

## Automated Testing

Currently, this is a client-side only application with no automated tests.
Future improvements could include:
- Unit tests for utility functions (extractDOI, calculateBookletOrder)
- Integration tests using Puppeteer or Playwright
- E2E tests for full conversion workflow
