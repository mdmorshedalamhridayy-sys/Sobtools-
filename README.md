# SobTools — All Your Tools in One Place (সব টুলস এক জায়গায়)

SobTools is a production-ready, privacy-focused, bilingual all-in-one web utility platform designed for creators, students, office workers, developers, and everyday internet users in Bangladesh and worldwide.

## 🚀 Key Highlights & Features

- **100% Client-Side Privacy**: All file processing (image compression, resizing, PDF merging, text manipulations, passwords, QR codes) happens strictly inside the user's web browser sandbox. Files never upload to remote servers.
- **Bilingual Interface**: Full localization in **Bengali (বাংলা)** and **English**, including navigation, categories, tool descriptions, error messages, and FAQs.
- **39 Production Tools**:
  - **Image Tools (1-10)**: Image Compressor, Image Resizer, Image Cropper, Format Converter (PNG/JPG/WebP), Image to Base64, Base64 to Image, Color Picker & Palette Extractor, Image Metadata Inspector, Passport Photo Layout Maker (4x6" print sheet), Background Remover (Local Chroma/Color Distance).
  - **PDF Tools (11-18)**: Merge PDF, Split PDF, PDF to JPG, JPG to PDF, PDF Page Reorder, Rotate PDF, PDF Metadata Viewer, PDF Compressor & Optimizer.
  - **Text & Bengali Tools (19-27)**: Word & Sentence Counter, Character Counter (with Social/SMS limits), Case Converter, Text Formatter, Duplicate Line Remover, Bengali Caption Generator, Bengali Hashtag Generator, Paragraph Rewriter, Text Diff Checker.
  - **Creator, Microstock & Developer Tools (28-39)**:
    - **Stock Metadata Generator**: Multi-platform CSV & metadata builder for **Adobe Stock**, **Dreamstime**, **Shutterstock**, and **Freepik** with taxonomy mapping, 5–49 tag validator, top 10 search priority keyword ordering, and trademark/brand name scanner.
    - **Stock Platform Rule Checker**: Validates image & vector preview dimensions, Megapixels (min 4 MP for Adobe Stock, min 3 MP for Dreamstime), aspect ratios, and file size against 7 top design selling marketplaces (Adobe Stock, Dreamstime, Shutterstock, Freepik, Vecteezy, Creative Fabrica, Etsy).
    - **Stock Keyword & Tag Suggester**: Curated, categorized microstock keyword packs (Islamic/Eid, Business, Patterns, AI/Tech, Social Flyers, Floral/Nature) with Adobe Stock top-10 prioritization and 1-click comma-separated copy.
    - **YouTube Thumbnail Downloader**: (1080p MaxRes, HD, HQ).
    - **YouTube Title Generator**: High-CTR viral formula headlines.
    - **YouTube Description Builder**: SEO timestamps, social links & hashtags.
    - **JSON Formatter & Validator**: Formatter with tree/indents and syntax error checking.
    - **URL Encoder & Decoder**: Unicode and URI component converter.
    - **UUID Generator**: RFC4122 v4 UUID generator using Web Crypto API.
    - **QR Code Generator**: High-resolution PNG/SVG codes for URLs, WiFi networks, and text.
    - **Password Generator**: Cryptographically secure generator with strength metrics.
    - **Smart Unit Converter**: Metric, Imperial, and Bangladeshi Land Units (Bigha, Katha, Decimal).
- **Google AdSense Ready**: Dedicated, responsive ad slot placeholders adhering to Google AdSense compliance policies. Separated from tool action buttons.
- **Modern UI & Dark/Light Mode**: Styled with Inter and Noto Sans Bengali typography, deep slate neutrals, and vibrant indigo/cyan accents.

---

## 🛠 Technology Stack

- **Frontend**: React 19, TypeScript, Vite 8
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM (Deep routes for each tool e.g. `/tools/pdf-merge`)
- **PDF Engine**: `pdf-lib` (pure client-side browser PDF manipulation)
- **QR Code Engine**: `qrcode` (local SVG/Canvas generator)
- **Icons**: Lucide React
- **Cryptography**: Native Web Crypto API (`window.crypto.getRandomValues`, `crypto.randomUUID`)

---

## 💻 Local Development & Build

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/sobtools.git
cd sobtools

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Building for Production
```bash
# Run production build
npm run build

# Preview production build locally
npm run preview
```

---

## 🌐 Deployment Guide

### Deploying Frontend (Vercel / Netlify / Cloudflare Pages)

1. Push your repository to GitHub.
2. In the Vercel/Netlify dashboard, select **New Project** and import your repository.
3. Build Settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Deploy!

### Google Search Console & SEO Checklist

1. Submit `https://sobtools.com/sitemap.xml` in **Google Search Console**.
2. Verify `robots.txt` is accessible at `https://sobtools.com/robots.txt`.
3. Add domain verification DNS TXT record.

---

## 📊 Feature Status Report

| Category | Tool Name | Local Processing | Status |
|---|---|---|---|
| Image | Image Compressor | 100% Client-Side | Fully Implemented & Tested |
| Image | Image Resizer | 100% Client-Side | Fully Implemented & Tested |
| Image | Image Cropper | 100% Client-Side | Fully Implemented & Tested |
| Image | Image Converter | 100% Client-Side | Fully Implemented & Tested |
| Image | Image to Base64 | 100% Client-Side | Fully Implemented & Tested |
| Image | Base64 to Image | 100% Client-Side | Fully Implemented & Tested |
| Image | Color Picker & Palette | 100% Client-Side | Fully Implemented & Tested |
| Image | Image Metadata Viewer | 100% Client-Side | Fully Implemented & Tested |
| Image | Passport Photo Layout Maker | 100% Client-Side | Fully Implemented & Tested |
| Image | Background Remover | 100% Client-Side | Fully Implemented & Tested |
| PDF | Merge PDF | 100% Client-Side | Fully Implemented & Tested |
| PDF | Split PDF | 100% Client-Side | Fully Implemented & Tested |
| PDF | PDF to JPG | 100% Client-Side | Fully Implemented & Tested |
| PDF | JPG to PDF | 100% Client-Side | Fully Implemented & Tested |
| PDF | PDF Page Reorder | 100% Client-Side | Fully Implemented & Tested |
| PDF | Rotate PDF | 100% Client-Side | Fully Implemented & Tested |
| PDF | PDF Info Viewer | 100% Client-Side | Fully Implemented & Tested |
| PDF | PDF Compressor | 100% Client-Side | Fully Implemented & Tested |
| Text | Word & Sentence Counter | 100% Client-Side | Fully Implemented & Tested |
| Text | Character Counter | 100% Client-Side | Fully Implemented & Tested |
| Text | Case Converter | 100% Client-Side | Fully Implemented & Tested |
| Text | Text Formatter & Cleaner | 100% Client-Side | Fully Implemented & Tested |
| Text | Duplicate Line Remover | 100% Client-Side | Fully Implemented & Tested |
| Text | Bengali Caption Generator | 100% Client-Side | Fully Implemented & Tested |
| Text | Bengali Hashtag Generator | 100% Client-Side | Fully Implemented & Tested |
| Text | Paragraph Rewriter | 100% Client-Side | Fully Implemented & Tested |
| Text | Text Diff Checker | 100% Client-Side | Fully Implemented & Tested |
| Creator | YouTube Thumbnail Viewer | Public Endpoint | Fully Implemented & Tested |
| Creator | YouTube Title Generator | 100% Client-Side | Fully Implemented & Tested |
| Creator | YouTube Description Builder | 100% Client-Side | Fully Implemented & Tested |
| Creator | JSON Formatter & Validator | 100% Client-Side | Fully Implemented & Tested |
| Creator | URL Encoder & Decoder | 100% Client-Side | Fully Implemented & Tested |
| Creator | UUID Generator | Web Crypto API | Fully Implemented & Tested |
| Creator | QR Code Generator | 100% Client-Side | Fully Implemented & Tested |
| Creator | Password Generator | Web Crypto API | Fully Implemented & Tested |
| Creator | Smart Unit Converter | 100% Client-Side | Fully Implemented & Tested |
| Creator | Stock Metadata Generator (Adobe Stock / Dreamstime) | 100% Client-Side CSV | Fully Implemented & Tested |
| Creator | Stock Platform Rule Checker (7 Marketplaces) | 100% Client-Side | Fully Implemented & Tested |
| Creator | Stock Keyword & Tag Suggester | 100% Client-Side | Fully Implemented & Tested |

---

## 📄 License & Compliance

Distributed under the Apache 2.0 License. All tools operate in compliance with GDPR, consumer privacy standards, and Google AdSense publisher policies.
