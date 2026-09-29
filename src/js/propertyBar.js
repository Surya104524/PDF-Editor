// Contextual Properties Bar (Adapts to Text, Shape, Image, Signature, Whiteout)
import { appState } from './state.js';
import { icons } from './icons.js';

export class PropertyBar {
  constructor(containerEl) {
    this.containerEl = containerEl;
    this.init();
  }

  init() {
    appState.subscribe((event, payload) => {
      if (['selectionChanged', 'elementUpdated', 'elementsUpdated', 'pageChanged'].includes(event)) {
        this.render();
      }
    });
    this.render();
  }

  render() {
    const el = appState.getFirstSelectedElement();
    const container = this.containerEl;
    container.innerHTML = '';

    if (!el) {
      // Empty state / Page properties
      container.innerHTML = `
        <div class="prop-group page-info-group">
          <span class="prop-label">Page:</span>
          <span class="prop-badge">A4 Portrait (794 × 1123)</span>
          <span class="prop-divider"></span>
          <span class="prop-hint">Click any element on page to edit properties, or drag from tools</span>
        </div>
      `;
      return;
    }

    if (el.type === 'text') {
      this.renderTextProperties(el);
    } else if (el.type === 'shape') {
      this.renderShapeProperties(el);
    } else if (el.type === 'whiteout') {
      this.renderWhiteoutProperties(el);
    } else if (el.type === 'image' || el.type === 'signature' || el.type === 'stamp') {
      this.renderImageProperties(el);
    } else {
      this.renderGenericProperties(el);
    }

    // Common actions (Layers, Duplicate, Delete)
    this.appendCommonActions(el);
  }

  renderTextProperties(el) {
    const group = document.createElement('div');
    group.className = 'prop-group';

    // Font Family dropdown
    const fontSelect = document.createElement('select');
    fontSelect.className = 'prop-select font-select';
    const fonts = [
      'Inter', 'Roboto', 'Outfit', 'Montserrat',
      'Playfair Display', 'Merriweather', 'JetBrains Mono', 'Courier New'
    ];
    fonts.forEach(f => {
      const opt = document.createElement('option');
      opt.value = f;
      opt.textContent = f;
      if (el.fontFamily === f) opt.selected = true;
      fontSelect.appendChild(opt);
    });
    fontSelect.addEventListener('change', (e) => {
      appState.updateSelectedElements({ fontFamily: e.target.value }, 'Change Font Family');
    });

    // Font Size input & buttons
    const sizeWrapper = document.createElement('div');
    sizeWrapper.className = 'prop-size-wrapper';
    sizeWrapper.innerHTML = `
      <button class="icon-btn prop-btn-step" id="dec-font-size" title="Decrease Size">-</button>
      <input type="number" class="prop-num-input" id="prop-font-size-val" min="8" max="96" value="${el.fontSize || 12}">
      <button class="icon-btn prop-btn-step" id="inc-font-size" title="Increase Size">+</button>
    `;

    // Bold / Italic / Underline
    const styleGroup = document.createElement('div');
    styleGroup.className = 'prop-btn-group';

    const boldBtn = document.createElement('button');
    boldBtn.className = `icon-btn prop-toggle-btn ${el.fontWeight === 'bold' ? 'active' : ''}`;
    boldBtn.innerHTML = icons.bold;
    boldBtn.title = 'Bold';
    boldBtn.addEventListener('click', () => {
      const isBold = el.fontWeight === 'bold';
      appState.updateSelectedElements({ fontWeight: isBold ? 'normal' : 'bold' }, 'Toggle Bold');
    });

    const italicBtn = document.createElement('button');
    italicBtn.className = `icon-btn prop-toggle-btn ${el.fontStyle === 'italic' ? 'active' : ''}`;
    italicBtn.innerHTML = icons.italic;
    italicBtn.title = 'Italic';
    italicBtn.addEventListener('click', () => {
      const isItalic = el.fontStyle === 'italic';
      appState.updateSelectedElements({ fontStyle: isItalic ? 'normal' : 'italic' }, 'Toggle Italic');
    });

    const underlineBtn = document.createElement('button');
    underlineBtn.className = `icon-btn prop-toggle-btn ${el.underline ? 'active' : ''}`;
    underlineBtn.innerHTML = icons.underline;
    underlineBtn.title = 'Underline';
    underlineBtn.addEventListener('click', () => {
      appState.updateSelectedElements({ underline: !el.underline }, 'Toggle Underline');
    });

    styleGroup.appendChild(boldBtn);
    styleGroup.appendChild(italicBtn);
    styleGroup.appendChild(underlineBtn);

    // Color Pickers
    const colorGroup = document.createElement('div');
    colorGroup.className = 'prop-color-group';

    const textColorLabel = document.createElement('label');
    textColorLabel.title = 'Text Color';
    textColorLabel.innerHTML = `
      <span class="color-picker-indicator" style="background:${el.color || '#0f172a'}">A</span>
      <input type="color" class="hidden-color-input" value="${this.rgbToHex(el.color) || '#0f172a'}">
    `;
    const colorInput = textColorLabel.querySelector('input');
    colorInput.addEventListener('input', (e) => {
      appState.updateSelectedElements({ color: e.target.value }, 'Change Text Color');
      textColorLabel.querySelector('.color-picker-indicator').style.background = e.target.value;
    });

    colorGroup.appendChild(textColorLabel);

    // Text Align
    const alignGroup = document.createElement('div');
    alignGroup.className = 'prop-btn-group';

    ['left', 'center', 'right'].forEach(align => {
      const btn = document.createElement('button');
      btn.className = `icon-btn prop-toggle-btn ${el.textAlign === align ? 'active' : ''}`;
      btn.innerHTML = align === 'left' ? icons.alignLeft : align === 'center' ? icons.alignCenter : icons.alignRight;
      btn.title = `Align ${align}`;
      btn.addEventListener('click', () => {
        appState.updateSelectedElements({ textAlign: align }, `Align ${align}`);
      });
      alignGroup.appendChild(btn);
    });

    group.appendChild(fontSelect);
    group.appendChild(sizeWrapper);
    group.appendChild(styleGroup);
    group.appendChild(colorGroup);
    group.appendChild(alignGroup);
    this.containerEl.appendChild(group);

    // Size events
    const sizeVal = sizeWrapper.querySelector('#prop-font-size-val');
    sizeVal.addEventListener('change', (e) => {
      appState.updateSelectedElements({ fontSize: parseInt(e.target.value) || 12 }, 'Change Font Size');
    });
    sizeWrapper.querySelector('#dec-font-size').addEventListener('click', () => {
      const cur = el.fontSize || 12;
      if (cur > 8) appState.updateSelectedElements({ fontSize: cur - 1 }, 'Decrease Font Size');
    });
    sizeWrapper.querySelector('#inc-font-size').addEventListener('click', () => {
      const cur = el.fontSize || 12;
      appState.updateSelectedElements({ fontSize: cur + 1 }, 'Increase Font Size');
    });
  }

  renderShapeProperties(el) {
    const group = document.createElement('div');
    group.className = 'prop-group';

    group.innerHTML = `
      <div class="prop-color-group">
        <label title="Fill Color">
          <span class="prop-label-sm">Fill:</span>
          <span class="color-picker-swatch" style="background:${el.fill || '#e0e7ff'}"></span>
          <input type="color" class="hidden-color-input" id="shape-fill-input" value="${this.rgbToHex(el.fill) || '#e0e7ff'}">
        </label>
      </div>

      <div class="prop-color-group">
        <label title="Stroke Color">
          <span class="prop-label-sm">Stroke:</span>
          <span class="color-picker-swatch" style="background:${el.stroke || '#4f46e5'}"></span>
          <input type="color" class="hidden-color-input" id="shape-stroke-input" value="${this.rgbToHex(el.stroke) || '#4f46e5'}">
        </label>
      </div>

      <div class="prop-size-wrapper">
        <span class="prop-label-sm">Border:</span>
        <input type="number" class="prop-num-input" id="shape-border-width" min="0" max="20" value="${el.strokeWidth || 1}">
        <span class="prop-unit">px</span>
      </div>

      ${el.shapeType === 'rect' ? `
        <div class="prop-size-wrapper">
          <span class="prop-label-sm">Radius:</span>
          <input type="number" class="prop-num-input" id="shape-border-radius" min="0" max="50" value="${el.borderRadius || 0}">
          <span class="prop-unit">px</span>
        </div>
      ` : ''}
    `;

    this.containerEl.appendChild(group);

    // Events
    group.querySelector('#shape-fill-input').addEventListener('input', (e) => {
      appState.updateSelectedElements({ fill: e.target.value }, 'Change Fill Color');
    });
    group.querySelector('#shape-stroke-input').addEventListener('input', (e) => {
      appState.updateSelectedElements({ stroke: e.target.value }, 'Change Stroke Color');
    });
    group.querySelector('#shape-border-width').addEventListener('change', (e) => {
      appState.updateSelectedElements({ strokeWidth: parseInt(e.target.value) || 0 }, 'Change Border Width');
    });
    const radInput = group.querySelector('#shape-border-radius');
    if (radInput) {
      radInput.addEventListener('change', (e) => {
        appState.updateSelectedElements({ borderRadius: parseInt(e.target.value) || 0 }, 'Change Border Radius');
      });
    }
  }

  renderWhiteoutProperties(el) {
    const group = document.createElement('div');
    group.className = 'prop-group';

    group.innerHTML = `
      <div class="prop-color-group">
        <label title="Cover Color">
          <span class="prop-label-sm">Color:</span>
          <span class="color-picker-swatch" style="background:${el.fill || '#ffffff'}"></span>
          <input type="color" class="hidden-color-input" id="whiteout-fill-input" value="${this.rgbToHex(el.fill) || '#ffffff'}">
        </label>
      </div>
      <button class="btn btn-secondary btn-sm" id="btn-quick-white">Pure White (#FFF)</button>
      <button class="btn btn-secondary btn-sm" id="btn-quick-offwhite">Off-White (#F8FAFC)</button>
    `;

    this.containerEl.appendChild(group);

    group.querySelector('#whiteout-fill-input').addEventListener('input', (e) => {
      appState.updateSelectedElements({ fill: e.target.value }, 'Change Whiteout Color');
    });
    group.querySelector('#btn-quick-white').addEventListener('click', () => {
      appState.updateSelectedElements({ fill: '#ffffff' }, 'Pure White Redaction');
    });
    group.querySelector('#btn-quick-offwhite').addEventListener('click', () => {
      appState.updateSelectedElements({ fill: '#f8fafc' }, 'Off-White Redaction');
    });
  }

  renderImageProperties(el) {
    const group = document.createElement('div');
    group.className = 'prop-group';

    group.innerHTML = `
      <div class="prop-btn-group">
        <button class="btn btn-secondary btn-sm" id="btn-circle-crop" title="Circle Avatar">Circle Crop</button>
        <button class="btn btn-secondary btn-sm" id="btn-round-crop" title="Rounded Corners">Rounded</button>
        <button class="btn btn-secondary btn-sm" id="btn-square-crop" title="Square">Square</button>
      </div>
      <div class="prop-size-wrapper">
        <span class="prop-label-sm">Opacity:</span>
        <input type="range" id="prop-opacity-slider" min="0.1" max="1" step="0.05" value="${el.opacity !== undefined ? el.opacity : 1}">
      </div>
    `;

    this.containerEl.appendChild(group);

    group.querySelector('#btn-circle-crop').addEventListener('click', () => {
      appState.updateSelectedElements({ borderRadius: Math.min(el.width, el.height) / 2 }, 'Circle Crop Image');
    });
    group.querySelector('#btn-round-crop').addEventListener('click', () => {
      appState.updateSelectedElements({ borderRadius: 12 }, 'Round Image Corners');
    });
    group.querySelector('#btn-square-crop').addEventListener('click', () => {
      appState.updateSelectedElements({ borderRadius: 0 }, 'Square Image Corners');
    });
    group.querySelector('#prop-opacity-slider').addEventListener('input', (e) => {
      appState.updateSelectedElements({ opacity: parseFloat(e.target.value) }, 'Change Opacity');
    });
  }

  renderGenericProperties(el) {
    const group = document.createElement('div');
    group.className = 'prop-group';
    group.innerHTML = `
      <span class="prop-label">Element:</span>
      <span class="prop-badge">${el.type.toUpperCase()}</span>
    `;
    this.containerEl.appendChild(group);
  }

  appendCommonActions(el) {
    const group = document.createElement('div');
    group.className = 'prop-group prop-actions-group';

    group.innerHTML = `
      <span class="prop-divider"></span>
      <button class="icon-btn prop-action-btn" id="prop-bring-forward" title="Bring Forward">${icons.bringForward}</button>
      <button class="icon-btn prop-action-btn" id="prop-send-backward" title="Send Backward">${icons.sendBackward}</button>
      <button class="icon-btn prop-action-btn" id="prop-duplicate" title="Duplicate (Ctrl+D)">${icons.duplicate}</button>
      <button class="icon-btn prop-action-btn btn-danger" id="prop-delete" title="Delete (Del)">${icons.delete}</button>
    `;

    this.containerEl.appendChild(group);

    group.querySelector('#prop-bring-forward').addEventListener('click', () => appState.bringForward());
    group.querySelector('#prop-send-backward').addEventListener('click', () => appState.sendBackward());
    group.querySelector('#prop-duplicate').addEventListener('click', () => appState.duplicateSelectedElements());
    group.querySelector('#prop-delete').addEventListener('click', () => appState.deleteSelectedElements());
  }

  rgbToHex(col) {
    if (!col) return '#000000';
    if (col.startsWith('#')) return col.slice(0, 7);
    return '#000000';
  }
}
