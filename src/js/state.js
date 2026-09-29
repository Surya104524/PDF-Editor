// State management with full undo/redo and event publishing
import { compileSuryaResumePages, SURYA_RESUME_DATA, RESUME_TEMPLATES } from './templates.js';

class AppState {
  constructor() {
    this.listeners = new Set();
    this.history = [];
    this.historyIndex = -1;
    this.maxHistory = 35;

    // Initialize with Surya R's exact 2-page resume
    const initialPages = compileSuryaResumePages(SURYA_RESUME_DATA);

    this.state = {
      docTitle: 'Surya_R_Angular_Developer_Resume',
      activeTool: 'select',
      shapeSubtype: 'rect',
      penColor: '#0f172a',
      penWidth: 2,
      highlighterColor: 'rgba(250, 204, 21, 0.4)',
      highlighterWidth: 16,
      zoom: 1.0,
      minZoom: 0.3,
      maxZoom: 2.5,
      showGrid: false,
      showRulers: true,
      snapToGrid: false,
      gridSize: 20,
      activeView: 'canvas',
      theme: 'dark',
      currentPageIndex: 0,
      selectedElementIds: [],
      clipboard: null,
      resumeData: JSON.parse(JSON.stringify(SURYA_RESUME_DATA)),
      currentTemplateId: 'surya-exact',
      pages: initialPages
    };

    // Save initial state to history
    this.pushHistory('Loaded Surya R Resume');
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event, payload) {
    for (const listener of this.listeners) {
      try {
        listener(event, payload, this.state);
      } catch (err) {
        console.error('State listener error:', err);
      }
    }
    this.debouncedSave();
  }

  debouncedSave() {
    if (this._saveTimeout) clearTimeout(this._saveTimeout);
    this._saveTimeout = setTimeout(() => {
      try {
        const payload = {
          docTitle: this.state.docTitle,
          pages: this.state.pages,
          resumeData: this.state.resumeData,
          currentTemplateId: this.state.currentTemplateId
        };
        localStorage.setItem('resumecraft_project_save', JSON.stringify(payload));
        this.notify('autosaved', { time: new Date() });
      } catch (e) {
        console.warn('LocalStorage save failed:', e);
      }
    }, 1000);
  }

  loadFromLocalStorage() {
    try {
      const raw = localStorage.getItem('resumecraft_project_save');
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && saved.pages && saved.pages.length) {
          this.state.docTitle = saved.docTitle || 'Surya_R_Resume';
          this.state.pages = saved.pages;
          if (saved.resumeData) this.state.resumeData = saved.resumeData;
          if (saved.currentTemplateId) this.state.currentTemplateId = saved.currentTemplateId;
          this.state.currentPageIndex = 0;
          this.state.selectedElementIds = [];
          this.history = [];
          this.historyIndex = -1;
          this.pushHistory('Loaded Saved Session');
          this.notify('docLoaded', null);
          return true;
        }
      }
    } catch (e) {
      console.warn('Failed to load autosave:', e);
    }
    return false;
  }

  loadSuryaResume() {
    this.state.docTitle = 'Surya_R_Angular_Developer_Resume';
    this.state.resumeData = JSON.parse(JSON.stringify(SURYA_RESUME_DATA));
    this.state.currentTemplateId = 'surya-exact';
    this.state.pages = compileSuryaResumePages(SURYA_RESUME_DATA);
    this.state.currentPageIndex = 0;
    this.state.selectedElementIds = [];
    this.pushHistory("Loaded Surya R's Exact Resume");
    this.notify('docLoaded', null);
    this.notify('pagesListChanged', this.state.pages);
    this.notify('pageChanged', this.currentPage());
    this.notify('resumeDataUpdated', this.state.resumeData);
    this.notify('renderNeeded', null);
  }

  pushHistory(description = 'Change') {
    const snapshot = JSON.stringify({
      pages: this.state.pages,
      currentPageIndex: this.state.currentPageIndex,
      resumeData: this.state.resumeData
    });

    if (this.historyIndex >= 0 && this.history[this.historyIndex]?.snapshot === snapshot) {
      return;
    }

    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    this.history.push({ snapshot, description, time: Date.now() });
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }

    this.notify('historyChanged', { canUndo: this.canUndo(), canRedo: this.canRedo() });
  }

  canUndo() {
    return this.historyIndex > 0;
  }

  canRedo() {
    return this.historyIndex < this.history.length - 1;
  }

  undo() {
    if (!this.canUndo()) return;
    this.historyIndex--;
    const entry = this.history[this.historyIndex];
    const data = JSON.parse(entry.snapshot);
    this.state.pages = data.pages;
    this.state.currentPageIndex = Math.min(data.currentPageIndex, data.pages.length - 1);
    if (data.resumeData) this.state.resumeData = data.resumeData;
    this.state.selectedElementIds = [];
    this.notify('undo', { description: entry.description });
    this.notify('pageChanged', this.currentPage());
    this.notify('historyChanged', { canUndo: this.canUndo(), canRedo: this.canRedo() });
    this.notify('pagesListChanged', this.state.pages);
  }

  redo() {
    if (!this.canRedo()) return;
    this.historyIndex++;
    const entry = this.history[this.historyIndex];
    const data = JSON.parse(entry.snapshot);
    this.state.pages = data.pages;
    this.state.currentPageIndex = Math.min(data.currentPageIndex, data.pages.length - 1);
    if (data.resumeData) this.state.resumeData = data.resumeData;
    this.state.selectedElementIds = [];
    this.notify('redo', { description: entry.description });
    this.notify('pageChanged', this.currentPage());
    this.notify('historyChanged', { canUndo: this.canUndo(), canRedo: this.canRedo() });
    this.notify('pagesListChanged', this.state.pages);
  }

  currentPage() {
    return this.state.pages[this.state.currentPageIndex] || this.state.pages[0];
  }

  selectElement(id, multi = false) {
    if (!id) {
      this.state.selectedElementIds = [];
    } else if (multi) {
      const idx = this.state.selectedElementIds.indexOf(id);
      if (idx >= 0) {
        this.state.selectedElementIds.splice(idx, 1);
      } else {
        this.state.selectedElementIds.push(id);
      }
    } else {
      this.state.selectedElementIds = [id];
    }
    this.notify('selectionChanged', this.getSelectedElements());
  }

  getSelectedElements() {
    const page = this.currentPage();
    return page.elements.filter(el => this.state.selectedElementIds.includes(el.id));
  }

  getFirstSelectedElement() {
    const selected = this.getSelectedElements();
    return selected.length ? selected[0] : null;
  }

  updateElement(id, patch, recordHistory = true) {
    const page = this.currentPage();
    const el = page.elements.find(e => e.id === id);
    if (el) {
      Object.assign(el, patch);
      if (recordHistory) {
        this.pushHistory(`Update ${el.type}`);
      }
      this.notify('elementUpdated', el);
    }
  }

  updateSelectedElements(patch, description = 'Update element') {
    const page = this.currentPage();
    let updated = false;
    page.elements.forEach(el => {
      if (this.state.selectedElementIds.includes(el.id)) {
        Object.assign(el, patch);
        updated = true;
      }
    });
    if (updated) {
      this.pushHistory(description);
      this.notify('elementsUpdated', this.getSelectedElements());
    }
  }

  addElement(element, recordHistory = true) {
    const page = this.currentPage();
    if (!element.id) {
      element.id = `el_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    }
    page.elements.push(element);
    this.selectElement(element.id, false);
    if (recordHistory) {
      this.pushHistory(`Add ${element.type}`);
    }
    this.notify('elementAdded', element);
    return element;
  }

  deleteSelectedElements() {
    if (!this.state.selectedElementIds.length) return;
    const page = this.currentPage();
    const count = this.state.selectedElementIds.length;
    page.elements = page.elements.filter(el => !this.state.selectedElementIds.includes(el.id));
    this.state.selectedElementIds = [];
    this.pushHistory(`Delete ${count} item(s)`);
    this.notify('selectionChanged', []);
    this.notify('renderNeeded', null);
  }

  duplicateSelectedElements() {
    const selected = this.getSelectedElements();
    if (!selected.length) return;
    const page = this.currentPage();
    const newIds = [];
    selected.forEach(el => {
      const copy = JSON.parse(JSON.stringify(el));
      copy.id = `el_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      copy.x += 20;
      copy.y += 20;
      page.elements.push(copy);
      newIds.push(copy.id);
    });
    this.state.selectedElementIds = newIds;
    this.pushHistory(`Duplicate ${selected.length} item(s)`);
    this.notify('selectionChanged', this.getSelectedElements());
    this.notify('renderNeeded', null);
  }

  bringForward() {
    const el = this.getFirstSelectedElement();
    if (!el) return;
    const page = this.currentPage();
    const idx = page.elements.indexOf(el);
    if (idx < page.elements.length - 1) {
      page.elements.splice(idx, 1);
      page.elements.splice(idx + 1, 0, el);
      this.pushHistory('Bring Forward');
      this.notify('renderNeeded', null);
    }
  }

  sendBackward() {
    const el = this.getFirstSelectedElement();
    if (!el) return;
    const page = this.currentPage();
    const idx = page.elements.indexOf(el);
    if (idx > 0) {
      page.elements.splice(idx, 1);
      page.elements.splice(idx - 1, 0, el);
      this.pushHistory('Send Backward');
      this.notify('renderNeeded', null);
    }
  }

  addPage(width = 794, height = 1123, bg = '#ffffff') {
    const newPage = {
      id: `page_${Date.now()}`,
      width,
      height,
      backgroundColor: bg,
      backgroundImage: null,
      elements: []
    };
    this.state.pages.push(newPage);
    this.state.currentPageIndex = this.state.pages.length - 1;
    this.state.selectedElementIds = [];
    this.pushHistory('Add Page');
    this.notify('pagesListChanged', this.state.pages);
    this.notify('pageChanged', newPage);
  }

  duplicatePage(index = this.state.currentPageIndex) {
    const page = this.state.pages[index];
    if (!page) return;
    const newPage = JSON.parse(JSON.stringify(page));
    newPage.id = `page_${Date.now()}`;
    newPage.elements.forEach(el => {
      el.id = `el_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    });
    this.state.pages.splice(index + 1, 0, newPage);
    this.state.currentPageIndex = index + 1;
    this.pushHistory('Duplicate Page');
    this.notify('pagesListChanged', this.state.pages);
    this.notify('pageChanged', newPage);
  }

  deletePage(index = this.state.currentPageIndex) {
    if (this.state.pages.length <= 1) return;
    this.state.pages.splice(index, 1);
    this.state.currentPageIndex = Math.min(index, this.state.pages.length - 1);
    this.state.selectedElementIds = [];
    this.pushHistory('Delete Page');
    this.notify('pagesListChanged', this.state.pages);
    this.notify('pageChanged', this.currentPage());
  }

  setPageIndex(index) {
    if (index >= 0 && index < this.state.pages.length) {
      this.state.currentPageIndex = index;
      this.state.selectedElementIds = [];
      this.notify('pageChanged', this.currentPage());
    }
  }

  setTool(tool) {
    this.state.activeTool = tool;
    this.notify('toolChanged', tool);
  }

  setZoom(zoom) {
    this.state.zoom = Math.max(this.state.minZoom, Math.min(this.state.maxZoom, zoom));
    this.notify('zoomChanged', this.state.zoom);
  }

  applyTemplate(templateId) {
    const tpl = RESUME_TEMPLATES.find(t => t.id === templateId) || RESUME_TEMPLATES[0];
    this.state.currentTemplateId = templateId;
    this.state.resumeData = JSON.parse(JSON.stringify(tpl.data));
    const newPages = compileSuryaResumePages(this.state.resumeData);
    this.state.pages = newPages;
    this.state.currentPageIndex = 0;
    this.state.selectedElementIds = [];
    this.pushHistory(`Apply ${tpl.name}`);
    this.notify('templateApplied', tpl);
    this.notify('pagesListChanged', this.state.pages);
    this.notify('pageChanged', this.currentPage());
    this.notify('resumeDataUpdated', this.state.resumeData);
    this.notify('renderNeeded', null);
  }

  syncFormData(updatedResumeData) {
    this.state.resumeData = updatedResumeData;
    const newPages = compileSuryaResumePages(updatedResumeData);
    // Preserve any custom annotations / whiteouts the user added
    newPages.forEach((np, idx) => {
      const existingPage = this.state.pages[idx];
      if (existingPage) {
        const extraElements = existingPage.elements.filter(
          e => !e.id.startsWith('p1_') && !e.id.startsWith('p2_')
        );
        np.elements.push(...extraElements);
      }
    });

    this.state.pages = newPages;
    this.pushHistory('Update Resume Form');
    this.notify('renderNeeded', null);
  }
}

export const appState = new AppState();
