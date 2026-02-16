// DOI to Booklet Converter
// Main script for converting PDFs to printable booklet format

/**
 * Extract DOI from various input formats
 */
function extractDOI(input) {
    input = input.trim();
    
    // Check if it's already a clean DOI
    const doiPattern = /^10\.\d{4,}\/[^\s]+$/;
    if (doiPattern.test(input)) {
        return input;
    }
    
    // Extract DOI from URL patterns
    const doiMatch = input.match(/10\.\d{4,}\/[^\s?&#]+/);
    if (doiMatch) {
        return doiMatch[0];
    }
    
    return null;
}

/**
 * Get PDF URL from DOI or direct URL
 */
async function getPDFUrl(input) {
    input = input.trim();
    
    // If it's already a PDF URL, validate and return it
    if (input.includes('.pdf')) {
        // Validate that it's a proper URL
        try {
            const url = new URL(input);
            // Check for trusted domains (PMC)
            if (url.hostname === 'pmc.ncbi.nlm.nih.gov' || url.hostname === 'www.ncbi.nlm.nih.gov') {
                return input;
            }
            // For other domains, return as-is (user responsibility)
            return input;
        } catch (e) {
            throw new Error('Invalid URL format.');
        }
    }
    
    // Extract DOI
    const doi = extractDOI(input);
    if (doi) {
        // NOTE: Automatic DOI → PDF resolution is not implemented here because
        // many DOI resolvers (e.g. https://doi.org) return HTML landing pages
        // rather than direct PDF files, which would cause failures later when
        // trying to parse the response as a PDF. To avoid this, we currently
        // require the user to provide a direct PDF URL instead of a bare DOI.
        throw new Error('DOI detected, but automatic DOI-to-PDF resolution is not supported. Please provide a direct PDF URL (e.g., from PubMed Central, bioRxiv, or publisher site).');
    }
    
    throw new Error('Invalid input. Please enter a direct PDF URL.');
}

/**
 * Fetch PDF as ArrayBuffer with CORS proxy if needed
 */
async function fetchPDF(url) {
    try {
        // Try direct fetch first
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Validate that the response is actually a PDF
        const contentType = response.headers.get('content-type');
        if (contentType && !contentType.includes('application/pdf')) {
            throw new Error(`Expected PDF but received ${contentType}. The URL may point to an HTML page instead of a PDF file.`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        
        // Check for PDF header signature (%PDF-)
        const header = new Uint8Array(arrayBuffer.slice(0, 5));
        const headerStr = String.fromCharCode(...header);
        if (!headerStr.startsWith('%PDF-')) {
            throw new Error('The fetched content is not a valid PDF file. Please check the URL.');
        }
        
        return arrayBuffer;
    } catch (error) {
        // Only use CORS proxy for network/CORS failures (TypeError: Failed to fetch)
        // Don't proxy for HTTP errors (404, 500, etc.) or invalid content
        if (error instanceof TypeError && error.message.includes('fetch')) {
            // If direct fetch fails due to CORS, try with a CORS proxy
            // WARNING: Using a third-party CORS proxy has security implications:
            // - The proxy can access all PDF content being fetched
            // - Service availability is not guaranteed
            // For production use, consider:
            // - Self-hosted CORS proxy
            // - Server-side PDF fetching
            // - Direct publisher API integration
            try {
                const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
                const response = await fetch(proxyUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const arrayBuffer = await response.arrayBuffer();
                
                // Validate PDF header for proxied content too
                const header = new Uint8Array(arrayBuffer.slice(0, 5));
                const headerStr = String.fromCharCode(...header);
                if (!headerStr.startsWith('%PDF-')) {
                    throw new Error('The fetched content is not a valid PDF file. The URL may point to an HTML page.');
                }
                
                return arrayBuffer;
            } catch (proxyError) {
                throw new Error(`Failed to fetch PDF via proxy. This may be due to CORS restrictions or the PDF not being publicly accessible. Original error: ${error.message}`);
            }
        }
        
        // Re-throw non-CORS errors
        throw error;
    }
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
function downloadBooklet(pdfBytes, doi) {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booklet-${doi.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Main conversion function
 */
async function convertToBooklet() {
    const input = document.getElementById('doi-input').value;
    const convertBtn = document.getElementById('convert-btn');
    const mainContainer = document.querySelector('main');
    
    if (!input.trim()) {
        showStatus('Please enter a DOI or PDF URL', 'error');
        return;
    }
    
    try {
        // Disable button and show progress
        convertBtn.disabled = true;
        mainContainer.setAttribute('aria-busy', 'true');
        hideStatus();
        updateProgress(0, 'Starting...');
        
        // Get PDF URL
        updateProgress(10, 'Resolving URL...');
        const pdfUrl = await getPDFUrl(input);
        
        // Fetch PDF
        updateProgress(20, 'Fetching PDF...');
        const pdfBytes = await fetchPDF(pdfUrl);
        
        // Create booklet
        const bookletBytes = await createBooklet(pdfBytes);
        
        // Download
        updateProgress(100, 'Done! Downloading...');
        const doi = extractDOI(input) || 'paper';
        downloadBooklet(bookletBytes, doi);
        
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

// Allow Enter key to submit
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('doi-input');
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            convertToBooklet();
        }
    });
});
