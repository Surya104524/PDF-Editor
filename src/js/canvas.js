// Interactive WYSIWYG Canvas Engine for Resume & PDF Editing
import { appState } from './state.js';

export class CanvasEngine {
  constructor(viewportEl) {
    this.viewportEl = viewportEl;
    this.stageEl = null;
    this.pageWrapperEl = null;
    this.bgCanvasEl = null;
    this.elementsLayerEl = null;
    this.drawingCanvasEl = null;
    this.drawingCtx = null;
    this.guideLinesContainer = null;

    // Interaction state
    this.isDragging = false;
    this.isResizing = false;
    this.isRotating = false;
    this.isPanning = false;
    this.isDrawingPath = false;
    this.isCreatingBox = false;

    this.dragStart = { x: 0, y: 0 };
    this.panStart = { x: 0, y: 0 };
    this.activeHandle = null;
    this.initialBounds = null;
    this.currentDrawingPoints = [];
    this.currentCreatingBox = null;

    this.init();
  }

  init() {
    this.createDOM();
    this.attachEventListeners();

    // Subscribe to state updates
    appState.subscribe((event, payload) => {
      if (['pageChanged', 'renderNeeded', 'docLoaded', 'pagesListChanged'].includes(event)) {
        this.render();
      } else if (event === 'selectionChanged') {
        this.updateSelectionUI();
      } else if (event === 'zoomChanged') {
        this.applyZoom();
      } else if (event === 'toolChanged') {
        this.updateCursorForTool();
      }
    });

    this.render();
    this.applyZoom();
  }

  createDOM() {
    this.viewportEl.innerHTML = '';
    this.viewportEl.className = 'canvas-viewport';

    this.stageEl = document.createElement('div');
    this.stageEl.className = 'canvas-stage';

    this.pageWrapperEl = document.createElement('div');
    this.pageWrapperEl.className = 'page-container';
    this.pageWrapperEl.id = 'active-page-container';

    // 1. Background layer
    this.bgCanvasEl = document.createElement('canvas');
    this.bgCanvasEl.className = 'page-background-canvas';

    // 2. Elements layer
    this.elementsLayerEl = document.createElement('div');
    this.elementsLayerEl.className = 'page-elements-layer';

    // 3. Freehand drawing canvas overlay
    this.drawingCanvasEl = document.createElement('canvas');
    this.drawingCanvasEl.className = 'page-drawing-canvas';
    this.drawingCtx = this.drawingCanvasEl.getContext('2d');

    // 4. Smart guides container
    this.guideLinesContainer = document.createElement('div');
    this.guideLinesContainer.className = 'smart-guides-container';

    this.pageWrapperEl.appendChild(this.bgCanvasEl);
    this.pageWrapperEl.appendChild(this.elementsLayerEl);
    this.pageWrapperEl.appendChild(this.drawingCanvasEl);
    this.pageWrapperEl.appendChild(this.guideLinesContainer);
    this.stageEl.appendChild(this.pageWrapperEl);
    this.viewportEl.appendChild(this.stageEl);
  }

  applyZoom() {
    const zoom = appState.state.zoom;
    this.stageEl.style.transform = `scale(${zoom})`;
    this.stageEl.style.transformOrigin = 'center top';
  }

  updateCursorForTool() {
    const tool = appState.state.activeTool;
    this.pageWrapperEl.classList.remove(
      'tool-cursor-select', 'tool-cursor-text', 'tool-cursor-whiteout',
      'tool-cursor-pen', 'tool-cursor-highlighter', 'tool-cursor-shape'
    );
    this.pageWrapperEl.classList.add(`tool-cursor-${tool}`);

    // If pen/highlighter is active, pointer-events on drawing canvas
    if (tool === 'pen' || tool === 'highlighter') {
      this.drawingCanvasEl.style.pointerEvents = 'auto';
    } else {
      this.drawingCanvasEl.style.pointerEvents = 'none';
    }
  }

  render() {
    const page = appState.currentPage();
    if (!page) return;

    const w = page.width || 794;
    const h = page.height || 1123;

    this.pageWrapperEl.style.width = `${w}px`;
    this.pageWrapperEl.style.height = `${h}px`;

    // 1. Render Background
    this.bgCanvasEl.width = w;
    this.bgCanvasEl.height = h;
    const ctx = this.bgCanvasEl.getContext('2d');
    ctx.fillStyle = page.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, w, h);

    if (page.backgroundImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, w, h);
      };
      img.src = page.backgroundImage;
    }

    // Also resize drawing canvas
    this.drawingCanvasEl.width = w;
    this.drawingCanvasEl.height = h;

    // 2. Render Elements Layer
    this.elementsLayerEl.innerHTML = '';
    const selectedIds = appState.state.selectedElementIds;

    page.elements.forEach((el, index) => {
      const elNode = this.createElementNode(el);
      if (selectedIds.includes(el.id)) {
        elNode.classList.add('selected');
        this.attachHandles(elNode, el);
      }
      this.elementsLayerEl.appendChild(elNode);
    });

    this.updateCursorForTool();
  }

  createElementNode(el) {
    const node = document.createElement('div');
    node.className = `canvas-element el-${el.type}`;
    node.id = `el_dom_${el.id}`;
    node.dataset.elementId = el.id;

    node.style.left = `${el.x}px`;
    node.style.top = `${el.y}px`;
    node.style.width = `${el.width}px`;
    node.style.height = `${el.height}px`;
    node.style.opacity = el.opacity !== undefined ? el.opacity : 1;

    if (el.rotation) {
      node.style.transform = `rotate(${el.rotation}deg)`;
    }

    if (el.type === 'text') {
      node.style.fontSize = `${el.fontSize || 12}px`;
      node.style.fontFamily = `${el.fontFamily || 'Inter'}, sans-serif`;
      node.style.fontWeight = el.fontWeight || 'normal';
      node.style.fontStyle = el.fontStyle || 'normal';
      node.style.color = el.color || '#0f172a';
      node.style.textAlign = el.textAlign || 'left';
      node.style.lineHeight = el.lineHeight || 1.35;
      if (el.underline) node.style.textDecoration = 'underline';
      if (el.backgroundColor) node.style.backgroundColor = el.backgroundColor;
      if (el.letterSpacing) node.style.letterSpacing = el.letterSpacing;

      const content = document.createElement('div');
      content.className = 'text-content';
      content.textContent = el.text || '';
      node.appendChild(content);

    } else if (el.type === 'shape') {
      node.style.backgroundColor = el.fill || 'transparent';
      node.style.borderColor = el.stroke || 'transparent';
      node.style.borderWidth = `${el.strokeWidth || 0}px`;
      node.style.borderStyle = el.stroke && el.strokeWidth > 0 ? (el.borderStyle || 'solid') : 'none';

      if (el.shapeType === 'rect') {
        node.style.borderRadius = `${el.borderRadius || 0}px`;
      } else if (el.shapeType === 'circle') {
        node.style.borderRadius = '50%';
      } else if (el.shapeType === 'line') {
        node.style.borderTop = `${el.strokeWidth || 2}px solid ${el.stroke || '#e2e8f0'}`;
        node.style.backgroundColor = 'transparent';
        node.style.height = '0px';
      }

    } else if (el.type === 'whiteout') {
      node.style.backgroundColor = el.fill || '#ffffff';
      node.style.boxShadow = '0 0 0 1px rgba(203, 213, 225, 0.4)';

    } else if (el.type === 'image' || el.type === 'signature' || el.type === 'stamp') {
      const img = document.createElement('img');
      img.src = el.src || '';
      img.alt = el.type;
      img.draggable = false;
      if (el.borderRadius) img.style.borderRadius = `${el.borderRadius}px`;
      if (el.border) img.style.border = el.border;
      node.appendChild(img);

    } else if (el.type === 'drawing') {
      // SVG path representation for crisp display & moving
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', el.width);
      svg.setAttribute('height', el.height);
      svg.style.overflow = 'visible';

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      if (el.points && el.points.length > 1) {
        const d = el.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x - el.x} ${p.y - el.y}`).join(' ');
        path.setAttribute('d', d);
        path.setAttribute('stroke', el.color || '#000000');
        path.setAttribute('stroke-width', el.width || 2);
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        path.setAttribute('fill', 'none');
        svg.appendChild(path);
      }
      node.appendChild(svg);
    }

    return node;
  }

  attachHandles(node, el) {
    const handles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
    handles.forEach(pos => {
      const h = document.createElement('div');
      h.className = `resize-handle handle-${pos}`;
      h.dataset.handle = pos;
      node.appendChild(h);
    });

    // Rotation handle at top
    const rot = document.createElement('div');
    rot.className = 'rotate-handle';
    rot.title = 'Drag to Rotate';
    node.appendChild(rot);

    // Delete badge quick action
    const del = document.createElement('div');
    del.className = 'quick-action-badge quick-delete';
    del.innerHTML = '✕';
    del.title = 'Delete (Del)';
    del.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      appState.deleteSelectedElements();
    });
    node.appendChild(del);
  }

  updateSelectionUI() {
    const selectedIds = appState.state.selectedElementIds;
    const allNodes = this.elementsLayerEl.querySelectorAll('.canvas-element');
    allNodes.forEach(n => {
      const id = n.dataset.elementId;
      const el = appState.currentPage()?.elements.find(e => e.id === id);
      if (selectedIds.includes(id)) {
        if (!n.classList.contains('selected')) {
          n.classList.add('selected');
          if (el) this.attachHandles(n, el);
        }
      } else {
        if (n.classList.contains('selected')) {
          n.classList.remove('selected');
          n.querySelectorAll('.resize-handle, .rotate-handle, .quick-action-badge').forEach(h => h.remove());
        }
      }
    });
  }

  attachEventListeners() {
    const viewport = this.viewportEl;
    const pageWrapper = this.pageWrapperEl;

    // Viewport panning (Space + Click drag or middle click)
    viewport.addEventListener('mousedown', (e) => {
      if (e.target === viewport || e.target === this.stageEl || e.button === 1 || e.spaceKey) {
        if (e.button === 0 || e.button === 1) {
          this.isPanning = true;
          this.panStart = { x: e.clientX - viewport.scrollLeft, y: e.clientY - viewport.scrollTop };
          viewport.style.cursor = 'grabbing';
          e.preventDefault();
        }
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isPanning) {
        viewport.scrollLeft = this.panStart.x - e.clientX;
        viewport.scrollTop = this.panStart.y - e.clientY;
      }
    });

    window.addEventListener('mouseup', () => {
      if (this.isPanning) {
        this.isPanning = false;
        viewport.style.cursor = 'default';
      }
    });

    // Page interactions (Click, Drag, Resize, Draw, Box creation)
    pageWrapper.addEventListener('mousedown', (e) => this.handlePageMouseDown(e));
    window.addEventListener('mousemove', (e) => this.handleWindowMouseMove(e));
    window.addEventListener('mouseup', (e) => this.handleWindowMouseUp(e));

    // Double click to inline edit text
    pageWrapper.addEventListener('dblclick', (e) => this.handlePageDoubleClick(e));

    // Keyboard shortcuts for delete, undo, redo, arrows
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));

    // Mouse wheel zoom when Ctrl/Cmd is pressed
    viewport.addEventListener('wheel', (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        appState.setZoom(appState.state.zoom + delta);
      }
    }, { passive: false });
  }

  getCanvasPoint(e) {
    const rect = this.pageWrapperEl.getBoundingClientRect();
    const zoom = appState.state.zoom;
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom
    };
  }

  handlePageMouseDown(e) {
    const tool = appState.state.activeTool;
    const pt = this.getCanvasPoint(e);

    // 1. FREEHAND PEN / HIGHLIGHTER
    if (tool === 'pen' || tool === 'highlighter') {
      this.isDrawingPath = true;
      this.currentDrawingPoints = [{ x: pt.x, y: pt.y }];
      this.drawingCtx.beginPath();
      this.drawingCtx.moveTo(pt.x, pt.y);
      this.drawingCtx.strokeStyle = tool === 'highlighter' ? appState.state.highlighterColor : appState.state.penColor;
      this.drawingCtx.lineWidth = tool === 'highlighter' ? appState.state.highlighterWidth : appState.state.penWidth;
      this.drawingCtx.lineCap = 'round';
      this.drawingCtx.lineJoin = 'round';
      return;
    }

    // 2. CREATING TEXT BOX OR WHITEOUT BOX ON DRAG
    if (tool === 'text' || tool === 'whiteout' || tool === 'shape') {
      this.isCreatingBox = true;
      this.dragStart = pt;
      this.currentCreatingBox = {
        tool,
        startX: pt.x,
        startY: pt.y,
        x: pt.x,
        y: pt.y,
        width: 1,
        height: 1
      };
      return;
    }

    // 3. SELECTION / DRAG / RESIZE (Select tool)
    const resizeHandle = e.target.closest('.resize-handle');
    const rotateHandle = e.target.closest('.rotate-handle');
    const elementNode = e.target.closest('.canvas-element');

    if (rotateHandle) {
      e.stopPropagation();
      this.isRotating = true;
      const el = appState.getFirstSelectedElement();
      if (el) {
        const cx = el.x + el.width / 2;
        const cy = el.y + el.height / 2;
        this.rotateCenter = { cx, cy };
      }
      return;
    }

    if (resizeHandle) {
      e.stopPropagation();
      this.isResizing = true;
      this.activeHandle = resizeHandle.dataset.handle;
      const el = appState.getFirstSelectedElement();
      if (el) {
        this.initialBounds = { x: el.x, y: el.y, width: el.width, height: el.height };
        this.dragStart = pt;
      }
      return;
    }

    if (elementNode) {
      const id = elementNode.dataset.elementId;
      const isMulti = e.shiftKey;
      if (!appState.state.selectedElementIds.includes(id)) {
        appState.selectElement(id, isMulti);
      }
      this.isDragging = true;
      this.dragStart = pt;
      this.initialElementPositions = appState.getSelectedElements().map(el => ({
        id: el.id,
        x: el.x,
        y: el.y
      }));
      return;
    }

    // Clicked on empty canvas background -> deselect
    appState.selectElement(null);
  }

  handleWindowMouseMove(e) {
    const pt = this.getCanvasPoint(e);

    // Freehand drawing in progress
    if (this.isDrawingPath) {
      this.currentDrawingPoints.push({ x: pt.x, y: pt.y });
      this.drawingCtx.lineTo(pt.x, pt.y);
      this.drawingCtx.stroke();
      return;
    }

    // Box creation in progress (Text / Whiteout / Shape)
    if (this.isCreatingBox && this.currentCreatingBox) {
      const sx = this.currentCreatingBox.startX;
      const sy = this.currentCreatingBox.startY;
      const x = Math.min(sx, pt.x);
      const y = Math.min(sy, pt.y);
      const w = Math.abs(pt.x - sx);
      const h = Math.abs(pt.y - sy);
      this.currentCreatingBox.x = x;
      this.currentCreatingBox.y = y;
      this.currentCreatingBox.width = w;
      this.currentCreatingBox.height = h;

      // Render temporary preview box
      let prevBox = document.getElementById('temp-creating-box');
      if (!prevBox) {
        prevBox = document.createElement('div');
        prevBox.id = 'temp-creating-box';
        prevBox.className = 'temp-box-preview';
        this.pageWrapperEl.appendChild(prevBox);
      }
      prevBox.style.left = `${x}px`;
      prevBox.style.top = `${y}px`;
      prevBox.style.width = `${w}px`;
      prevBox.style.height = `${h}px`;
      return;
    }

    // Dragging elements
    if (this.isDragging && this.initialElementPositions) {
      const dx = pt.x - this.dragStart.x;
      const dy = pt.y - this.dragStart.y;

      const page = appState.currentPage();
      this.initialElementPositions.forEach(item => {
        const el = page.elements.find(e => e.id === item.id);
        if (el) {
          el.x = Math.round(item.x + dx);
          el.y = Math.round(item.y + dy);

          // Update DOM node directly for silky 60fps performance
          const domNode = document.getElementById(`el_dom_${el.id}`);
          if (domNode) {
            domNode.style.left = `${el.x}px`;
            domNode.style.top = `${el.y}px`;
          }
        }
      });
      return;
    }

    // Resizing element
    if (this.isResizing && this.initialBounds) {
      const el = appState.getFirstSelectedElement();
      if (!el) return;

      const dx = pt.x - this.dragStart.x;
      const dy = pt.y - this.dragStart.y;
      const b = this.initialBounds;
      const handle = this.activeHandle;

      let newX = b.x;
      let newY = b.y;
      let newW = b.width;
      let newH = b.height;

      if (handle.includes('e')) newW = Math.max(20, b.width + dx);
      if (handle.includes('s')) newH = Math.max(16, b.height + dy);
      if (handle.includes('w')) {
        const candidateW = b.width - dx;
        if (candidateW > 20) {
          newW = candidateW;
          newX = b.x + dx;
        }
      }
      if (handle.includes('n')) {
        const candidateH = b.height - dy;
        if (candidateH > 16) {
          newH = candidateH;
          newY = b.y + dy;
        }
      }

      el.x = Math.round(newX);
      el.y = Math.round(newY);
      el.width = Math.round(newW);
      el.height = Math.round(newH);

      const domNode = document.getElementById(`el_dom_${el.id}`);
      if (domNode) {
        domNode.style.left = `${el.x}px`;
        domNode.style.top = `${el.y}px`;
        domNode.style.width = `${el.width}px`;
        domNode.style.height = `${el.height}px`;
      }
      return;
    }

    // Rotating element
    if (this.isRotating && this.rotateCenter) {
      const el = appState.getFirstSelectedElement();
      if (!el) return;
      const rad = Math.atan2(pt.y - this.rotateCenter.cy, pt.x - this.rotateCenter.cx);
      let deg = Math.round((rad * 180) / Math.PI) + 90;
      if (deg < 0) deg += 360;
      // Snap to 45 deg if shift held
      if (e.shiftKey) deg = Math.round(deg / 45) * 45;
      el.rotation = deg;

      const domNode = document.getElementById(`el_dom_${el.id}`);
      if (domNode) {
        domNode.style.transform = `rotate(${deg}deg)`;
      }
    }
  }

  handleWindowMouseUp(e) {
    // 1. Finish Drawing
    if (this.isDrawingPath) {
      this.isDrawingPath = false;
      this.drawingCtx.clearRect(0, 0, this.drawingCanvasEl.width, this.drawingCanvasEl.height);

      if (this.currentDrawingPoints.length > 2) {
        // Calculate bounding box of the drawn path
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        this.currentDrawingPoints.forEach(p => {
          if (p.x < minX) minX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.x > maxX) maxX = p.x;
          if (p.y > maxY) maxY = p.y;
        });

        const pad = 10;
        const tool = appState.state.activeTool;
        appState.addElement({
          type: 'drawing',
          x: Math.round(minX - pad),
          y: Math.round(minY - pad),
          width: Math.round(maxX - minX + pad * 2),
          height: Math.round(maxY - minY + pad * 2),
          points: this.currentDrawingPoints,
          color: tool === 'highlighter' ? appState.state.highlighterColor : appState.state.penColor,
          width: tool === 'highlighter' ? appState.state.highlighterWidth : appState.state.penWidth,
          opacity: tool === 'highlighter' ? 0.6 : 1
        });
      }
      this.currentDrawingPoints = [];
      return;
    }

    // 2. Finish Creating Box
    if (this.isCreatingBox && this.currentCreatingBox) {
      this.isCreatingBox = false;
      const b = this.currentCreatingBox;
      document.getElementById('temp-creating-box')?.remove();

      // Ensure minimum size
      const minW = b.tool === 'text' ? 140 : 40;
      const minH = b.tool === 'text' ? 36 : 24;
      const finalW = Math.max(minW, b.width);
      const finalH = Math.max(minH, b.height);

      if (b.tool === 'text') {
        appState.addElement({
          type: 'text',
          x: Math.round(b.x),
          y: Math.round(b.y),
          width: Math.round(finalW),
          height: Math.round(finalH),
          text: 'Type your text here...',
          fontSize: 14,
          fontFamily: 'Inter',
          fontWeight: 'normal',
          color: '#0f172a',
          textAlign: 'left'
        });
      } else if (b.tool === 'whiteout') {
        appState.addElement({
          type: 'whiteout',
          x: Math.round(b.x),
          y: Math.round(b.y),
          width: Math.round(finalW),
          height: Math.round(finalH),
          fill: '#ffffff',
          showBorder: false
        });
      } else if (b.tool === 'shape') {
        appState.addElement({
          type: 'shape',
          shapeType: appState.state.shapeSubtype || 'rect',
          x: Math.round(b.x),
          y: Math.round(b.y),
          width: Math.round(finalW),
          height: Math.round(finalH),
          fill: '#e0e7ff',
          stroke: '#4f46e5',
          strokeWidth: 2,
          borderRadius: 6
        });
      }

      // Switch back to select tool for immediate usability
      appState.setTool('select');
      this.currentCreatingBox = null;
      return;
    }

    // 3. Record Drag/Resize/Rotate into History
    if (this.isDragging) {
      this.isDragging = false;
      this.initialElementPositions = null;
      appState.pushHistory('Move Element');
      appState.notify('renderNeeded', null);
    }

    if (this.isResizing) {
      this.isResizing = false;
      this.initialBounds = null;
      this.activeHandle = null;
      appState.pushHistory('Resize Element');
      appState.notify('renderNeeded', null);
    }

    if (this.isRotating) {
      this.isRotating = false;
      this.rotateCenter = null;
      appState.pushHistory('Rotate Element');
      appState.notify('renderNeeded', null);
    }
  }

  handlePageDoubleClick(e) {
    const elNode = e.target.closest('.canvas-element.el-text');
    if (!elNode) return;

    const id = elNode.dataset.elementId;
    const el = appState.currentPage()?.elements.find(item => item.id === id);
    if (!el) return;

    const textContent = elNode.querySelector('.text-content');
    if (!textContent) return;

    // Enable in-place editing
    textContent.contentEditable = 'true';
    textContent.focus();

    // Select all text
    const range = document.createRange();
    range.selectNodeContents(textContent);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    const onBlur = () => {
      textContent.contentEditable = 'false';
      const newText = textContent.innerText;
      if (newText !== el.text) {
        el.text = newText;
        appState.pushHistory('Edit Text');
        appState.notify('elementUpdated', el);
      }
      textContent.removeEventListener('blur', onBlur);
      textContent.removeEventListener('keydown', onKeyDown);
    };

    const onKeyDown = (ke) => {
      if (ke.key === 'Escape') {
        textContent.blur();
      }
    };

    textContent.addEventListener('blur', onBlur);
    textContent.addEventListener('keydown', onKeyDown);
  }

  handleKeyDown(e) {
    // If typing in input or contentEditable, do not capture tool shortcuts
    if (e.target.matches('input, textarea, [contenteditable="true"]')) {
      return;
    }

    // Delete / Backspace
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      appState.deleteSelectedElements();
      return;
    }

    // Ctrl+Z / Ctrl+Y (Undo / Redo)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        appState.redo();
      } else {
        appState.undo();
      }
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      appState.redo();
      return;
    }

    // Ctrl+D (Duplicate)
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      appState.duplicateSelectedElements();
      return;
    }

    // Arrow keys nudge
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      const selected = appState.getSelectedElements();
      if (selected.length) {
        e.preventDefault();
        const delta = e.shiftKey ? 10 : 1;
        selected.forEach(el => {
          if (e.key === 'ArrowLeft') el.x -= delta;
          if (e.key === 'ArrowRight') el.x += delta;
          if (e.key === 'ArrowUp') el.y -= delta;
          if (e.key === 'ArrowDown') el.y += delta;
        });
        appState.pushHistory('Nudge Element');
        appState.notify('renderNeeded', null);
      }
    }
  }
}
