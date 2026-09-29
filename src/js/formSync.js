// Resume Form Builder & Live Visual Sync Module
import { appState } from './state.js';
import { icons } from './icons.js';

export class ResumeFormSync {
  constructor(containerEl) {
    this.containerEl = containerEl;
    this.init();
  }

  init() {
    this.render();

    appState.subscribe((event) => {
      if (['resumeDataUpdated', 'docLoaded'].includes(event)) {
        this.render();
      }
    });
  }

  render() {
    const data = appState.state.resumeData || {};
    const p = data.personal || {};
    const sk = data.skillsObj || {};

    this.containerEl.innerHTML = `
      <div class="resume-form-wrapper">
        <div class="form-header-banner">
          <div>
            <h4>Surya R — Resume Content Editor</h4>
            <p>Edit any section below. Changes sync directly to the 2-page visual PDF canvas.</p>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-sync-to-canvas">
            ${icons.sparkles} Apply to Canvas
          </button>
        </div>

        <form id="resume-main-form" class="resume-form">
          <!-- 1. PERSONAL DETAILS -->
          <div class="form-accordion-section active">
            <div class="form-section-header">
              <span class="section-icon">${icons.user}</span>
              <h5>Personal Details & Header</h5>
            </div>
            <div class="form-section-body">
              <div class="form-row">
                <div class="form-field">
                  <label>Full Name</label>
                  <input type="text" name="name" class="form-input" value="${p.name || ''}" placeholder="SURYA R">
                </div>
                <div class="form-field">
                  <label>Job Title / Headline</label>
                  <input type="text" name="title" class="form-input" value="${p.title || ''}" placeholder="Senior Angular Developer | Frontend Engineer | TypeScript">
                </div>
              </div>

              <div class="form-row">
                <div class="form-field">
                  <label>Phone Number</label>
                  <input type="text" name="phone" class="form-input" value="${p.phone || ''}" placeholder="(+91) 7867848478">
                </div>
                <div class="form-field">
                  <label>Email Address</label>
                  <input type="email" name="email" class="form-input" value="${p.email || ''}" placeholder="rsurya2702@gmail.com">
                </div>
              </div>

              <div class="form-row">
                <div class="form-field">
                  <label>LinkedIn</label>
                  <input type="text" name="linkedin" class="form-input" value="${p.linkedin || ''}" placeholder="Surya R">
                </div>
                <div class="form-field">
                  <label>Location</label>
                  <input type="text" name="location" class="form-input" value="${p.location || ''}" placeholder="Chennai, Tamilnadu, India">
                </div>
              </div>
            </div>
          </div>

          <!-- 2. PROFESSIONAL SUMMARY -->
          <div class="form-accordion-section active">
            <div class="form-section-header">
              <span class="section-icon">${icons.fileText}</span>
              <h5>Professional Summary</h5>
            </div>
            <div class="form-section-body">
              <div class="form-field">
                <textarea name="summary" class="form-textarea" rows="4">${data.summary || ''}</textarea>
              </div>
            </div>
          </div>

          <!-- 3. TECHNICAL SKILLS CATEGORIES -->
          <div class="form-accordion-section active">
            <div class="form-section-header">
              <span class="section-icon">${icons.code}</span>
              <h5>Technical Skills</h5>
            </div>
            <div class="form-section-body">
              <div class="form-field">
                <label>Languages</label>
                <input type="text" name="sk_languages" class="form-input" value="${sk.languages || 'TypeScript, JavaScript, HTML5, CSS3, Java, SQL'}">
              </div>
              <div class="form-field">
                <label>Frontend</label>
                <input type="text" name="sk_frontend" class="form-input" value="${sk.frontend || 'Angular (v12–19), Angular Signals, RxJS, Reactive Forms, Lazy Loading, Route Guards, HTTP Interceptors, WebSockets, Pipes, Directives'}">
              </div>
              <div class="form-field">
                <label>Backend</label>
                <input type="text" name="sk_backend" class="form-input" value="${sk.backend || 'Spring Boot, RESTful API Design'}">
              </div>
              <div class="form-field">
                <label>State Management</label>
                <input type="text" name="sk_stateManagement" class="form-input" value="${sk.stateManagement || 'RxJS Observables, Async Pipes, Component Communication Patterns'}">
              </div>
              <div class="form-field">
                <label>Databases</label>
                <input type="text" name="sk_databases" class="form-input" value="${sk.databases || 'PostgreSQL, SQL'}">
              </div>
              <div class="form-field">
                <label>Tools & Platforms</label>
                <input type="text" name="sk_tools" class="form-input" value="${sk.tools || 'Git, GitHub, GitLab, Postman, VS Code'}">
              </div>
              <div class="form-field">
                <label>Concepts</label>
                <input type="text" name="sk_concepts" class="form-input" value="${sk.concepts || 'Component-based Architecture, Dependency Injection, CRUD Operations, Agile/Scrum, Code Reviews, Sprint Planning'}">
              </div>
            </div>
          </div>

          <!-- 4. WORK EXPERIENCE -->
          <div class="form-accordion-section active">
            <div class="form-section-header">
              <span class="section-icon">${icons.briefcase}</span>
              <h5>Work Experience</h5>
              <button type="button" class="btn btn-secondary btn-xs btn-add-item" id="btn-add-experience">+ Add Role</button>
            </div>
            <div class="form-section-body" id="experience-list-container">
              ${(data.experience || []).map((exp, idx) => `
                <div class="form-item-card" data-index="${idx}">
                  <div class="item-card-header">
                    <span class="item-number">Role #${idx + 1}</span>
                    <button type="button" class="icon-btn btn-delete-item delete-exp-btn" title="Remove Role">✕</button>
                  </div>
                  <div class="form-row">
                    <div class="form-field">
                      <label>Job Title</label>
                      <input type="text" class="form-input exp-title" value="${exp.title || ''}">
                    </div>
                    <div class="form-field">
                      <label>Company</label>
                      <input type="text" class="form-input exp-company" value="${exp.company || ''}">
                    </div>
                  </div>
                  <div class="form-row">
                    <div class="form-field">
                      <label>Period</label>
                      <input type="text" class="form-input exp-period" value="${exp.period || ''}">
                    </div>
                    <div class="form-field">
                      <label>Location</label>
                      <input type="text" class="form-input exp-location" value="${exp.location || ''}">
                    </div>
                  </div>
                  <div class="form-field">
                    <label>Bullet Points (One per line)</label>
                    <textarea class="form-textarea exp-highlights" rows="8">${(exp.highlights || []).join('\n')}</textarea>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 5. KEY PROJECTS -->
          <div class="form-accordion-section active">
            <div class="form-section-header">
              <span class="section-icon">${icons.folder}</span>
              <h5>Key Projects</h5>
              <button type="button" class="btn btn-secondary btn-xs btn-add-item" id="btn-add-project">+ Add Project</button>
            </div>
            <div class="form-section-body" id="project-list-container">
              ${(data.projects || []).map((proj, idx) => `
                <div class="form-item-card" data-index="${idx}">
                  <div class="item-card-header">
                    <span class="item-number">Project #${idx + 1}</span>
                    <button type="button" class="icon-btn btn-delete-item delete-proj-btn" title="Remove Project">✕</button>
                  </div>
                  <div class="form-field">
                    <label>Project Name</label>
                    <input type="text" class="form-input proj-name" value="${proj.name || ''}">
                  </div>
                  <div class="form-field">
                    <label>Description</label>
                    <textarea class="form-textarea proj-desc" rows="3">${proj.desc || ''}</textarea>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 6. EDUCATION -->
          <div class="form-accordion-section active">
            <div class="form-section-header">
              <span class="section-icon">${icons.graduationCap}</span>
              <h5>Education</h5>
            </div>
            <div class="form-section-body" id="education-list-container">
              ${(data.education || []).map((edu, idx) => `
                <div class="form-item-card" data-index="${idx}">
                  <div class="form-row">
                    <div class="form-field">
                      <label>Degree</label>
                      <input type="text" class="form-input edu-degree" value="${edu.degree || ''}">
                    </div>
                    <div class="form-field">
                      <label>Period</label>
                      <input type="text" class="form-input edu-period" value="${edu.period || ''}">
                    </div>
                  </div>
                  <div class="form-field">
                    <label>College / University</label>
                    <input type="text" class="form-input edu-school" value="${edu.school || ''}">
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </form>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const form = document.getElementById('resume-main-form');
    const syncBtn = document.getElementById('btn-sync-to-canvas');
    if (!form) return;

    syncBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      this.collectAndSync();
    });

    let syncTimeout = null;
    form.addEventListener('input', () => {
      if (syncTimeout) clearTimeout(syncTimeout);
      syncTimeout = setTimeout(() => {
        this.collectAndSync(false);
      }, 500);
    });

    // Add Experience
    document.getElementById('btn-add-experience')?.addEventListener('click', () => {
      if (!appState.state.resumeData.experience) appState.state.resumeData.experience = [];
      appState.state.resumeData.experience.push({
        title: 'Software Developer',
        company: 'Company',
        period: '2023 - Present',
        location: 'Location',
        highlights: ['Accomplishment point']
      });
      this.render();
      this.collectAndSync(true);
    });

    this.containerEl.querySelectorAll('.delete-exp-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('.form-item-card');
        const idx = parseInt(card.dataset.index);
        appState.state.resumeData.experience.splice(idx, 1);
        this.render();
        this.collectAndSync(true);
      });
    });

    // Add Project
    document.getElementById('btn-add-project')?.addEventListener('click', () => {
      if (!appState.state.resumeData.projects) appState.state.resumeData.projects = [];
      appState.state.resumeData.projects.push({
        name: 'New Project Application',
        desc: 'Project details and technical implementation summary.'
      });
      this.render();
      this.collectAndSync(true);
    });

    this.containerEl.querySelectorAll('.delete-proj-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = e.target.closest('.form-item-card');
        const idx = parseInt(card.dataset.index);
        appState.state.resumeData.projects.splice(idx, 1);
        this.render();
        this.collectAndSync(true);
      });
    });
  }

  collectAndSync(recordHistory = true) {
    const form = document.getElementById('resume-main-form');
    if (!form) return;

    const fd = new FormData(form);

    const personal = {
      name: fd.get('name') || '',
      title: fd.get('title') || '',
      email: fd.get('email') || '',
      phone: fd.get('phone') || '',
      location: fd.get('location') || '',
      linkedin: fd.get('linkedin') || '',
      website: '',
      github: '',
      avatar: ''
    };

    const summary = fd.get('summary') || '';

    const skillsObj = {
      languages: fd.get('sk_languages') || '',
      frontend: fd.get('sk_frontend') || '',
      backend: fd.get('sk_backend') || '',
      stateManagement: fd.get('sk_stateManagement') || '',
      databases: fd.get('sk_databases') || '',
      tools: fd.get('sk_tools') || '',
      concepts: fd.get('sk_concepts') || ''
    };

    // Experience
    const expCards = this.containerEl.querySelectorAll('#experience-list-container .form-item-card');
    const experience = [];
    expCards.forEach(card => {
      const title = card.querySelector('.exp-title')?.value || '';
      const company = card.querySelector('.exp-company')?.value || '';
      const period = card.querySelector('.exp-period')?.value || '';
      const location = card.querySelector('.exp-location')?.value || '';
      const rawHighlights = card.querySelector('.exp-highlights')?.value || '';
      const highlights = rawHighlights.split('\n').map(s => s.trim()).filter(Boolean);

      experience.push({ title, company, period, location, highlights });
    });

    // Projects
    const projCards = this.containerEl.querySelectorAll('#project-list-container .form-item-card');
    const projects = [];
    projCards.forEach(card => {
      const name = card.querySelector('.proj-name')?.value || '';
      const desc = card.querySelector('.proj-desc')?.value || '';
      projects.push({ name, desc });
    });

    // Education
    const eduCards = this.containerEl.querySelectorAll('#education-list-container .form-item-card');
    const education = [];
    eduCards.forEach(card => {
      const degree = card.querySelector('.edu-degree')?.value || '';
      const school = card.querySelector('.edu-school')?.value || '';
      const period = card.querySelector('.edu-period')?.value || '';
      education.push({ degree, school, period, honors: '' });
    });

    const newResumeData = {
      personal,
      summary,
      skillsObj,
      experience,
      projects,
      education
    };

    appState.syncFormData(newResumeData);
  }
}
