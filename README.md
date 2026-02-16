# 📚 DOI to Booklet

Convert open access scientific papers into printable booklets for easy reading and note-taking.

## 🌟 Features

- **Simple Input**: Just paste a DOI or PDF URL
- **Client-Side Processing**: All conversion happens in your browser - no data sent to servers
- **Printable Format**: Automatically arranges pages in booklet format (2-up layout)
- **Free & Open Source**: No sign-up, no costs, fully open source

## 🚀 Usage

Visit the live app: **[https://lubianat.github.io/doi2booklet/](https://lubianat.github.io/doi2booklet/)**

1. Enter a DOI (e.g., `10.1371/journal.pone.0154556`) or direct PDF URL
2. Click "Convert to Booklet"
3. Wait for processing (happens entirely in your browser)
4. Download your printable booklet PDF

### Example DOIs to try:
- `10.1371/journal.pone.0154556`
- Direct URL: `https://pmc.ncbi.nlm.nih.gov/articles/PMC4851331/pdf/pone.0154556.pdf`

## 📖 How It Works

The tool rearranges PDF pages into booklet format:
- Pages are ordered for folding: [last, first, second, second-to-last, ...]
- Two pages per sheet in landscape orientation
- Print double-sided and fold in the middle for a handy booklet

## 🛠️ Technology Stack

- **HTML/CSS/JavaScript**: Pure client-side application
- **pdf-lib**: PDF manipulation and generation
- **PDF.js**: PDF parsing and rendering
- **GitHub Pages**: Free hosting

## 📝 Notes

- Works best with open access papers (no paywalls)
- Some publishers may have CORS restrictions
- All processing happens locally in your browser for privacy

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📄 License

See [LICENSE](LICENSE) file for details.

## 🙏 Credits

Built with ❤️ for the open science community. 
