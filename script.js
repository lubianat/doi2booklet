// PDF to Booklet Converter
// Main script for converting uploaded PDFs to printable booklet format

// Constants
const PDFLIB_LOAD_ERROR_MESSAGE = 'PDF library failed to load. Please check your internet connection or ad blocker settings and refresh the page.';
const PDFLIB_LOAD_TIMEOUT_MS = 2000; // Wait 2 seconds for CDN scripts to load

/**
 * Validate that an ArrayBuffer contains a valid PDF file
 * @param {ArrayBuffer} arrayBuffer - The buffer to validate
 * @returns {boolean} - True if valid PDF, false otherwise
 */
function validatePdfSignature(arrayBuffer) {
    const PDF_SIGNATURE_LENGTH = 5;
    const header = new Uint8Array(arrayBuffer.slice(0, PDF_SIGNATURE_LENGTH));
    const headerStr = String.fromCharCode(...header);
    return headerStr.startsWith('%PDF-');
}

/**
 * Create booklet from PDF
 * Rearranges pages in booklet order (for printing and folding)
 */
async function createBooklet(pdfBytes) {
    // Load the PDF
    const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
    const pageCount = pdfDoc.getPageCount();
    
    // Calculate pages needed (must be multiple of 4 for booklet)
    const pagesNeeded = Math.ceil(pageCount / 4) * 4;
    const blankPages = pagesNeeded - pageCount;
    
    const paddingInfo = blankPages > 0
        ? ` (adding ${blankPages} blank page${blankPages === 1 ? '' : 's'} for booklet layout)`
        : '';
    
    updateProgress(30, `Processing ${pageCount} pages...${paddingInfo}`);
    
    // Create new document for booklet
    const bookletDoc = await PDFLib.PDFDocument.create();
    
    // Copy all pages from original document
    const copiedPages = await bookletDoc.copyPages(pdfDoc, [...Array(pageCount).keys()]);
    
    // Calculate booklet page order
    // For a booklet, pages are arranged: [n, 1, 2, n-1, n-2, 3, 4, n-3, ...]
    const bookletOrder = calculateBookletOrder(pagesNeeded);
    
    updateProgress(50, 'Arranging pages in booklet format...');
    
    // Get dimensions from first page or use standard letter size
    const firstPage = pdfDoc.getPage(0);
    const { width: pageWidth, height: pageHeight } = firstPage.getSize();
    
    // Create booklet pages (2-up layout)
    for (let i = 0; i < bookletOrder.length; i += 2) {
        const leftPageNum = bookletOrder[i];
        const rightPageNum = bookletOrder[i + 1];
        
        // Create a new landscape page (2x width)
        const newPage = bookletDoc.addPage([pageWidth * 2, pageHeight]);
        
        // Draw left page
        if (leftPageNum < pageCount) {
            const leftPage = copiedPages[leftPageNum];
            newPage.drawPage(leftPage, {
                x: 0,
                y: 0,
                width: pageWidth,
                height: pageHeight
            });
        }
        
        // Draw right page
        if (rightPageNum < pageCount) {
            const rightPage = copiedPages[rightPageNum];
            newPage.drawPage(rightPage, {
                x: pageWidth,
                y: 0,
                width: pageWidth,
                height: pageHeight
            });
        }
    }
    
    updateProgress(80, 'Finalizing booklet...');
    
    // Save the booklet
    const bookletBytes = await bookletDoc.save();
    return bookletBytes;
}

/**
 * Calculate the page order for booklet printing
 */
function calculateBookletOrder(totalPages) {
    const order = [];
    const sheets = totalPages / 4;
    
    for (let i = 0; i < sheets; i++) {
        // Front of sheet: last page, first page
        order.push(totalPages - 1 - (i * 2));
        order.push(i * 2);
        // Back of sheet: second page, second-to-last page
        order.push(i * 2 + 1);
        order.push(totalPages - 2 - (i * 2));
    }
    
    return order;
}

/**
 * Update progress bar and message
 */
function updateProgress(percent, message) {
    const progressContainer = document.getElementById('progress');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    progressContainer.classList.remove('hidden');
    progressFill.style.width = `${percent}%`;
    progressText.textContent = message;
}

/**
 * Show status message
 */
function showStatus(message, type = 'info') {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.classList.remove('hidden');
}

/**
 * Hide status message
 */
function hideStatus() {
    const statusDiv = document.getElementById('status');
    statusDiv.classList.add('hidden');
}

/**
 * Download the booklet PDF
 */
function downloadBooklet(pdfBytes, filename) {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booklet-${filename}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Main conversion function
 */
async function convertToBooklet() {
    const fileInput = document.getElementById('pdf-upload');
    const convertBtn = document.getElementById('convert-btn');
    const mainContainer = document.querySelector('main');
    
    // Check if PDFLib is loaded
    if (typeof PDFLib === 'undefined') {
        showStatus(PDFLIB_LOAD_ERROR_MESSAGE, 'error');
        return;
    }
    
    if (!fileInput.files || fileInput.files.length === 0) {
        showStatus('Please select a PDF file', 'error');
        return;
    }
    
    const file = fileInput.files[0];
    
    // Validate file type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        showStatus('Please select a valid PDF file', 'error');
        return;
    }
    
    try {
        // Disable button and show progress
        convertBtn.disabled = true;
        mainContainer.setAttribute('aria-busy', 'true');
        hideStatus();
        updateProgress(0, 'Starting...');
        
        // Read file
        updateProgress(10, 'Reading PDF file...');
        const arrayBuffer = await file.arrayBuffer();
        
        // Validate PDF signature
        if (!validatePdfSignature(arrayBuffer)) {
            throw new Error('The selected file is not a valid PDF.');
        }
        
        // Create booklet
        updateProgress(20, 'Processing PDF...');
        const bookletBytes = await createBooklet(arrayBuffer);
        
        // Download
        updateProgress(100, 'Done! Downloading...');
        const filename = file.name.replace(/\.pdf$/i, '') + '.pdf';
        downloadBooklet(bookletBytes, filename);
        
        showStatus('Booklet created successfully! Check your downloads.', 'success');
        
        // Hide progress after a delay
        setTimeout(() => {
            document.getElementById('progress').classList.add('hidden');
        }, 2000);
        
    } catch (error) {
        console.error('Error:', error);
        showStatus(`Error: ${error.message}`, 'error');
        document.getElementById('progress').classList.add('hidden');
    } finally {
        convertBtn.disabled = false;
        mainContainer.removeAttribute('aria-busy');
    }
}

// Handle file selection changes
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('pdf-upload');
    fileInput.addEventListener('change', () => {
        // Clear any previous status messages when a new file is selected
        hideStatus();
    });
    
    // Check if PDFLib loaded successfully after allowing time for CDN to load
    setTimeout(() => {
        if (typeof PDFLib === 'undefined') {
            showStatus(`Warning: ${PDFLIB_LOAD_ERROR_MESSAGE}`, 'error');
            const convertBtn = document.getElementById('convert-btn');
            convertBtn.disabled = true;
        }
    }, PDFLIB_LOAD_TIMEOUT_MS);
});
