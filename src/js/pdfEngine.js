// PDF Import (via pdfjs-dist) and Export (via jsPDF & Canvas rasterization)
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { jsPDF } from 'jspdf';
import { appState } from './state.js';

// Setup worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export class PDFEngine {
  /**
   * Import an uploaded PDF file and load all pages into state
   * @param {File} file 
   * @param {Function} onProgress 
   */
  static async loadPDFFile(file, onProgress = () => {}) {
    try {
      onProgress(10, 'Reading file...');
      const arrayBuffer = await file.arrayBuffer();

      onProgress(30, 'Parsing PDF document...');
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      const newPages = [];
      const A4_WIDTH = 794;
      const A4_HEIGHT = 1123;

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        onProgress(30 + Math.round((pageNum / numPages) * 50), `Rendering page ${pageNum} of ${numPages}...`);
        const page = await pdf.getPage(pageNum);

        // Get viewport at 2x scale for crisp retina display
        const unscaledViewport = page.getViewport({ scale: 1 });
        const scale = (A4_WIDTH / unscaledViewport.width) * 2; // 2x DPI
        const viewport = page.getViewport({ scale });

        // Render to canvas
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(viewport.width);
        canvas.height = Math.round(viewport.height);
        const ctx = canvas.getContext('2d', { alpha: false });
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: ctx,
          viewport: viewport
        }).promise;

        const bgDataUrl = canvas.toDataURL('image/jpeg', 0.92);

        // Also extract text annotations for optical overlay editing
        const textContent = await page.getTextContent();
        const extractedElements = [];

        // Scale factors to map PDF coords (pt) to A4 pixel space (794 x 1123)
        const scaleX = A4_WIDTH / unscaledViewport.width;
        const scaleY = A4_HEIGHT / unscaledViewport.height;

        textContent.items.forEach((item, idx) => {
          if (!item.str || !item.str.trim()) return;
          // PDF coords are from bottom-left
          const tx = item.transform[4] * scaleX;
          const ty = A4_HEIGHT - (item.transform[5] * scaleY) - (item.height * scaleY);
          const tw = Math.max(20, (item.width || 40) * scaleX);
          const th = Math.max(14, (item.height || 12) * scaleY);
          const fontSize = Math.max(9, Math.round((item.height || 11) * scaleY * 0.9));

          extractedElements.push({
            id: `imported_txt_${pageNum}_${idx}_${Date.now()}`,
            type: 'text',
            x: Math.round(tx),
            y: Math.round(ty),
            width: Math.round(tw + 8),
            height: Math.round(th + 4),
            text: item.str,
            fontSize: fontSize,
            fontFamily: 'Inter',
            fontWeight: 'normal',
            color: '#0f172a',
            textAlign: 'left',
            isImportedOverlay: true
          });
        });

        newPages.push({
          id: `pdf_page_${pageNum}_${Date.now()}`,
          width: A4_WIDTH,
          height: A4_HEIGHT,
          backgroundColor: '#ffffff',
          backgroundImage: bgDataUrl,
          elements: [] // By default keep elements overlay clean; user can edit on top of background
        });
      }

      onProgress(95, 'Finalizing document...');

      // Clean file name
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
      appState.state.docTitle = cleanTitle || 'Uploaded_Resume';
      appState.state.pages = newPages;
      appState.state.currentPageIndex = 0;
      appState.state.selectedElementIds = [];
      appState.history = [];
      appState.historyIndex = -1;
      appState.pushHistory(`Uploaded ${file.name}`);

      appState.notify('docLoaded', { fileName: file.name, pagesCount: numPages });
      appState.notify('pagesListChanged', newPages);
      appState.notify('pageChanged', newPages[0]);
      onProgress(100, 'Complete!');
      return true;
    } catch (err) {
      console.error('PDF parsing error:', err);
      throw err;
    }
  }

  /**
   * Export the entire document to a high-quality PDF file
   * @param {string} filename 
   * @param {Object} options
   */
  static async exportToPDF(filename = 'Resume.pdf', options = {}) {
    const pages = appState.state.pages;
    if (!pages || !pages.length) return;

    // Standard A4 in points (pt): 595.28 x 841.89 pt
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
      compress: true
    });

    const A4_PT_W = 595.28;
    const A4_PT_H = 841.89;

    for (let i = 0; i < pages.length; i++) {
      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }

      const page = pages[i];
      const pageCanvas = await this.renderPageToHiResCanvas(page, 2.5); // 2.5x retina rendering
      const imgData = pageCanvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', 0, 0, A4_PT_W, A4_PT_H, undefined, 'FAST');
    }

    // Trigger download
    const cleanName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(cleanName);
    return true;
  }

  /**
   * Render a page model to a standalone HTML5 Canvas at custom DPI scale
   * @param {Object} page 
   * @param {number} scale 
   */
  static async renderPageToHiResCanvas(page, scale = 2.0) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(page.width * scale);
    canvas.height = Math.round(page.height * scale);
    const ctx = canvas.getContext('2d');

    // Scale canvas context
    ctx.scale(scale, scale);

    // 1. Draw Page Background Color
    ctx.fillStyle = page.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, page.width, page.height);

    // 2. Draw Background PDF Image if loaded
    if (page.backgroundImage) {
      await new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, page.width, page.height);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = page.backgroundImage;
      });
    }

    // 3. Draw All Canvas Elements in order
    for (const el of page.elements) {
      ctx.save();
      ctx.globalAlpha = el.opacity !== undefined ? el.opacity : 1;

      // Handle rotation if present
      if (el.rotation) {
        const cx = el.x + el.width / 2;
        const cy = el.y + el.height / 2;
        ctx.translate(cx, cy);
        ctx.rotate((el.rotation * Math.PI) / 180);
        ctx.translate(-cx, -cy);
      }

      if (el.type === 'shape') {
        ctx.fillStyle = el.fill || 'transparent';
        ctx.strokeStyle = el.stroke || 'transparent';
        ctx.lineWidth = el.strokeWidth || 1;

        if (el.shapeType === 'rect') {
          const r = el.borderRadius || 0;
          if (r > 0) {
            this._drawRoundRect(ctx, el.x, el.y, el.width, el.height, r);
            if (el.fill && el.fill !== 'transparent') ctx.fill();
            if (el.stroke && el.stroke !== 'transparent' && el.strokeWidth > 0) ctx.stroke();
          } else {
            if (el.fill && el.fill !== 'transparent') ctx.fillRect(el.x, el.y, el.width, el.height);
            if (el.stroke && el.stroke !== 'transparent' && el.strokeWidth > 0) ctx.strokeRect(el.x, el.y, el.width, el.height);
          }
        } else if (el.shapeType === 'circle') {
          ctx.beginPath();
          ctx.ellipse(el.x + el.width / 2, el.y + el.height / 2, el.width / 2, el.height / 2, 0, 0, Math.PI * 2);
          if (el.fill && el.fill !== 'transparent') ctx.fill();
          if (el.stroke && el.stroke !== 'transparent' && el.strokeWidth > 0) ctx.stroke();
        } else if (el.shapeType === 'line') {
          ctx.beginPath();
          ctx.moveTo(el.x, el.y + el.height / 2);
          ctx.lineTo(el.x + el.width, el.y + el.height / 2);
          ctx.stroke();
        }
      } else if (el.type === 'whiteout') {
        // Redact / Whiteout block
        ctx.fillStyle = el.fill || '#ffffff';
        ctx.fillRect(el.x, el.y, el.width, el.height);
        if (el.showBorder) {
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 1;
          ctx.strokeRect(el.x, el.y, el.width, el.height);
        }
      } else if (el.type === 'image' || el.type === 'signature' || el.type === 'stamp') {
        if (el.src) {
          await new Promise(resolve => {
            const img = new Image();
            img.onload = () => {
              const r = el.borderRadius || 0;
              if (r > 0) {
                ctx.save();
                this._drawRoundRect(ctx, el.x, el.y, el.width, el.height, r);
                ctx.clip();
                ctx.drawImage(img, el.x, el.y, el.width, el.height);
                ctx.restore();
              } else {
                ctx.drawImage(img, el.x, el.y, el.width, el.height);
              }
              resolve();
            };
            img.onerror = () => resolve();
            img.src = el.src;
          });
        }
      } else if (el.type === 'drawing') {
        // Freehand path
        if (el.points && el.points.length > 1) {
          ctx.strokeStyle = el.color || '#000000';
          ctx.lineWidth = el.width || 2;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(el.points[0].x, el.points[0].y);
          for (let p = 1; p < el.points.length; p++) {
            ctx.lineTo(el.points[p].x, el.points[p].y);
          }
          ctx.stroke();
        }
      } else if (el.type === 'text') {
        // Crisp Text rendering with word-wrapping
        const fontSize = el.fontSize || 12;
        const fontFamily = el.fontFamily || 'Inter, sans-serif';
        const fontWeight = el.fontWeight || 'normal';
        const fontStyle = el.fontStyle || 'normal';
        const color = el.color || '#000000';
        const lineHeight = el.lineHeight || 1.35;
        const textAlign = el.textAlign || 'left';

        ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}, sans-serif`;
        ctx.fillStyle = color;
        ctx.textBaseline = 'top';

        // Background highlight if present
        if (el.backgroundColor && el.backgroundColor !== 'transparent') {
          ctx.save();
          ctx.fillStyle = el.backgroundColor;
          ctx.fillRect(el.x, el.y, el.width, el.height);
          ctx.restore();
        }

        const lines = this._wrapText(ctx, el.text || '', el.width);
        const lineSpacing = fontSize * lineHeight;

        lines.forEach((line, lineIdx) => {
          let lx = el.x;
          if (textAlign === 'center') {
            const metrics = ctx.measureText(line);
            lx = el.x + (el.width - metrics.width) / 2;
          } else if (textAlign === 'right') {
            const metrics = ctx.measureText(line);
            lx = el.x + (el.width - metrics.width);
          }
          const ly = el.y + (lineIdx * lineSpacing);
          ctx.fillText(line, lx, ly);

          // Underline support
          if (el.underline) {
            const metrics = ctx.measureText(line);
            ctx.save();
            ctx.strokeStyle = color;
            ctx.lineWidth = Math.max(1, fontSize / 14);
            ctx.beginPath();
            ctx.moveTo(lx, ly + fontSize + 2);
            ctx.lineTo(lx + metrics.width, ly + fontSize + 2);
            ctx.stroke();
            ctx.restore();
          }
        });
      }

      ctx.restore();
    }

    return canvas;
  }

  static _drawRoundRect(ctx, x, y, width, height, radius) {
    radius = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  static _wrapText(ctx, text, maxWidth) {
    if (!text) return [];
    const paragraphs = text.split('\n');
    const resultLines = [];

    paragraphs.forEach(para => {
      if (!para) {
        resultLines.push('');
        return;
      }
      const words = para.split(' ');
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + ' ' + words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth) {
          resultLines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      resultLines.push(currentLine);
    });

    return resultLines;
  }

  /**
   * Export current page as PNG image
   */
  static async exportCurrentPageAsPNG(filename = 'Resume_Page.png') {
    const page = appState.currentPage();
    const canvas = await this.renderPageToHiResCanvas(page, 2.5);
    const link = document.createElement('a');
    link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
}
