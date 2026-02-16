# 📚 DOI to Booklet

Convert open access scientific papers into printable booklets for easy reading and note-taking.

## 🌟 Features

- **Simple Input**: Just paste a direct PDF URL
- **Client-Side Processing**: PDF manipulation happens in your browser
- **Printable Format**: Automatically arranges pages in booklet format (2-up layout)
- **Free & Open Source**: No sign-up, no costs, fully open source

## 🚀 Usage

Visit the live app: **[https://lubianat.github.io/doi2booklet/](https://lubianat.github.io/doi2booklet/)**

1. Enter a direct PDF URL (e.g., from PubMed Central, bioRxiv, or publisher site)
2. Click "Convert to Booklet"
3. Wait for processing (PDF manipulation happens in your browser)
4. Download your printable booklet PDF

### Example PDF URLs to try:
- Direct URL: `https://pmc.ncbi.nlm.nih.gov/articles/PMC4851331/pdf/pone.0154556.pdf`

**Note:** DOI-to-PDF resolution is not currently supported. Please provide direct PDF URLs.

## 📖 How It Works

The tool rearranges PDF pages into booklet format:
- Pages are ordered for folding: [last, first, second, second-to-last, ...]
- Two pages per sheet in landscape orientation
- Print double-sided and fold in the middle for a handy booklet

## 🛠️ Technology Stack

- **HTML/CSS/JavaScript**: Pure client-side application
- **pdf-lib**: PDF manipulation and generation
- **GitHub Pages**: Free hosting

## 📝 Notes

- Works best with open access papers (no paywalls)
- Some publishers may have CORS restrictions
- **Privacy:** PDF manipulation happens locally in your browser. However, PDFs are fetched from external sources (publisher websites), and if direct access fails due to CORS, the app may route requests through a third-party CORS proxy (corsproxy.io), which can access the PDF content being fetched.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📄 License

See [LICENSE](LICENSE) file for details.

## 🙏 Credits

Built with ❤️ for the open science community. 
