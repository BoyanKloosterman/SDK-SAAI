// Extra open vragen + examenconfig (7 vragen, 50% ADR)
const QUESTIONS_EXTRA = [
  // === OPEN: smell + principe (zoals toets) ===
  {
    id: 'open-smell-01', category: 'smell', type: 'open-identify',
    question: 'Bekijk de code. Noem de design smell EN het geschonden design principe.',
    code: `class InvoiceService {
  void process(Invoice inv) {
    // PDF genereren
    // Email versturen
    // Database updaten
    // BTW berekenen
    // Logging
  }
}`,
    rubric: {
      smell: { acceptable: ['complexity', 'complex'], expected: 'Complexity', hint: 'Methode doet te veel' },
      principle: { acceptable: ['srp', 'single responsibility'], expected: 'SRP', hint: 'Meerdere taken in één klasse' },
    },
    modelAnswer: 'Smell: Complexity. Principe: SRP (Single Responsibility Principle).',
    explain: 'Eén methode met 5 taken = Complexity smell + SRP-schending.',
  },
  {
    id: 'open-smell-02', category: 'smell', type: 'open-identify',
    question: 'Noem de design smell en het geschonden principe.',
    code: `class ShapeDrawer {
  void draw(String type) {
    if (type.equals("circle")) { /* teken cirkel */ }
    else if (type.equals("square")) { /* teken vierkant */ }
    // nieuw shape = deze methode aanpassen
  }
}`,
    rubric: {
      smell: { acceptable: ['rigidity', 'rigid', 'starheid'], expected: 'Rigidity', hint: 'Uitbreiden = bestaande code wijzigen' },
      principle: { acceptable: ['ocp', 'open closed', 'open/closed'], expected: 'OCP', hint: 'Open voor uitbreiding, gesloten voor aanpassing' },
    },
    modelAnswer: 'Smell: Rigidity. Principe: OCP.',
    explain: 'If-chain groeit bij elk nieuw shape → Rigidity + OCP-schending.',
  },
  {
    id: 'open-smell-03', category: 'smell', type: 'open-identify',
    question: 'Noem de design smell en het geschonden principe.',
    code: `class BookService {
  private MySqlBookDAO dao = new MySqlBookDAO();
  Book find(int id) { return dao.find(id); }
}`,
    rubric: {
      smell: { acceptable: ['rigidity', 'rigid'], expected: 'Rigidity', hint: 'Moeilijk wisselen van implementatie' },
      principle: { acceptable: ['loose coupling', 'loose', 'koppeling'], expected: 'Loose Coupling', hint: 'Direct new MySqlBookDAO' },
    },
    modelAnswer: 'Smell: Rigidity. Principe: Loose Coupling (tight coupling naar concrete DAO).',
    explain: 'Direct afhankelijk van MySqlBookDAO = tight coupling.',
  },
  {
    id: 'open-smell-04', category: 'smell', type: 'open-identify',
    question: 'Je wijzigt één regel in de DAO en drie GUI-schermen crashen. Noem smell en principe.',
    code: `// MemberDAO.getName() hernoemd naar getFullName()
// 3 GUI-klassen crashen onverwacht`,
    rubric: {
      smell: { acceptable: ['fragility', 'fragile', 'breekbaar'], expected: 'Fragility', hint: 'Kleine wijziging, groot effect' },
      principle: { acceptable: ['loose coupling', 'loose', 'design for change'], expected: 'Loose Coupling / Design for Change', hint: 'GUI hangt te direct aan DAO-details' },
    },
    modelAnswer: 'Smell: Fragility. Principe: Loose Coupling.',
    explain: 'Onverwachte breuk op afstand = Fragility.',
  },
  {
    id: 'open-smell-05', category: 'smell', type: 'open-identify',
    question: 'Variabelen heten a, b, tmp, x1. Niemand snapt de code. Noem de smell.',
    code: `int a = calc(x1, tmp);
String b = proc(a);
void go() { zzz(b, tmp); }`,
    rubric: {
      smell: { acceptable: ['opacity', 'ondoorzichtig'], expected: 'Opacity', hint: 'Onleesbare namen' },
      principle: { acceptable: ['opacity', 'leesbaar', 'onderhoud', 'design for change'], expected: 'Design for Change / onderhoudbaarheid', hint: 'Code moet begrijpelijk zijn' },
    },
    modelAnswer: 'Smell: Opacity. Onderhoudbaarheid/Design for Change lijdt eronder.',
    explain: 'Ondoorzichtige code = Opacity smell.',
  },

  // === OPEN: lagen, UML, factory (tekst) ===
  {
    id: 'open-layer-01', category: 'layers', type: 'open-write',
    question: 'Noem de 4 architectuurlagen en beschrijf per laag wat erin hoort (bibliotheek-app als voorbeeld).',
    rubric: {
      subtype: 'four-layers',
      gradingCriteria: 'Per laag naam + verantwoordelijkheid, liefst met bibliotheek-voorbeeld (GUI, MemberManager, Member/Book, MemberDAO).',
    },
    modelAnswer: `1. Presentation — GUI: schermen, knoppen, lijst met boeken tonen.
2. Application Logic — MemberManager: mag lid boek lenen? delegeert naar DAO.
3. Domain — Member, Book: entiteiten met regels (max lenen).
4. Data Storage — MemberDAO, BookDAO: SQL, database-opslag.`,
    explain: 'Alle 4 lagen met bibliotheek-voorbeeld.',
  },
  {
    id: 'open-layer-02', category: 'layers', type: 'open-write',
    question: 'Leg uit: waarom hoort SQL-code NIET in de Manager-klasse?',
    rubric: {
      minLength: 50,
      keywordGroups: [
        { words: ['data storage', 'dao', 'laag'], points: 20, label: 'Data Storage laag' },
        { words: ['srp', 'verantwoordelijk', 'scheid'], points: 15, label: 'SRP/scheiding' },
        { words: ['manager', 'delegeer', 'application logic'], points: 15, label: 'Manager rolt' },
      ],
    },
    modelAnswer: 'Manager = Application Logic, delegeert opslag naar DAO. SQL hoort in Data Storage (DAO). Anders schendt je SRP.',
    explain: 'Laag-scheiding en SRP.',
  },
  {
    id: 'open-uml-01', category: 'uml', type: 'open-write',
    question: 'Beschrijf het verschil tussen compositie en aggregatie in UML. Geef per relatie een voorbeeld.',
    rubric: {
      minLength: 60,
      keywordGroups: [
        { words: ['compositie', 'composition', 'onlosmakelijk', 'verdwijnt'], points: 20, label: 'Compositie' },
        { words: ['aggregatie', 'aggregation', 'los', 'kan bestaan'], points: 20, label: 'Aggregatie' },
        { words: ['order', 'orderitem', 'team', 'player', 'voorbeeld'], points: 10, label: 'Voorbeeld' },
      ],
    },
    modelAnswer: 'Compositie ◆: child kan niet zonder parent (Order-OrderItem). Aggregatie ◇: child kan los (Team-Player).',
    explain: 'Ezelsbruggetje: verdwijnt child met parent?',
  },
  {
    id: 'open-factory-01', category: 'factory', type: 'open-write',
    question: 'LinFactory en MacFactory bestaan. GUIFactory heeft createButton() en createCheckbox(). Leg stap voor stap uit hoe je WinFactory toevoegt (Abstract Factory stap 2).',
    rubric: {
      minLength: 80,
      keywordGroups: [
        { words: ['winfactory', 'implements', 'guifactory'], points: 20, label: 'WinFactory implements' },
        { words: ['winbutton', 'wincheckbox', 'create'], points: 20, label: 'Concrete producten' },
        { words: ['new win', 'return new'], points: 10, label: 'new WinButton' },
        { words: ['main', 'inject', 'application'], points: 15, label: 'main injecteert' },
        { words: ['ocp', 'nieuwe familie', 'geen bestaande'], points: 10, label: 'OCP voordeel' },
      ],
    },
    modelAnswer: '1) WinFactory implements GUIFactory. 2) createButton→new WinButton(), createCheckbox→new WinCheckbox(). 3) main: new WinFactory() → Application. Geen bestaande factories aanpassen.',
    explain: 'Nieuwe familie = alleen nieuwe klassen.',
  },
  {
    id: 'open-factory-02', category: 'factory', type: 'open-write',
    question: 'Leg uit: wat is het verschil tussen Simple Factory (stap 1) en Abstract Factory (stap 2)? Wanneer schend je OCP?',
    rubric: {
      minLength: 70,
      keywordGroups: [
        { words: ['switch', 'if', 'simple'], points: 15, label: 'Simple Factory' },
        { words: ['interface', 'abstract', 'concrete factory'], points: 15, label: 'Abstract Factory' },
        { words: ['ocp', 'aanpassen', 'uitbreiden'], points: 20, label: 'OCP' },
        { words: ['nieuwe familie', 'nieuwe databron'], points: 10, label: 'Nieuwe familie' },
      ],
    },
    modelAnswer: 'Simple Factory: switch/if, nieuwe soort = factory aanpassen → OCP-schending. Abstract Factory: interface + concrete factories, nieuwe familie = nieuwe klasse → OCP ok.',
    explain: 'Stap 1 vs stap 2 uit samenvatting.',
  },

  // === EXAMEN CASUS — 2 ADR's op één legacy + module + extern systeem ===
  {
    id: 'adr-casus-01', category: 'adr', type: 'open-multi', topic: 's10',
    question: 'Casus (zoals op het examen): Legacy ERP-monolith, nieuwe Order Service-module en extern Fulfillment SaaS.\n\nLees de systeemcontext. Schrijf twee Nygard ADR\'s die toekomstige kwaliteit van het bestaande systeem verhogen. Gebruik de gegeven indeling (Titel, Status, Context, Decision, Consequences).',
    scenario: 'Examen — 2 ADR\'s op één casus',
    examCasus: true,
    parts: [
      {
        key: 'adr1', label: 'ADR 1', weight: 1, type: 'adr-write',
        question: 'ADR 1 — Koppeling Order Service ↔ Legacy ERP\n\nHet ERP is \'s nachts offline (temporal coupling). Order Service roept nu synchroon REST aan; orders falen bij onderhoud. Overwogen: sync REST blijven, point-to-point RabbitMQ queue, of nachtelijke batch-export.\n\nLeg vast welke integratiebeslissing de kwaliteit van het bestaande ERP-landschap verhoogt.',
        rubric: {
          contextKeywords: ['legacy', 'erp', 'order', 'temporal', 'offline', 'sync', 'synchroon'],
          problemMustMention: ['temporal', 'offline', 'coupling', 'sync', 'synchroon', 'erp'],
          alternativesExpected: ['rest', 'sync', 'synchroon', 'rabbitmq', 'queue', 'batch'],
          solutionQuality: {
            excellent: [{ patterns: ['rabbitmq', 'message queue', 'queue', 'durable', 'asynchroon'], why: 'Temporal decoupling — orders bewaard tot ERP online (les).' }],
            good: [{ patterns: ['event', 'adapter', 'async'], why: 'Asynchroon en ontkoppeld in tijd.' }],
            poor: [{ patterns: ['sync rest', 'synchroon rest', 'direct rest', 'rest blijven'], penalty: 30, why: 'Sync REST lost temporal coupling niet op — nachtelijk onderhoud blijft probleem.' }],
          },
          bestSolution: 'Durable RabbitMQ queue: Order Service = producer, ERP-adapter = consumer.',
          consequencePositive: ['temporal', 'offline', 'queue', 'beschikbaar', 'kwaliteit'],
          consequenceNegative: ['infrastructuur', 'complex', 'eventual', 'debug'],
        },
        modelAnswer: '# RabbitMQ queue tussen Order Service en Legacy ERP\n\n## Status\nAccepted\n\n## Context\nOrder Service roept ERP synchroon aan. ERP offline 01:00–04:00 → temporal coupling, mislukte orders. Overwogen: sync REST, P2P queue, nachtelijke batch.\n\n## Decision\n1. Order Service publiceert order-messages naar een durable RabbitMQ queue.\n2. ERP-adapter consumeert asynchroon wanneer ERP beschikbaar is (ACK na succes).\n\n## Consequences\n+ Temporal coupling opgelost — orders blijven bewaard\n+ Bestaand ERP hoeft niet herschreven te worden\n- RabbitMQ-infrastructuur en adapter nodig\n- Eventual consistency — order pas later in ERP zichtbaar',
      },
      {
        key: 'adr2', label: 'ADR 2', weight: 1, type: 'adr-write',
        question: 'ADR 2 — OrderShipped informeren (intern + extern)\n\nNa verzending moeten Fulfillment SaaS (extern), magazijn-app én marketing worden geïnformeerd. Nu roept Order Service alles synchroon aan; nieuwe subscriber = Order Service aanpassen (behavioral coupling). Overwogen: meer P2P REST, point-to-point queues, of pub/sub exchange met OrderShipped event.\n\nLeg vast hoe je schaalbaar en losgekoppeld informeert — bouwt voort op ADR 1.',
        rubric: {
          contextKeywords: ['order', 'shipped', 'extern', 'fulfillment', 'behavioral', 'pub', 'sub'],
          problemMustMention: ['behavioral', 'coupling', 'extern', 'sync', 'synchroon', 'subscriber'],
          alternativesExpected: ['point', 'rest', 'sync', 'queue', 'pub', 'sub', 'exchange', 'event'],
          solutionQuality: {
            excellent: [{ patterns: ['pub/sub', 'pub sub', 'publish', 'subscribe', 'exchange', 'ordershipped', 'order shipped'], why: 'Behavioral decoupling — Order Service kent subscribers niet (les).' }],
            good: [{ patterns: ['rabbitmq', 'message queue', 'queue'], why: 'Beter dan sync, maar P2P queues kennen nog alle bestemmingen.' }],
            poor: [{ patterns: ['sync rest', 'synchroon rest', 'meer point', 'point-to-point'], penalty: 30, why: 'Verergert behavioral coupling en P2P-spaghetti.' }],
          },
          bestSolution: 'RabbitMQ exchange pub/sub: OrderShipped event; aparte queues voor fulfillment, magazijn, marketing.',
          consequencePositive: ['behavioral', 'extern', 'schaal', 'ontkoppeld', 'kwaliteit'],
          consequenceNegative: ['complex', 'eventual', 'infrastructuur', 'volgorde'],
        },
        modelAnswer: '# Pub/sub met OrderShipped event\n\n## Status\nAccepted\n\n## Context\nOrder Service roept sync Fulfillment, magazijn en marketing aan. Behavioral coupling: elke nieuwe consumer = code wijzigen. Extern SaaS + interne apps. Overwogen: P2P REST, P2P queues, pub/sub exchange. Voortbouwend op ADR 1 (RabbitMQ).\n\n## Decision\n1. Order Service publiceert `OrderShipped` events (verleden tijd) naar RabbitMQ exchange.\n2. Fulfillment SaaS-adapter, magazijn en marketing subscriben via eigen queues (routing key).\n\n## Consequences\n+ Behavioral decoupling — nieuwe subscriber zonder Order Service aan te passen\n+ Extern en intern gelijk behandeld via messaging\n- Event-driven flows lastiger te debuggen\n- Idempotency nodig bij at-least-once delivery',
      },
    ],
    modelAnswer: 'Zie modelantwoorden bij ADR 1 en ADR 2.',
    explain: 'Examenformat: één casus, twee ADR\'s, elk een andere kwaliteitsverbetering (temporal + behavioral decoupling).',
  },

  // === EXAMEN VRAAG 3: open multi-part (3.1, 3.2, 3.3) ===
  {
    id: 'open-exam-01', category: 'smell', type: 'open-multi',
    question: 'Vraag 3 — Beantwoord alle deelvragen (open, zoals op de toets).',
    parts: [
      {
        key: 'a', label: '3.1', weight: 1, type: 'open-identify',
        question: 'Noem de design smell EN het geschonden principe in deze code:',
        code: `class ReportManager {
  void generateMonthlyReport() {
    // data ophalen uit database
    // Excel genereren
    // PDF maken
    // email versturen naar management
    // resultaat loggen
  }
}`,
        rubric: {
          smell: { acceptable: ['complexity', 'complex'], expected: 'Complexity' },
          principle: { acceptable: ['srp', 'single responsibility'], expected: 'SRP' },
        },
        modelAnswer: 'Complexity + SRP',
      },
      {
        key: 'b', label: '3.2', weight: 1, type: 'open-write',
        question: 'Noem de 4 architectuurlagen en geef per laag één verantwoordelijkheid.',
        rubric: {
          subtype: 'four-layers',
          gradingCriteria: 'Per laag moet zowel de laagnaam als een concrete verantwoordelijkheid staan: Presentation (GUI/scherm), Application Logic (Managers/checks), Domain (entiteiten/regels), Data Storage (DAO/database).',
        },
        modelAnswer: `1. Presentation — alles wat de gebruiker ziet: GUI-componenten, knoppen, schermen. Zo "dom" mogelijk: tonen en events doorgeven.

2. Application Logic — Managers (service layer): logica op app-niveau, checks ("mag dit?"), coördineren en opslag delegeren naar DAO's.

3. Domain — entiteiten zoals Member en Book: domeinkennis en bedrijfsregels (bijv. canBorrow()).

4. Data Storage — DAO's en database-connectie: alle kennis over persistente opslag (SQL, CRUD).`,
      },
      {
        key: 'c', label: '3.3', weight: 1, type: 'open-write',
        question: 'Leg uit wat loose coupling is en hoe je het bereikt met een interface en dependency injection.',
        rubric: {
          subtype: 'loose-coupling',
          gradingCriteria: 'Antwoord moet bevatten: (1) definitie loose coupling = niet afhankelijk van concrete klasse, (2) interface als abstractie, (3) DI via constructor waarbij main het concrete object maakt en injecteert, (4) voordeel dat je implementatie kunt wisselen.',
        },
        modelAnswer: `Loose coupling betekent dat een klasse niet direct afhankelijk is van een concrete implementatie, maar van een abstractie (interface). Zo kun je de implementatie wisselen zonder de afhankelijke klasse aan te passen.

Je bereikt dit door te "programmeren tegen een interface". Bijvoorbeeld: MemberManager hangt af van IMemberDAO, niet van SQLMemberDAO.

Dependency Injection (DI): de main-klasse maakt het concrete object aan (bijv. new SQLMemberDAO()) en geeft het via de constructor mee aan MemberManager. De Manager weet niet welke database gebruikt wordt.

Voordeel: overstappen van MySQL naar XML = alleen nieuwe DAO + aanpassing in main. MemberManager blijft ongewijzigd.`,
      },
    ],
    modelAnswer: 'Zie modelantwoorden per deelvraag 3.1, 3.2 en 3.3.',
    explain: 'Typische open examenvraag met subdelen.',
  },
  {
    id: 'open-exam-02', category: 'factory', type: 'open-multi',
    question: 'Open examenvraag — Factory pattern en pseudocode.',
    parts: [
      {
        key: 'a', label: 'a', weight: 1, type: 'open-write',
        question: 'GUIFactory interface bestaat met LinFactory en MacFactory. Beschrijf hoe je WinFactory toevoegt zonder bestaande code te wijzigen.',
        rubric: {
          minLength: 60,
          keywordGroups: [
            { words: ['winfactory implements'], points: 15 },
            { words: ['winbutton', 'wincheckbox'], points: 15 },
            { words: ['ocp', 'nieuwe klasse', 'geen bestaande'], points: 10 },
          ],
        },
      },
      {
        key: 'b', label: 'b', weight: 1, type: 'pseudocode-write',
        question: 'Schrijf pseudocode voor WinFactory en main.',
        rubric: {
          mustHave: ['WinFactory', 'GUIFactory', 'createButton', 'createCheckbox', 'main', 'new'],
          mainMustHave: ['main', 'WinFactory', 'Application'],
          diPattern: true,
        },
        modelAnswer: 'WinFactory implements GUIFactory; main injecteert in Application.',
      },
    ],
  },

  // === EXTRA OPEN VRAGEN (weinig meerkeuze, zoals echte toets) ===
  {
    id: 'open-smell-06', category: 'smell', type: 'open-identify',
    question: 'Noem de design smell en het geschonden principe.',
    code: `class DatabaseManager {
  void backup() { /* SQL dump */ }
  void restore() { /* SQL import */ }
  void migrate() { /* schema wijzigen */ }
  void optimize() { /* indexen */ }
  void sendReport() { /* email admin */ }
}`,
    rubric: {
      smell: { acceptable: ['complexity', 'complex'], expected: 'Complexity' },
      principle: { acceptable: ['srp', 'single responsibility'], expected: 'SRP' },
    },
    modelAnswer: 'Complexity + SRP.',
  },
  {
    id: 'open-smell-07', category: 'smell', type: 'open-write',
    question: 'Leg uit wat Rigidity (starheid) is en geef een concreet voorbeeld uit code.',
    rubric: {
      minLength: 50,
      keywordGroups: [
        { words: ['kleine', 'aanpassing', 'veel', 'bestand', 'domino'], points: 20 },
        { words: ['if', 'switch', 'factory', 'uitbreid'], points: 15 },
        { words: ['voorbeeld', 'bijv'], points: 10 },
      ],
    },
    modelAnswer: 'Rigidity = één wijziging vereist veel andere aanpassingen. Bijv. switch in factory groeit bij elke nieuwe databron.',
  },
  {
    id: 'open-smell-08', category: 'smell', type: 'open-write',
    question: 'Leg Fragility (breekbaarheid) uit. Hoe verschilt het van Rigidity?',
    rubric: {
      minLength: 50,
      keywordGroups: [
        { words: ['breek', 'crash', 'onverwacht', 'kapot'], points: 20 },
        { words: ['rigidity', 'star', 'uitbreid', 'verschil'], points: 20 },
        { words: ['voorbeeld'], points: 10 },
      ],
    },
    modelAnswer: 'Fragility = iets breekt onverwacht op afstand. Rigidity = je moet veel aanpassen om iets te veranderen.',
  },
  {
    id: 'open-princ-01', category: 'principle', type: 'open-write',
    question: 'Leg SRP (Single Responsibility Principle) uit met een fout én een goed voorbeeld.',
    rubric: {
      minLength: 60,
      keywordGroups: [
        { words: ['één taak', 'een taak', 'reden om te veranderen'], points: 15 },
        { words: ['usermanager', 'fout', 'slecht', 'alles'], points: 15 },
        { words: ['service', 'repository', 'goed', 'scheid'], points: 15 },
      ],
    },
    modelAnswer: 'SRP = één verantwoordelijkheid per klasse. Fout: UserManager doet alles. Goed: UserService + EmailService + UserRepository.',
  },
  {
    id: 'open-princ-02', category: 'principle', type: 'open-write',
    question: 'Leg OCP uit. Waarom schendt een Simple Factory met switch het OCP?',
    rubric: {
      minLength: 60,
      keywordGroups: [
        { words: ['open', 'uitbreid', 'gesloten', 'aanpass'], points: 15 },
        { words: ['switch', 'if', 'simple factory'], points: 15 },
        { words: ['nieuwe', 'factory aanpassen', 'interface'], points: 15 },
      ],
    },
    modelAnswer: 'OCP = uitbreiden zonder bestaande code te wijzigen. Simple Factory: nieuwe type = switch aanpassen.',
  },
  {
    id: 'open-princ-03', category: 'principle', type: 'open-identify',
    question: 'Welk principe wordt geschonden? Noem het en leg kort uit.',
    code: `class OrderController {
  void showOrder(int id) {
    MySqlConnection c = new MySqlConnection(...);
    // SQL query direct in controller
  }
}`,
    rubric: {
      smell: { acceptable: ['rigidity', 'complexity'], expected: 'Rigidity/Complexity' },
      principle: { acceptable: ['srp', 'loose coupling', 'laag'], expected: 'SRP + laag-scheiding / Loose Coupling' },
    },
    modelAnswer: 'SRP + laag-scheiding: SQL hoort niet in Presentation/Controller.',
  },
  {
    id: 'open-uml-02', category: 'uml', type: 'open-write',
    question: 'Een Lid (Member) heeft een attribuut `currentLoan : Loan`. Welke UML-relatie is dit? Leg uit waarom.',
    rubric: {
      minLength: 40,
      keywordGroups: [
        { words: ['associatie', 'association'], points: 25 },
        { words: ['attribuut', 'referentie', 'opgeslagen'], points: 20 },
        { words: ['pijl', 'lijn'], points: 10 },
      ],
    },
    modelAnswer: 'Associatie → — referentie opgeslagen als attribuut, beide leven onafhankelijk.',
  },
  {
    id: 'open-uml-03', category: 'uml', type: 'open-write',
    question: 'Order en OrderItem: als Order wordt verwijderd, verdwijnen OrderItems ook. Welke relatie? Teken in woorden.',
    rubric: {
      minLength: 40,
      keywordGroups: [
        { words: ['compositie', 'composition'], points: 25 },
        { words: ['gevulde ruit', 'onlosmakelijk', 'niet zonder'], points: 20 },
      ],
    },
    modelAnswer: 'Compositie ◆ — OrderItem kan niet zonder Order bestaan.',
  },
  {
    id: 'open-uml-04', category: 'uml', type: 'open-write',
    question: 'Cat implementeert IFeedable. Beschrijf de UML-relatie (lijntype, pijl, stippel/doorgetrokken).',
    rubric: {
      minLength: 40,
      keywordGroups: [
        { words: ['interface', 'implements', 'implementeert'], points: 20 },
        { words: ['stippel', 'dashed', 'driehoek'], points: 20 },
      ],
    },
    modelAnswer: 'Interface/implementeert: stippellijn met open driehoek naar interface.',
  },
  {
    id: 'open-uml-05', category: 'uml', type: 'open-write',
    question: 'Noem alle 6 UML-relaties en geef per relatie één zin wanneer je hem gebruikt.',
    rubric: {
      minLength: 100,
      keywordGroups: [
        { words: ['inheritance', 'overerving', 'extends'], points: 10 },
        { words: ['interface', 'implements'], points: 10 },
        { words: ['compositie'], points: 10 },
        { words: ['aggregatie'], points: 10 },
        { words: ['dependency', 'afhankelijk'], points: 10 },
        { words: ['associatie'], points: 10 },
      ],
    },
    modelAnswer: 'Inheritance, Interface, Compositie, Aggregatie, Dependency, Associatie — elk met gebruikssituatie.',
  },
  {
    id: 'open-layer-03', category: 'layers', type: 'open-write',
    question: 'Waar hoort een `BookDAO` thuis en waarom mag een `Book` entiteit geen SQL bevatten?',
    rubric: {
      minLength: 50,
      keywordGroups: [
        { words: ['data storage', 'dao'], points: 20 },
        { words: ['domain', 'entiteit'], points: 15 },
        { words: ['scheid', 'laag', 'verantwoordelijk'], points: 15 },
      ],
    },
    modelAnswer: 'BookDAO in Data Storage. Book is Domain — alleen domeinkennis, geen opslag-details.',
  },
  {
    id: 'open-layer-04', category: 'layers', type: 'open-write',
    question: 'Wat doet een Manager in de Application Logic layer? Geef 3 taken.',
    rubric: {
      minLength: 50,
      keywordGroups: [
        { words: ['check', 'valid', 'mag'], points: 15 },
        { words: ['delegeer', 'dao'], points: 15 },
        { words: ['gui', 'presentation', 'coördin'], points: 10 },
      ],
    },
    modelAnswer: 'Checks uitvoeren, DAO aanroepen, resultaat teruggeven aan GUI. Geen SQL, geen schermlogica.',
  },
  {
    id: 'open-factory-03', category: 'factory', type: 'pseudocode-write',
    question: 'Schrijf pseudocode: DAOFactory interface, SqlDAOFactory en XmlDAOFactory. Main injecteert factory in BookManager.',
    rubric: {
      mustHave: ['DAOFactory', 'SqlDAOFactory', 'XmlDAOFactory', 'implements', 'BookManager', 'main', 'new', 'create'],
      mainMustHave: ['main', 'SqlDAOFactory', 'BookManager'],
      diPattern: true,
    },
    modelAnswer: 'interface DAOFactory, concrete factories, main: new SqlDAOFactory() → BookManager(factory).',
  },
  {
    id: 'open-factory-04', category: 'factory', type: 'open-write',
    question: 'Waarom maakt de Manager NOOIT zelf `new SqlMemberDAO()`? Leg loose coupling uit.',
    rubric: {
      minLength: 50,
      keywordGroups: [
        { words: ['interface', 'imemberdao', 'dao'], points: 15 },
        { words: ['main', 'inject', 'constructor'], points: 15 },
        { words: ['wissel', 'xml', 'test', 'concrete'], points: 15 },
      ],
    },
    modelAnswer: 'Manager kent alleen interface. main kiest concrete DAO en injecteert. Zo kun je wisselen zonder Manager aan te passen.',
  },
  {
    id: 'open-msg-01', category: 'messaging', type: 'open-write',
    question: 'Leg temporal coupling uit en hoe een message queue dit oplost.',
    rubric: {
      minLength: 50,
      keywordGroups: [
        { words: ['tegelijk', 'online', 'beschikbaar'], points: 20 },
        { words: ['queue', 'wachtrij', 'bewaar', 'asynchroon'], points: 20 },
      ],
    },
    modelAnswer: 'Temporal coupling = beide systemen moeten tegelijk online. Queue bewaart berichten tot consumer klaar is.',
  },
  {
    id: 'open-msg-02', category: 'messaging', type: 'open-write',
    question: 'Verschil tussen Message en Event? Geef per type een voorbeeld.',
    rubric: {
      minLength: 50,
      keywordGroups: [
        { words: ['message', 'opdracht', 'gericht', 'verwerk'], points: 20 },
        { words: ['event', 'gebeurd', 'aankondiging', 'verleden'], points: 20 },
      ],
    },
    modelAnswer: 'Message = opdracht ("verwerk betaling"). Event = aankondiging ("betaling verwerkt").',
  },
  {
    id: 'open-msg-03', category: 'messaging', type: 'open-write',
    question: 'Wat is idempotency en waarom is het nodig bij at-least-once delivery?',
    rubric: {
      minLength: 40,
      keywordGroups: [
        { words: ['zelfde resultaat', 'meerdere keren', 'dubbel'], points: 25 },
        { words: ['at-least-once', 'at least once', 'duplicaat'], points: 15 },
      ],
    },
    modelAnswer: 'Idempotent = dubbele verwerking geeft zelfde resultaat. Nodig omdat at-least-once duplicaten kan leveren.',
  },
  {
    id: 'open-adr-01', category: 'adr', type: 'open-write',
    question: 'Noem de 5 secties van een Nygard ADR en beschrijf kort wat er in elke sectie hoort.',
    rubric: {
      minLength: 80,
      keywordGroups: [
        { words: ['status'], points: 8 },
        { words: ['context'], points: 12 },
        { words: ['decision'], points: 12 },
        { words: ['consequences'], points: 12 },
        { words: ['alternatief', 'titel'], points: 8 },
      ],
    },
    modelAnswer: 'Titel, Status, Context (probleem+alternatieven), Decision (keuze), Consequences (+/-).',
  },
];

// Meerkeuze alleen voor oefenen — niet in examen-focus
const MCQ_ONLY_IDS = new Set([
  'smell-01','smell-02','smell-03','smell-04','smell-08','smell-10',
  'princ-04','princ-05','princ-07','princ-08',
  'uml-01','uml-02','uml-03','uml-04','uml-05','uml-06','uml-07','uml-08','uml-09',
  'layer-01','layer-02','layer-03','layer-04','layer-06','layer-07','layer-09','layer-11',
  'adr-01','adr-02','adr-03','adr-07',
  'fact-01','fact-02','fact-03','fact-04','fact-05','fact-08','fact-10','fact-11',
  'msg-01','msg-02','msg-03','msg-04','msg-05','msg-06','msg-07',
]);

// Examen: 6 vragen — 2 MC (0,5 pt), 1 casus met 2 ADR (50%), 3 open
const EXAM_SLOTS = [
  { slot: 'mcq', weight: 0.25, label: 'Vraag 1' },
  { slot: 'mcq', weight: 0.25, label: 'Vraag 2' },
  { slot: 'open', weight: 1.5, label: 'Vraag 3', preferType: 'open-multi' },
  { slot: 'adr-casus', weight: 5, label: 'Vraag 4–5', preferType: 'adr-casus' },
  { slot: 'open', weight: 1.5, label: 'Vraag 6' },
  { slot: 'open', weight: 1.5, label: 'Vraag 7' },
];

// Vaste set = examenopbouw (casus met 2 ADR's = 50%)
const EXAM_REFERENCE = [
  { id: 'smell-01', weight: 0.25, label: 'Vraag 1', note: 'Meerkeuze (0,25 pt) — design smell' },
  { id: 'uml-07', weight: 0.25, label: 'Vraag 2', note: 'Meerkeuze (0,25 pt) — compositie vs aggregatie' },
  { id: 'open-exam-01', weight: 1.5, label: 'Vraag 3', note: 'Open: 3.1, 3.2, 3.3 (1,5 pt)' },
  { id: 'adr-casus-01', weight: 5, label: 'Vraag 4–5', note: 'Casus: 2 Nygard ADR\'s — legacy + module + extern (5 pt, 50%)' },
  { id: 'fact-06', weight: 1.5, label: 'Vraag 6', note: 'Open pseudocode WinFactory (1,5 pt)' },
  { id: 'fact-07', weight: 1.5, label: 'Vraag 7', note: 'Open pseudocode loose coupling (1,5 pt)' },
];

// Rubric-upgrades — alleen nog voor MCQ-ADR indien nodig
const ADR_RUBRIC_UPGRADES = {};

// Merge alles
function buildQuestionBank() {
  const samenvatting = typeof QUESTIONS_SAMENVATTING !== 'undefined' ? QUESTIONS_SAMENVATTING : [];
  const casusesExtra = typeof ADR_CASUSES_EXTRA !== 'undefined' ? ADR_CASUSES_EXTRA : [];
  const all = [...QUESTIONS, ...QUESTIONS_EXTRA, ...casusesExtra, ...samenvatting];
  all.forEach((q) => {
    if (ADR_RUBRIC_UPGRADES[q.id] && q.rubric) {
      q.rubric = { ...q.rubric, ...ADR_RUBRIC_UPGRADES[q.id] };
    }
    if (typeof ADR_CONTEXT !== 'undefined' && ADR_CONTEXT[q.id]) {
      Object.assign(q, ADR_CONTEXT[q.id]);
    }
    if (typeof ADR_CASUS !== 'undefined' && ADR_CASUS[q.id]) {
      Object.assign(q, ADR_CASUS[q.id]);
    }
  });
  return all;
}

const ALL_QUESTIONS = buildQuestionBank();

function isOpenQuestion(q) {
  return ['text', 'open-identify', 'open-write', 'adr-write', 'pseudocode-write', 'open-multi'].includes(q.type);
}

function getOpenQuestions() {
  return ALL_QUESTIONS.filter(isOpenQuestion);
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isAdrCasusQuestion(q) {
  return q.type === 'open-multi' && q.examCasus && (q.parts || []).some((p) => p.type === 'adr-write');
}

function getAdrCasusQuestions() {
  return ALL_QUESTIONS.filter(isAdrCasusQuestion);
}

function getExamPool(slot) {
  switch (slot) {
    case 'mcq':
      return ALL_QUESTIONS.filter((q) =>
        ['mcq', 'code-analysis', 'uml-relation', 'factory-uml', 'ordering'].includes(q.type)
      );
    case 'open':
      return ALL_QUESTIONS.filter((q) =>
        ['open-multi', 'open-write', 'open-identify', 'pseudocode-write'].includes(q.type)
        && !q.examCasus
      );
    case 'adr':
      return ALL_QUESTIONS.filter((q) => q.type === 'adr-write');
    case 'adr-casus':
      return ALL_QUESTIONS.filter((q) => isAdrCasusQuestion(q));
    default:
      return [];
  }
}

function examNoteForSlot(slot, q) {
  const section = typeof getQuestionTopic === 'function' ? getSectionLabel(getQuestionTopic(q)) : '';
  const sectionSuffix = section ? ` — ${section}` : '';
  switch (slot) {
    case 'mcq':
      return `Meerkeuze (0,25 pt)${sectionSuffix}`;
    case 'open':
      if (q.type === 'open-multi') return `Open deelvragen (1,5 pt)${sectionSuffix}`;
      if (q.type === 'pseudocode-write') return `Open pseudocode (1,5 pt)${sectionSuffix}`;
      return `Open vraag (1,5 pt)${sectionSuffix}`;
    case 'adr':
      return `ADR (2,5 pt)${sectionSuffix}`;
    case 'adr-casus':
      return `Casus: 2 Nygard ADR's (5 pt, 50%)${sectionSuffix}`;
    default:
      return sectionSuffix.replace(/^ — /, '');
  }
}

// Kies vraag met voorkeur voor nog niet gebruikte samenvatting-secties
function pickExamQuestion(pool, usedSections, preferType, forceSections) {
  const available = pool.filter(Boolean);
  if (!available.length) return null;

  let candidates = available;
  if (forceSections && forceSections.length) {
    const forced = available.filter((q) => forceSections.includes(getQuestionTopic(q)));
    if (forced.length) candidates = forced;
  }

  const scored = candidates.map((q) => {
    const topic = getQuestionTopic(q);
    let score = Math.random();
    if (!usedSections.has(topic)) score += 12;
    if (preferType && q.type === preferType) score += 6;
    if (preferType === 'open-multi' && q.type === 'open-multi') score += 4;
    return { q, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0].q;
}

function mapExamConfig(cfgList) {
  return cfgList.map((cfg) => {
    const q = ALL_QUESTIONS.find((x) => x.id === cfg.id);
    return q ? { ...q, examLabel: cfg.label, examWeight: cfg.weight, examNote: cfg.note } : null;
  }).filter(Boolean);
}

// Willekeurig examen — casus-ADR (50%) + rest verdeeld over samenvatting-secties
function buildRandomExam() {
  const used = new Set();
  const usedSections = new Set();
  const result = [];

  EXAM_SLOTS.forEach((slot) => {
    const pool = getExamPool(slot.slot).filter((q) => !used.has(q.id));
    const forceSections = slot.slot === 'adr-casus' ? ['s10'] : [];
    const preferType = slot.preferType === 'adr-casus' ? null : (slot.preferType || null);
    const q = pickExamQuestion(pool, usedSections, preferType, forceSections);
    if (!q) return;
    used.add(q.id);
    usedSections.add(getQuestionTopic(q));
    result.push({
      ...q,
      examLabel: slot.label,
      examWeight: slot.weight,
      examNote: slot.note || examNoteForSlot(slot.slot, q),
      examSection: getQuestionTopic(q),
    });
  });

  return result.length >= EXAM_SLOTS.length ? result : mapExamConfig(EXAM_REFERENCE);
}

// Vragen per samenvatting-sectie (voor oefenen per onderwerp)
function getQuestionsBySection(sectionId) {
  return ALL_QUESTIONS.filter((q) => getQuestionTopic(q) === sectionId);
}

function getExamQuestions() {
  return buildRandomExam();
}

function getReferenceExamQuestions() {
  return mapExamConfig(EXAM_REFERENCE);
}

function getExamTotalPoints() {
  return EXAM_SLOTS.reduce((s, c) => s + c.weight, 0);
}
