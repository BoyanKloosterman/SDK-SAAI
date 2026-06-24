// SDK & SAAI Oefenapp
const App = {
  state: {
    mode: 'practice',
    questions: [],
    currentIndex: 0,
    answers: {},
    results: {},
    showFeedback: false,
    progress: {},
    casusStep: 1,
  },

  getAllQuestions() {
    return typeof ALL_QUESTIONS !== 'undefined' ? ALL_QUESTIONS : QUESTIONS;
  },

  isAdrCasusFlow(q) {
    return typeof isAdrCasusQuestion === 'function' && isAdrCasusQuestion(q);
  },

  getCasusAdrPart(q, step) {
    const parts = (q.parts || []).filter((p) => p.type === 'adr-write');
    return parts[step - 1] || null;
  },

  init() {
    this.loadProgress();
    this.bindEvents();
    this.renderHome();
    this.initMermaid();
  },

  initMermaid() {
    if (typeof mermaid !== 'undefined') {
      mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose', class: { useMaxWidth: true } });
    }
  },

  loadProgress() {
    try {
      const saved = localStorage.getItem('saai-progress');
      if (saved) this.state.progress = JSON.parse(saved);
    } catch (_) {}
  },

  saveProgress() {
    localStorage.setItem('saai-progress', JSON.stringify(this.state.progress));
  },

  bindEvents() {
    document.getElementById('btn-home').addEventListener('click', () => this.renderHome());
    document.getElementById('btn-next').addEventListener('click', () => this.nextQuestion());
    document.getElementById('btn-prev').addEventListener('click', () => this.prevQuestion());
    document.getElementById('btn-check').addEventListener('click', () => this.checkAnswer());
    document.getElementById('btn-skip').addEventListener('click', () => this.skipQuestion());
  },

  renderHome() {
    const all = this.getAllQuestions();
    const main = document.getElementById('main');
    const answered = Object.keys(this.state.progress).length;
    const avgScore = answered
      ? Math.round(Object.values(this.state.progress).reduce((a, b) => a + b, 0) / answered)
      : 0;
    const examCount = typeof getExamQuestions === 'function' ? getExamQuestions().length : 0;
    const openCount = typeof getOpenQuestions === 'function' ? getOpenQuestions().length : all.filter((q) => this.isOpenType(q.type)).length;
    const mcqCount = all.length - openCount;

    let categoryCards = '';
    Object.entries(QUESTION_CATEGORIES).forEach(([key, cat]) => {
      const count = all.filter((q) => q.category === key).length;
      if (!count) return;
      categoryCards += `
        <button class="cat-card" data-cat="${key}" style="--accent:${cat.color}">
          <span class="cat-label">${cat.label}</span>
          <span class="cat-count">${count} vragen</span>
        </button>`;
    });

    let sectionCards = '';
    if (typeof SUMMARY_SECTIONS !== 'undefined' && typeof getQuestionsBySection === 'function') {
      Object.entries(SUMMARY_SECTIONS).forEach(([key, sec]) => {
        const count = getQuestionsBySection(key).length;
        if (!count) return;
        sectionCards += `
          <button class="cat-card" data-section="${key}" style="--accent:${sec.color}">
            <span class="cat-label">${sec.num}. ${sec.label}</span>
            <span class="cat-count">${count} vragen</span>
          </button>`;
      });
    }

    main.innerHTML = `
      <section class="hero">
        <h2>SDK & SAAI Toetstrainer</h2>
        <p>6 vragen per examenronde — 2 meerkeuze (0,5 pt), 1 casus met 2 ADR (50%), 3 open. ADR-oefening: casus in 2 stappen (deel 1 → ADR 1 → deel 2 → ADR 2).</p>
        <div class="stats">
          <div class="stat"><span class="stat-num">${openCount}</span><span class="stat-label">open</span></div>
          <div class="stat"><span class="stat-num">${mcqCount}</span><span class="stat-label">meerkeuze</span></div>
          <div class="stat"><span class="stat-num">${answered}</span><span class="stat-label">geoefend</span></div>
          <div class="stat"><span class="stat-num">${avgScore}%</span><span class="stat-label">gem. score</span></div>
        </div>
        <div class="hero-actions">
          <a href="../samenvatting_sdk_saai_v5.html" target="_blank" rel="noopener" class="mode-btn primary">
            <strong>Samenvatting openen</strong>
            <span>Volledige theorie — 17 secties</span>
          </a>
        </div>
      </section>

      <section class="modes">
        <h3>Start oefenen</h3>
        <div class="mode-grid">
          <button class="mode-btn primary" id="btn-exam">
            <strong>Examenmodus</strong>
            <span>Casus + 2 ADR's (50%) — zoals op de toets</span>
          </button>
          <button class="mode-btn" id="btn-open">
            <strong>Open vragen</strong>
            <span>${openCount} open vragen — zoals de toets</span>
          </button>
          <button class="mode-btn" id="btn-adr">
            <strong>ADR-oefening</strong>
            <span>4 casussen — elk 2 ADR's in stappen</span>
          </button>
          <button class="mode-btn" id="btn-all">
            <strong>Alles incl. meerkeuze</strong>
            <span>${all.length} vragen (oefen MC apart)</span>
          </button>
          <button class="mode-btn" id="btn-weak">
            <strong>Zwakke punten</strong>
            <span>Herhaal vragen onder 70%</span>
          </button>
        </div>
      </section>

      <section class="categories">
        <h3>Per samenvatting-sectie</h3>
        <div class="cat-grid">${sectionCards || categoryCards}</div>
      </section>

      <section class="categories">
        <h3>Per vraagtype</h3>
        <div class="cat-grid">${categoryCards}</div>
      </section>

      <section class="settings">
        <h3>AI-beoordeling (optioneel)</h3>
        <p class="hint">Inhoudelijke feedback op open vragen. Gemini: ${typeof AiGrader !== 'undefined' ? AiGrader.GEMINI_MODEL + ' met fallback naar ' + AiGrader.GEMINI_FALLBACK_MODELS[0] : 'gemini-3.5-flash'}. ADR-casussen: per ADR apart beoordeeld (${typeof AiGrader !== 'undefined' ? AiGrader.ADR_INTERVAL_MS / 1000 : 12}s tussen calls). Bij 429: lokale fallback per deel.</p>
        <div class="api-key-row">
          <select id="api-provider" class="api-provider-select">
            <option value="gemini" ${typeof AiGrader !== 'undefined' && AiGrader.getProvider() === 'gemini' ? 'selected' : ''}>Gemini</option>
            <option value="openai" ${typeof AiGrader !== 'undefined' && AiGrader.getProvider() === 'openai' ? 'selected' : ''}>OpenAI</option>
          </select>
          <input type="password" id="api-key-input" class="api-key-input" placeholder="Gemini key (AIza...)" value="${typeof AiGrader !== 'undefined' ? AiGrader.getKey() : ''}">
          <button class="mode-btn" id="btn-save-key">Opslaan</button>
        </div>
        <p class="hint" id="ai-status">${typeof AiGrader !== 'undefined' ? AiGrader.statusLabel() : 'Alleen lokale beoordeling'}</p>
        <div class="api-test-row">
          <button class="mode-btn primary" id="btn-test-api">Test API-verbinding</button>
          <span class="hint">Stuurt 1 test-request — controleert of je key werkt</span>
        </div>
        <div id="api-test-result" class="api-test-result hidden"></div>
      </section>
    `;

    document.getElementById('btn-exam').addEventListener('click', () => this.startMode('exam'));
    document.getElementById('btn-open').addEventListener('click', () => this.startMode('open'));
    document.getElementById('btn-adr').addEventListener('click', () => this.startCategory('adr'));
    document.getElementById('btn-all').addEventListener('click', () => this.startMode('all'));
    document.getElementById('btn-weak').addEventListener('click', () => this.startMode('weak'));
    document.querySelectorAll('.cat-card[data-cat]').forEach((btn) => {
      btn.addEventListener('click', () => this.startCategory(btn.dataset.cat));
    });
    document.querySelectorAll('.cat-card[data-section]').forEach((btn) => {
      btn.addEventListener('click', () => this.startSection(btn.dataset.section));
    });

    const saveKeyBtn = document.getElementById('btn-save-key');
    const providerSel = document.getElementById('api-provider');
    const keyInput = document.getElementById('api-key-input');
    if (providerSel && keyInput) {
      providerSel.addEventListener('change', () => {
        keyInput.placeholder = providerSel.value === 'gemini' ? 'Gemini key (AIza...)' : 'OpenAI key (sk-...)';
      });
    }
    if (saveKeyBtn) {
      saveKeyBtn.addEventListener('click', () => {
        const val = keyInput.value;
        if (typeof AiGrader !== 'undefined') {
          AiGrader.saveProvider(providerSel.value);
          AiGrader.saveKey(val);
          document.getElementById('ai-status').textContent = AiGrader.statusLabel();
        }
      });
    }

    const testBtn = document.getElementById('btn-test-api');
    if (testBtn) {
      testBtn.addEventListener('click', () => this.testApiConnection());
    }

    document.getElementById('quiz-controls').classList.add('hidden');
    document.getElementById('progress-bar').classList.add('hidden');
  },

  startMode(mode) {
    const all = this.getAllQuestions();
    let questions;
    if (mode === 'exam') {
      questions = typeof getExamQuestions === 'function' ? getExamQuestions() : [];
    } else if (mode === 'open') {
      questions = typeof getOpenQuestions === 'function' ? getOpenQuestions() : all.filter((q) => this.isOpenType(q.type));
    } else if (mode === 'weak') {
      questions = all.filter((q) => (this.state.progress[q.id] || 100) < 70);
      if (!questions.length) { alert('Geen zwakke punten. Oefen eerst wat vragen.'); return; }
    } else {
      questions = [...all];
    }
    this.startQuiz(questions, mode);
  },

  startCategory(cat) {
    let questions = this.getAllQuestions().filter((q) => q.category === cat);
    if (cat === 'adr') {
      questions = typeof getAdrCasusQuestions === 'function'
        ? getAdrCasusQuestions()
        : questions.filter((q) => q.examCasus);
    }
    if (!questions.length) { alert('Geen vragen in deze categorie.'); return; }
    this.startQuiz(questions, 'category');
  },

  startSection(sectionId) {
    const questions = typeof getQuestionsBySection === 'function'
      ? getQuestionsBySection(sectionId)
      : [];
    if (!questions.length) { alert('Geen vragen voor deze samenvatting-sectie.'); return; }
    this.startQuiz(questions, 'section');
  },

  startQuiz(questions, mode) {
    this.state.mode = mode;
    this.state.questions = questions;
    this.state.currentIndex = 0;
    this.state.answers = {};
    this.state.results = {};
    this.state.showFeedback = false;
    this.state.casusStep = 1;
    document.getElementById('quiz-controls').classList.remove('hidden');
    document.getElementById('progress-bar').classList.remove('hidden');
    this.renderQuestion();
  },

  renderQuestion() {
    const q = this.state.questions[this.state.currentIndex];
    if (!q) return this.renderResults();

    const cat = QUESTION_CATEGORIES[q.category] || { label: q.category, color: '#9c9a92' };
    const secLabel = q.examSection && typeof SUMMARY_SECTIONS !== 'undefined' && SUMMARY_SECTIONS[q.examSection]
      ? SUMMARY_SECTIONS[q.examSection].label
      : (typeof getQuestionTopic === 'function' && typeof SUMMARY_SECTIONS !== 'undefined'
        ? (SUMMARY_SECTIONS[getQuestionTopic(q)] || {}).label
        : null);
    const main = document.getElementById('main');
    const progress = ((this.state.currentIndex + 1) / this.state.questions.length) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
    const casusStep = this.state.casusStep || 1;
    const inCasusFlow = this.isAdrCasusFlow(q);
    document.getElementById('progress-text').textContent = inCasusFlow
      ? `${this.state.currentIndex + 1} / ${this.state.questions.length} — stap ${casusStep}/2`
      : `${this.state.currentIndex + 1} / ${this.state.questions.length}`;

    const examBadge = q.examLabel
      ? `<span class="exam-badge">${q.examLabel}${q.examWeight ? ` — ${String(q.examWeight).replace('.', ',')} pt` : ''}</span>`
      : '';

    let body = `
      <div class="question-card">
        <div class="q-meta">
          <span class="q-cat" style="background:${cat.color}22;color:${cat.color}">${secLabel || cat.label}</span>
          <span class="q-type">${this.typeLabel(q.type, q)}</span>
          ${examBadge}
        </div>
        ${q.examNote ? `<p class="exam-note">${this.escapeHtml(q.examNote)}</p>` : ''}
        ${inCasusFlow ? `<p class="casus-step-badge">Stap ${casusStep} van 2 — ${casusStep === 1 ? 'casus deel 1 + ADR 1' : 'casus deel 2 + ADR 2'}</p>` : ''}
        <h3 class="q-text">${this.escapeHtml(inCasusFlow && casusStep === 2 ? 'Casus — deel 2: tweede ontwerpbeslissing' : q.question).replace(/\n/g, '<br>')}</h3>
    `;

    if (q.code) body += `<pre class="code-block">${this.escapeHtml(q.code)}</pre>`;
    if (q.codeContext) body += `<pre class="code-block context">${this.escapeHtml(q.codeContext)}</pre>`;
    if (q.scenario && (!inCasusFlow || casusStep === 1)) {
      body += `<p class="scenario">${this.escapeHtml(q.scenario)}</p>`;
    }
    const contextBlock = inCasusFlow
      ? (casusStep === 1 ? q.systemContext : q.systemContextPart2)
      : q.systemContext;
    if (contextBlock) {
      body += `<details class="system-context" open>
        <summary>${inCasusFlow ? `Systeemcontext — deel ${casusStep}` : 'Systeemcontext — lees dit eerst'}</summary>
        <div class="system-context-body">${this.formatContext(contextBlock)}</div>
      </details>`;
    }
    const umlBlock = inCasusFlow
      ? (casusStep === 2 && q.umlPart2 ? q.umlPart2 : q.uml)
      : q.uml;
    if (umlBlock) {
      const umlLabel = (q.type === 'adr-write' || q.examCasus) ? 'Architectuur — huidige vs gewenste richting' : '';
      if (umlLabel) body += `<p class="uml-label">${umlLabel}</p>`;
      body += `<div class="uml-wrap"><div class="mermaid">${umlBlock}</div></div>`;
    }

    body += `<div class="answer-area" id="answer-area">${this.renderAnswerInput(q)}</div>`;

    if (this.state.showFeedback && this.state.results[q.id]) {
      body += this.renderFeedback(this.state.results[q.id], q);
    }

    body += '</div>';
    main.innerHTML = body;
    this.renderMermaid();
    this.bindAnswerEvents(q);

    document.getElementById('btn-prev').disabled = this.state.currentIndex === 0 && casusStep === 1;
    const hideCheck = this.isMcqType(q.type) && this.state.showFeedback;
    const checkBtn = document.getElementById('btn-check');
    checkBtn.classList.toggle('hidden', hideCheck);
    if (inCasusFlow) {
      const part = this.getCasusAdrPart(q, casusStep);
      checkBtn.textContent = part ? `Controleer ${part.label}` : 'Controleer antwoord';
    } else {
      checkBtn.textContent = 'Controleer antwoord';
    }
    document.getElementById('btn-next').textContent = inCasusFlow && casusStep === 1
      ? 'Deel 2 →'
      : (this.state.currentIndex === this.state.questions.length - 1 ? 'Resultaten' : 'Volgende');
  },

  typeLabel(type, q) {
    const labels = {
      mcq: 'Meerkeuze',
      'code-analysis': 'Code-analyse',
      'uml-relation': 'UML-relatie',
      ordering: 'Volgorde',
      text: 'Open vraag',
      'open-identify': 'Open — smell + principe',
      'open-write': 'Open vraag',
      'open-multi': 'Open — deelvragen',
      'adr-write': 'ADR schrijven',
      'pseudocode-write': 'Pseudocode',
      'factory-uml': 'Factory + UML',
    };
    if (type === 'open-multi' && q && q.examCasus) return 'Casus — 2 ADR\'s';
    return labels[type] || type;
  },

  isMcqType(type) {
    return ['mcq', 'code-analysis', 'uml-relation', 'factory-uml'].includes(type);
  },

  isOpenType(type) {
    return ['text', 'open-identify', 'open-write', 'adr-write', 'pseudocode-write', 'open-multi'].includes(type);
  },

  renderAnswerInput(q) {
    const saved = this.state.answers[q.id];

    if (q.type === 'mcq' || q.type === 'uml-relation' || q.type === 'factory-uml') {
      return q.options.map((opt, i) => `
        <label class="option ${saved === i ? 'selected' : ''}">
          <input type="radio" name="answer" value="${i}" ${saved === i ? 'checked' : ''}>
          <span>${this.escapeHtml(opt)}</span>
        </label>`).join('');
    }

    if (q.type === 'code-analysis') {
      const inputType = q.multi ? 'checkbox' : 'radio';
      return q.options.map((opt, i) => {
        const checked = Array.isArray(saved) ? saved.includes(i) : saved === i;
        return `<label class="option ${checked ? 'selected' : ''}">
          <input type="${inputType}" name="answer" value="${i}" ${checked ? 'checked' : ''}>
          <span>${this.escapeHtml(opt)}</span>
        </label>`;
      }).join('');
    }

    if (q.type === 'ordering') {
      const items = saved || [...q.items];
      return `<p class="hint">Sorteer met pijltjes (boven = eerste laag)</p>
        <ul class="sort-list" id="sort-list">
          ${items.map((item, i) => `
            <li><span class="sort-num">${i + 1}</span><span class="sort-label">${this.escapeHtml(item)}</span>
              <button type="button" class="sort-up" data-i="${i}">▲</button>
              <button type="button" class="sort-down" data-i="${i}">▼</button></li>`).join('')}
        </ul>`;
    }

    if (q.type === 'open-multi') {
      // Casus: per stap één ADR-veld
      if (this.isAdrCasusFlow(q)) {
        const step = this.state.casusStep || 1;
        const part = this.getCasusAdrPart(q, step);
        if (!part) return '';
        const partSaved = saved && saved[part.key] ? saved[part.key] : '';
        let partHtml = `<div class="part-block part-adr">
          <div class="part-label">${this.escapeHtml(part.label)}</div>
          <p class="part-q">${this.escapeHtml(part.question).replace(/\n/g, '<br>')}</p>
          <div class="adr-template">
            <button type="button" class="tpl-btn part-tpl-btn" data-part="${part.key}">Nygard template ${this.escapeHtml(part.label)}</button>
            <span class="hint">Min. 2 beslissingen, min. 1 + en 1 - in Consequences.</span>
          </div>
          <textarea class="text-answer part-answer adr-answer" data-part="${part.key}" rows="16"
            placeholder="Schrijf ${this.escapeHtml(part.label)}...">${this.escapeHtml(partSaved)}</textarea></div>`;
        return partHtml;
      }
      return (q.parts || []).map((part) => {
        const partSaved = saved && saved[part.key] ? saved[part.key] : '';
        const rows = part.type === 'adr-write' ? 16 : part.type === 'pseudocode-write' ? 10 : 5;
        let partHtml = `<div class="part-block${part.type === 'adr-write' ? ' part-adr' : ''}">
          <div class="part-label">${this.escapeHtml(part.label)}</div>
          <p class="part-q">${this.escapeHtml(part.question).replace(/\n/g, '<br>')}</p>`;
        if (part.type === 'adr-write') {
          partHtml += `<div class="adr-template">
            <button type="button" class="tpl-btn part-tpl-btn" data-part="${part.key}">Nygard template ${this.escapeHtml(part.label)}</button>
            <span class="hint">Min. 2 beslissingen, min. 1 + en 1 - in Consequences.</span>
          </div>`;
        }
        if (part.code) partHtml += `<pre class="code-block">${this.escapeHtml(part.code)}</pre>`;
        if (part.codeContext) partHtml += `<pre class="code-block context">${this.escapeHtml(part.codeContext)}</pre>`;
        partHtml += `<textarea class="text-answer part-answer${part.type === 'adr-write' ? ' adr-answer' : ''}" data-part="${part.key}" rows="${rows}"
          placeholder="Schrijf ${this.escapeHtml(part.label)}...">${this.escapeHtml(partSaved)}</textarea></div>`;
        return partHtml;
      }).join('');
    }

    if (q.type === 'open-identify') {
      return `<textarea class="text-answer" id="text-answer" rows="5"
        placeholder="Noem de design smell en het principe...">${saved || ''}</textarea>
        <p class="hint">Bijv.: "Smell: Fragility. Principe: Loose Coupling."</p>`;
    }

    if (q.type === 'open-write' || q.type === 'text') {
      return `<textarea class="text-answer" id="text-answer" rows="7" placeholder="Typ je antwoord...">${saved || ''}</textarea>`;
    }

    if (q.type === 'adr-write') {
      return `<div class="adr-template">
          <button type="button" class="tpl-btn" id="insert-adr-template">Nygard template invoegen</button>
          <span class="hint">Verplicht: min. 2 concrete beslissingen in Decision, min. 1 voordeel (+) en 1 nadeel (-) in Consequences.</span>
        </div>
        <textarea class="text-answer adr-answer" id="text-answer" rows="18"
          placeholder="Schrijf je Nygard ADR (RabbitMQ, events, temporal/behavioral coupling)...">${saved || ''}</textarea>`;
    }

    if (q.type === 'pseudocode-write') {
      return `<textarea class="text-answer code-answer" id="text-answer" rows="14" placeholder="Schrijf pseudocode...">${saved || ''}</textarea>`;
    }

    return '';
  },

  bindAnswerEvents(q) {
    if (this.isMcqType(q.type)) {
      document.querySelectorAll('.option input').forEach((input) => {
        input.addEventListener('change', () => {
          if (q.type === 'code-analysis' && q.multi) {
            this.state.answers[q.id] = [...document.querySelectorAll('input:checked')].map((el) => +el.value);
          } else {
            this.state.answers[q.id] = +document.querySelector('input:checked')?.value;
          }
          document.querySelectorAll('.option').forEach((l) => l.classList.remove('selected'));
          document.querySelectorAll('input:checked').forEach((el) => el.closest('.option')?.classList.add('selected'));
          if (['mcq', 'uml-relation', 'factory-uml'].includes(q.type)) this.checkAnswer();
        });
      });
    }

    if (q.type === 'ordering') {
      document.querySelectorAll('.sort-up').forEach((btn) => {
        btn.addEventListener('click', () => {
          const i = +btn.dataset.i;
          const list = [...(this.state.answers[q.id] || q.items)];
          if (i > 0) { [list[i - 1], list[i]] = [list[i], list[i - 1]]; this.state.answers[q.id] = list; this.renderQuestion(); }
        });
      });
      document.querySelectorAll('.sort-down').forEach((btn) => {
        btn.addEventListener('click', () => {
          const i = +btn.dataset.i;
          const list = [...(this.state.answers[q.id] || q.items)];
          if (i < list.length - 1) { [list[i], list[i + 1]] = [list[i + 1], list[i]]; this.renderQuestion(); }
        });
      });
      if (!this.state.answers[q.id]) this.state.answers[q.id] = [...q.items];
    }

    if (q.type === 'open-multi') {
      document.querySelectorAll('.part-answer').forEach((ta) => {
        ta.addEventListener('input', () => {
          if (!this.state.answers[q.id]) this.state.answers[q.id] = {};
          this.state.answers[q.id][ta.dataset.part] = ta.value;
        });
      });
      document.querySelectorAll('.part-tpl-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const ta = document.querySelector(`.part-answer[data-part="${btn.dataset.part}"]`);
          if (!ta) return;
          ta.value = this.getNygardTemplate();
          if (!this.state.answers[q.id]) this.state.answers[q.id] = {};
          this.state.answers[q.id][btn.dataset.part] = ta.value;
        });
      });
    }

    const tplBtn = document.getElementById('insert-adr-template');
    if (tplBtn) {
      tplBtn.addEventListener('click', () => {
        const textarea = document.getElementById('text-answer');
        textarea.value = this.getNygardTemplate();
        this.state.answers[q.id] = textarea.value;
      });
    }

    const textarea = document.getElementById('text-answer');
    if (textarea) {
      textarea.addEventListener('input', () => { this.state.answers[q.id] = textarea.value; });
    }
  },

  getNygardTemplate() {
    return `# [Titel]

## Status
Proposed

## Context
[Probleem: temporal/behavioral coupling, sync vs async. Min. 2 overwogen alternatieven uit de les: sync REST, P2P queue, pub/sub exchange]

## Decision
1. [Eerste concrete keuze — bijv. welke technologie]
2. [Tweede concrete keuze — bijv. hoe het werkt / werkwijze]

## Consequences
+ [voordeel 1]
+ [voordeel 2 — optioneel]
- [nadeel 1]
- [nadeel 2 — optioneel]`;
  },

  getAnswer(q) {
    if (q.type === 'ordering') return this.state.answers[q.id] || q.items;
    if (q.type === 'open-multi') {
      const ans = { ...(this.state.answers[q.id] || {}) };
      document.querySelectorAll('.part-answer').forEach((ta) => { ans[ta.dataset.part] = ta.value; });
      return ans;
    }
    if (this.isOpenType(q.type)) {
      return document.getElementById('text-answer')?.value || this.state.answers[q.id] || '';
    }
    return this.state.answers[q.id];
  },

  async checkAnswer() {
    const q = this.state.questions[this.state.currentIndex];
    const answer = this.getAnswer(q);

    // ADR-casus: per stap één ADR beoordelen (minder 429, snellere feedback)
    if (this.isAdrCasusFlow(q)) {
      const step = this.state.casusStep || 1;
      const part = this.getCasusAdrPart(q, step);
      if (!part || !(answer[part.key] || '').trim()) {
        alert(`Vul ${part?.label || 'ADR'} eerst in.`);
        return;
      }

      const btn = document.getElementById('btn-check');
      const oldLabel = btn.textContent;
      btn.disabled = true;
      btn.textContent = typeof AiGrader !== 'undefined' && AiGrader.hasKey()
        ? `AI beoordeelt ${part.label}...` : 'Bezig...';

      try {
        const partResult = await Grader.gradeCasusAdrPart(q, part.key, answer[part.key]);
        const existing = this.state.results[q.id] || {};
        const partResults = { ...(existing.partResults || {}), [part.key]: partResult };
        const merged = Grader.mergeMultiPartResults(q, partResults);
        this.state.results[q.id] = merged;
        this.state.showFeedback = true;
        if (!merged.partial) this.state.progress[q.id] = merged.score;
        this.saveProgress();
        this.renderQuestion();
      } finally {
        btn.disabled = false;
        btn.textContent = oldLabel;
      }
      return;
    }

    if (q.type === 'open-multi') {
      const empty = (q.parts || []).filter((p) => !(answer[p.key] || '').trim());
      if (empty.length) { alert(`Vul alle deelvragen in (${empty.map((p) => p.label).join(', ')}).`); return; }
    } else if (answer === undefined || answer === '' || (Array.isArray(answer) && !answer.length)) {
      alert('Geef eerst een antwoord.'); return;
    }

    const btn = document.getElementById('btn-check');
    const oldLabel = btn.textContent;
    btn.disabled = true;
    btn.textContent = typeof AiGrader !== 'undefined' && AiGrader.hasKey() && Grader.usesAiGrading(q)
      ? 'AI beoordeelt...' : 'Bezig...';

    try {
      const result = await Grader.gradeAsync(q, answer);
      this.state.results[q.id] = result;
      this.state.showFeedback = true;
      this.state.progress[q.id] = result.score;
      this.saveProgress();
      this.renderQuestion();
    } finally {
      btn.disabled = false;
      btn.textContent = oldLabel;
    }
  },

  renderFeedback(result, q) {
    const scoreClass = result.score >= 70 ? 'good' : result.score >= 50 ? 'warn' : 'bad';
    let html = `<div class="feedback ${scoreClass}">
      <div class="feedback-header">
        <span class="score-badge">${result.score}%</span>
        <span>${result.correct ? 'Voldoende' : 'Nog oefenen'}</span>
      </div>`;

    if (result.breakdown) {
      html += `<p class="breakdown">${this.escapeHtml(result.breakdown)}</p>`;
    }

    html += `<ul>${result.feedback.map((f) => `<li>${this.escapeHtml(f)}</li>`).join('')}</ul>`;

    if (result.partResults && q.parts) {
      html += '<div class="part-results">';
      if (result.partial) {
        html += '<p class="hint">Deelscore — beoordeel elk ADR apart. Ga naar deel 2 voor de tweede ADR.</p>';
      }
      q.parts.forEach((part) => {
        const pr = result.partResults[part.key];
        if (!pr) return;
        const aiTag = pr.aiReviewed ? ' (AI)' : '';
        html += `<details class="part-feedback-detail">
          <summary>${part.label}: ${pr.score}%${aiTag}</summary>
          <ul>${(pr.feedback || []).map((f) => `<li>${this.escapeHtml(f)}</li>`).join('')}</ul>
          ${part.modelAnswer ? `<pre class="part-model">${this.escapeHtml(part.modelAnswer)}</pre>` : ''}
        </details>`;
      });
      html += '</div>';
    }

    if (result.aiStyle) {
      html += `<div class="ai-feedback"><strong>Beoordeling:</strong><pre>${this.escapeHtml(result.aiStyle)}</pre></div>`;
    }

    if (q.explain) html += `<p class="explain"><strong>Uitleg:</strong> ${this.escapeHtml(q.explain)}</p>`;
    if (q.modelAnswer && result.score < 85) {
      html += `<details class="model-answer"><summary>Modelantwoord</summary><pre>${this.escapeHtml(q.modelAnswer)}</pre></details>`;
    }
    if (q.uml && q.type === 'pseudocode-write' && result.score >= 50) {
      html += `<div class="uml-wrap"><div class="mermaid">${q.uml}</div></div>`;
    }
    html += '</div>';
    return html;
  },

  async renderMermaid() {
    const nodes = document.querySelectorAll('.mermaid');
    if (!nodes.length || typeof mermaid === 'undefined') return;
    for (const node of nodes) {
      try {
        const id = 'mmd-' + Math.random().toString(36).slice(2);
        const { svg } = await mermaid.render(id, node.textContent);
        node.innerHTML = svg;
      } catch (_) {
        node.innerHTML = `<pre class="code-block">${node.textContent}</pre>`;
      }
    }
  },

  nextQuestion() {
    const q = this.state.questions[this.state.currentIndex];
    if (this.isAdrCasusFlow(q) && (this.state.casusStep || 1) === 1) {
      const part = this.getCasusAdrPart(q, 1);
      const answer = this.getAnswer(q);
      if (part && !(answer[part.key] || '').trim()) {
        alert('Vul ADR 1 in voordat je naar deel 2 gaat.');
        return;
      }
      this.state.casusStep = 2;
      this.state.showFeedback = false;
      this.renderQuestion();
      return;
    }
    this.state.casusStep = 1;
    if (this.state.currentIndex < this.state.questions.length - 1) {
      this.state.currentIndex++;
      this.state.showFeedback = false;
      this.renderQuestion();
    } else {
      this.renderResults();
    }
  },

  skipQuestion() {
    this.state.casusStep = 1;
    if (this.state.currentIndex < this.state.questions.length - 1) {
      this.state.currentIndex++;
      this.state.showFeedback = false;
      this.renderQuestion();
    } else {
      this.renderResults();
    }
  },

  prevQuestion() {
    const q = this.state.questions[this.state.currentIndex];
    if (this.isAdrCasusFlow(q) && (this.state.casusStep || 1) === 2) {
      this.state.casusStep = 1;
      this.state.showFeedback = !!this.state.results[q.id];
      this.renderQuestion();
      return;
    }
    if (this.state.currentIndex > 0) {
      this.state.casusStep = 1;
      this.state.currentIndex--;
      this.state.showFeedback = !!this.state.results[this.state.questions[this.state.currentIndex].id];
      this.renderQuestion();
    }
  },

  renderResults() {
    const questions = this.state.questions;
    const isExam = this.state.mode === 'exam';
    let weightedSum = 0;
    let totalWeight = 0;
    let answered = 0;

    questions.forEach((q) => {
      const r = this.state.results[q.id];
      const score = r ? r.score : (this.state.progress[q.id] || null);
      if (score !== null) {
        const w = q.examWeight || 1;
        weightedSum += score * w;
        totalWeight += w;
        answered++;
      }
    });

    const avg = totalWeight ? Math.round(weightedSum / totalWeight) : 0;

    let adrSum = 0, adrWeight = 0, otherSum = 0, otherWeight = 0;
    questions.forEach((q) => {
      const r = this.state.results[q.id];
      const score = r ? r.score : null;
      if (score === null) return;
      const w = q.examWeight || 1;
      if (q.category === 'adr' || q.type === 'adr-write') {
        adrSum += score * w; adrWeight += w;
      } else {
        otherSum += score * w; otherWeight += w;
      }
    });

    const rows = questions.map((q) => {
      const r = this.state.results[q.id];
      const score = r ? r.score : '-';
      const cat = QUESTION_CATEGORIES[q.category] || { label: q.category, color: '#9c9a92' };
      const sec = typeof getQuestionTopic === 'function' ? getSectionLabel(getQuestionTopic(q)) : cat.label;
      const label = q.examLabel || this.typeLabel(q.type, q);
      const weight = q.examWeight ? ` (${String(q.examWeight).replace('.', ',')} pt)` : '';
      return `<tr>
        <td>${label}${weight}</td>
        <td><span style="color:${cat.color}">${sec}</span></td>
        <td class="score-cell ${r && r.score >= 70 ? 'pass' : 'fail'}">${score}${r ? '%' : ''}</td>
      </tr>`;
    }).join('');

    const totalPts = typeof getExamTotalPoints === 'function' ? getExamTotalPoints() : totalWeight;
    const mcqPts = questions.filter((q) => this.isMcqType(q.type)).reduce((s, q) => s + (q.examWeight || 0), 0);
    const earnedPts = totalWeight ? (weightedSum / 100).toFixed(2) : '0';
    const examExtra = isExam
      ? `<p class="exam-breakdown">
          Totaal: ${earnedPts} / ${totalPts} pt |
          ADR: ${adrWeight ? Math.round(adrSum / adrWeight) : '-'}% (${Math.round(adrWeight / totalWeight * 100)}% gewicht) |
          Meerkeuze samen: ${mcqPts} pt
        </p>`
      : '';

    document.getElementById('main').innerHTML = `
      <section class="results">
        <h2>${isExam ? 'Examenresultaat' : 'Resultaten'}</h2>
        <div class="result-score ${avg >= 55 ? 'pass' : 'fail'}">${avg}%</div>
        <p>${answered} van ${questions.length} vragen beantwoord</p>
        ${examExtra}
        <table class="result-table">
          <thead><tr><th>Vraag</th><th>Onderwerp</th><th>Score</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <button class="mode-btn primary" id="btn-retry">Opnieuw</button>
        <button class="mode-btn" id="btn-home-result">Terug naar home</button>
      </section>
    `;

    document.getElementById('btn-retry').addEventListener('click', () => this.startQuiz(questions, this.state.mode));
    document.getElementById('btn-home-result').addEventListener('click', () => this.renderHome());
    document.getElementById('quiz-controls').classList.add('hidden');
    document.getElementById('progress-bar').classList.add('hidden');
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  },

  async testApiConnection() {
    const providerSel = document.getElementById('api-provider');
    const keyInput = document.getElementById('api-key-input');
    const resultEl = document.getElementById('api-test-result');
    const testBtn = document.getElementById('btn-test-api');

    if (typeof AiGrader === 'undefined') {
      alert('AI-module niet geladen.');
      return;
    }
    if (AiGrader.VERSION !== '5') {
      resultEl.classList.remove('hidden');
      resultEl.className = 'api-test-result fail';
      resultEl.innerHTML = '<strong>Verouderde versie geladen</strong><br>Druk <strong>Ctrl+Shift+R</strong> (harde refresh) en test opnieuw.';
      return;
    }

    const provider = providerSel?.value || 'gemini';
    const key = keyInput?.value || '';

    AiGrader.saveProvider(provider);
    AiGrader.saveKey(key);

    testBtn.disabled = true;
    testBtn.textContent = 'Testen...';
    resultEl.classList.remove('hidden', 'ok', 'fail');
    resultEl.className = 'api-test-result';
    resultEl.textContent = 'Verbinding testen...';

    try {
      const res = await AiGrader.testConnection(provider, key);
      resultEl.classList.add('ok');
      resultEl.innerHTML = `<strong>API werkt</strong> (${res.provider}, ${res.model}, ${res.responseTime} ms)<br>${this.escapeHtml(res.message)}`;
      document.getElementById('ai-status').textContent = AiGrader.statusLabel();
    } catch (err) {
      resultEl.classList.add('fail');
      resultEl.innerHTML = `<strong>API mislukt</strong><br>${this.escapeHtml(err.message)}`;
      if (err.isRateLimit) {
        resultEl.innerHTML += '<br><br>Wacht 60 seconden en probeer opnieuw. Lokale beoordeling werkt altijd zonder API.';
      }
    } finally {
      testBtn.disabled = false;
      testBtn.textContent = 'Test API-verbinding';
      resultEl.classList.remove('hidden');
    }
  },

  formatContext(text) {
    if (!text) return '';
    return text
      .split('\n')
      .map((line) => {
        const esc = this.escapeHtml(line);
        if (line.startsWith('## ')) return `<h4>${esc.slice(3)}</h4>`;
        if (line.startsWith('**') && line.endsWith('**')) return `<p><strong>${esc.slice(2, -2)}</strong></p>`;
        if (line.startsWith('|')) return `<code class="ctx-line">${esc}</code>`;
        if (line.startsWith('- ')) return `<li>${esc.slice(2)}</li>`;
        if (line.trim() === '') return '';
        return `<p>${esc}</p>`;
      })
      .join('');
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
