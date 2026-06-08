// Onderwerpen volgens samenvatting_sdk_saai_v5.html (secties 1–17)
const SUMMARY_SECTIONS = {
  s1:  { num: 1,  label: 'UML Klassendiagram', color: '#AFA9EC' },
  s2:  { num: 2,  label: 'Design principes & Smells', color: '#5DCAA5' },
  s3:  { num: 3,  label: 'Applicatiearchitectuur', color: '#85B7EB' },
  s4:  { num: 4,  label: 'Systeemarchitectuur', color: '#EF9F27' },
  s5:  { num: 5,  label: 'Messaging & Events', color: '#F0997B' },
  s6:  { num: 6,  label: 'Applicatie-integratie', color: '#ED93B1' },
  s7:  { num: 7,  label: 'Snelle begrippen', color: '#97C459' },
  s8:  { num: 8,  label: 'Loose Coupling & Factory', color: '#F87171' },
  s9:  { num: 9,  label: 'Doorontwikkeling & Refactoring', color: '#60A5FA' },
  s10: { num: 10, label: 'Nygard ADR', color: '#C084FC' },
  s11: { num: 11, label: 'Abstract Factory stap 2', color: '#34D399' },
  s12: { num: 12, label: 'Delivery Guarantees', color: '#FBBF24' },
  s13: { num: 13, label: 'Applicatielandschap', color: '#FB923C' },
  s14: { num: 14, label: 'Referentiearchitectuur & DAO', color: '#5DCAA5' },
  s15: { num: 15, label: 'RabbitMQ', color: '#EF9F27' },
  s16: { num: 16, label: 'Thin vs Fat & Event-driven', color: '#ED93B1' },
  s17: { num: 17, label: 'Visualisaties & Realisatie', color: '#97C459' },
};

// Per vraag-id: welke samenvatting-sectie (override)
const QUESTION_TOPIC_BY_ID = {
  'open-exam-01': 's2',
  'open-exam-02': 's11',
  'open-exam-03': 's5',
  'layer-05': 's14',
  'layer-06': 's6',
  'layer-07': 's6',
  'layer-08': 's14',
  'layer-09': 's14',
  'layer-10': 's14',
  'layer-11': 's14',
  'msg-01': 's5',
  'msg-02': 's12',
  'msg-03': 's5',
  'msg-04': 's5',
  'msg-05': 's6',
  'msg-06': 's12',
  'msg-07': 's5',
  'open-msg-01': 's5',
  'open-msg-02': 's5',
  'open-msg-03': 's12',
  'open-layer-01': 's14',
  'open-layer-02': 's14',
  'open-layer-03': 's14',
  'open-layer-04': 's14',
  'open-factory-01': 's11',
  'open-factory-02': 's8',
  'open-factory-04': 's8',
  'fact-05': 's11',
  'fact-06': 's11',
  'fact-07': 's11',
  'fact-08': 's11',
  'fact-09': 's11',
  'fact-10': 's8',
  'fact-11': 's11',
  'princ-09': 's8',
  'open-adr-01': 's10',
  'smell-10': 's4',
};

const TOPIC_BY_CATEGORY = {
  smell: 's2',
  principle: 's2',
  uml: 's1',
  layers: 's14',
  factory: 's8',
  messaging: 's5',
  adr: 's10',
  concepts: 's7',
  refactoring: 's9',
  visualization: 's17',
  architecture: 's3',
};

function getQuestionTopic(q) {
  if (!q) return 's7';
  if (q.topic) return q.topic;
  if (QUESTION_TOPIC_BY_ID[q.id]) return QUESTION_TOPIC_BY_ID[q.id];
  if (q.category && TOPIC_BY_CATEGORY[q.category]) return TOPIC_BY_CATEGORY[q.category];
  if (q.id && q.id.startsWith('adr-') && q.type === 'adr-write') return 's10';
  return 's7';
}

function getSectionLabel(topicId) {
  const s = SUMMARY_SECTIONS[topicId];
  return s ? `${s.num}. ${s.label}` : topicId;
}

// Extra vragen voor secties die nog weinig dekking hadden
const QUESTIONS_SAMENVATTING = [
  // === s3 Applicatiearchitectuur ===
  {
    id: 'arch-01', category: 'architecture', topic: 's3', type: 'mcq',
    question: 'Wat is het verschil tussen design en architectuur?',
    options: [
      'Design = één klasse/methode; architectuur = opbouw van het hele systeem',
      'Design = database; architectuur = GUI',
      'Ze zijn hetzelfde',
      'Design = UML; architectuur = Java',
    ],
    answer: 0,
    explain: 'Design is dichter bij de code. Architectuur is het grotere plaatje (lagen, subsystemen).',
  },
  {
    id: 'open-arch-01', category: 'architecture', topic: 's3', type: 'open-write',
    question: 'Leg uit wat een domeinmodel is en geef een voorbeeld voor een bibliotheekapp.',
    rubric: {
      minLength: 50,
      keywordGroups: [
        { words: ['essentie', 'object', 'entiteit', 'regel'], points: 20, label: 'Domeinmodel' },
        { words: ['boek', 'lid', 'uitlening', 'bibliotheek', 'member'], points: 20, label: 'Voorbeeld' },
      ],
    },
    modelAnswer: 'Domeinmodel = essentiële objecten en regels van de wereld waarvoor je bouwt. Bibliotheek: Book, Member, Loan met regels (max lenen).',
  },
  {
    id: 'open-arch-02', category: 'architecture', topic: 's3', type: 'open-write',
    question: 'Verschil tussen technical partitioning en domain partitioning? Geef per type een mapstructuur-voorbeeld.',
    rubric: {
      minLength: 60,
      keywordGroups: [
        { words: ['technical', 'laag', 'controllers', 'services', 'repositories'], points: 20 },
        { words: ['domain', 'feature', 'orders', 'checkout', 'inventory'], points: 20 },
      ],
    },
    modelAnswer: 'Technical = mappen per laag (controllers/, services/). Domain = mappen per feature (orders/, checkout/).',
  },

  // === s4 Systeemarchitectuur ===
  {
    id: 'arch-02', category: 'architecture', topic: 's4', type: 'mcq',
    question: 'Waarom is architectuuranalyse belangrijk vóór je code aanpast in een bestaand systeem?',
    options: [
      'Je voorkomt dat je bestaande code breekt of keuzes herhaalt die al zijn afgewezen',
      'Het is verplicht voor Java-compilatie',
      'Alleen voor legacy mainframes',
      'Het vervangt unit tests',
    ],
    answer: 0,
    explain: 'Zonder analyse schrijf je dubbele code, breek je dingen en negeer je eerdere beslissingen.',
  },
  {
    id: 'open-arch-03', category: 'architecture', topic: 's4', type: 'open-write',
    question: 'Leg het verschil uit tussen applicatiearchitectuur en systeemarchitectuur.',
    rubric: {
      minLength: 50,
      keywordGroups: [
        { words: ['één app', 'een app', 'lagen', 'binnen'], points: 20 },
        { words: ['meerdere systemen', 'samen', 'api', 'landschap'], points: 20 },
      ],
    },
    modelAnswer: 'Applicatiearchitectuur = opbouw van één app (lagen, klassen). Systeemarchitectuur = hoe meerdere systemen samenwerken.',
  },

  // === s7 Snelle begrippen ===
  {
    id: 'concept-01', category: 'concepts', topic: 's7', type: 'mcq',
    question: 'Wat is het cruciale verschil tussen een abstracte klasse en een interface?',
    options: [
      'Je erft van max één abstracte klasse, maar kunt meerdere interfaces implementeren',
      'Interfaces hebben altijd code, abstracte klassen niet',
      'Abstracte klassen zijn alleen voor databases',
      'Er is geen verschil',
    ],
    answer: 0,
    explain: 'Abstracte klasse kan gedeelde code + abstracte methoden. Interface = alleen afspraken. Meervoudige interfaces mogelijk.',
  },
  {
    id: 'concept-02', category: 'concepts', topic: 's7', type: 'mcq',
    question: 'Wat is een data-silo?',
    options: [
      'Data opgesloten in één systeem, andere systemen kunnen er niet bij',
      'Een snelle database',
      'Een backup-strategie',
      'Een type message queue',
    ],
    answer: 0,
    explain: 'Data-silo = data zit vast in één systeem (bijv. HR-data niet bereikbaar voor CRM).',
  },
  {
    id: 'concept-03', category: 'concepts', topic: 's7', type: 'mcq',
    question: 'Monoliet vs microservices — welke stelling klopt?',
    options: [
      'Monoliet = één grote app; microservices = veel kleine onafhankelijke services',
      'Monoliet = alleen mainframe; microservices = alleen cloud',
      'Microservices hebben nooit een database',
      'Monolieten zijn altijd sneller',
    ],
    answer: 0,
    explain: 'Monoliet = alles in één app. Microservices = aparte services (Orders, Payments, Users).',
  },
  {
    id: 'open-concept-01', category: 'concepts', topic: 's7', type: 'open-write',
    question: 'Wat is technical debt? Geef een concreet voorbeeld.',
    rubric: {
      minLength: 40,
      keywordGroups: [
        { words: ['snel', 'rommel', 'later', 'fix', 'kosten'], points: 25 },
        { words: ['copy', 'paste', 'voorbeeld', 'bijv'], points: 15 },
      ],
    },
    modelAnswer: 'Technical debt = snel gebouwde rommelcode die later veel extra werk kost. Bijv. copy-paste op 10 plekken.',
  },

  // === s9 Doorontwikkeling & Refactoring ===
  {
    id: 'refactor-01', category: 'refactoring', topic: 's9', type: 'mcq',
    question: 'Wat is refactoring?',
    options: [
      'Interne structuur verbeteren zonder het gedrag te veranderen',
      'Nieuwe features toevoegen',
      'De database migreren',
      'Code verwijderen zonder tests',
    ],
    answer: 0,
    explain: 'Refactoring = cleaner maken, zelfde functionaliteit. Altijd daarna testen.',
  },
  {
    id: 'refactor-02', category: 'refactoring', topic: 's9', type: 'mcq',
    question: 'Waarom hoort BSN-validatie NIET in de Member-klasse (SRP-voorbeeld)?',
    options: [
      'Validatielogica is een aparte verantwoordelijkheid — maak BurgerServiceNummer',
      'BSN is geen String',
      'Member mag geen attributen hebben',
      'BSN hoort in de GUI',
    ],
    answer: 0,
    explain: 'Member = lidmaatschap. BSN-regels = aparte klasse BurgerServiceNummer.',
  },
  {
    id: 'open-refactor-01', category: 'refactoring', topic: 's9', type: 'open-write',
    question: 'Leg cohesion uit en het verband met SRP.',
    rubric: {
      minLength: 50,
      keywordGroups: [
        { words: ['samenhang', 'cohesie', 'horen bij elkaar'], points: 20 },
        { words: ['srp', 'één verantwoordelijk', 'single responsibility'], points: 20 },
        { words: ['hoog', 'laag'], points: 10 },
      ],
    },
    modelAnswer: 'Cohesion = in hoeverre verantwoordelijkheden bij elkaar horen. SRP goed toepassen → hoge cohesie.',
  },
  {
    id: 'open-refactor-02', category: 'refactoring', topic: 's9', type: 'open-write',
    question: 'Internationalisering: leg uit hoe je BSN (NL) en SSN (VS) oplost met interface + Simple Factory.',
    rubric: {
      minLength: 60,
      keywordGroups: [
        { words: ['interface', 'ssn', 'abstract'], points: 15 },
        { words: ['burgerservicenummer', 'socialsecurity', 'concrete'], points: 15 },
        { words: ['factory', 'country', 'land'], points: 15 },
        { words: ['member', 'attribuut'], points: 10 },
      ],
    },
    modelAnswer: 'Interface SSN, concrete BurgerServiceNummer + SocialSecurityNumber. Member heeft SSN-attribuut. SsnFactory.create(country) kiest type.',
  },

  // === s12 Delivery Guarantees ===
  {
    id: 'msg-08', category: 'messaging', topic: 's12', type: 'mcq',
    question: 'At-most-once delivery betekent...',
    options: [
      'Bericht komt maximaal één keer aan; bij fout geen retry → kan verloren gaan',
      'Bericht komt minimaal één keer aan',
      'Bericht komt precies één keer aan',
      'Bericht wordt altijd dubbel afgeleverd',
    ],
    answer: 0,
    explain: 'At-most-once = geen retry. Geschikt voor logging/statistieken, niet voor betalingen.',
  },
  {
    id: 'msg-09', category: 'messaging', topic: 's12', type: 'mcq',
    question: 'Waarom kiest men in de praktijk vaak at-least-once + idempotency i.p.v. exactly-once?',
    options: [
      'Exactly-once is technisch complex, traag en duur',
      'Exactly-once is altijd gratis',
      'At-least-once garandeert geen duplicaten',
      'Idempotency werkt niet met queues',
    ],
    answer: 0,
    explain: 'Exactly-once is zeldzaam. Compromis: at-least-once + idempotente verwerking.',
  },
  {
    id: 'open-msg-04', category: 'messaging', topic: 's12', type: 'open-write',
    question: 'Leg de drie delivery guarantees uit (at-most-once, at-least-once, exactly-once) en wanneer je ze gebruikt.',
    rubric: {
      minLength: 80,
      keywordGroups: [
        { words: ['at-most', 'at most', 'verloren', 'retry'], points: 15 },
        { words: ['at-least', 'at least', 'dubbel', 'duplicaat'], points: 15 },
        { words: ['exactly', 'precies één'], points: 15 },
        { words: ['idempoten', 'logging', 'betaling'], points: 10 },
      ],
    },
    modelAnswer: 'At-most-once: kan verloren, geen retry. At-least-once: zeker aan, risico duplicaten. Exactly-once: precies één keer, complex.',
  },

  // === s13 Applicatielandschap ===
  {
    id: 'msg-10', category: 'messaging', topic: 's13', type: 'mcq',
    question: 'Voordeel van hub-and-spoke (broker/ESB) t.o.v. point-to-point?',
    options: [
      'Loose coupling op systeemniveau — systemen kennen elkaar niet direct',
      'Minder systemen nodig',
      'Geen message queue nodig',
      'Altijd sneller dan REST',
    ],
    answer: 0,
    explain: 'Hub-and-spoke: alle systemen via centrale hub. Nieuw systeem = alleen koppelen aan hub.',
  },
  {
    id: 'open-msg-05', category: 'messaging', topic: 's13', type: 'open-write',
    question: 'Verschil tussen applicatielandschap en applicatiearchitectuur?',
    rubric: {
      minLength: 50,
      keywordGroups: [
        { words: ['meerdere systemen', 'landschap', 'samen'], points: 20 },
        { words: ['één app', 'lagen', 'binnen'], points: 20 },
      ],
    },
    modelAnswer: 'Applicatiearchitectuur = één app van binnen. Applicatielandschap = diagram van meerdere systemen en hun communicatie.',
  },
  {
    id: 'open-msg-06', category: 'messaging', topic: 's13', type: 'open-write',
    question: 'Leg point-to-point koppeling uit en waarom het bij veel systemen tot spaghetti leidt.',
    rubric: {
      minLength: 50,
      keywordGroups: [
        { words: ['direct', 'point', 'tussen'], points: 15 },
        { words: ['spaghetti', 'veel verbinding', 'tight coupling'], points: 20 },
      ],
    },
    modelAnswer: 'Point-to-point = elk systeem direct gekoppeld aan anderen. Bij 5 systemen = 10 verbindingen. Wijziging in A raakt B, C, D.',
  },

  // === s14 Referentiearchitectuur ===
  {
    id: 'layer-12', category: 'layers', topic: 's14', type: 'mcq',
    question: 'Wat is een referentiearchitectuur?',
    options: [
      'Standaard-bouwplan met vaste lagen en verantwoordelijkheden voor elke app',
      'Een UML-diagram van één klasse',
      'Een RabbitMQ-configuratie',
      'Een ADR-template',
    ],
    answer: 0,
    explain: 'Referentiearchitectuur = abstract bouwplan (4 lagen) waar je elke applicatie in onderbrengt.',
  },
  {
    id: 'open-layer-05', category: 'layers', topic: 's14', type: 'open-write',
    question: 'Wat is ORM en waarom hoort het in de Data Storage-laag?',
    rubric: {
      minLength: 50,
      keywordGroups: [
        { words: ['object', 'relation', 'mapping', 'orm', 'jpa', 'hibernate'], points: 20 },
        { words: ['sql', 'database', 'dao', 'data storage', 'opslag'], points: 20 },
      ],
    },
    modelAnswer: 'ORM koppelt objecten aan tabellen (JPA/Hibernate). Automatiseert CRUD → hoort bij Data Storage/DAO.',
  },
  {
    id: 'open-layer-06', category: 'layers', topic: 's14', type: 'open-write',
    question: 'Leg "verticale slice" en iteratief bouwen uit. In welke volgorde begin je met de lagen?',
    rubric: {
      minLength: 60,
      keywordGroups: [
        { words: ['verticale slice', 'dun plakje', 'alle lagen'], points: 20 },
        { words: ['domain', 'eerst', 'manager', 'presentation', 'data storage'], points: 20 },
      ],
    },
    modelAnswer: 'Verticale slice = één feature door alle lagen werkend. Volgorde: Domain → Application Logic → Presentation of Data Storage.',
  },

  // === s15 RabbitMQ ===
  {
    id: 'msg-11', category: 'messaging', topic: 's15', type: 'mcq',
    question: 'Wat doet een routing key in RabbitMQ?',
    options: [
      'Label op het bericht waarmee de exchange bepaalt naar welke queue het gaat',
      'Het wachtwoord van de broker',
      'De naam van de consumer',
      'Het SQL-query voor de database',
    ],
    answer: 0,
    explain: 'Producer plakt routing key op bericht → exchange routeert naar juiste queue(s).',
  },
  {
    id: 'msg-12', category: 'messaging', topic: 's15', type: 'mcq',
    question: 'Wanneer heb je een exchange nodig (i.p.v. alleen de default exchange)?',
    options: [
      'Bij publish/subscribe — één bericht naar meerdere queues/consumers',
      'Altijd, ook bij point-to-point',
      'Alleen bij synchrone REST',
      'Nooit bij RabbitMQ',
    ],
    answer: 0,
    explain: 'Pub/sub: exchange verdeelt naar meerdere queues. Point-to-point: default exchange volstaat.',
  },
  {
    id: 'msg-13', category: 'messaging', topic: 's15', type: 'mcq',
    question: 'Wat is een dead-letter queue?',
    options: [
      'Queue voor berichten die na X pogingen nog steeds falen',
      'Queue voor succesvol verwerkte berichten',
      'De hoofd-database van RabbitMQ',
      'Een queue zonder consumers',
    ],
    answer: 0,
    explain: 'Poison messages → dead-letter queue. Inspecteren/herverwerken zonder hoofdqueue te blokkeren.',
  },
  {
    id: 'open-msg-07', category: 'messaging', topic: 's15', type: 'open-write',
    question: 'Beschrijf de reis van een bericht door RabbitMQ: Producer → Exchange → Queue → Consumer. Noem AMQP.',
    rubric: {
      minLength: 60,
      keywordGroups: [
        { words: ['producer', 'exchange', 'queue', 'consumer'], points: 20 },
        { words: ['routing', 'amqp'], points: 15 },
        { words: ['ack', 'nack'], points: 10 },
      ],
    },
    modelAnswer: 'Producer → Exchange (routing key) → Queue (FIFO) → Consumer. AMQP = protocol. Ack/Nack bevestigt verwerking.',
  },

  // === s16 Thin vs Fat & Event-driven ===
  {
    id: 'msg-14', category: 'messaging', topic: 's16', type: 'mcq',
    question: 'Nadeel van een thin event (alleen gameId in payload)?',
    options: [
      'Consumer moet extra synchrone calls doen → temporal coupling terug',
      'Te veel data in het bericht',
      'Geen schema drift mogelijk',
      'Werkt niet met RabbitMQ',
    ],
    answer: 0,
    explain: 'Thin = weinig data. Consumer haalt rest op via sync calls → slechter schaalbaar.',
  },
  {
    id: 'msg-15', category: 'messaging', topic: 's16', type: 'mcq',
    question: 'Wat kenmerkt een event-driven architecture?',
    options: [
      'Systemen reageren op gebeurtenissen, asynchroon en losgekoppeld',
      'Alleen synchrone REST-calls',
      'Geen queues nodig',
      'Events zijn optioneel en gaan vaak verloren',
    ],
    answer: 0,
    explain: 'EDA: reageren op wat gebeurd is, async, events zijn first-class citizens.',
  },
  {
    id: 'open-msg-08', category: 'messaging', topic: 's16', type: 'open-write',
    question: 'Leg thin vs fat events uit met voor- en nadelen per type.',
    rubric: {
      minLength: 70,
      keywordGroups: [
        { words: ['thin', 'weinig', 'klein'], points: 15 },
        { words: ['fat', 'veel', 'payload'], points: 15 },
        { words: ['schema drift', 'stale', 'sync', 'zelfstandig'], points: 15 },
      ],
    },
    modelAnswer: 'Thin: klein schema, minder drift, maar consumer moet extra ophalen. Fat: zelfstandig, maar meer data en stale risico.',
  },
  {
    id: 'open-msg-09', category: 'messaging', topic: 's16', type: 'open-write',
    question: 'Verschil tussen Eventual Consistency en Event Sourcing?',
    rubric: {
      minLength: 50,
      keywordGroups: [
        { words: ['eventual', 'uiteindelijk', 'consistent', 'async'], points: 20 },
        { words: ['event sourcing', 'gebeurtenissen', 'afspelen', 'toestand'], points: 20 },
      ],
    },
    modelAnswer: 'Eventual consistency = data wordt uiteindelijk gelijk (async). Event sourcing = toestand opgebouwd door alle events af te spelen.',
  },

  // === s17 Visualisaties & Realisatie ===
  {
    id: 'viz-01', category: 'visualization', topic: 's17', type: 'mcq',
    question: 'Welk diagram gebruik je om te tonen wat er gebeurt als X plaatsvindt?',
    options: ['Data Flow Diagram of sequentiediagram', 'UML klassendiagram', 'ERD van één tabel', 'Gantt-chart'],
    answer: 0,
    explain: 'DFD/sequentie = stroom van acties. Klassendiagram = structuur.',
  },
  {
    id: 'open-viz-01', category: 'visualization', topic: 's17', type: 'open-write',
    question: 'Welke visualisatie kies je voor: (a) systeemopbouw, (b) datastroom bij actie X, (c) applicatielandschap?',
    rubric: {
      minLength: 60,
      keywordGroups: [
        { words: ['c4', 'component', 'opbouw', 'structuur'], points: 15 },
        { words: ['data flow', 'dfd', 'sequentie', 'stroom'], points: 15 },
        { words: ['landschap', 'systeemlandschap', 'fossflow'], points: 15 },
      ],
    },
    modelAnswer: 'Opbouw: C4/4+1/component. Datastroom: DFD/sequentie. Landschap: applicatie-/systeemlandschap.',
  },
  {
    id: 'open-viz-02', category: 'visualization', topic: 's17', type: 'open-write',
    question: 'Wat moet je reflecteren bij realisatie verantwoording (AI-tooling)? Noem 3 punten.',
    rubric: {
      minLength: 50,
      keywordGroups: [
        { words: ['afhankelijk', 'onafhankelijk'], points: 15 },
        { words: ['tijd', 'besparing'], points: 15 },
        { words: ['advies', 'toekomst', 'project'], points: 15 },
      ],
    },
    modelAnswer: 'Reflecteer op (on)afhankelijkheid, tijdsbesparing, en advies voor toekomstige projecten.',
  },

  // === Open multi-part examenvraag (messaging-integratie) ===
  {
    id: 'open-exam-03', category: 'messaging', topic: 's5', type: 'open-multi',
    question: 'Open examenvraag — Messaging & integratie (samenvatting sectie 5–6).',
    parts: [
      {
        key: 'a', label: 'a', weight: 1, type: 'open-write',
        question: 'Leg synchroon vs asynchroon communiceren uit met een voorbeeld.',
        rubric: {
          minLength: 40,
          keywordGroups: [
            { words: ['wacht', 'synchroon', 'rest'], points: 15 },
            { words: ['asynchroon', 'queue', 'brievenbus'], points: 15 },
          ],
        },
        modelAnswer: 'Synchroon: A wacht op antwoord (REST). Asynchroon: bericht in queue, verder gaan.',
      },
      {
        key: 'b', label: 'b', weight: 1, type: 'open-write',
        question: 'Wat is een poison message en hoe los je het op?',
        rubric: {
          minLength: 40,
          keywordGroups: [
            { words: ['faalt', 'steeds', 'blokkeer'], points: 15 },
            { words: ['dead-letter', 'dead letter', 'dlq'], points: 15 },
          ],
        },
        modelAnswer: 'Poison message faalt steeds en blokkeert queue. Oplossing: dead-letter queue na X pogingen.',
      },
      {
        key: 'c', label: 'c', weight: 1, type: 'open-write',
        question: 'SOA vs microservices: noem één verschil (centrale bus vs gedecentraliseerd).',
        rubric: {
          minLength: 30,
          keywordGroups: [
            { words: ['esb', 'soa', 'centraal'], points: 15 },
            { words: ['microservice', 'gedecentraliseerd', 'klein'], points: 15 },
          ],
        },
        modelAnswer: 'SOA heeft centrale ESB. Microservices = kleine onafhankelijke services, gedecentraliseerd.',
      },
    ],
    modelAnswer: 'Zie deelvragen a, b, c.',
    explain: 'Dekt messaging en integratiestijlen uit de samenvatting.',
  },
];
