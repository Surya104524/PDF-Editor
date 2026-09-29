# ResumeCraft & PDF Studio 📄✨

[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ESM-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![PDF.js](https://img.shields.io/badge/PDF.js-5.6-E44D26?style=flat-square&logo=adobeacrobatreader&logoColor=white)](https://mozilla.github.io/pdf.js/)
[![jsPDF](https://img.shields.io/badge/jsPDF-4.2-brightgreen?style=flat-square)](https://github.com/parallax/jsPDF)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)

> **ResumeCraft & PDF Studio** is a modern, high-performance, and privacy-first web application for **building professional resumes** and **editing any existing PDF document** directly in your browser. 

Featuring an intuitive WYSIWYG visual studio, dual form-sync workflow, digital signature suite, whiteout/redact tools, and crisp vector A4 PDF export — with **zero server uploads** and **100% client-side data privacy**.

---

## 📑 Table of Contents

- [✨ Key Features](#-key-features)
  - [1. Dual-Workflow Resume Creation](#1-dual-workflow-resume-creation)
  - [2. Upload & Annotate Any Existing PDF](#2-upload--annotate-any-existing-pdf)
  - [3. Complete Creative Toolbox](#3-complete-creative-toolbox)
  - [4. Multi-Mode Digital Signature Studio](#4-multi-mode-digital-signature-studio)
  - [5. Document & Page Management](#5-document--page-management)
  - [6. Export & Persistence](#6-export--persistence)
- [🛠️ Tech Stack](#️-tech-stack)
- [📂 Project Architecture](#-project-architecture)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development Server](#development-server)
  - [Production Build](#production-build)
- [⌨️ Keyboard Shortcuts](#️-keyboard-shortcuts)
- [🔒 Privacy & Security](#-privacy--security)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Key Features

### 1. Dual-Workflow Resume Creation
* **🎨 Visual Studio (WYSIWYG Canvas)**:
  * Drag, resize, rotate, nudge, and align elements directly on printable A4 pages (`794 × 1123 px`).
  * Double-click any text element to edit inline with real-time typography styling.
  * Bounding boxes with 8 precision resize handles, rotation pins, and smart guides.
* **📝 Structured Resume Form**:
  * Clean, multi-section form covering Personal Info, Summary, Work History, Projects, Education, and Skills.
  * Instant two-way synchronization between form inputs and the visual canvas.

### 2. Upload & Annotate Any Existing PDF
* **Universal PDF Import**: Drag-and-drop or upload any multi-page PDF document.
* **Retina Fidelity**: Rendered at 2× scale via `pdfjs-dist` for crisp, high-DPI display.
* **Optical Overlay Editing**: Automatically extracts text bounding boxes so you can edit, correct, or redact existing documents seamlessly.

### 3. Complete Creative Toolbox
* **Select & Transform (`V`)**: Move, resize, rotate, duplicate (`Ctrl+D`), and delete (`Del`).
* **Rich Text Tool (`T`)**: Insert custom typography with Google Fonts (Inter, Roboto, Playfair Display, Outfit, Merriweather, etc.), font weight, size, color, and alignment controls.
* **Whiteout & Redact (`W`)**: Swiftly blank out outdated information or redact confidential sections.
* **Freehand Drawing (`P`) & Highlighter (`H`)**: Natural ink drawing and semi-transparent marker highlighting.
* **Shapes & Dividers (`U`)**: Add clean divider rules, solid or outlined rectangles, rounded cards, and badges.
* **Photo & Logo Inserter (`I`)**: Add profile avatars, headshots, or company logos with circular/rounded corner clipping.
* **Official Stamps & Badges**: One-click stamps (`APPROVED`, `CONFIDENTIAL`, `VERIFIED`, `CERTIFIED`, `DRAFT`).

### 4. Multi-Mode Digital Signature Studio (`S`)
* **✍️ Draw Mode**: Natural handwriting signature pad with smooth ink smoothing and stroke customization.
* **🔤 Type Calligraphy**: Choose from authentic cursive script fonts (`Dancing Script`, `Caveat`, `Great Vibes`).
* **📤 Image Upload**: Upload existing signature image files with transparent PNG background support.

### 5. Document & Page Management
* **Multi-Page Support**: Easily manage multi-page documents (Page 1 of N).
* **Page Operations**: Add new blank A4 pages, duplicate pages with contents, or remove pages.
* **Fluid Navigation**: Zoom from 50% to 200%, Fit-to-Screen, `Ctrl + Mouse Wheel` zooming, and `Space + Click Drag` canvas panning.

### 6. Export & Persistence
* **📄 Vector/Print PDF Generation**: 1-click export to standard A4 PDF files using `jspdf` (accompanied by celebratory confetti 🎉).
* **🖼️ High-Res PNG Export**: Save individual pages as crisp image graphics.
* **🖨️ Direct Browser Print**: Optimized print stylesheets for direct physical printing.
* **💾 Project File Backup**: Export and import `.resumecraft.json` project files to resume work anywhere.
* **⚡ Continuous Auto-Save**: Automatically commits work to browser `localStorage` to guard against accidental refreshes.

---

## 🛠️ Tech Stack

| Technology | Purpose |
| --- | --- |
| **Vanilla JavaScript (ESM)** | Lightweight, reactive state management and modular architecture |
| **Vite 8** | Next-generation frontend tooling and ultra-fast dev server |
| **pdfjs-dist** | Mozilla's industry-standard engine for rendering PDF pages to HTML5 canvas |
| **jsPDF & pdf-lib** | High-fidelity client-side PDF document generation and manipulation |
| **HTML5 Canvas** | High-performance interactive rendering for pens, signatures, and rasterization |
| **Vanilla CSS3** | Custom design system with glassmorphism, CSS variables, and light/dark theme support |
| **canvas-confetti** | Delightful micro-interaction on export completion |

---

## 📂 Project Architecture

```plaintext
pdf-editor/
├── index.html              # Core application markup, toolbars, and modals
├── package.json            # Project manifest and scripts
├── vite.config.js          # Vite build and development configuration
├── public/                 # Static assets
└── src/
    ├── main.js             # Main entry point & event wiring
    ├── style.css           # Design system tokens, layouts, and dark theme
    └── js/
        ├── canvas.js       # WYSIWYG canvas interaction, dragging, handles & transforms
        ├── formSync.js     # Form-to-canvas real-time synchronization
        ├── icons.js        # SVG icon library
        ├── pdfEngine.js    # PDF import (pdfjs-dist) & export (jspdf)
        ├── propertyBar.js  # Contextual tool property inspection bar
        ├── signatureModal.js # Digital signature drawer (Draw, Type, Upload)
        ├── state.js        # Central application state & history stack (Undo/Redo)
        └── templates.js    # Built-in resume templates & sample datasets
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or later recommended)
- `npm`, `yarn`, or `pnpm`

### Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/pdf-editor.git
cd pdf-editor
npm install
```

### Development Server
Run the local development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173/`.

### Production Build
Bundle and optimize for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## ⌨️ Keyboard Shortcuts

Speed up your document workflow with built-in hotkeys:

| Key | Tool / Action |
| :--- | :--- |
| <kbd>V</kbd> | Select & Move Tool |
| <kbd>T</kbd> | Text Box Tool |
| <kbd>W</kbd> | Whiteout / Redact Tool |
| <kbd>P</kbd> | Freehand Pen Tool |
| <kbd>H</kbd> | Highlighter Tool |
| <kbd>U</kbd> | Shapes & Lines Tool |
| <kbd>S</kbd> | Digital Signature Modal |
| <kbd>I</kbd> | Insert Photo / Logo |
| <kbd>Ctrl</kbd> + <kbd>Z</kbd> | Undo Last Action |
| <kbd>Ctrl</kbd> + <kbd>Y</kbd> | Redo Last Action |
| <kbd>Ctrl</kbd> + <kbd>D</kbd> | Duplicate Selected Element |
| <kbd>Del</kbd> / <kbd>Backspace</kbd> | Delete Selected Element |
| <kbd>Arrow Keys</kbd> | Nudge Element by 1px (Hold <kbd>Shift</kbd> for 10px) |
| <kbd>Space</kbd> + <kbd>Click Drag</kbd> | Pan Canvas |
| <kbd>Ctrl</kbd> + <kbd>Mouse Wheel</kbd> | Zoom In / Out |
| <kbd>?</kbd> | Show Keyboard Shortcuts Cheatsheet |

---

## 🔒 Privacy & Security

* **100% Client-Side Execution**: All PDF rendering, text parsing, canvas manipulation, and export generation execute entirely within your local web browser.
* **No Remote Servers**: Your documents, uploaded PDFs, personal resume information, and digital signatures are never transmitted over the internet.
* **Offline Ready**: Works without an active internet connection once loaded.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
