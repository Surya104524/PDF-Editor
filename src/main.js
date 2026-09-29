// Main entrypoint for ResumeCraft & PDF Editor Studio
import './style.css';
import confetti from 'canvas-confetti';
import { icons } from './js/icons.js';
import { appState } from './js/state.js';
import { PDFEngine } from './js/pdfEngine.js';
import { CanvasEngine } from './js/canvas.js';
import { PropertyBar } from './js/propertyBar.js';
import { ResumeFormSync } from './js/formSync.js';
import { SignatureModal } from './js/signatureModal.js';
import { RESUME_TEMPLATES } from './js/templates.js';

class App {
  constructor() {
    this.canvasEngine = null;
    this.propertyBar = null;
    this.formSync = null;
    this.sigModal = null;
  }

  init() {
    // Populate icons
    this.setupIcons();

    // Initialize modules
    const viewportEl = document.getElementById('canvas-viewport');
    this.canvasEngine = new CanvasEngine(viewportEl);

    const propBarEl = document.getElementById('contextual-property-bar');
    this.propertyBar = new PropertyBar(propBarEl);

    const formViewEl = document.getElementById('resume-form-view');
    this.formSync = new ResumeFormSync(formViewEl);

    this.sigModal = new SignatureModal();

    // Wire up events
    this.attachHeaderEvents();
    this.attachToolbarEvents();
    this.attachBottomBarEvents();
    this.attachModals();
    this.attachDragAndDropPDF();
    this.attachKeyboardShortcuts();

    // Attempt to restore autosaved draft if present
    appState.loadFromLocalStorage();

    // Update initial UI state
    this.updatePageIndicator();
    this.updateZoomLabel();

    // Subscribe to state notifications
    appState.subscribe((event, payload) => {
      if (['pageChanged', 'pagesListChanged'].includes(event)) {
        this.updatePageIndicator();
      } else if (event === 'zoomChanged') {
        this.updateZoomLabel();
      } else if (event === 'historyChanged') {
        this.updateHistoryButtons(payload);
      } else if (event === 'autosaved') {
        this.flashAutosave();
      }
    });

    console.log('ResumeCraft & PDF Studio initialized successfully.');
  }

  setupIcons() {
    // Top header icons
    document.getElementById('btn-undo').innerHTML = icons.undo;
    document.getElementById('btn-redo').innerHTML = icons.redo;
    document.getElementById('btn-theme-toggle').innerHTML = icons.sun;
    document.getElementById('btn-help').innerHTML = icons.help;
    document.getElementById('upload-icon-slot').innerHTML = icons.upload;
    document.getElementById('download-icon-slot').innerHTML = icons.download;

    // Toolbar icons
    document.getElementById('icon-select').innerHTML = icons.cursor;
    document.getElementById('icon-text').innerHTML = icons.type;
    document.getElementById('icon-whiteout').innerHTML = icons.whiteout;
    document.getElementById('icon-pen').innerHTML = icons.pen;
    document.getElementById('icon-highlighter').innerHTML = icons.highlighter;
    document.getElementById('icon-shape').innerHTML = icons.shape;
    document.getElementById('icon-image').innerHTML = icons.image;
    document.getElementById('icon-signature').innerHTML = icons.signature;
    document.getElementById('icon-stamp').innerHTML = icons.stamp;
    document.getElementById('icon-template').innerHTML = icons.template;
  }

  attachHeaderEvents() {
    // Document Title
    const titleInput = document.getElementById('doc-title-input');
    titleInput.value = appState.state.docTitle;
    titleInput.addEventListener('change', (e) => {
      appState.state.docTitle = e.target.value.trim() || 'My_Resume';
      appState.debouncedSave();
    });

    // View tab switching (Visual Studio vs Resume Form)
    const canvasTab = document.getElementById('tab-btn-canvas');
    const formTab = document.getElementById('tab-btn-form');
    const canvasViewport = document.getElementById('canvas-viewport');
    const formView = document.getElementById('resume-form-view');
    const propBar = document.getElementById('contextual-property-bar');

    canvasTab.addEventListener('click', () => {
      canvasTab.classList.add('active');
      formTab.classList.remove('active');
      canvasViewport.classList.remove('hidden');
      propBar.classList.remove('hidden');
      formView.classList.add('hidden');
      appState.state.activeView = 'canvas';
      this.canvasEngine.render();
    });

    formTab.addEventListener('click', () => {
      formTab.classList.add('active');
      canvasTab.classList.remove('active');
      canvasViewport.classList.add('hidden');
      propBar.classList.add('hidden');
      formView.classList.remove('hidden');
      appState.state.activeView = 'form';
    });

    // Undo / Redo
    const undoBtn = document.getElementById('btn-undo');
    const redoBtn = document.getElementById('btn-redo');
    undoBtn.addEventListener('click', () => appState.undo());
    redoBtn.addEventListener('click', () => appState.redo());

    // Theme toggle
    const themeBtn = document.getElementById('btn-theme-toggle');
    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      themeBtn.innerHTML = next === 'light' ? icons.moon : icons.sun;
    });

    // Load Surya Resume button
    const loadSuryaBtn = document.getElementById('btn-load-surya-resume');
    loadSuryaBtn?.addEventListener('click', () => {
      appState.loadSuryaResume();
      titleInput.value = appState.state.docTitle;
      this.showToast("Loaded Surya R's exact 2-page resume!", 'success');
    });

    // Upload PDF button
    const pdfUploadBtn = document.getElementById('btn-upload-pdf-header');
    const pdfUploadInput = document.getElementById('pdf-file-upload-input');
    pdfUploadBtn.addEventListener('click', () => pdfUploadInput.click());
    pdfUploadInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        this.handleUploadPDF(e.target.files[0]);
      }
    });

    // Primary Download PDF Button
    const downloadPdfBtn = document.getElementById('btn-download-pdf-primary');
    downloadPdfBtn.addEventListener('click', () => this.handleDownloadPDF());

    // Export dropdown toggle
    const dropdownToggle = document.getElementById('btn-export-dropdown-toggle');
    const dropdownMenu = document.getElementById('export-dropdown-menu');

    dropdownToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle('show');
    });

    window.addEventListener('click', () => {
      dropdownMenu.classList.remove('show');
    });

    // Dropdown Items
    document.getElementById('menu-export-pdf').addEventListener('click', () => {
      this.handleDownloadPDF();
    });

    document.getElementById('menu-export-png').addEventListener('click', () => {
      const name = `${appState.state.docTitle}_page_${appState.state.currentPageIndex + 1}.png`;
      PDFEngine.exportCurrentPageAsPNG(name);
      this.showToast('Exported page as PNG image!', 'success');
    });

    document.getElementById('menu-print-doc').addEventListener('click', () => {
      window.print();
    });

    document.getElementById('menu-export-json').addEventListener('click', () => {
      const project = {
        version: '1.0',
        docTitle: appState.state.docTitle,
        pages: appState.state.pages,
        resumeData: appState.state.resumeData,
        currentTemplateId: appState.state.currentTemplateId
      };
      const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${appState.state.docTitle}.resumecraft.json`;
      a.click();
      URL.revokeObjectURL(url);
      this.showToast('Project file saved!', 'success');
    });

    const jsonInput = document.getElementById('json-project-upload-input');
    document.getElementById('menu-import-json').addEventListener('click', () => {
      jsonInput.click();
    });
    jsonInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);
            if (data.pages) {
              appState.state.docTitle = data.docTitle || 'Imported_Project';
              appState.state.pages = data.pages;
              if (data.resumeData) appState.state.resumeData = data.resumeData;
              if (data.currentTemplateId) appState.state.currentTemplateId = data.currentTemplateId;
              appState.state.currentPageIndex = 0;
              titleInput.value = appState.state.docTitle;
              appState.pushHistory('Imported JSON Project');
              appState.notify('docLoaded', null);
              this.showToast('Project loaded successfully!', 'success');
            }
          } catch (err) {
            alert('Invalid project file.');
          }
        };
        reader.readAsText(e.target.files[0]);
      }
    });
  }

  attachToolbarEvents() {
    const toolBtns = document.querySelectorAll('.sidebar-toolbar .tool-btn[data-tool]');
    toolBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        toolBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        appState.setTool(btn.dataset.tool);
      });
    });

    // Photo / Image upload
    const imgUploadInput = document.getElementById('canvas-image-upload-input');
    document.querySelector('.tool-btn[data-action="image"]').addEventListener('click', () => {
      imgUploadInput.click();
    });

    imgUploadInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (ev) => {
          appState.addElement({
            type: 'image',
            x: 80,
            y: 80,
            width: 140,
            height: 140,
            src: ev.target.result,
            borderRadius: 8
          });
          this.showToast('Image added to resume!', 'success');
        };
        reader.readAsDataURL(file);
      }
    });

    // Signature tool
    document.querySelector('.tool-btn[data-action="signature"]').addEventListener('click', () => {
      this.sigModal.show();
    });

    // Stamps tool
    document.querySelector('.tool-btn[data-action="stamps"]').addEventListener('click', () => {
      this.openStampsModal();
    });

    // Templates tool
    document.querySelector('.tool-btn[data-action="templates"]').addEventListener('click', () => {
      this.openTemplatesModal();
    });
  }

  attachBottomBarEvents() {
    // Page navigation
    document.getElementById('btn-prev-page').addEventListener('click', () => {
      const cur = appState.state.currentPageIndex;
      if (cur > 0) appState.setPageIndex(cur - 1);
    });

    document.getElementById('btn-next-page').addEventListener('click', () => {
      const cur = appState.state.currentPageIndex;
      if (cur < appState.state.pages.length - 1) appState.setPageIndex(cur + 1);
    });

    document.getElementById('btn-add-page').addEventListener('click', () => {
      appState.addPage();
      this.showToast('New blank A4 page added!', 'success');
    });

    document.getElementById('btn-duplicate-page').addEventListener('click', () => {
      appState.duplicatePage();
      this.showToast('Page duplicated!', 'success');
    });

    document.getElementById('btn-delete-page').addEventListener('click', () => {
      if (appState.state.pages.length <= 1) {
        alert('Document must have at least one page.');
        return;
      }
      if (confirm('Delete current page?')) {
        appState.deletePage();
        this.showToast('Page deleted', 'info');
      }
    });

    // Zoom buttons
    document.getElementById('btn-zoom-in').addEventListener('click', () => {
      appState.setZoom(appState.state.zoom + 0.1);
    });

    document.getElementById('btn-zoom-out').addEventListener('click', () => {
      appState.setZoom(appState.state.zoom - 0.1);
    });

    document.getElementById('btn-zoom-fit').addEventListener('click', () => {
      const viewport = document.getElementById('canvas-viewport');
      const vh = viewport.clientHeight - 120;
      const fitZoom = Math.min(1.2, Math.max(0.4, vh / 1123));
      appState.setZoom(fitZoom);
    });
  }

  attachModals() {
    // Shortcuts modal
    const shortcutsBackdrop = document.getElementById('shortcuts-modal-backdrop');
    document.getElementById('btn-help').addEventListener('click', () => {
      shortcutsBackdrop.classList.remove('hidden');
    });
    document.getElementById('close-shortcuts-btn').addEventListener('click', () => {
      shortcutsBackdrop.classList.add('hidden');
    });
    document.getElementById('gotit-shortcuts-btn').addEventListener('click', () => {
      shortcutsBackdrop.classList.add('hidden');
    });

    // Templates modal close
    const tplBackdrop = document.getElementById('templates-modal-backdrop');
    document.getElementById('close-templates-btn').addEventListener('click', () => {
      tplBackdrop.classList.add('hidden');
    });
    document.getElementById('cancel-templates-btn').addEventListener('click', () => {
      tplBackdrop.classList.add('hidden');
    });

    // Stamps modal close
    const stampsBackdrop = document.getElementById('stamps-modal-backdrop');
    document.getElementById('close-stamps-btn').addEventListener('click', () => {
      stampsBackdrop.classList.add('hidden');
    });
    document.getElementById('cancel-stamps-btn').addEventListener('click', () => {
      stampsBackdrop.classList.add('hidden');
    });
  }

  attachDragAndDropPDF() {
    window.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    window.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files.length) {
        const file = e.dataTransfer.files[0];
        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
          this.handleUploadPDF(file);
        } else if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            appState.addElement({
              type: 'image',
              x: 100,
              y: 100,
              width: 150,
              height: 150,
              src: ev.target.result,
              borderRadius: 8
            });
            this.showToast('Dropped image added!', 'success');
          };
          reader.readAsDataURL(file);
        }
      }
    });
  }

  attachKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.target.matches('input, textarea, [contenteditable="true"]')) return;

      const key = e.key.toUpperCase();
      if (key === 'V') appState.setTool('select');
      else if (key === 'T') appState.setTool('text');
      else if (key === 'W') appState.setTool('whiteout');
      else if (key === 'P') appState.setTool('pen');
      else if (key === 'H') appState.setTool('highlighter');
      else if (key === 'U') appState.setTool('shape');
      else if (key === 'S') this.sigModal.show();
      else if (key === '?') document.getElementById('shortcuts-modal-backdrop').classList.remove('hidden');

      // Update active button in toolbar
      document.querySelectorAll('.sidebar-toolbar .tool-btn[data-tool]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tool === appState.state.activeTool);
      });
    });
  }

  openTemplatesModal() {
    const backdrop = document.getElementById('templates-modal-backdrop');
    const grid = document.getElementById('templates-grid-container');
    grid.innerHTML = '';

    RESUME_TEMPLATES.forEach(t => {
      const card = document.createElement('div');
      card.className = `template-card ${t.id === appState.state.currentTemplateId ? 'active' : ''}`;
      card.innerHTML = `
        <div class="template-preview-mockup">
          <div style="height: 6px; width: 60px; background: ${t.accentColor}; border-radius: 3px; margin-bottom: 8px;"></div>
          <div class="mockup-line" style="width: 140px; height: 10px; background: #0f172a;"></div>
          <div class="mockup-line" style="width: 90px; height: 7px; background: ${t.accentColor};"></div>
          <div class="mockup-line" style="width: 100%; margin-top: 10px;"></div>
          <div class="mockup-line" style="width: 95%;"></div>
          <div class="mockup-line" style="width: 80%;"></div>
          <div class="mockup-line" style="width: 100%; margin-top: 8px;"></div>
          <div class="mockup-line" style="width: 70%;"></div>
        </div>
        <div class="template-card-info">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <h5>${t.name}</h5>
            <span class="brand-badge">${t.badge}</span>
          </div>
          <p>${t.description}</p>
        </div>
      `;

      card.addEventListener('click', () => {
        appState.applyTemplate(t.id);
        backdrop.classList.add('hidden');
        this.showToast(`Applied ${t.name} template!`, 'success');
      });

      grid.appendChild(card);
    });

    backdrop.classList.remove('hidden');
  }

  openStampsModal() {
    const backdrop = document.getElementById('stamps-modal-backdrop');
    const grid = document.getElementById('stamps-grid-container');
    grid.innerHTML = '';

    const stampsList = [
      { text: 'VERIFIED', color: '#4f46e5', border: '#4f46e5', bg: 'rgba(79, 70, 229, 0.08)' },
      { text: 'APPROVED', color: '#059669', border: '#059669', bg: 'rgba(5, 150, 105, 0.08)' },
      { text: 'CONFIDENTIAL', color: '#dc2626', border: '#dc2626', bg: 'rgba(220, 38, 38, 0.08)' },
      { text: 'OFFICIAL COPY', color: '#0284c7', border: '#0284c7', bg: 'rgba(2, 132, 199, 0.08)' },
      { text: 'CERTIFIED', color: '#d97706', border: '#d97706', bg: 'rgba(217, 119, 6, 0.08)' },
      { text: 'DRAFT', color: '#64748b', border: '#64748b', bg: 'rgba(100, 116, 139, 0.08)' }
    ];

    stampsList.forEach(s => {
      const btn = document.createElement('button');
      btn.style.padding = '14px';
      btn.style.border = `2.5px dashed ${s.border}`;
      btn.style.borderRadius = '8px';
      btn.style.background = s.bg;
      btn.style.color = s.color;
      btn.style.fontWeight = '800';
      btn.style.letterSpacing = '2px';
      btn.style.fontSize = '14px';
      btn.style.cursor = 'pointer';
      btn.style.transform = 'rotate(-3deg)';
      btn.textContent = s.text;

      btn.addEventListener('click', () => {
        // Render stamp to data URL
        const canvas = document.createElement('canvas');
        canvas.width = 240;
        canvas.height = 80;
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = s.border;
        ctx.lineWidth = 4;
        ctx.strokeRect(10, 10, 220, 60);
        ctx.fillStyle = s.color;
        ctx.font = 'bold 22px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(s.text, 120, 40);

        appState.addElement({
          type: 'stamp',
          x: 540,
          y: 900,
          width: 160,
          height: 54,
          src: canvas.toDataURL('image/png'),
          rotation: -5
        });

        backdrop.classList.add('hidden');
        this.showToast(`Stamp "${s.text}" placed!`, 'success');
      });

      grid.appendChild(btn);
    });

    backdrop.classList.remove('hidden');
  }

  async handleUploadPDF(file) {
    const progressModal = document.getElementById('progress-modal-backdrop');
    const progressBar = document.getElementById('progress-bar-fill');
    const progressTitle = document.getElementById('progress-title');
    const progressDesc = document.getElementById('progress-desc');

    progressModal.classList.remove('hidden');
    progressBar.style.width = '5%';
    progressTitle.textContent = `Reading ${file.name}...`;

    try {
      await PDFEngine.loadPDFFile(file, (percent, msg) => {
        progressBar.style.width = `${percent}%`;
        progressDesc.textContent = msg;
      });

      document.getElementById('doc-title-input').value = appState.state.docTitle;
      setTimeout(() => {
        progressModal.classList.add('hidden');
        this.showToast(`Loaded ${file.name} successfully!`, 'success');
      }, 400);
    } catch (err) {
      console.error(err);
      progressModal.classList.add('hidden');
      alert(`Could not process PDF: ${err.message || 'Corrupted or unsupported PDF'}`);
    }
  }

  async handleDownloadPDF() {
    const title = appState.state.docTitle || 'Resume';
    const filename = `${title}.pdf`;

    this.showToast('Generating high-res printable PDF...', 'info');

    try {
      await PDFEngine.exportToPDF(filename);

      // Trigger celebratory confetti burst!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      this.showToast(`Downloaded ${filename} successfully!`, 'success');
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to generate PDF. Please try again.');
    }
  }

  updatePageIndicator() {
    const cur = appState.state.currentPageIndex + 1;
    const total = appState.state.pages.length;
    document.getElementById('page-indicator-text').textContent = `Page ${cur} of ${total}`;
  }

  updateZoomLabel() {
    const pct = Math.round(appState.state.zoom * 100);
    document.getElementById('zoom-label-text').textContent = `${pct}%`;
  }

  updateHistoryButtons({ canUndo, canRedo }) {
    document.getElementById('btn-undo').style.opacity = canUndo ? '1' : '0.4';
    document.getElementById('btn-undo').style.pointerEvents = canUndo ? 'auto' : 'none';

    document.getElementById('btn-redo').style.opacity = canRedo ? '1' : '0.4';
    document.getElementById('btn-redo').style.pointerEvents = canRedo ? 'auto' : 'none';
  }

  flashAutosave() {
    const textEl = document.getElementById('autosave-text');
    if (textEl) {
      textEl.textContent = 'Saved';
      setTimeout(() => {
        textEl.textContent = 'Auto-saved';
      }, 2000);
    }
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
