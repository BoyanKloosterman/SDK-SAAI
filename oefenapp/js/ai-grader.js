// AI-beoordeling — Gemini of OpenAI, met rate limiting tegen 429
const AiGrader = {
  KEY_STORAGE: 'saai-ai-key',
  PROVIDER_STORAGE: 'saai-ai-provider',
  LEGACY_KEY: 'saai-openai-key',
  MIN_INTERVAL_MS: 6000,
  lastCallAt: 0,

  // Actuele modellen (geen gemini-1.5-flash — geeft 404)
  GEMINI_MODELS: ['gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-2.0-flash'],

  getProvider() {
    const saved = localStorage.getItem(this.PROVIDER_STORAGE);
    if (saved === 'openai' || saved === 'gemini') return saved;
    const key = this.getKey();
    if (key.startsWith('AIza')) return 'gemini';
    if (key.startsWith('sk-')) return 'openai';
    return 'gemini';
  },

  saveProvider(provider) {
    localStorage.setItem(this.PROVIDER_STORAGE, provider);
  },

  hasKey() {
    return !!this.getKey();
  },

  getKey() {
    return localStorage.getItem(this.KEY_STORAGE)
      || localStorage.getItem(this.LEGACY_KEY)
      || '';
  },

  saveKey(key) {
    const trimmed = (key || '').trim();
    if (trimmed) {
      localStorage.setItem(this.KEY_STORAGE, trimmed);
      if (trimmed.startsWith('AIza')) this.saveProvider('gemini');
      else if (trimmed.startsWith('sk-')) this.saveProvider('openai');
    } else {
      localStorage.removeItem(this.KEY_STORAGE);
      localStorage.removeItem(this.LEGACY_KEY);
    }
  },

  async waitForRateLimit() {
    const now = Date.now();
    const wait = this.MIN_INTERVAL_MS - (now - this.lastCallAt);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    this.lastCallAt = Date.now();
  },

  buildPrompt(question, userAnswer, partContext) {
    const qText = partContext
      ? `Deelvraag ${partContext.label}: ${partContext.question}`
      : question.question;
    const criteria = partContext?.modelAnswer || question.modelAnswer || '';
    const rubricHint = partContext?.rubric?.gradingCriteria || question.rubric?.gradingCriteria || '';
    const sysCtx = question.systemContext || partContext?.systemContext || '';

    const system = `Je bent examinator voor het vak SDK & SAAI (software design & architectuur) in Nederland.
Beoordeel het studentantwoord INHOUDELIJK — niet alleen keywords.
Geef ALLEEN geldig JSON, geen markdown:
{"score":0-100,"correct":true/false,"feedback":["max 5 punten NL"],"missing":["ontbreekt"],"strengths":["goed"]}`;

    const user = `${sysCtx ? 'SYSTEEMCONTEXT:\n' + sysCtx + '\n\n' : ''}VRAAG:\n${qText}\n\nMODELANTWOORD / CRITERIA:\n${criteria}\n${rubricHint ? '\nRUBRIC:\n' + rubricHint : ''}\n\nSTUDENTANTWOORD:\n${userAnswer || '(leeg)'}\n\nScore 70+ alleen als inhoudelijk compleet en kloppend.`;

    return { system, user, criteria };
  },

  buildMultiPrompt(question, answers) {
    const parts = (question.parts || []).map((p) => {
      const ans = answers[p.key] || '(leeg)';
      return `--- ${p.label} ---\nVraag: ${p.question}\nModel: ${p.modelAnswer || ''}\nStudent: ${ans}`;
    }).join('\n\n');

    const system = `Je bent examinator SDK & SAAI. Beoordeel ELKE deelvraag apart.
Geef ALLEEN JSON:
{"parts":{"a":{"score":0-100,"correct":bool,"feedback":["..."],"missing":[]},"b":{...}},"overall":0-100}`;

    const user = `Beoordeel alle deelvragen:\n\n${parts}`;
    return { system, user };
  },

  parseResult(parsed, criteria) {
    return {
      score: Math.min(100, Math.max(0, Math.round(parsed.score || 0))),
      correct: !!parsed.correct || (parsed.score || 0) >= 70,
      feedback: [
        ...(parsed.strengths || []).map((s) => `+ ${s}`),
        ...(parsed.feedback || []),
        ...(parsed.missing || []).map((m) => `Ontbreekt: ${m}`),
      ],
      modelAnswer: criteria,
      aiReviewed: true,
      aiStyle: [
        parsed.strengths?.length ? `Sterk: ${parsed.strengths.join('; ')}` : '',
        parsed.missing?.length ? `Ontbreekt: ${parsed.missing.join('; ')}` : '',
        ...(parsed.feedback || []),
      ].filter(Boolean).join('\n'),
    };
  },

  extractJson(text) {
    const raw = (text || '{}').trim();
    try {
      return JSON.parse(raw);
    } catch (_) {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
      throw new Error('Geen geldig JSON van AI');
    }
  },

  isRateLimitError(status, errText) {
    return status === 429 || /too many requests|resource exhausted|quota/i.test(errText || '');
  },

  isModelNotFound(status, errText) {
    return status === 404 || /not found|not supported for generatecontent/i.test(errText || '');
  },

  async callGemini(key, system, user, model) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: { temperature: 0.2, responseMimeType: 'application/json' },
      }),
    });

    const errText = res.ok ? '' : await res.text();
    if (!res.ok) {
      const err = new Error(`Gemini ${res.status} (${model}): ${errText.slice(0, 120)}`);
      err.status = res.status;
      err.model = model;
      err.isRateLimit = this.isRateLimitError(res.status, errText);
      err.isNotFound = this.isModelNotFound(res.status, errText);
      throw err;
    }

    const data = await res.json();
    return this.extractJson(data.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
  },

  async callGeminiWithRetry(key, system, user) {
    let lastErr;

    for (const model of this.GEMINI_MODELS) {
      for (let attempt = 0; attempt < 2; attempt++) {
        await this.waitForRateLimit();
        try {
          const result = await this.callGemini(key, system, user, model);
          this.activeModel = model;
          return result;
        } catch (err) {
          lastErr = err;
          if (err.isNotFound) break; // volgend model proberen
          if (err.isRateLimit && attempt === 0) {
            await new Promise((r) => setTimeout(r, 10000));
            continue;
          }
          break;
        }
      }
    }
    throw lastErr || new Error('Geen werkend Gemini-model gevonden');
  },

  async callOpenAI(key, system, user) {
    await this.waitForRateLimit();
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
        response_format: { type: 'json_object' },
      }),
    });

    const errText = res.ok ? '' : await res.text();
    if (!res.ok) {
      const err = new Error(`OpenAI ${res.status}: ${errText.slice(0, 200)}`);
      err.isRateLimit = res.status === 429;
      throw err;
    }

    const data = await res.json();
    return this.extractJson(data.choices?.[0]?.message?.content || '{}');
  },

  async callApi(system, user) {
    const key = this.getKey();
    if (!key) throw new Error('Geen API-key');
    return this.getProvider() === 'openai'
      ? this.callOpenAI(key, system, user)
      : this.callGeminiWithRetry(key, system, user);
  },

  async grade(question, userAnswer, partContext) {
    const { system, user, criteria } = this.buildPrompt(question, userAnswer, partContext);
    const parsed = await this.callApi(system, user);
    return this.parseResult(parsed, criteria);
  },

  async gradeMulti(question, answers) {
    const { system, user } = this.buildMultiPrompt(question, answers);
    const parsed = await this.callApi(system, user);

    const partResults = {};
    const parts = question.parts || [];
    let total = 0;
    let maxW = 0;

    parts.forEach((part) => {
      const p = parsed.parts?.[part.key] || { score: parsed.overall || 0, feedback: ['AI batch'] };
      partResults[part.key] = {
        score: Math.min(100, Math.max(0, Math.round(p.score || 0))),
        correct: (p.score || 0) >= 70,
        feedback: p.feedback || [],
        aiReviewed: true,
        modelAnswer: part.modelAnswer,
      };
      maxW += part.weight || 1;
      total += ((p.score || 0) / 100) * (part.weight || 1);
    });

    const score = maxW ? Math.round((total / maxW) * 100) : 0;
    return {
      score,
      correct: score >= 70,
      feedback: parts.map((p) => `${p.label}: ${partResults[p.key].score}% [AI]`),
      partResults,
      modelAnswer: question.modelAnswer,
      aiReviewed: true,
    };
  },

  statusLabel() {
    if (!this.hasKey()) return 'Alleen lokale beoordeling';
    const p = this.getProvider() === 'gemini' ? 'Gemini' : 'OpenAI';
    const m = this.activeModel ? ` (${this.activeModel})` : '';
    return `AI actief (${p}${m})`;
  },

  // Snelle test — probeert modellen tot er een werkt, geen lange retries
  async testConnection(provider, key) {
    if (!key || !key.trim()) throw new Error('Vul eerst een API-key in');

    const p = provider || this.getProvider();
    const k = key.trim();
    const system = 'Antwoord ALLEEN als JSON: {"ok":true,"message":"korte bevestiging in het Nederlands"}';
    const user = 'Zeg dat de API-verbinding werkt voor de SDK SAAI toetstrainer.';
    const start = Date.now();

    if (p === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${k}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          temperature: 0,
          messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
          response_format: { type: 'json_object' },
          max_tokens: 80,
        }),
      });
      const errText = res.ok ? '' : await res.text();
      if (!res.ok) {
        const err = new Error(this.formatApiError(res.status, errText, 'OpenAI'));
        err.isRateLimit = res.status === 429;
        throw err;
      }
      const data = await res.json();
      const parsed = this.extractJson(data.choices?.[0]?.message?.content || '{}');
      return {
        ok: true,
        provider: 'OpenAI',
        model: 'gpt-4o-mini',
        message: parsed.message || 'Verbinding OK',
        responseTime: Date.now() - start,
      };
    }

    // Gemini: elk model 1x proberen, geen 6s wachten bij test
    let lastErr;
    for (const model of this.GEMINI_MODELS) {
      try {
        const parsed = await this.callGemini(k, system, user, model);
        this.activeModel = model;
        this.lastCallAt = Date.now();
        return {
          ok: true,
          provider: 'Gemini',
          model,
          message: parsed.message || 'Verbinding OK',
          responseTime: Date.now() - start,
        };
      } catch (err) {
        lastErr = err;
        if (!err.isNotFound) throw new Error(this.formatApiError(err.status, err.message, 'Gemini'));
      }
    }
    throw new Error(
      lastErr?.isNotFound
        ? 'Geen werkend Gemini-model. Controleer je key in Google AI Studio.'
        : (lastErr?.message || 'Gemini niet bereikbaar')
    );
  },

  formatApiError(status, errText, provider) {
    if (status === 429) {
      return '429 Too Many Requests — wacht 1 minuut en probeer opnieuw.';
    }
    if (status === 404) {
      return '404 Model niet gevonden — app probeert automatisch een ander model.';
    }
    if (status === 400 && /API key not valid|invalid|API_KEY_INVALID/i.test(errText)) {
      return 'Ongeldige API-key — kopieer opnieuw van aistudio.google.com/apikey';
    }
    if (status === 403) {
      return '403 — schakel Generative Language API in via Google AI Studio.';
    }
    return `${provider} fout ${status}: ${(errText || '').slice(0, 120)}`;
  },
};
