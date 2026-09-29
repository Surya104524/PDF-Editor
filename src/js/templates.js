// Resume Templates with realistic professional data and layout compilers

export const SURYA_RESUME_DATA = {
  personal: {
    name: 'SURYA R',
    title: 'Senior Angular Developer | Frontend Engineer | TypeScript',
    email: 'rsurya2702@gmail.com',
    phone: '(+91) 7867848478',
    location: 'Chennai, Tamilnadu, India',
    linkedin: 'Surya R',
    website: '',
    github: '',
    avatar: ''
  },
  summary: 'Results-driven Frontend Engineer with 3+ years of experience building enterprise-grade Angular applications for financial and agri-tech platforms. Proficient in TypeScript, RxJS, state management, and RESTful API integrations. Proven ability to lead frontend teams, architect scalable UIs, and deliver features that improve operational efficiency. Skilled in Full stack development with Java, Spring boot, and Postgresql, enabling end-to-end full-stack contribution.',
  skillsObj: {
    languages: 'TypeScript, JavaScript, HTML5, CSS3, Java, SQL',
    frontend: 'Angular (v12–19), Angular Signals, RxJS, Reactive Forms, Lazy Loading, Route Guards, HTTP Interceptors, WebSockets, Pipes, Directives',
    backend: 'Spring Boot, RESTful API Design',
    stateManagement: 'RxJS Observables, Async Pipes, Component Communication Patterns',
    databases: 'PostgreSQL, SQL',
    tools: 'Git, GitHub, GitLab, Postman, VS Code',
    concepts: 'Component-based Architecture, Dependency Injection, CRUD Operations, Agile/Scrum, Code Reviews, Sprint Planning'
  },
  experience: [
    {
      title: 'Software Developer – Full Stack',
      company: 'KiVi – Agrosperity',
      period: 'Nov 2022–Present',
      location: 'Chennai, India',
      highlights: [
        'Mentored junior developers on Angular best practices, actively participated in code reviews and sprint planning, and contributed to improving code quality, reducing review turnaround time by approximately 30%.',
        'Engineered an end-to-end Onboarding Application with multi-language (Translate Service) and real-time document validation (WebSocket), accelerating customer loan onboarding by ~25%.',
        'Built a Collections Module supporting cash and online payment tracking with full loan lifecycle management, serving 10,000+ loan records.',
        'Developed secure API integrations using HTTP interceptors, robust error handling, and optimized state management with RxJS, cutting average API error rate by ~20%.',
        'Implemented advanced Angular features: RxJS, Promises, Lazy Loading, Route Guards, Reactive Forms, Pipes, Directives, and Child Routes for across 5 enterprise applications.',
        'Pioneered adoption of Angular Signals for high-performance reactive features, improving change detection efficiency and reducing unnecessary re-renders.',
        'Collaborated with backend team to co-design scalable RESTful APIs (Spring Boot + PostgreSQL), ensuring seamless frontend-backend integration across Onboarding, OPS, Credit, and FRM modules.',
        'Delivered responsive, cross-browser UIs using Angular, TypeScript, HTML5, and CSS3 across all enterprise platforms.'
      ]
    }
  ],
  projects: [
    {
      name: 'Onboarding Application',
      desc: 'Designed and developed core onboarding modules for a loan management platform. Implemented multi-language support via a custom Translate Service and real-time document validation using WebSocket integration. Built the Collections module to track cash and online payments with complete loan lifecycle visibility.'
    },
    {
      name: 'OPS – Operations Platform',
      desc: 'Built customer detail and document verification modules enabling operational teams to approve or reject applications and track progress via interactive dashboards with real-time status updates.'
    },
    {
      name: 'Credit Application',
      desc: 'Created credit evaluation and loan approval modules for agri-farmers, integrating auth interceptors, reactive form validations, and routing strategies for seamless workflow with OPS and FRM platforms.'
    },
    {
      name: 'FRM – Farmer Relationship Manager',
      desc: 'Developed loan disbursement tracking and approval workflow features, maintaining data accuracy and validations across integrated OPS and Credit application pipelines.'
    }
  ],
  education: [
    {
      degree: 'Bachelor of Science – Computer Science',
      school: 'Kamaraj College of Arts&Science, Thoothukudi, Tamil Nadu',
      period: '2017 – 2020',
      honors: ''
    }
  ]
};

export const RESUME_TEMPLATES = [
  {
    id: 'surya-exact',
    name: 'Surya R — Exact Resume (2 Pages)',
    description: 'Exact replica of your 2-page Angular & Full-Stack Developer resume with navy blue headers and classic layout.',
    badge: 'My Resume',
    accentColor: '#1e3a8a',
    data: SURYA_RESUME_DATA
  },
  {
    id: 'tech-lead',
    name: 'Tech Lead / Senior Developer',
    description: 'Modern, high-impact technical resume tailored for senior engineers and team leads.',
    badge: 'Popular',
    accentColor: '#4f46e5',
    data: {
      personal: {
        name: 'Alex Morgan',
        title: 'Senior Full-Stack Engineer & Cloud Architect',
        email: 'alex.morgan@devforge.io',
        phone: '+1 (555) 234-5678',
        location: 'San Francisco, CA (Remote)',
        website: 'alexmorgan.dev',
        linkedin: 'linkedin.com/in/alexmorgan-dev',
        github: 'github.com/alexm-cloud',
        avatar: ''
      },
      summary: 'Results-driven Senior Software Engineer with 8+ years designing scalable microservices, high-throughput distributed systems, and modern web applications.',
      experience: [
        {
          title: 'Senior Staff Engineer / Tech Lead',
          company: 'Nexus Cloud Technologies',
          period: '2021 - Present',
          location: 'San Francisco, CA',
          highlights: [
            'Architected high-throughput event processing platform processing 120M+ daily events using Kafka & Go, reducing end-to-end latency by 45%.',
            'Led cross-functional team of 9 engineers across frontend, backend, and DevOps.'
          ]
        }
      ],
      education: [
        {
          degree: 'B.S. in Computer Science',
          school: 'UC Berkeley',
          period: '2012 - 2016',
          honors: 'GPA: 3.89/4.0'
        }
      ],
      skills: ['TypeScript', 'JavaScript', 'React', 'Node.js', 'Go', 'Docker', 'AWS']
    }
  }
];

// Helper to compile Surya R's exact 2-page resume
export function compileSuryaResumePages(customData = null) {
  const d = customData || SURYA_RESUME_DATA;
  let uidCount = 1;
  const uid = (prefix = 'el') => `${prefix}_${Date.now()}_${uidCount++}`;

  const PAGE_W = 794;
  const PAGE_H = 1123;
  const MARGIN_X = 52;
  const CONTENT_W = 690;
  const NAVY = '#1e3a8a';
  const DARK = '#0f172a';
  const GRAY = '#475569';

  // PAGE 1 ELEMENTS
  const page1Elements = [];
  let y = 46;

  // Name
  page1Elements.push({
    id: uid('p1_name'),
    type: 'text',
    x: MARGIN_X,
    y: y,
    width: CONTENT_W,
    height: 38,
    text: d.personal.name || 'SURYA R',
    fontSize: 28,
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: NAVY,
    textAlign: 'center',
    letterSpacing: '1px'
  });
  y += 42;

  // Title
  page1Elements.push({
    id: uid('p1_title'),
    type: 'text',
    x: MARGIN_X,
    y: y,
    width: CONTENT_W,
    height: 22,
    text: d.personal.title,
    fontSize: 13,
    fontFamily: 'Inter',
    fontWeight: 'normal',
    fontStyle: 'italic',
    color: '#334155',
    textAlign: 'center'
  });
  y += 24;

  // Contact line
  const contactText = `${d.personal.phone}  |  ${d.personal.email}  |  LinkedIn: ${d.personal.linkedin}  |  ${d.personal.location}`;
  page1Elements.push({
    id: uid('p1_contact'),
    type: 'text',
    x: MARGIN_X,
    y: y,
    width: CONTENT_W,
    height: 20,
    text: contactText,
    fontSize: 10.5,
    fontFamily: 'Inter',
    fontWeight: 'normal',
    color: GRAY,
    textAlign: 'center'
  });
  y += 34;

  // SECTION: PROFESSIONAL SUMMARY
  page1Elements.push({
    id: uid('p1_sec_summary'),
    type: 'text',
    x: MARGIN_X,
    y: y,
    width: CONTENT_W,
    height: 20,
    text: 'PROFESSIONAL SUMMARY',
    fontSize: 12.5,
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: NAVY,
    textAlign: 'left',
    letterSpacing: '0.5px'
  });
  y += 20;

  page1Elements.push({
    id: uid('p1_line_summary'),
    type: 'shape',
    shapeType: 'line',
    x: MARGIN_X,
    y: y,
    width: CONTENT_W,
    height: 2,
    stroke: NAVY,
    strokeWidth: 2,
    opacity: 1
  });
  y += 12;

  page1Elements.push({
    id: uid('p1_summary_txt'),
    type: 'text',
    x: MARGIN_X,
    y: y,
    width: CONTENT_W,
    height: 80,
    text: d.summary,
    fontSize: 11,
    fontFamily: 'Inter',
    fontWeight: 'normal',
    color: '#1e293b',
    lineHeight: 1.48,
    textAlign: 'left'
  });
  y += 88;

  // SECTION: TECHNICAL SKILLS
  page1Elements.push({
    id: uid('p1_sec_skills'),
    type: 'text',
    x: MARGIN_X,
    y: y,
    width: CONTENT_W,
    height: 20,
    text: 'TECHNICAL SKILLS',
    fontSize: 12.5,
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: NAVY,
    textAlign: 'left',
    letterSpacing: '0.5px'
  });
  y += 20;

  page1Elements.push({
    id: uid('p1_line_skills'),
    type: 'shape',
    shapeType: 'line',
    x: MARGIN_X,
    y: y,
    width: CONTENT_W,
    height: 2,
    stroke: NAVY,
    strokeWidth: 2,
    opacity: 1
  });
  y += 10;

  const sk = d.skillsObj || {};
  const skillsLines = [
    `Languages: ${sk.languages || 'TypeScript, JavaScript, HTML5, CSS3, Java, SQL'}`,
    `Frontend: ${sk.frontend || 'Angular (v12–19), Angular Signals, RxJS, Reactive Forms, Lazy Loading, Route Guards, HTTP Interceptors, WebSockets, Pipes, Directives'}`,
    `Backend: ${sk.backend || 'Spring Boot, RESTful API Design'}`,
    `State Management: ${sk.stateManagement || 'RxJS Observables, Async Pipes, Component Communication Patterns'}`,
    `Databases: ${sk.databases || 'PostgreSQL, SQL'}`,
    `Tools & Platforms: ${sk.tools || 'Git, GitHub, GitLab, Postman, VS Code'}`,
    `Concepts: ${sk.concepts || 'Component-based Architecture, Dependency Injection, CRUD Operations, Agile/Scrum, Code Reviews, Sprint Planning'}`
  ];

  skillsLines.forEach((sLine) => {
    page1Elements.push({
      id: uid('p1_sk_item'),
      type: 'text',
      x: MARGIN_X,
      y: y,
      width: CONTENT_W,
      height: 22,
      text: sLine,
      fontSize: 10.5,
      fontFamily: 'Inter',
      fontWeight: 'normal',
      color: '#1e293b',
      lineHeight: 1.35,
      textAlign: 'left'
    });
    y += 20;
  });
  y += 12;

  // SECTION: WORK EXPERIENCE
  page1Elements.push({
    id: uid('p1_sec_exp'),
    type: 'text',
    x: MARGIN_X,
    y: y,
    width: CONTENT_W,
    height: 20,
    text: 'WORK EXPERIENCE',
    fontSize: 12.5,
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: NAVY,
    textAlign: 'left',
    letterSpacing: '0.5px'
  });
  y += 20;

  page1Elements.push({
    id: uid('p1_line_exp'),
    type: 'shape',
    shapeType: 'line',
    x: MARGIN_X,
    y: y,
    width: CONTENT_W,
    height: 2,
    stroke: NAVY,
    strokeWidth: 2,
    opacity: 1
  });
  y += 10;

  const exp1 = (d.experience && d.experience[0]) || {};
  page1Elements.push({
    id: uid('p1_exp_title'),
    type: 'text',
    x: MARGIN_X,
    y: y,
    width: 480,
    height: 20,
    text: `${exp1.title || 'Software Developer – Full Stack'} | ${exp1.company || 'KiVi – Agrosperity'}`,
    fontSize: 11.5,
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: DARK,
    textAlign: 'left'
  });

  page1Elements.push({
    id: uid('p1_exp_period'),
    type: 'text',
    x: MARGIN_X + 480,
    y: y,
    width: CONTENT_W - 480,
    height: 20,
    text: exp1.period || 'Nov 2022–Present',
    fontSize: 11,
    fontFamily: 'Inter',
    fontWeight: 'normal',
    fontStyle: 'italic',
    color: '#334155',
    textAlign: 'right'
  });
  y += 22;

  (exp1.highlights || []).forEach((bullet) => {
    page1Elements.push({
      id: uid('p1_exp_bullet'),
      type: 'text',
      x: MARGIN_X + 8,
      y: y,
      width: CONTENT_W - 8,
      height: 32,
      text: `• ${bullet}`,
      fontSize: 10.5,
      fontFamily: 'Inter',
      fontWeight: 'normal',
      color: '#1e293b',
      lineHeight: 1.35,
      textAlign: 'left'
    });
    y += 33;
  });
  y += 6;

  // SECTION: KEY PROJECTS (Starts on page 1)
  page1Elements.push({
    id: uid('p1_sec_proj'),
    type: 'text',
    x: MARGIN_X,
    y: y,
    width: CONTENT_W,
    height: 20,
    text: 'KEY PROJECTS',
    fontSize: 12.5,
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: NAVY,
    textAlign: 'left',
    letterSpacing: '0.5px'
  });
  y += 20;

  page1Elements.push({
    id: uid('p1_line_proj'),
    type: 'shape',
    shapeType: 'line',
    x: MARGIN_X,
    y: y,
    width: CONTENT_W,
    height: 2,
    stroke: NAVY,
    strokeWidth: 2,
    opacity: 1
  });
  y += 10;

  const proj1 = (d.projects && d.projects[0]) || { name: 'Onboarding Application', desc: '' };
  page1Elements.push({
    id: uid('p1_proj1_title'),
    type: 'text',
    x: MARGIN_X,
    y: y,
    width: CONTENT_W,
    height: 20,
    text: proj1.name,
    fontSize: 11.5,
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: DARK,
    textAlign: 'left'
  });
  y += 20;

  page1Elements.push({
    id: uid('p1_proj1_desc'),
    type: 'text',
    x: MARGIN_X,
    y: y,
    width: CONTENT_W,
    height: 48,
    text: proj1.desc,
    fontSize: 10.5,
    fontFamily: 'Inter',
    fontWeight: 'normal',
    color: '#1e293b',
    lineHeight: 1.4,
    textAlign: 'left'
  });

  // PAGE 2 ELEMENTS
  const page2Elements = [];
  let y2 = 46;

  // Projects continuation on Page 2
  const otherProjects = (d.projects || []).slice(1);
  otherProjects.forEach((proj) => {
    page2Elements.push({
      id: uid('p2_proj_title'),
      type: 'text',
      x: MARGIN_X,
      y: y2,
      width: CONTENT_W,
      height: 20,
      text: proj.name,
      fontSize: 11.5,
      fontFamily: 'Inter',
      fontWeight: 'bold',
      color: DARK,
      textAlign: 'left'
    });
    y2 += 20;

    page2Elements.push({
      id: uid('p2_proj_desc'),
      type: 'text',
      x: MARGIN_X,
      y: y2,
      width: CONTENT_W,
      height: 48,
      text: proj.desc,
      fontSize: 10.5,
      fontFamily: 'Inter',
      fontWeight: 'normal',
      color: '#1e293b',
      lineHeight: 1.4,
      textAlign: 'left'
    });
    y2 += 54;
  });

  y2 += 16;

  // SECTION: EDUCATION
  page2Elements.push({
    id: uid('p2_sec_edu'),
    type: 'text',
    x: MARGIN_X,
    y: y2,
    width: CONTENT_W,
    height: 20,
    text: 'EDUCATION',
    fontSize: 12.5,
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: NAVY,
    textAlign: 'left',
    letterSpacing: '0.5px'
  });
  y2 += 20;

  page2Elements.push({
    id: uid('p2_line_edu'),
    type: 'shape',
    shapeType: 'line',
    x: MARGIN_X,
    y: y2,
    width: CONTENT_W,
    height: 2,
    stroke: NAVY,
    strokeWidth: 2,
    opacity: 1
  });
  y2 += 12;

  const edu1 = (d.education && d.education[0]) || { degree: 'Bachelor of Science – Computer Science', school: 'Kamaraj College of Arts&Science, Thoothukudi, Tamil Nadu', period: '2017 – 2020' };

  page2Elements.push({
    id: uid('p2_edu_degree'),
    type: 'text',
    x: MARGIN_X,
    y: y2,
    width: 480,
    height: 20,
    text: edu1.degree,
    fontSize: 11.5,
    fontFamily: 'Inter',
    fontWeight: 'bold',
    color: DARK,
    textAlign: 'left'
  });

  page2Elements.push({
    id: uid('p2_edu_period'),
    type: 'text',
    x: MARGIN_X + 480,
    y: y2,
    width: CONTENT_W - 480,
    height: 20,
    text: edu1.period,
    fontSize: 11,
    fontFamily: 'Inter',
    fontWeight: 'normal',
    fontStyle: 'italic',
    color: '#334155',
    textAlign: 'right'
  });
  y2 += 22;

  page2Elements.push({
    id: uid('p2_edu_school'),
    type: 'text',
    x: MARGIN_X,
    y: y2,
    width: CONTENT_W,
    height: 20,
    text: edu1.school,
    fontSize: 10.5,
    fontFamily: 'Inter',
    fontWeight: 'normal',
    color: GRAY,
    textAlign: 'left'
  });

  return [
    {
      id: 'page_1',
      width: PAGE_W,
      height: PAGE_H,
      backgroundColor: '#ffffff',
      backgroundImage: null,
      elements: page1Elements
    },
    {
      id: 'page_2',
      width: PAGE_W,
      height: PAGE_H,
      backgroundColor: '#ffffff',
      backgroundImage: null,
      elements: page2Elements
    }
  ];
}

export function compileTemplateToElements(templateId, customData = null) {
  if (templateId === 'surya-exact') {
    const pages = compileSuryaResumePages(customData);
    return pages[0].elements;
  }
  const pages = compileSuryaResumePages(customData);
  return pages[0].elements;
}
