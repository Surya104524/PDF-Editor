// Digital Signature Creator Modal (Draw, Type, Upload)
import { appState } from './state.js';

export class SignatureModal {
  constructor() {
    this.modalEl = null;
    this.activeTab = 'draw'; // 'draw' | 'type' | 'upload'
    this.penColor = '#0f172a';
    this.penWidth = 2.5;
    this.selectedFont = "'Dancing Script', cursive";
    this.isDrawing = false;
    this.drawCanvas = null;
    this.drawCtx = null;
    this.hasDrawn = false;
    this.init();
  }

  init() {
    this.createDOM();
    this.attachEvents();
  }

  createDOM() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-backdrop hidden';
    overlay.id = 'signature-modal-backdrop';

    overlay.innerHTML = `
      <div class="modal-card signature-modal">
        <div class="modal-header">
          <div class="modal-title-group">
            <h3>Add Digital Signature</h3>
            <p>Create, draw, or upload a professional signature for your resume/document</p>
          </div>
          <button class="icon-btn close-modal-btn" id="close-sig-btn" title="Close">✕</button>
        </div>

        <div class="sig-tabs">
          <button class="sig-tab active" data-tab="draw">Draw Signature</button>
          <button class="sig-tab" data-tab="type">Type (Cursive Fonts)</button>
          <button class="sig-tab" data-tab="upload">Upload Image</button>
        </div>

        <div class="sig-tab-content">
          <!-- DRAW TAB -->
          <div class="tab-pane active" id="pane-draw">
            <div class="sig-canvas-container">
              <canvas id="sig-pad-canvas" width="600" height="220"></canvas>
              <div class="sig-baseline"></div>
              <div class="sig-hint">Sign above the line using mouse or touch</div>
            </div>
            <div class="sig-controls">
              <div class="sig-ctrl-group">
                <label>Ink Color:</label>
                <div class="color-palette-small">
                  <button class="color-dot active" data-color="#0f172a" style="background:#0f172a;"></button>
                  <button class="color-dot" data-color="#1e3a8a" style="background:#1e3a8a;"></button>
                  <button class="color-dot" data-color="#047857" style="background:#047857;"></button>
                  <button class="color-dot" data-color="#b91c1c" style="background:#b91c1c;"></button>
                </div>
              </div>
              <div class="sig-ctrl-group">
                <label>Stroke Width:</label>
                <input type="range" id="sig-stroke-slider" min="1" max="6" step="0.5" value="2.5">
              </div>
              <button class="btn btn-secondary btn-sm" id="clear-sig-btn">Clear Canvas</button>
            </div>
          </div>

          <!-- TYPE TAB -->
          <div class="tab-pane" id="pane-type">
            <div class="sig-input-group">
              <label>Type your full name or initials:</label>
              <input type="text" id="sig-text-input" placeholder="e.g. Alex Morgan" class="form-input">
            </div>
            <div class="font-preview-grid">
              <div class="font-preview-card active" data-font="'Dancing Script', cursive">
                <span class="font-name">Dancing Script</span>
                <div class="font-sample" style="font-family:'Dancing Script', cursive;">Alex Morgan</div>
              </div>
              <div class="font-preview-card" data-font="'Caveat', cursive">
                <span class="font-name">Caveat</span>
                <div class="font-sample" style="font-family:'Caveat', cursive;">Alex Morgan</div>
              </div>
              <div class="font-preview-card" data-font="'Great Vibes', cursive">
                <span class="font-name">Great Vibes</span>
                <div class="font-sample" style="font-family:'Great Vibes', cursive;">Alex Morgan</div>
              </div>
            </div>
          </div>

          <!-- UPLOAD TAB -->
          <div class="tab-pane" id="pane-upload">
            <div class="upload-dropzone" id="sig-dropzone">
              <div class="upload-icon">✍️</div>
              <p>Drag & drop signature image (PNG, JPG, SVG) here</p>
              <span class="upload-subtext">Transparent background PNG recommended</span>
              <input type="file" id="sig-file-input" accept="image/*" class="hidden">
              <button class="btn btn-outline btn-sm" id="browse-sig-file-btn">Browse File</button>
            </div>
            <div class="sig-upload-preview hidden" id="sig-upload-preview-container">
              <img id="sig-upload-preview-img" src="" alt="Signature Preview">
              <button class="btn btn-secondary btn-sm" id="remove-sig-upload-btn">Remove</button>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" id="cancel-sig-btn">Cancel</button>
          <button class="btn btn-primary" id="insert-sig-btn">Insert Signature</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.modalEl = overlay;

    // Canvas setup
    this.drawCanvas = document.getElementById('sig-pad-canvas');
    this.drawCtx = this.drawCanvas.getContext('2d');
  }

  attachEvents() {
    const closeBtn = document.getElementById('close-sig-btn');
    const cancelBtn = document.getElementById('cancel-sig-btn');
    const insertBtn = document.getElementById('insert-sig-btn');
    const clearBtn = document.getElementById('clear-sig-btn');
    const strokeSlider = document.getElementById('sig-stroke-slider');
    const textInput = document.getElementById('sig-text-input');
    const fileInput = document.getElementById('sig-file-input');
    const browseFileBtn = document.getElementById('browse-sig-file-btn');
    const dropzone = document.getElementById('sig-dropzone');

    closeBtn.addEventListener('click', () => this.hide());
    cancelBtn.addEventListener('click', () => this.hide());

    // Tab switching
    const tabs = this.modalEl.querySelectorAll('.sig-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeTab = tab.dataset.tab;

        this.modalEl.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        document.getElementById(`pane-${this.activeTab}`).classList.add('active');
      });
    });

    // Color buttons
    const colorDots = this.modalEl.querySelectorAll('.color-dot');
    colorDots.forEach(dot => {
      dot.addEventListener('click', () => {
        colorDots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        this.penColor = dot.dataset.color;
      });
    });

    strokeSlider.addEventListener('input', (e) => {
      this.penWidth = parseFloat(e.target.value);
    });

    clearBtn.addEventListener('click', () => this.clearCanvas());

    // Canvas Drawing listeners
    this.setupDrawingPad();

    // Type tab
    textInput.addEventListener('input', (e) => {
      const val = e.target.value || 'Signature';
      this.modalEl.querySelectorAll('.font-sample').forEach(sample => {
        sample.textContent = val;
      });
    });

    const fontCards = this.modalEl.querySelectorAll('.font-preview-card');
    fontCards.forEach(card => {
      card.addEventListener('click', () => {
        fontCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.selectedFont = card.dataset.font;
      });
    });

    // Upload tab
    browseFileBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        this.handleUploadedImage(e.target.files[0]);
      }
    });

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        this.handleUploadedImage(e.dataTransfer.files[0]);
      }
    });

    document.getElementById('remove-sig-upload-btn').addEventListener('click', () => {
      this.uploadedDataUrl = null;
      document.getElementById('sig-upload-preview-container').classList.add('hidden');
      dropzone.classList.remove('hidden');
      fileInput.value = '';
    });

    // Insert button
    insertBtn.addEventListener('click', () => this.handleInsert());
  }

  setupDrawingPad() {
    const canvas = this.drawCanvas;
    const ctx = this.drawCtx;

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height)
      };
    };

    const startDraw = (e) => {
      e.preventDefault();
      this.isDrawing = true;
      this.hasDrawn = true;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.strokeStyle = this.penColor;
      ctx.lineWidth = this.penWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };

    const draw = (e) => {
      if (!this.isDrawing) return;
      e.preventDefault();
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    };

    const endDraw = () => {
      this.isDrawing = false;
    };

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', endDraw);

    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    window.addEventListener('touchend', endDraw);
  }

  clearCanvas() {
    this.drawCtx.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
    this.hasDrawn = false;
  }

  handleUploadedImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.uploadedDataUrl = e.target.result;
      document.getElementById('sig-upload-preview-img').src = this.uploadedDataUrl;
      document.getElementById('sig-upload-preview-container').classList.remove('hidden');
      document.getElementById('sig-dropzone').classList.add('hidden');
    };
    reader.readAsDataURL(file);
  }

  show() {
    this.modalEl.classList.remove('hidden');
    // Pre-fill text input with current user name if available
    const nameInput = document.getElementById('sig-text-input');
    if (nameInput && !nameInput.value && appState.state.resumeData?.personal?.name) {
      nameInput.value = appState.state.resumeData.personal.name;
      this.modalEl.querySelectorAll('.font-sample').forEach(sample => {
        sample.textContent = appState.state.resumeData.personal.name;
      });
    }
  }

  hide() {
    this.modalEl.classList.add('hidden');
  }

  handleInsert() {
    let signatureDataUrl = null;

    if (this.activeTab === 'draw') {
      if (!this.hasDrawn) {
        alert('Please draw your signature first on the canvas.');
        return;
      }
      signatureDataUrl = this.drawCanvas.toDataURL('image/png');
    } else if (this.activeTab === 'type') {
      const text = document.getElementById('sig-text-input').value.trim() || 'Signature';
      const offCanvas = document.createElement('canvas');
      offCanvas.width = 500;
      offCanvas.height = 160;
      const ctx = offCanvas.getContext('2d');
      ctx.font = `56px ${this.selectedFont}`;
      ctx.fillStyle = this.penColor;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillText(text, offCanvas.width / 2, offCanvas.height / 2);
      signatureDataUrl = offCanvas.toDataURL('image/png');
    } else if (this.activeTab === 'upload') {
      if (!this.uploadedDataUrl) {
        alert('Please select or drop a signature image file.');
        return;
      }
      signatureDataUrl = this.uploadedDataUrl;
    }

    if (signatureDataUrl) {
      // Add signature element to current page
      appState.addElement({
        type: 'signature',
        x: 480,
        y: 920,
        width: 190,
        height: 70,
        src: signatureDataUrl,
        opacity: 1
      });
      this.hide();
    }
  }
}
