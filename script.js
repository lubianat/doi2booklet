// DOI to Booklet Converter
// Main script for converting PDFs to printable booklet format

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

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
    
    // If it's already a PDF URL, return it
    if (input.includes('.pdf') || input.includes('pmc.ncbi.nlm.nih.gov')) {
        return input;
    }
    
    // Extract DOI
    const doi = extractDOI(input);
    if (!doi) {
        throw new Error('Invalid DOI format. Please enter a valid DOI or PDF URL.');
    }
    
    // For now, we'll try common open access repositories
    // This is a simple approach - production might use CrossRef API
    const possibleUrls = [
        `https://doi.org/${doi}`, // Will redirect to publisher
        `https://www.biorxiv.org/content/${doi}v1.full.pdf`,
        `https://europepmc.org/articles/PMC${doi.split('/').pop()}/pdf`
    ];
    
    return possibleUrls[0]; // Start with DOI resolver
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
        return await response.arrayBuffer();
    } catch (error) {
        // If direct fetch fails due to CORS, try with a CORS proxy
        // Note: In production, you'd want your own proxy or handle CORS properly
        try {
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.arrayBuffer();
        } catch (proxyError) {
            throw new Error(`Failed to fetch PDF. This may be due to CORS restrictions or the PDF not being publicly accessible. Original error: ${error.message}`);
        }
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
    
    updateProgress(30, `Processing ${pageCount} pages...`);
    
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
            const leftDims = leftPage.getSize();
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
            const rightDims = rightPage.getSize();
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
    
    if (!input.trim()) {
        showStatus('Please enter a DOI or PDF URL', 'error');
        return;
    }
    
    try {
        // Disable button and show progress
        convertBtn.disabled = true;
        hideStatus();
        updateProgress(0, 'Starting...');
        
        // Get PDF URL
        updateProgress(10, 'Resolving DOI...');
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
    }
}

// Allow Enter key to submit
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('doi-input');
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            convertToBooklet();
        }
    });
});
