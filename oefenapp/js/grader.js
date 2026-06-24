// Antwoord-checker — format + inhoudelijke kwaliteit (vooral ADR)
const Grader = {
  normalize(text) {
    return (text || '').toLowerCase().replace(/[^\w\s#+-]/g, ' ').replace(/\s+/g, ' ').trim();
  },

  matchesAny(norm, patterns) {
    return patterns.some((p) => {
      if (typeof p === 'string') return norm.includes(p.toLowerCase());
      return p.test(norm);
    });
  },

  // Nygard-sectie uit markdown halen
  extractAdrSection(answer, name) {
    const re = new RegExp(`##\\s*${name}\\s*\\n([\\s\\S]*?)(?=\\n##\\s|$)`, 'i');
    const m = (answer || '').match(re);
    return m ? m[1].trim() : '';
  },

  // Minimaal 2 concrete keuzes in Decision
  countAdrDecisionItems(text) {
    if (!text) return 0;
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    const bullets = lines.filter((l) => /^[-*•]\s+|^\d+[.)]\s+/.test(l));
    if (bullets.length >= 2) return bullets.length;

    const sentences = text
      .split(/(?<=[.!?])\s+|\n+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 12);
    const verbHits = sentences.filter((s) =>
      /\b(gebruik|kiezen|kozen|implement|bouwen|plaats|verwerk|introduc|adopt|stellen|besluit|public|consumeer)\w*/i.test(s)
    );
    if (verbHits.length >= 2) return verbHits.length;
    if (sentences.length >= 2) return 2;
    return sentences.length || (text.length > 40 ? 1 : 0);
  },

  // Minimaal 1 voordeel (+) en 1 nadeel (-) in Consequences
  countAdrProCon(text) {
    if (!text) return { pros: 0, cons: 0 };
    let pros = 0;
    let cons = 0;

    text.split('\n').forEach((line) => {
      const t = line.trim();
      if (/^\+/.test(t) && t.length > 2) pros++;
      else if (/^[-–—]/.test(t) && !/^---/.test(t) && t.length > 2) cons++;
    });

    const plusLines = (text.match(/^\s*\+/gm) || []).length;
    const minusLines = (text.match(/^\s*-(?!\s*-)\S/gm) || []).length;
    pros = Math.max(pros, plusLines);
    cons = Math.max(cons, minusLines);

    const norm = this.normalize(text);
    if (pros === 0 && /voordeel|positief/.test(norm)) pros = 1;
    if (cons === 0 && /nadeel|negatief/.test(norm)) cons = 1;

    return { pros, cons };
  },

  validateAdrStructure(answer) {
    const decisionText = this.extractAdrSection(answer, 'decision');
    const consText = this.extractAdrSection(answer, 'consequences');
    const decisionCount = this.countAdrDecisionItems(decisionText);
    const { pros, cons } = this.countAdrProCon(consText);
    const issues = [];

    if (decisionCount < 2) {
      issues.push(`Decision: minimaal 2 concrete beslissingen (nu ${decisionCount}).`);
    }
    if (pros < 1) issues.push('Consequences: minimaal 1 voordeel (+) ontbreekt.');
    if (cons < 1) issues.push('Consequences: minimaal 1 nadeel (-) ontbreekt.');

    return { decisionCount, pros, cons, issues, valid: issues.length === 0 };
  },

  applyAdrStructureToResult(result, answer) {
    const structure = this.validateAdrStructure(answer);
    if (structure.valid) {
      result.feedback = result.feedback || [];
      if (!result.feedback.some((f) => f.includes('2 concrete beslissing'))) {
        result.feedback.push(`Structuur OK: ${structure.decisionCount} beslissing(en), ${structure.pros} voordeel-regel(s), ${structure.cons} nadeel-regel(s).`);
      }
      return result;
    }

    result.feedback = [...structure.issues, ...(result.feedback || [])];
    result.score = Math.min(result.score ?? 100, 65);
    result.correct = (result.score ?? 0) >= 70;
    result.structureOk = false;
    return result;
  },

  grade(question, userAnswer) {
    switch (question.type) {
      case 'mcq': return this.gradeMcq(question, userAnswer);
      case 'code-analysis': return this.gradeCodeAnalysis(question, userAnswer);
      case 'uml-relation': return this.gradeMcq(question, userAnswer);
      case 'ordering': return this.gradeOrdering(question, userAnswer);
      case 'text': return this.gradeText(question, userAnswer);
      case 'open-identify': return this.gradeOpenIdentify(question, userAnswer);
      case 'open-write': return this.gradeOpenWrite(question, userAnswer);
      case 'adr-write': return this.gradeAdr(question, userAnswer);
      case 'pseudocode-write': return this.gradePseudocode(question, userAnswer);
      case 'factory-uml': return this.gradeMcq(question, userAnswer);
      case 'open-multi': return this.gradeOpenMulti(question, userAnswer);
      default: return { score: 0, feedback: ['Onbekend vraagtype.'], correct: false };
    }
  },

  gradeMcq(q, answer) {
    const correct = answer === q.answer;
    return {
      score: correct ? 100 : 0,
      correct,
      feedback: correct ? ['Correct!'] : [`Fout. Het juiste antwoord is: ${q.options[q.answer]}`],
      modelAnswer: q.options[q.answer],
    };
  },

  gradeCodeAnalysis(q, answer) {
    const selected = Array.isArray(answer) ? answer : [answer];
    const expected = Array.isArray(q.answer) ? q.answer : [q.answer];
    const match = selected.length === expected.length && selected.every((a) => expected.includes(a));
    return {
      score: match ? 100 : selected.some((a) => expected.includes(a)) ? 50 : 0,
      correct: match,
      feedback: match ? ['Correct!'] : [`Verwacht: ${expected.map((i) => q.options[i]).join(', ')}`],
      modelAnswer: expected.map((i) => q.options[i]).join(', '),
    };
  },

  gradeOrdering(q, answer) {
    const correct = JSON.stringify(answer) === JSON.stringify(q.answer);
    return {
      score: correct ? 100 : 0,
      correct,
      feedback: correct ? ['Juiste volgorde!'] : [`Juiste volgorde: ${q.answer.join(' → ')}`],
      modelAnswer: q.answer.join(' → '),
    };
  },

  gradeText(q, answer) {
    const norm = this.normalize(answer);
    const rubric = q.rubric;
    let matched = 0;
    const missing = [];
    rubric.keywords.forEach((group) => {
      const found = group.some((kw) => norm.includes(kw));
      if (found) matched++;
      else missing.push(group[0]);
    });
    const score = Math.round((matched / rubric.keywords.length) * 100);
    const feedback = matched >= rubric.minMatches
      ? [`Goed! Je noemde ${matched}/${rubric.keywords.length} onderdelen.`]
      : [`Je noemde ${matched}/${rubric.keywords.length}. Ontbrekend: ${missing.join(', ')}.`];
    return { score, correct: matched >= rubric.minMatches, feedback, modelAnswer: q.modelAnswer };
  },

  gradeOpenIdentify(q, answer) {
    const norm = this.normalize(answer);
    const rubric = q.rubric;
    const feedback = [];
    let points = 0;

    const smellHit = rubric.smell.acceptable.some((s) => norm.includes(s));
    const principleHit = rubric.principle.acceptable.some((p) => norm.includes(p));

    if (smellHit) {
      points += 50;
      feedback.push(`Design smell herkend (${rubric.smell.expected}).`);
    } else {
      feedback.push(`Design smell: verwacht iets als ${rubric.smell.expected}. Tip: ${rubric.smell.hint || ''}`);
    }

    if (principleHit) {
      points += 50;
      feedback.push(`Principe herkend (${rubric.principle.expected}).`);
    } else {
      feedback.push(`Principe: verwacht ${rubric.principle.expected}. Tip: ${rubric.principle.hint || ''}`);
    }

    return {
      score: points,
      correct: points >= 70,
      feedback,
      modelAnswer: q.modelAnswer,
    };
  },

  gradeOpenWrite(q, answer) {
    const rubric = q.rubric || {};
    if (rubric.subtype === 'four-layers') return this.gradeFourLayers(q, answer);
    if (rubric.subtype === 'loose-coupling') return this.gradeLooseCoupling(q, answer);

    const norm = this.normalize(answer);
    const feedback = [];
    let points = 0;
    const max = rubric.maxPoints || 100;

    (rubric.required || []).forEach((req) => {
      if (norm.includes(req.toLowerCase())) {
        points += rubric.requiredPoints || 15;
        feedback.push(`Bevat kernbegrip: ${req}`);
      }
    });

    (rubric.keywordGroups || []).forEach((group) => {
      const hit = group.words.some((w) => norm.includes(w));
      if (hit) {
        points += group.points || 10;
        feedback.push(group.feedback || `Goed punt: ${group.words[0]}`);
      } else if (group.required) {
        feedback.push(`Ontbreekt: ${group.label || group.words[0]}`);
      }
    });

    if (answer.length < (rubric.minLength || 40)) {
      feedback.push('Antwoord is te kort — werk het verder uit.');
      points = Math.min(points, 40);
    }

    const score = Math.min(max, Math.round(points));
    return {
      score,
      correct: score >= 70,
      feedback: feedback.length ? feedback : ['Antwoord ontvangen, maar mist kernpunten.'],
      modelAnswer: q.modelAnswer,
    };
  },

  // 3.2 — per laag naam + verantwoordelijkheid inhoudelijk checken
  gradeFourLayers(q, answer) {
    const norm = this.normalize(answer);
    const feedback = [];
    const layers = [
      {
        label: 'Presentation',
        names: ['presentation', 'presentatie', 'presentatielaag'],
        duties: ['gui', 'scherm', 'knop', 'formulier', 'actionlistener', 'weergave', 'tonen', 'gebruiker ziet', 'interface gebruiker', 'view'],
        expected: 'GUI/schermen tonen, events doorgeven (zo dom mogelijk)',
      },
      {
        label: 'Application Logic',
        names: ['application logic', 'applicatie logica', 'applicatielogica', 'applicatie-laag'],
        duties: ['manager', 'check', 'valid', 'coördin', 'delegeer', 'app-niveau', 'mag dit', 'orkestreer'],
        expected: 'Managers: checks ("mag dit?"), coördineren, opslag delegeren naar DAO',
      },
      {
        label: 'Domain',
        names: ['domain', 'domein', 'domeinlaag'],
        duties: ['entiteit', 'business', 'regel', 'member', 'book', 'domeinkennis', 'domeinmodel', 'object'],
        expected: 'Entiteiten (Member, Book) met domeinkennis en bedrijfsregels',
      },
      {
        label: 'Data Storage',
        names: ['data storage', 'datastorage', 'data opslag', 'opslaglaag'],
        duties: ['dao', 'database', 'sql', 'opslag', 'persistent', 'connectie', 'crud', 'repository'],
        expected: 'DAO\'s, database-connectie, alle SQL/opslag-logica',
      },
    ];

    let points = 0;
    const missing = [];

    layers.forEach((layer) => {
      const hasName = layer.names.some((n) => norm.includes(n));
      const hasDuty = layer.duties.some((d) => norm.includes(d));
      if (hasName && hasDuty) {
        points += 25;
        feedback.push(`${layer.label}: laag én verantwoordelijkheid aanwezig.`);
      } else if (hasName) {
        points += 10;
        missing.push(`${layer.label}: naam genoemd, maar verantwoordelijkheid ontbreekt (${layer.expected})`);
      } else if (hasDuty) {
        points += 5;
        missing.push(`${layer.label}: verantwoordelijkheid genoemd, maar laagnaam ontbreekt`);
      } else {
        missing.push(`${layer.label}: ontbreekt (${layer.expected})`);
      }
    });

    if (answer.length < 80) {
      feedback.push('Antwoord is te kort — noem expliciet alle 4 lagen met elk een verantwoordelijkheid.');
      points = Math.min(points, 50);
    }

    if (missing.length) feedback.push(...missing);

    const score = Math.min(100, points);
    return {
      score,
      correct: score >= 70,
      feedback,
      modelAnswer: q.modelAnswer,
      breakdown: `Lagen: ${4 - missing.filter((m) => m.includes('ontbreekt')).length}/4 compleet`,
    };
  },

  // 3.3 — loose coupling + interface + DI inhoudelijk
  gradeLooseCoupling(q, answer) {
    const norm = this.normalize(answer);
    const feedback = [];
    let points = 0;

    const checks = [
      {
        pts: 25,
        label: 'Definitie loose coupling',
        ok: ['loose coupling', 'losse koppeling', 'los gekoppeld', 'niet afhankelijk van concrete', 'niet aan concrete', 'zwakke koppeling', 'tight coupling', 'strakke koppeling'],
        miss: 'Leg uit wat loose coupling is: niet afhankelijk van een concrete klasse/implementatie.',
      },
      {
        pts: 25,
        label: 'Interface / abstractie',
        ok: ['interface', 'abstract', 'program to an interface', 'programmeer tegen', 'contract', 'imemberdao', 'iorderdao'],
        miss: 'Leg uit dat je programmeert tegen een interface (abstractie), niet tegen SqlDAO/MySqlDAO.',
      },
      {
        pts: 30,
        label: 'Dependency Injection',
        ok: ['inject', 'constructor', 'main', 'meegeven', 'doorgeven', 'parameter', 'dependency injection', 'di'],
        miss: 'Leg uit hoe DI werkt: main maakt concrete object aan en geeft het via constructor mee.',
      },
      {
        pts: 20,
        label: 'Voordeel / voorbeeld',
        ok: ['wissel', 'vervang', 'mysql', 'xml', 'test', 'andere implementatie', 'zonder aan te passen', 'manager blijft', 'flexibel', 'uitbreid'],
        miss: 'Noem het voordeel: Manager/Service blijft hetzelfde als je van implementatie wisselt.',
      },
    ];

    checks.forEach((c) => {
      if (c.ok.some((k) => norm.includes(k))) {
        points += c.pts;
        feedback.push(`${c.label}: aanwezig.`);
      } else {
        feedback.push(c.miss);
      }
    });

    if (answer.length < 60) {
      feedback.push('Antwoord is te kort — beschrijf definitie, interface, DI en voordeel in volledige zinnen.');
      points = Math.min(points, 45);
    }

    const score = Math.min(100, points);
    return {
      score,
      correct: score >= 70,
      feedback,
      modelAnswer: q.modelAnswer,
      breakdown: `Loose coupling: ${points}/100 — definitie, interface, DI, voordeel`,
    };
  },

  // Juiste casuscontext per ADR-deel (deel 2 = kortere context, minder tokens)
  getAdrPartQuestion(q, part) {
    const parts = (q.parts || []).filter((p) => p.type === 'adr-write');
    const idx = parts.findIndex((p) => p.key === part.key);
    const ctx = idx === 1 && q.systemContextPart2 ? q.systemContextPart2 : (q.systemContext || part.systemContext);
    return { ...part, question: part.question, systemContext: ctx };
  },

  mergeMultiPartResults(q, partResults) {
    const parts = q.parts || [];
    const feedback = [];
    let total = 0;
    let maxW = 0;
    parts.forEach((part) => {
      const pr = partResults[part.key];
      if (!pr) return;
      maxW += part.weight || 1;
      total += (pr.score / 100) * (part.weight || 1);
      feedback.push(`${part.label}: ${pr.score}%${pr.aiReviewed ? ' [AI]' : ''}`);
    });
    const score = maxW ? Math.round((total / maxW) * 100) : 0;
    const graded = parts.filter((p) => partResults[p.key]).length;
    return {
      score,
      correct: score >= 70,
      feedback: feedback.length ? feedback : ['Nog geen deelvragen beoordeeld.'],
      partResults,
      modelAnswer: q.modelAnswer,
      aiReviewed: parts.some((p) => partResults[p.key]?.aiReviewed),
      partial: graded > 0 && graded < parts.length,
    };
  },

  async gradeAdrPartAi(q, part, answer) {
    const partQ = this.getAdrPartQuestion(q, part);
    try {
      if (typeof AiGrader !== 'undefined' && AiGrader.hasKey()) {
        let result = await AiGrader.gradeAdr(partQ, answer);
        result = this.applyAdrStructureToResult(result, answer);
        result.aiReviewed = true;
        return { ...result, modelAnswer: part.modelAnswer };
      }
    } catch (err) {
      const local = this.gradeAdr(partQ, answer);
      local.feedback.unshift(`AI niet beschikbaar (${err.message}) — lokale beoordeling:`);
      local.aiReviewed = false;
      return { ...local, modelAnswer: part.modelAnswer };
    }
    const local = this.gradeAdr(partQ, answer);
    return { ...local, modelAnswer: part.modelAnswer };
  },

  async gradeCasusAdrPart(q, partKey, answer) {
    const part = (q.parts || []).find((p) => p.key === partKey);
    if (!part) throw new Error('Onbekend ADR-deel');
    return this.gradeAdrPartAi(q, part, answer);
  },

  gradePart(part, answer) {
    if (part.type === 'open-identify') return this.gradeOpenIdentify(part, answer);
    if (part.type === 'adr-write') return this.gradeAdr(part, answer);
    if (part.type === 'pseudocode-write') return this.gradePseudocode(part, answer);
    if (part.type === 'text') return this.gradeText(part, answer);
    if (part.type === 'open-write') return this.gradeOpenWrite(part, answer);
    return { score: 0, feedback: ['Onbekend deeltype'] };
  },

  usesAiGrading(q) {
    const aiTypes = ['open-write', 'open-multi', 'open-identify', 'adr-write', 'text'];
    if (!aiTypes.includes(q.type)) return false;
    if (q.type === 'open-multi') {
      return (q.parts || []).some((p) => ['open-write', 'open-identify', 'adr-write'].includes(p.type));
    }
    if (q.rubric?.subtype === 'four-layers' || q.rubric?.subtype === 'loose-coupling') return true;
    return ['open-write', 'open-identify', 'adr-write'].includes(q.type);
  },

  async gradeAsync(q, answer) {
    if (typeof AiGrader !== 'undefined' && AiGrader.hasKey() && this.usesAiGrading(q)) {
      try {
        if (q.type === 'open-multi') {
          return await this.gradeOpenMultiAi(q, answer);
        }
        const result = q.type === 'adr-write'
          ? await AiGrader.gradeAdr(q, answer)
          : await AiGrader.grade(q, answer);
        result.feedback = result.feedback?.length ? result.feedback : ['AI-beoordeling voltooid.'];
        if (q.type === 'adr-write') return this.applyAdrStructureToResult(result, answer);
        return result;
      } catch (err) {
        const local = this.grade(q, answer);
        local.feedback.unshift(`AI niet beschikbaar (${err.message}) — lokale beoordeling:`);
        return local;
      }
    }
    return this.grade(q, answer);
  },

  async gradeOpenMultiAi(q, answers) {
    const parts = q.parts || [];
    const allAdr = parts.length > 0 && parts.every((p) => p.type === 'adr-write');

    // ADR-casus: per ADR apart, bij 429 doorgaan met lokale fallback voor dat deel
    if (allAdr && typeof AiGrader !== 'undefined' && AiGrader.hasKey()) {
      const partResults = {};
      for (const part of parts) {
        const ans = (answers && answers[part.key]) || '';
        partResults[part.key] = await this.gradeAdrPartAi(q, part, ans);
      }
      return this.mergeMultiPartResults(q, partResults);
    }

    // Overige open-multi: één batch API-call
    if (typeof AiGrader !== 'undefined' && AiGrader.hasKey()) {
      try {
        return await AiGrader.gradeMulti(q, answers);
      } catch (err) {
        const local = this.gradeOpenMulti(q, answers);
        local.feedback.unshift(`AI: ${err.message} — lokale beoordeling`);
        return local;
      }
    }
    return this.gradeOpenMulti(q, answers);
  },

  gradeOpenMulti(q, answers) {
    const parts = q.parts || [];
    const feedback = [];
    let total = 0;
    let maxTotal = 0;
    const partResults = {};

    parts.forEach((part) => {
      const ans = (answers && answers[part.key]) || '';
      maxTotal += part.weight || 1;
      const result = this.gradePart(part, ans);
      partResults[part.key] = result;
      total += (result.score / 100) * (part.weight || 1);
      feedback.push(`${part.label}: ${result.score}% — ${result.feedback[0] || ''}`);
    });

    const score = maxTotal ? Math.round((total / maxTotal) * 100) : 0;
    return { score, correct: score >= 70, feedback, partResults, modelAnswer: q.modelAnswer };
  },

  // Hoeveel alternatieven noemt de student zelf in Context?
  scoreContextAlternatives(answer) {
    const ctxMatch = answer.match(/##\s*context([\s\S]*?)(?=##\s*decision|$)/i);
    const ctx = ctxMatch ? ctxMatch[1] : answer;
    const altCue = /\b(alternatief|overwogen|optie|versus|vs\.|in plaats van|ofwel|niet gekozen)\b/gi;
    const cueHits = (ctx.match(altCue) || []).length;
    const bullets = (ctx.match(/^\s*[-*]|\n\s*\d+[.)]/g) || []).length;
    if (cueHits >= 2 || bullets >= 2) return 2;
    if (cueHits >= 1 || bullets >= 1) return 1;
    return 0;
  },

  // ADR: format (25) + context/alternatieven (15) + oplossingskwaliteit (40) + consequences (20)
  gradeAdr(q, answer) {
    const norm = this.normalize(answer);
    const rubric = q.rubric || {};
    const feedback = [];
    let formatScore = 0;
    let contextScore = 0;
    let solutionScore = 0;
    let consequenceScore = 0;

    // --- FORMAT (25 punten) ---
    const sections = {
      status: /##\s*status|status\s*:/i.test(answer),
      context: /##\s*context|context\s*:/i.test(answer),
      decision: /##\s*decision|decision\s*:/i.test(answer),
      consequences: /##\s*consequences|consequences\s*:/i.test(answer),
      title: /^#\s+\S/m.test(answer),
    };
    const sectionCount = Object.values(sections).filter(Boolean).length;
    formatScore = Math.round((sectionCount / 5) * 25);

    if (sectionCount >= 4) {
      feedback.push(`Format: ${sectionCount}/5 Nygard-secties aanwezig.`);
    } else {
      feedback.push(`Format: slechts ${sectionCount}/5 secties. Nygard = Titel, Status, Context, Decision, Consequences.`);
    }

    // --- CONTEXT + ALTERNATIEVEN (15 punten) ---
    const contextHits = (rubric.contextKeywords || []).filter((kw) => norm.includes(kw));
    contextScore += Math.min(8, contextHits.length * 2);

    const problemHits = (rubric.problemMustMention || []).filter((kw) => norm.includes(kw));
    if (problemHits.length > 0) {
      contextScore += 4;
      feedback.push('Context benoemt het kernprobleem uit de casus.');
    } else {
      feedback.push('Context: beschrijf het concrete probleem uit de casus.');
    }

    const altLevel = this.scoreContextAlternatives(answer);
    if (altLevel >= 2) {
      contextScore += 3;
      feedback.push('Context: meerdere opties overwogen.');
    } else if (altLevel === 1) {
      contextScore += 1;
      feedback.push('Context: noem minstens 2 overwogen alternatieven.');
    } else {
      feedback.push('Context: vergelijk minstens 2 opties vóór je Decision.');
    }
    contextScore = Math.min(15, contextScore);

    // --- OPLOSSINGSKWALITEIT (40 punten) — belangrijkste deel ---
    const sq = rubric.solutionQuality || {};
    let solutionVerdict = 'onduidelijk';

    if (sq.excellent && sq.excellent.some((s) => this.matchesAny(norm, s.patterns))) {
      solutionScore = 38;
      solutionVerdict = 'uitstekend';
      const match = sq.excellent.find((s) => this.matchesAny(norm, s.patterns));
      feedback.push(`Oplossing: uitstekende keuze voor dit scenario. ${match.why}`);
    } else if (sq.good && sq.good.some((s) => this.matchesAny(norm, s.patterns))) {
      solutionScore = 32;
      solutionVerdict = 'goed';
      const match = sq.good.find((s) => this.matchesAny(norm, s.patterns));
      feedback.push(`Oplossing: goede keuze. ${match.why}`);
    } else if (sq.acceptable && sq.acceptable.some((s) => this.matchesAny(norm, s.patterns))) {
      solutionScore = 22;
      solutionVerdict = 'acceptabel';
      const match = sq.acceptable.find((s) => this.matchesAny(norm, s.patterns));
      feedback.push(`Oplossing: acceptabel maar niet optimaal. ${match.why}`);
    } else if (sq.weak && sq.weak.some((s) => this.matchesAny(norm, s.patterns))) {
      solutionScore = 12;
      solutionVerdict = 'zwak';
      const match = sq.weak.find((s) => this.matchesAny(norm, s.patterns));
      feedback.push(`Oplossing: zwakke keuze voor dit scenario. ${match.why}`);
    } else {
      const decisionHits = (rubric.decisionKeywords || []).filter((kw) => norm.includes(kw));
      if (decisionHits.length > 0) {
        solutionScore = 18;
        feedback.push(`Decision is concreet (${decisionHits.join(', ')}), maar past mogelijk niet optimaal bij het probleem.`);
      } else {
        solutionScore = 5;
        feedback.push('Decision mist een concrete, passende oplossing.');
      }
    }

    // Slechte oplossingen aftrekken
    (sq.poor || []).forEach((p) => {
      if (this.matchesAny(norm, p.patterns)) {
        solutionScore = Math.max(0, solutionScore - (p.penalty || 15));
        solutionVerdict = 'slecht';
        feedback.push(`Oplossing PROBLEEM: ${p.why}`);
      }
    });

    // Bonus: decision sluit aan op context-probleem
    if (problemHits.length > 0 && solutionVerdict === 'uitstekend') {
      solutionScore = Math.min(40, solutionScore + 2);
    }

    // --- DECISION-STRUCTUUR (min. 2 beslissingen) ---
    const structure = this.validateAdrStructure(answer);
    if (structure.decisionCount >= 2) {
      feedback.push(`Decision: ${structure.decisionCount} concrete beslissing(en).`);
    } else {
      formatScore = Math.max(0, formatScore - 8);
      feedback.push(`Decision: minimaal 2 concrete beslissingen (nu ${structure.decisionCount}). Bijv. technologie + werkwijze.`);
    }

    // --- CONSEQUENCES (20 punten) — min. 1 voordeel en 1 nadeel ---
    const hasPosKw = (rubric.consequencePositive || []).some((kw) => norm.includes(kw));
    const hasNegKw = (rubric.consequenceNegative || []).some((kw) => norm.includes(kw));
    const hasPro = structure.pros >= 1;
    const hasCon = structure.cons >= 1;

    if (hasPro && hasCon) {
      consequenceScore = 20;
      feedback.push(`Consequences: ${structure.pros} voordeel(en) en ${structure.cons} nadeel(en).`);
    } else if ((hasPro || hasCon) && (hasPosKw || hasNegKw)) {
      consequenceScore = 10;
      feedback.push('Consequences: gebruik expliciet + voor voordelen en - voor nadelen (minimaal 1 van elk).');
    } else if (hasPro || hasCon || hasPosKw || hasNegKw) {
      consequenceScore = 6;
      feedback.push('Consequences: minimaal 1 voordeel (+) én 1 nadeel (-) verplicht.');
    } else {
      feedback.push('Consequences ontbreken — voeg minimaal 1 + en 1 - toe.');
    }

    const score = Math.min(100, formatScore + contextScore + solutionScore + consequenceScore);
    const breakdown = `Format ${formatScore}/25 | Context ${contextScore}/15 | Oplossing ${solutionScore}/40 | Gevolgen ${consequenceScore}/20`;

    return {
      score,
      correct: score >= 70,
      feedback,
      breakdown,
      solutionVerdict,
      modelAnswer: q.modelAnswer,
      aiStyle: this.buildAdrFeedback(score, breakdown, solutionVerdict, feedback),
    };
  },

  buildAdrFeedback(score, breakdown, verdict, feedback) {
    let summary;
    if (score >= 85) summary = 'Sterke ADR — format én inhoudelijk passende oplossing.';
    else if (score >= 70) summary = 'Voldoende ADR. Kleine verbeteringen mogelijk.';
    else if (score >= 50) summary = 'Format oké, maar oplossing of context moet beter.';
    else summary = 'Onvoldoende — werk Context, Decision en consequences bij.';

    let text = `${summary}\n\nBeoordeling: ${breakdown}\nOplossingskwaliteit: ${verdict}\n\n`;
    text += feedback.join('\n');
    return text;
  },

  gradePseudocode(q, answer) {
    const norm = this.normalize(answer);
    const rubric = q.rubric;
    let points = 0;
    const feedback = [];

    const mustHave = rubric.mustHave || [];
    const found = mustHave.filter((item) => norm.includes(this.normalize(item)));
    points += Math.round((found.length / mustHave.length) * 50);

    if (found.length === mustHave.length) feedback.push('Alle kernonderdelen aanwezig.');
    else feedback.push(`Ontbrekend: ${mustHave.filter((i) => !norm.includes(this.normalize(i))).join(', ')}`);

    if (rubric.diPattern) {
      const hasConstructor = /constructor|\([\w\s:,]*\)/i.test(answer);
      const hasInterface = norm.includes('interface') || norm.includes('implements') || norm.includes('imemberdao') || norm.includes('guifactory');
      if (hasConstructor && hasInterface) {
        points += 25;
        feedback.push('Dependency Injection via constructor: goed.');
      } else {
        feedback.push('Gebruik constructor-injectie met een interface.');
      }
    }

    if (rubric.mainMustHave) {
      const mainFound = rubric.mainMustHave.filter((item) => norm.includes(this.normalize(item)));
      if (mainFound.length >= rubric.mainMustHave.length - 1) {
        points += 15;
        feedback.push('main maakt objecten aan en injecteert.');
      } else {
        feedback.push('main moet factory/dao aanmaken en injecteren.');
      }
    }

    if (norm.includes('return') && norm.includes('new')) {
      points += 10;
      feedback.push('create-methoden returnen new ConcreteObject().');
    }

    const score = Math.min(100, points);
    return {
      score,
      correct: score >= 70,
      feedback,
      modelAnswer: q.modelAnswer,
      aiStyle: this.buildAiFeedback('Pseudocode', score, feedback),
    };
  },

  buildAiFeedback(type, score, feedback) {
    let summary;
    if (score >= 85) summary = `Sterk ${type}-antwoord.`;
    else if (score >= 70) summary = 'Voldoende. Kleine verbeterpunten.';
    else if (score >= 50) summary = 'Gedeeltelijk correct. Bekijk modelantwoord.';
    else summary = 'Nog niet voldoende.';
    return `${summary}\n\n${feedback.join('\n')}`;
  },
};
