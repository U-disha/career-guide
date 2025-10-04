// Pathfinder – Career Guide (client-only)
// Local-first app using localStorage

(function () {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const ls = {
    get(key, fallback) {
      try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
    },
    set(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  };

  // --- Seed role and skill data ---
  const ROLE_DB = {
    'Data Analyst': {
      tags: ['data', 'math'],
      skills: ['SQL', 'Excel', 'Python', 'Data Visualization', 'Statistics'],
      resources: [
        { title: 'Google Data Analytics', url: 'https://www.coursera.org/professional-certificates/google-data-analytics' },
        { title: 'Mode SQL Tutorial', url: 'https://mode.com/sql-tutorial/' },
        { title: 'Storytelling with Data', url: 'https://www.storytellingwithdata.com/' }
      ]
    },
    'Data Scientist': {
      tags: ['data', 'math', 'research'],
      skills: ['Python', 'ML', 'Statistics', 'Pandas', 'Modeling'],
      resources: [
        { title: 'fast.ai Practical Deep Learning', url: 'https://course.fast.ai/' },
        { title: 'Hands-On ML (book)', url: 'https://www.oreilly.com/library/view/hands-on-machine-learning/9781492032632/' },
        { title: 'Kaggle Learn', url: 'https://www.kaggle.com/learn' }
      ]
    },
    'ML Engineer': {
      tags: ['build', 'data'],
      skills: ['Python', 'ML', 'MLOps', 'Docker', 'APIs'],
      resources: [
        { title: 'Made With ML', url: 'https://madewithml.com/' },
        { title: 'Full Stack Deep Learning', url: 'https://fullstackdeeplearning.com/' },
        { title: 'Coursera MLOps', url: 'https://www.coursera.org/specializations/mlops' }
      ]
    },
    'Frontend Developer': {
      tags: ['design', 'build'],
      skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Accessibility'],
      resources: [
        { title: 'MDN Web Docs', url: 'https://developer.mozilla.org/' },
        { title: 'Frontend Mentor', url: 'https://www.frontendmentor.io/' },
        { title: 'React Beta Docs', url: 'https://react.dev/' }
      ]
    },
    'Backend Developer': {
      tags: ['build'],
      skills: ['APIs', 'Databases', 'Node.js', 'Python', 'Auth'],
      resources: [
        { title: 'SQLBolt', url: 'https://sqlbolt.com/' },
        { title: 'Node.js Docs', url: 'https://nodejs.org/en/docs' },
        { title: 'Designing Data-Intensive Apps', url: 'https://dataintensive.net/' }
      ]
    },
    'Product Manager': {
      tags: ['people', 'organization'],
      skills: ['Roadmapping', 'User Research', 'Communication', 'Analytics', 'Prioritization'],
      resources: [
        { title: 'SVPG Articles', url: 'https://www.svpg.com/articles/' },
        { title: 'Reforge Product Strategy', url: 'https://www.reforge.com/' },
        { title: 'Lean Analytics', url: 'https://leananalyticsbook.com/' }
      ]
    },
    'UX Designer': {
      tags: ['design', 'creativity'],
      skills: ['Figma', 'Wireframing', 'User Research', 'Prototyping', 'Accessibility'],
      resources: [
        { title: 'Figma Learn Design', url: 'https://www.figma.com/resources/learn-design/' },
        { title: 'NN/g', url: 'https://www.nngroup.com/articles/' },
        { title: 'Refactoring UI', url: 'https://www.refactoringui.com/' }
      ]
    },
    'Operations Manager': {
      tags: ['people', 'organization'],
      skills: ['Process Design', 'Project Management', 'Communication', 'Excel', 'Reporting'],
      resources: [
        { title: 'PMI Basics', url: 'https://www.pmi.org/' },
        { title: 'Notion/Asana Guides', url: 'https://www.notion.so/help' },
        { title: 'ExcelJet', url: 'https://exceljet.net/' }
      ]
    }
  };

  // --- UI boot ---
  $('#year').textContent = String(new Date().getFullYear());

  // Tabs
  $$('.nav-btn').forEach(btn => btn.addEventListener('click', () => {
    $$('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const target = btn.getAttribute('data-target');
    $$('.panel').forEach(p => p.classList.remove('active'));
    $(target).classList.add('active');
  }));

  // Populate target role select
  const targetRoleSelect = $('#target-role');
  Object.keys(ROLE_DB).forEach(role => {
    const opt = document.createElement('option');
    opt.value = role; opt.textContent = role; targetRoleSelect.appendChild(opt);
  });

  // Restore saved state
  const state = ls.get('pf_state', {
    quiz: null,
    recommended: [],
    targetRole: 'Data Analyst',
    currentSkills: '',
    plan: [],
    milestones: []
  });
  if (state.targetRole) targetRoleSelect.value = state.targetRole;
  if (state.currentSkills) $('#current-skills').value = state.currentSkills;

  // Quiz -> Recommendations
  $('#quiz-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    state.quiz = data; ls.set('pf_state', state);

    // Simple scoring by tags + values
    const score = [];
    for (const [role, meta] of Object.entries(ROLE_DB)) {
      let s = 0;
      if (meta.tags.includes(data.interest)) s += 2;
      if (meta.tags.includes(data.strength)) s += 2;
      if (data.environment === 'startup' && meta.tags.includes('build')) s += 1;
      if (data.environment === 'research' && meta.tags.includes('research')) s += 1;
      if (data.value === 'growth') s += 1; // learning friendly
      score.push([role, s]);
    }
    score.sort((a,b) => b[1]-a[1]);
    const top = score.slice(0, 4).map(([r]) => r);
    state.recommended = top; ls.set('pf_state', state);

    renderRecommendations(top);
    $('#recommendations').classList.remove('hidden');
  });

  function renderRecommendations(list) {
    const box = $('#reco-list');
    box.innerHTML = '';
    list.forEach(role => {
      const meta = ROLE_DB[role];
      const div = document.createElement('div');
      div.className = 'reco';
      div.innerHTML = `
        <h3>${role}</h3>
        <div class="skills">${meta.skills.slice(0,5).map(s => `<span class="chips"><li>${s}</li></span>`).join('')}</div>
        <div style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap;">
          ${meta.resources.slice(0,2).map(r => `<a href="${r.url}" target="_blank" rel="noopener noreferrer">${r.title}</a>`).join(' ')}
        </div>
        <div style="margin-top:10px;">
          <button class="secondary set-target" data-role="${role}">Set as Target</button>
        </div>
      `;
      box.appendChild(div);
    });
    // attach handlers
    $$('.set-target', box).forEach(btn => btn.addEventListener('click', () => {
      const role = btn.getAttribute('data-role');
      targetRoleSelect.value = role;
      state.targetRole = role; ls.set('pf_state', state);
      // Switch to Plan tab
      $$('.nav-btn').find(b => b.getAttribute('data-target') === '#plan').click();
    }));
  }

  if (state.recommended && state.recommended.length) {
    renderRecommendations(state.recommended);
    $('#recommendations').classList.remove('hidden');
  }

  // Skill gap analysis
  $('#analyze-btn').addEventListener('click', () => {
    const role = targetRoleSelect.value;
    const have = parseSkills($('#current-skills').value);
    state.targetRole = role; state.currentSkills = have.join(', ');
    ls.set('pf_state', state);

    const need = ROLE_DB[role]?.skills || [];
    const present = need.filter(s => hasSkill(have, s));
    const missing = need.filter(s => !hasSkill(have, s));

    renderChips($('#present-skills'), present);
    renderChips($('#missing-skills'), missing);
    $('#gap-result').classList.remove('hidden');

    // Build plan
    state.plan = buildPlan(role, missing);
    ls.set('pf_state', state);
    renderPlan(state.plan);
    $('#learning-plan').classList.remove('hidden');
  });

  function parseSkills(text) {
    return text.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
  }
  function hasSkill(arr, skill) {
    const canon = (s) => s.toLowerCase().replace(/[^a-z0-9+#.]/g, '');
    const cs = canon(skill);
    return arr.some(a => canon(a) === cs);
  }
  function renderChips(ul, items) {
    ul.innerHTML = items.map(s => `<li>${s}</li>`).join('');
  }

  function buildPlan(role, missing) {
    const baseResources = ROLE_DB[role]?.resources || [];
    const steps = [];

    // Onramp
    steps.push({
      id: uid(),
      title: `Overview of ${role}`,
      desc: 'Understand responsibilities, outcomes, and day-to-day.',
      link: baseResources[0]?.url || 'https://www.coursera.org/',
      skill: 'Foundations',
      done: false
    });

    missing.forEach(ms => {
      steps.push({
        id: uid(),
        title: `Learn ${ms}`,
        desc: `Get up to speed with ${ms} via curated resources and a mini-project.`,
        link: pickResourceForSkill(ms, baseResources),
        skill: ms,
        done: false
      });
      steps.push({
        id: uid(),
        title: `${ms} mini-project`,
        desc: `Build a small artifact demonstrating ${ms} in action.`,
        link: 'https://github.com/public-apis/public-apis',
        skill: ms,
        done: false
      });
    });

    // Portfolio and interview
    steps.push({ id: uid(), title: 'Build portfolio artifact', desc: 'Publish your project and write a short case study.', link: 'https://pages.github.com/', skill: 'Portfolio', done: false });
    steps.push({ id: uid(), title: 'Mock interviews', desc: 'Practice with peers or platforms to refine communication.', link: 'https://www.pramp.com/', skill: 'Interview', done: false });

    return steps;
  }
  function pickResourceForSkill(skill, resourceList) {
    const map = {
      'SQL': 'https://sqlbolt.com/',
      'Excel': 'https://exceljet.net/',
      'Python': 'https://docs.python.org/3/tutorial/',
      'Data Visualization': 'https://www.data-to-viz.com/',
      'Statistics': 'https://seeing-theory.brown.edu/',
      'ML': 'https://course.fast.ai/',
      'Pandas': 'https://pandas.pydata.org/docs/user_guide/10min.html',
      'Modeling': 'https://scikit-learn.org/stable/',
      'MLOps': 'https://madewithml.com/',
      'Docker': 'https://docs.docker.com/get-started/overview/',
      'APIs': 'https://restfulapi.net/',
      'Node.js': 'https://nodejs.dev/learn',
      'Databases': 'https://www.postgresql.org/docs/',
      'Auth': 'https://auth0.com/docs',
      'HTML': 'https://developer.mozilla.org/en-US/docs/Web/HTML',
      'CSS': 'https://developer.mozilla.org/en-US/docs/Web/CSS',
      'JavaScript': 'https://javascript.info/',
      'React': 'https://react.dev/learn',
      'Accessibility': 'https://www.w3.org/WAI/standards-guidelines/wcag/',
      'Figma': 'https://help.figma.com/hc/en-us',
      'Wireframing': 'https://www.nngroup.com/articles/wireframing-prototyping/',
      'User Research': 'https://www.nngroup.com/topic/user-research/',
      'Prototyping': 'https://www.figma.com/community',
      'Process Design': 'https://sloanreview.mit.edu/article/operations-strategy/',
      'Project Management': 'https://www.atlassian.com/agile/project-management'
    };
    return map[skill] || (resourceList[1]?.url || 'https://google.com');
  }

  function renderPlan(plan) {
    const box = $('#plan-list');
    box.innerHTML = '';
    plan.forEach(step => {
      const div = document.createElement('div');
      div.className = 'step';
      div.innerHTML = `
        <input type="checkbox" ${step.done ? 'checked' : ''} aria-label="Mark done" />
        <div>
          <strong>${step.title}</strong>
          <div class="badge">${step.skill}</div>
          <div class="muted">${step.desc}</div>
        </div>
        <div>
          <a href="${step.link}" target="_blank" rel="noopener noreferrer">Open</a>
        </div>
      `;
      const cb = $('input[type="checkbox"]', div);
      cb.addEventListener('change', () => {
        step.done = cb.checked; ls.set('pf_state', state);
      });
      box.appendChild(div);
    });
  }
  if (state.plan && state.plan.length) {
    renderPlan(state.plan);
    $('#learning-plan').classList.remove('hidden');
  }

  // Export & Reset
  $('#export-plan').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({
      targetRole: state.targetRole,
      plan: state.plan
    }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `pathfinder-plan-${(state.targetRole||'role').toLowerCase().replace(/\s+/g,'-')}.json`;
    a.click();
  });
  $('#reset-plan').addEventListener('click', () => {
    if (!confirm('Reset your learning plan progress?')) return;
    state.plan.forEach(s => s.done = false);
    ls.set('pf_state', state);
    renderPlan(state.plan);
  });

  // Resume analyzer (basic keyword coverage + ATS tips)
  $('#analyze-resume').addEventListener('click', () => {
    const file = $('#resume-file').files[0];
    const textArea = $('#resume-text');

    const proceed = (text) => showResumeInsights(text || '');

    if (file) {
      const reader = new FileReader();
      reader.onload = e => proceed(String(e.target.result || ''));
      reader.onerror = () => proceed(textArea.value);
      reader.readAsText(file);
    } else {
      proceed(textArea.value);
    }
  });

  function showResumeInsights(text) {
    const role = state.targetRole || 'Data Analyst';
    const keywords = (ROLE_DB[role]?.skills || []).concat(['project', 'impact', 'team', 'stakeholder']);
    const present = [];
    const missing = [];
    const lower = text.toLowerCase();
    keywords.forEach(k => {
      if (lower.includes(k.toLowerCase())) present.push(k); else missing.push(k);
    });

    const tips = [
      'Use consistent, standard section headings (Experience, Education, Skills).',
      'Quantify impact with metrics (e.g., improved X by Y%).',
      'Keep formatting simple (avoid tables/images that confuse ATS).',
      'Include keywords from target job descriptions.',
      `Mirror the language for "${role}" job postings.`
    ];

    const box = $('#resume-result');
    box.innerHTML = `
      <h3>ATS Keyword Coverage for ${role}</h3>
      <div class="grid-2">
        <div>
          <strong>Present</strong>
          <ul class="chips">${present.map(k => `<li>${k}</li>`).join('')}</ul>
        </div>
        <div>
          <strong>Missing</strong>
          <ul class="chips danger">${missing.map(k => `<li>${k}</li>`).join('')}</ul>
        </div>
      </div>
      <div style="margin-top:10px">
        <strong>ATS Tips</strong>
        <ul>
          ${tips.map(t => `<li>${t}</li>`).join('')}
        </ul>
      </div>
    `;
    box.classList.remove('hidden');
  }

  // Milestones
  function renderMilestones() {
    const list = $('#milestones');
    list.innerHTML = '';
    state.milestones.forEach((m, idx) => {
      const li = document.createElement('li');
      li.className = 'milestone';
      li.innerHTML = `
        <div>
          <div><strong>${m.title}</strong></div>
          <small>${m.when || ''}</small>
        </div>
        <div>
          <button data-idx="${idx}" class="del">Remove</button>
        </div>
      `;
      $('button.del', li).addEventListener('click', () => {
        state.milestones.splice(idx, 1);
        ls.set('pf_state', state);
        renderMilestones();
      });
      list.appendChild(li);
    });
  }
  if (state.milestones) renderMilestones();

  $('#add-milestone').addEventListener('click', () => {
    const title = prompt('Milestone (e.g., Submit 3 job applications)');
    if (!title) return;
    const when = prompt('When (optional, e.g., next Friday)');
    state.milestones.push({ title, when });
    ls.set('pf_state', state);
    renderMilestones();
  });
  $('#clear-milestones').addEventListener('click', () => {
    if (!confirm('Clear all milestones?')) return;
    state.milestones = [];
    ls.set('pf_state', state);
    renderMilestones();
  });

  // Helpers
  function uid() { return Math.random().toString(36).slice(2, 9); }
})();