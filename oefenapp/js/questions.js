// Vragenbank SDK & SAAI - gebaseerd op toetsinhoud en samenvatting
const QUESTION_CATEGORIES = {
  smell: { label: 'Design Smells', color: '#F87171' },
  principle: { label: 'Design Principes', color: '#5DCAA5' },
  uml: { label: 'UML', color: '#AFA9EC' },
  layers: { label: '4 Architectuurlagen', color: '#85B7EB' },
  adr: { label: 'Nygard ADR', color: '#C084FC' },
  factory: { label: 'Factory & Pseudocode', color: '#34D399' },
  messaging: { label: 'Messaging & Integratie', color: '#FBBF24' },
};

const QUESTIONS = [
  // === DESIGN SMELLS (15) ===
  {
    id: 'smell-01', category: 'smell', type: 'mcq',
    question: 'Je past één variabele aan in de OrderService en plotseling crashen 5 GUI-schermen die je nooit hebt aangeraakt. Welke design smell is dit?',
    options: ['Rigidity', 'Fragility', 'Complexity', 'Opacity'],
    answer: 1,
    explain: 'Fragility = breekbaarheid. Kleine wijziging op plek A breekt onverwacht plek B, C, D.',
  },
  {
    id: 'smell-02', category: 'smell', type: 'mcq',
    question: 'Je wilt één feature toevoegen maar moet daarvoor 12 bestanden in 4 packages aanpassen. Welke smell?',
    options: ['Rigidity', 'Fragility', 'Complexity', 'Opacity'],
    answer: 0,
    explain: 'Rigidity = starheid. Eén kleine aanpassing heeft enorm domino-effect.',
  },
  {
    id: 'smell-03', category: 'smell', type: 'mcq',
    question: 'Een methode `processEverything()` is 350 regels met 20 if-statements. Welke smell?',
    options: ['Rigidity', 'Fragility', 'Complexity', 'Opacity'],
    answer: 2,
    explain: 'Complexity = te veel logica op één plek, methoden veel te lang.',
  },
  {
    id: 'smell-04', category: 'smell', type: 'mcq',
    question: 'Variabelen heten `x`, `tmp2`, `zzz123` en niemand snapt de code. Welke smell?',
    options: ['Rigidity', 'Fragility', 'Complexity', 'Opacity'],
    answer: 3,
    explain: 'Opacity = ondoorzichtig. Code is bijna onmogelijk te begrijpen.',
  },
  {
    id: 'smell-05', category: 'smell', type: 'code-analysis',
    question: 'Welke design smell(s) zie je in deze code?',
    code: `class ReportGenerator {
  void generate() {
    // 400 regels: PDF maken, Excel maken,
    // mail versturen, database updaten,
    // logging, error handling...
  }
}`,
    options: ['Complexity', 'Opacity', 'Rigidity', 'Fragility'],
    answer: [0],
    multi: false,
    explain: 'Eén methode doet alles → Complexity. Ook SRP-schending.',
  },
  {
    id: 'smell-06', category: 'smell', type: 'code-analysis',
    question: 'Welke smell zie je hier?',
    code: `class PaymentService {
  void pay(Order o) {
    MySqlConnection conn = new MySqlConnection("jdbc:...");
    // direct SQL in business logic
    conn.execute("INSERT INTO payments...");
  }
}`,
    options: ['Rigidity', 'Fragility', 'Complexity', 'Opacity'],
    answer: [0],
    explain: 'Tight coupling aan MySQL maakt wijzigen moeilijk → Rigidity. Ook SRP-schending.',
  },
  {
    id: 'smell-07', category: 'smell', type: 'code-analysis',
    question: 'Je hernoemt `getTotal()` naar `calculateTotal()` en 8 klassen compileren niet meer. Welke smell?',
    code: `// 30 klassen roepen direct getTotal() aan
// overal in het project verspreid`,
    options: ['Rigidity', 'Fragility', 'Complexity', 'Opacity'],
    answer: [1],
    explain: 'Fragility: kleine hernoeming breekt veel ongerelateerde code.',
  },
  {
    id: 'smell-08', category: 'smell', type: 'mcq',
    question: 'Wat is het verschil tussen Rigidity en Fragility?',
    options: [
      'Rigidity = moeilijk uitbreiden; Fragility = makkelijk kapot door kleine wijziging',
      'Rigidity = slechte namen; Fragility = lange methoden',
      'Ze zijn hetzelfde',
      'Rigidity = runtime fouten; Fragility = compile fouten',
    ],
    answer: 0,
    explain: 'Rigidity = je MOET veel aanpassen om iets te veranderen. Fragility = iets BREEKT onverwacht.',
  },

  // === DESIGN PRINCIPES (12) ===
  {
    id: 'princ-01', category: 'principle', type: 'code-analysis',
    question: 'Welk design principe wordt hier geschonden?',
    code: `class UserManager {
  void createUser(String name) { /* aanmaken */ }
  void sendWelcomeEmail(User u) { /* mailen */ }
  void saveToDatabase(User u) { /* opslaan */ }
}`,
    options: ['SRP', 'OCP', 'Loose Coupling', 'Design for Change'],
    answer: [0],
    explain: 'Drie taken in één klasse → schendt Single Responsibility Principle.',
  },
  {
    id: 'princ-02', category: 'principle', type: 'code-analysis',
    question: 'Welk principe wordt geschonden?',
    code: `void drawShape(String type) {
  if (type.equals("Circle")) drawCircle();
  else if (type.equals("Square")) drawSquare();
  else if (type.equals("Triangle")) drawTriangle();
  // nieuw shape? deze methode aanpassen!
}`,
    options: ['SRP', 'OCP', 'Loose Coupling', 'Design for Change'],
    answer: [1],
    explain: 'Nieuwe shape toevoegen = bestaande code aanpassen → schendt Open/Closed Principle.',
  },
  {
    id: 'princ-03', category: 'principle', type: 'code-analysis',
    question: 'Welk principe wordt geschonden?',
    code: `class OrderService {
  private MySqlOrderDAO dao = new MySqlOrderDAO();
  Order find(int id) { return dao.find(id); }
}`,
    options: ['SRP', 'OCP', 'Loose Coupling', 'Design for Change'],
    answer: [2],
    explain: 'Direct afhankelijk van concrete MySqlOrderDAO → tight coupling, geen loose coupling.',
  },
  {
    id: 'princ-04', category: 'principle', type: 'mcq',
    question: 'Wat betekent OCP (Open/Closed Principle)?',
    options: [
      'Open voor uitbreiding, gesloten voor aanpassing',
      'Open source code, gesloten database',
      'Open voor iedereen, gesloten voor hackers',
      'Open voor testen, gesloten voor productie',
    ],
    answer: 0,
    explain: 'Nieuwe functionaliteit via nieuwe klassen, niet door bestaande code te wijzigen.',
  },
  {
    id: 'princ-05', category: 'principle', type: 'mcq',
    question: 'Hoe bereik je loose coupling het beste?',
    options: [
      'Programmeer tegen een interface, niet tegen een concrete klasse',
      'Zet alles in één grote klasse',
      'Gebruik overal static methoden',
      'Vermijd interfaces',
    ],
    answer: 0,
    explain: 'Interface = afhankelijk van abstractie, niet van implementatie.',
  },
  {
    id: 'princ-06', category: 'principle', type: 'code-analysis',
    question: 'Welk principe wordt hier WEL nageleefd?',
    code: `interface IShape { void draw(); }
class Circle implements IShape { void draw() { /* ... */ } }
class Square implements IShape { void draw() { /* ... */ } }
// Nieuw shape? Alleen nieuwe klasse toevoegen`,
    options: ['SRP', 'OCP', 'Loose Coupling', 'Alle drie'],
    answer: [1],
    explain: 'Nieuwe shapes via nieuwe klassen → OCP. Ook loose coupling via interface.',
  },
  {
    id: 'princ-07', category: 'principle', type: 'mcq',
    question: 'Simple Factory met switch schendt vooral welk principe bij uitbreiding?',
    options: ['SRP', 'OCP', 'Loose Coupling', 'Geen van alle'],
    answer: 1,
    explain: 'Nieuwe databron toevoegen = factory aanpassen → schendt OCP.',
  },

  // === UML (10) ===
  {
    id: 'uml-01', category: 'uml', type: 'uml-relation',
    question: 'Dog IS EEN Animal. Welke UML-relatie?',
    scenario: 'Dog extends Animal. Dog erft alles van Animal.',
    uml: `classDiagram
  Animal <|-- Dog`,
    options: ['Inheritance (extends)', 'Interface (implements)', 'Compositie', 'Aggregatie', 'Dependency', 'Associatie'],
    answer: 0,
    explain: 'Overerving = doorgetrokken lijn met gevulde driehoek naar de parent.',
  },
  {
    id: 'uml-02', category: 'uml', type: 'uml-relation',
    question: 'Cat implementeert IFeedable. Welke relatie?',
    scenario: 'Cat VOERT UIT wat IFeedable vraagt.',
    uml: `classDiagram
  IFeedable <|.. Cat`,
    options: ['Inheritance (extends)', 'Interface (implements)', 'Compositie', 'Aggregatie', 'Dependency', 'Associatie'],
    answer: 1,
    explain: 'Implements = stippellijn met open driehoek naar interface.',
  },
  {
    id: 'uml-03', category: 'uml', type: 'uml-relation',
    question: 'OrderItem bestaat NIET zonder Order. Welke relatie?',
    scenario: 'Als Order verdwijnt, verdwijnt OrderItem ook.',
    uml: `classDiagram
  Order "1" *-- "1..*" OrderItem`,
    options: ['Inheritance', 'Interface', 'Compositie', 'Aggregatie', 'Dependency', 'Associatie'],
    answer: 2,
    explain: 'Compositie ◆ = onlosmakelijk, child kan niet zonder parent.',
  },
  {
    id: 'uml-04', category: 'uml', type: 'uml-relation',
    question: 'Player kan WEL los van Team bestaan. Welke relatie?',
    scenario: 'Speler kan van team wisselen of zonder team bestaan.',
    uml: `classDiagram
  Team "1" o-- "0..*" Player`,
    options: ['Inheritance', 'Interface', 'Compositie', 'Aggregatie', 'Dependency', 'Associatie'],
    answer: 3,
    explain: 'Aggregatie ◇ = onderdeel van, maar kan los bestaan.',
  },
  {
    id: 'uml-05', category: 'uml', type: 'uml-relation',
    question: 'Game GEBRUIKT Dice alleen in een methode. Welke relatie?',
    scenario: 'Geen attribuut, alleen tijdelijk gebruik in roll().',
    uml: `classDiagram
  Game ..> Dice`,
    options: ['Inheritance', 'Interface', 'Compositie', 'Aggregatie', 'Dependency', 'Associatie'],
    answer: 4,
    explain: 'Dependency = stippellijn + pijl, tijdelijk gebruik.',
  },
  {
    id: 'uml-06', category: 'uml', type: 'uml-relation',
    question: 'Student HEEFT een Course als attribuut. Welke relatie?',
    scenario: 'Student heeft private Course enrolledCourse.',
    uml: `classDiagram
  Student --> Course`,
    options: ['Inheritance', 'Interface', 'Compositie', 'Aggregatie', 'Dependency', 'Associatie'],
    answer: 5,
    explain: 'Associatie = doorgetrokken lijn met pijl, referentie opgeslagen als attribuut.',
  },
  {
    id: 'uml-07', category: 'uml', type: 'mcq',
    question: 'Ezelsbruggetje compositie vs aggregatie: "Als de parent verdwijnt, verdwijnt de child dan ook?"',
    options: ['Ja → compositie, Nee → aggregatie', 'Ja → aggregatie, Nee → compositie', 'Altijd compositie', 'Altijd aggregatie'],
    answer: 0,
    explain: 'Ja = compositie ◆. Nee = aggregatie ◇.',
  },

  // === 4 LAGEN (8) ===
  {
    id: 'layer-01', category: 'layers', type: 'mcq',
    question: 'Welke laag bevat GUI-componenten met ActionListener?',
    options: ['Presentation', 'Application Logic', 'Domain', 'Data Storage'],
    answer: 0,
    explain: 'Presentation = alles van het scherm, zo dom mogelijk.',
  },
  {
    id: 'layer-02', category: 'layers', type: 'mcq',
    question: 'Waar zitten de Managers?',
    options: ['Presentation', 'Application Logic', 'Domain', 'Data Storage'],
    answer: 1,
    explain: 'Application Logic = managers, checks, delegeert opslag.',
  },
  {
    id: 'layer-03', category: 'layers', type: 'mcq',
    question: 'Waar zitten Member, Book en andere entiteiten?',
    options: ['Presentation', 'Application Logic', 'Domain', 'Data Storage'],
    answer: 2,
    explain: 'Domain = entiteiten met domeinkennis en regels.',
  },
  {
    id: 'layer-04', category: 'layers', type: 'mcq',
    question: 'Waar zitten DAO\'s en DatabaseConnection?',
    options: ['Presentation', 'Application Logic', 'Domain', 'Data Storage'],
    answer: 3,
    explain: 'Data Storage = alle kennis over opslag: SQL, connectie, database.',
  },
  {
    id: 'layer-05', category: 'layers', type: 'ordering',
    question: 'Zet de 4 architectuurlagen in de juiste volgorde (boven → onder):',
    items: ['Data Storage', 'Presentation', 'Domain', 'Application Logic'],
    answer: ['Presentation', 'Application Logic', 'Domain', 'Data Storage'],
    explain: 'Presentation → Application Logic → Domain + Data Storage (Manager delegeert naar DAO).',
  },
  {
    id: 'layer-06', category: 'layers', type: 'mcq',
    question: 'In welke volgorde bouw je de lagen (ontwerpvolgorde)?',
    options: [
      'Domain → Application Logic → Presentation of Data Storage',
      'Presentation → Domain → Data Storage → Application Logic',
      'Data Storage → Domain → Application Logic → Presentation',
      'Alles tegelijk',
    ],
    answer: 0,
    explain: 'Begin met Domain (hart), dan Managers, dan Presentation of Data Storage.',
  },
  {
    id: 'layer-07', category: 'layers', type: 'mcq',
    question: 'Naamgeving: per persistente domeinklasse maak je...',
    options: ['Eén DAO (MemberDAO)', 'Eén Manager per DAO', 'Eén GUI per entiteit', 'Geen DAO nodig'],
    answer: 0,
    explain: 'Regel: één DAO per persistente domeinklasse, naam = KlasseNaamDAO.',
  },
  {
    id: 'layer-08', category: 'layers', type: 'open-write',
    question: 'Noem alle 4 architectuurlagen en geef per laag één verantwoordelijkheid.',
    rubric: {
      subtype: 'four-layers',
      gradingCriteria: 'Per laag: naam + concrete verantwoordelijkheid.',
    },
    modelAnswer: `1. Presentation — GUI/schermen, knoppen, events doorgeven.
2. Application Logic — Managers: checks en delegeren naar DAO.
3. Domain — entiteiten met domeinkennis en regels.
4. Data Storage — DAO's, database, SQL/opslag.`,
    explain: 'Alle 4 lagen met hun kernverantwoordelijkheid noemen.',
  },

  // === NYGARD ADR (6) ===
  {
    id: 'adr-01', category: 'adr', type: 'mcq',
    question: 'Hoeveel secties heeft een Nygard ADR?',
    options: ['3', '4', '5', '7'],
    answer: 2,
    explain: 'Nygard = 5 secties: Titel, Status, Context, Decision, Consequences.',
  },
  {
    id: 'adr-02', category: 'adr', type: 'mcq',
    question: 'Welke sectie heeft Nygard NIET als apart blok (wel MADR)?',
    options: ['Context', 'Decision Drivers', 'Decision', 'Consequences'],
    answer: 1,
    explain: 'Nygard: Decision Drivers en Considered Options zitten IN Context.',
  },
  {
    id: 'adr-03', category: 'adr', type: 'mcq',
    question: 'Welke status betekent: vervangen door een nieuwere ADR?',
    options: ['Proposed', 'Accepted', 'Deprecated', 'Superseded'],
    answer: 3,
    explain: 'Superseded = vervangen, verwijs naar de nieuwe ADR.',
  },
  {
    id: 'adr-04', category: 'adr', type: 'adr-write',
    question: 'Schrijf een Nygard ADR voor dit scenario:\n\nLegacy bibliotheeksysteem (COBOL, monolith) moet gekoppeld worden aan een nieuwe webshop. Directe REST-koppeling faalt als legacy offline is (temporal coupling). Het team overweegt RabbitMQ.',
    scenario: 'Legacy bibliotheek + webshop integratie via messaging',
    rubric: {
      sections: ['status', 'context', 'decision', 'consequences'],
      decisionKeywords: ['rabbitmq', 'queue', 'message', 'broker', 'asynchroon'],
      contextKeywords: ['legacy', 'offline', 'temporal', 'coupling', 'rest'],
      consequencePositive: ['temporal', 'offline', 'asynchroon', 'bewaart', 'queue'],
      consequenceNegative: ['infrastructuur', 'complex', 'debug', 'beheer', 'extra'],
    },
    modelAnswer: `# RabbitMQ als message broker voor legacy-koppeling\n\n## Status\nAccepted\n\n## Context\nHet legacy COBOL-systeem is niet altijd bereikbaar. REST-koppeling veroorzaakt temporal coupling.\n\n## Decision\nWe gebruiken RabbitMQ. De webshop plaatst orders in een queue, legacy verwerkt asynchroon.\n\n## Consequences\n+ Temporal coupling opgelost\n+ Berichten bewaard bij uitval\n- Extra infrastructuur\n- Moeilijker debuggen`,
    explain: 'Volledige Nygard ADR met alle 5 secties, concrete decision, +/- consequences.',
  },
  {
    id: 'adr-05', category: 'adr', type: 'adr-write',
    question: 'Schrijf een Nygard ADR voor dit scenario:\n\nLegacy HR-systeem slaat data op in Oracle DB. Nieuw systeem moet dezelfde data lezen. Opties: directe DB-koppeling, dagelijkse CSV-export, of API-laag ervoor.',
    scenario: 'Legacy HR data beschikbaar maken',
    rubric: {
      sections: ['status', 'context', 'decision', 'consequences'],
      decisionKeywords: ['api', 'rest', 'laag', 'service', 'export', 'csv', 'oracle'],
      contextKeywords: ['legacy', 'hr', 'oracle', 'data', 'koppeling'],
      consequencePositive: ['los', 'ontkoppeld', 'veilig', 'controle'],
      consequenceNegative: ['latency', 'vertraging', 'onderhoud', 'complex'],
    },
    modelAnswer: `# API-laag voor legacy HR-data\n\n## Status\nProposed\n\n## Context\nNieuw systeem heeft HR-data nodig. Directe DB-toegang is riskant en koppelt tight aan Oracle-schema.\n\n## Decision\nWe bouwen een read-only REST API-laag bovenop het legacy systeem.\n\n## Consequences\n+ Loose coupling, geen directe DB-toegang\n+ Controle over welke data gedeeld wordt\n- Extra ontwikkeltijd\n- Nog steeds afhankelijk van legacy beschikbaarheid`,
    explain: 'Context met probleem + alternatieven, concrete Decision, positieve EN negatieve Consequences.',
  },
  {
    id: 'adr-06', category: 'adr', type: 'adr-write',
    question: 'Schrijf een Nygard ADR: Legacy betalingssysteem kan max 10 requests/seconde. Black Friday piek verwacht 1000/sec. Keuze: queue met throttling, caching, of systeem vervangen.',
    scenario: 'Legacy performance bottleneck',
    rubric: {
      sections: ['status', 'context', 'decision', 'consequences'],
      decisionKeywords: ['queue', 'throttl', 'cache', 'rabbitmq', 'buffer'],
      contextKeywords: ['legacy', '10', 'performance', 'piek', 'black friday', 'capaciteit'],
      consequencePositive: ['piek', 'buffer', 'bescherm', 'legacy'],
      consequenceNegative: ['vertraging', 'delay', 'complex', 'queue'],
    },
    modelAnswer: `# Message queue met throttling voor legacy betalingen\n\n## Status\nAccepted\n\n## Context\nLegacy systeem a 10 req/sec. Black Friday verwacht 1000/sec. Directe koppeling zou legacy crashen.\n\n## Decision\nRabbitMQ queue met consumer die max 10 berichten/sec doorstuurt naar legacy.\n\n## Consequences\n+ Legacy beschermd tegen overload\n+ Pieken opgevangen in queue\n- Vertraging bij hoge load\n- Extra RabbitMQ infrastructuur`,
    explain: 'ADR moet het performance-probleem in Context benoemen en een concrete oplossing in Decision.',
  },

  // === FACTORY PATTERN (10) ===
  {
    id: 'fact-01', category: 'factory', type: 'mcq',
    question: 'Waarom gebruik je een Factory Pattern?',
    options: [
      'Om `new` te beperken tot één plek en coupling te verminderen',
      'Om code sneller te maken',
      'Om geen interfaces te gebruiken',
      'Om SQL te vermijden',
    ],
    answer: 0,
    explain: 'Factory centraliseert object-creatie. `new` = tight coupling, beperk het tot de factory.',
  },
  {
    id: 'fact-02', category: 'factory', type: 'mcq',
    question: 'Wie maakt de concrete factory aan en geeft die aan de Manager?',
    options: ['De Manager zelf', 'De DAO', 'De main-klasse', 'De GUI'],
    answer: 2,
    explain: 'main maakt factory aan en injecteert via constructor (Dependency Injection).',
  },
  {
    id: 'fact-03', category: 'factory', type: 'mcq',
    question: 'Abstract Factory vs Simple Factory: nieuwe FAMILIE (bijv. WinFactory naast LinFactory) toevoegen...',
    options: [
      'Alleen nieuwe klassen, bestaande code ongewijzigd (OCP)',
      'Factory-interface + alle factories aanpassen',
      'Alleen de main aanpassen',
      'Onmogelijk zonder alles te herschrijven',
    ],
    answer: 0,
    explain: 'Nieuwe familie = nieuwe concrete factory klasse. Volledig OCP-proof!',
  },
  {
    id: 'fact-04', category: 'factory', type: 'mcq',
    question: 'Nieuw PRODUCT-type toevoegen (bijv. Gorilla naast Spider, Duck) in Abstract Factory...',
    options: [
      'Alleen nieuwe product-klasse',
      'Interface uitbreiden + ALLE concrete factories aanpassen',
      'Alleen main aanpassen',
      'Niets doen',
    ],
    answer: 1,
    explain: 'Nieuwe soort = createGorilla() aan interface + elke factory implementeren. Schendt eigenlijk OCP.',
  },
  {
    id: 'fact-05', category: 'factory', type: 'factory-uml',
    question: 'Bekijk het UML-diagram. LinFactory en MacFactory implementeren GUIFactory. Wat moet WinFactory doen?',
    uml: `classDiagram
    class GUIFactory {
        <<interface>>
        +createButton() Button
        +createCheckbox() Checkbox
    }
    class LinFactory {
        +createButton() LinButton
        +createCheckbox() LinCheckbox
    }
    class MacFactory {
        +createButton() MacButton
        +createCheckbox() MacCheckbox
    }
    class WinFactory {
        +createButton() WinButton
        +createCheckbox() WinCheckbox
    }
  class Button { <<interface>> }
  class Checkbox { <<interface>> }
  class LinButton
  class MacButton
  class WinButton
  class LinCheckbox
  class MacCheckbox
  class WinCheckbox
  GUIFactory <|.. LinFactory
  GUIFactory <|.. MacFactory
  Button <|.. LinButton
  Button <|.. MacButton
  Button <|.. WinButton
  Checkbox <|.. LinCheckbox
  Checkbox <|.. MacCheckbox
  Checkbox <|.. WinCheckbox`,
    options: [
      'implements GUIFactory, maakt WinButton en WinCheckbox',
      'extends LinFactory',
      'extends Button',
      'Heeft geen interface nodig',
    ],
    answer: 0,
    explain: 'WinFactory implements GUIFactory, createButton() → new WinButton(), createCheckbox() → new WinCheckbox().',
  },
  {
    id: 'fact-06', category: 'factory', type: 'pseudocode-write',
    question: 'Schrijf pseudocode voor WinFactory en de main-klasse.\n\nGegeven: GUIFactory interface met createButton() en createCheckbox(). LinFactory en MacFactory bestaan al. De Application-klasse krijgt een GUIFactory via constructor.',
    codeContext: `interface GUIFactory {
  createButton() : Button
  createCheckbox() : Checkbox
}
// LinFactory, MacFactory bestaan
// Application(GUIFactory factory)`,
    rubric: {
      mustHave: ['class WinFactory', 'implements', 'GUIFactory', 'createButton', 'createCheckbox', 'WinButton', 'WinCheckbox', 'new'],
      mainMustHave: ['main', 'WinFactory', 'Application', 'new'],
      diPattern: true,
    },
    modelAnswer: `class WinFactory implements GUIFactory
  createButton() : Button
    return new WinButton()
  end
  createCheckbox() : Checkbox
    return new WinCheckbox()
  end
end

main
  factory = new WinFactory()
  app = new Application(factory)
  app.run()
end`,
    explain: 'WinFactory implementeert GUIFactory. main maakt factory en injecteert in Application.',
    uml: `classDiagram
  class GUIFactory { <<interface>> +createButton() +createCheckbox() }
  class WinFactory { +createButton() +createCheckbox() }
  class Application { -factory: GUIFactory }
  class WinButton
  class WinCheckbox
  GUIFactory <|.. WinFactory
  Application --> GUIFactory
  WinFactory ..> WinButton
  WinFactory ..> WinCheckbox`,
  },
  {
    id: 'fact-07', category: 'factory', type: 'pseudocode-write',
    question: 'Schrijf pseudocode voor loose coupling: MemberManager die alleen van IMemberDAO afhangt, en main die SQLMemberDAO injecteert.',
    rubric: {
      mustHave: ['MemberManager', 'IMemberDAO', 'constructor', 'main', 'SQLMemberDAO', 'new'],
      diPattern: true,
      noDirectNew: ['MySql', 'concrete'],
    },
    modelAnswer: `interface IMemberDAO
  find(id) : Member
  save(member) : void
end

class MemberManager
  -dao : IMemberDAO
  MemberManager(dao : IMemberDAO)
    this.dao = dao
  end
  getMember(id) : Member
    return dao.find(id)
  end
end

main
  dao = new SQLMemberDAO()
  manager = new MemberManager(dao)
end`,
    explain: 'Manager kent alleen interface. main doet dependency injection.',
    uml: `classDiagram
  class IMemberDAO { <<interface>> +find() +save() }
  class SQLMemberDAO
  class MemberManager { -dao: IMemberDAO }
  IMemberDAO <|.. SQLMemberDAO
  MemberManager --> IMemberDAO`,
  },
  {
    id: 'fact-08', category: 'factory', type: 'factory-uml',
    question: 'DAOFactory abstract factory: SQLServerDAOFactory en TestDataDAOFactory. Wat doet de Manager?',
    uml: `classDiagram
    class DAOFactory { <<interface>> +createMemberDAO() +createBookDAO() }
    class SQLServerDAOFactory
    class TestDataDAOFactory
    class MemberManager { -factory: DAOFactory }
    DAOFactory <|.. SQLServerDAOFactory
    DAOFactory <|.. TestDataDAOFactory
    MemberManager --> DAOFactory`,
    options: [
      'Kent alleen DAOFactory interface, vraagt factory.createMemberDAO()',
      'Maakt zelf new SQLMemberDAO()',
      'Kent alle concrete DAO-klassen',
      'Slaat SQL over en gebruikt altijd TestData',
    ],
    answer: 0,
    explain: 'Manager is loose coupled: alleen DAOFactory interface, geen concrete DAO\'s.',
  },

  // === MESSAGING (6) ===
  {
    id: 'msg-01', category: 'messaging', type: 'mcq',
    question: 'Temporal coupling betekent...',
    options: [
      'A en B moeten tegelijk online zijn',
      'Code is te complex',
      'Berichten worden gedupliceerd',
      'Database is traag',
    ],
    answer: 0,
    explain: 'Temporal coupling = beide partijen moeten tegelijk beschikbaar zijn. Oplossing: queue.',
  },
  {
    id: 'msg-02', category: 'messaging', type: 'mcq',
    question: 'At-least-once delivery betekent...',
    options: [
      'Bericht komt zeker aan, maar kan dubbel aankomen',
      'Bericht komt max 1 keer aan of niet',
      'Bericht komt precies 1 keer aan',
      'Bericht wordt nooit afgeleverd',
    ],
    answer: 0,
    explain: 'At-least-once = zeker aankomst, risico op duplicaten → idempotency nodig.',
  },
  {
    id: 'msg-03', category: 'messaging', type: 'mcq',
    question: 'Message vs Event: "Verwerk deze betaling" is een...',
    options: ['Message (gerichte opdracht)', 'Event (aankondiging)', 'Beide', 'Geen van beide'],
    answer: 0,
    explain: 'Message = toekomst, gerichte opdracht. Event = verleden, aankondiging.',
  },
  {
    id: 'msg-04', category: 'messaging', type: 'mcq',
    question: 'Poison message is...',
    options: [
      'Bericht dat altijd faalt en de queue blokkeert',
      'Bericht met virus',
      'Bericht dat te groot is',
      'Bericht zonder headers',
    ],
    answer: 0,
    explain: 'Poison message faalt steeds opnieuw en blokkeert verwerking.',
  },
  {
    id: 'msg-05', category: 'messaging', type: 'mcq',
    question: 'SOA vs Microservices: welke heeft een centrale ESB?',
    options: ['SOA', 'Microservices', 'Beide', 'Geen van beide'],
    answer: 0,
    explain: 'SOA = Enterprise Service Bus als centrale tussenlaag.',
  },
  {
    id: 'msg-06', category: 'messaging', type: 'mcq',
    question: 'Idempotent betekent...',
    options: [
      'Zelfde bericht meerdere keren verwerken = zelfde resultaat',
      'Bericht kan maar 1 keer verstuurd worden',
      'Bericht is versleuteld',
      'Bericht heeft geen payload',
    ],
    answer: 0,
    explain: 'Idempotency = dubbele verwerking geeft hetzelfde resultaat als één keer.',
  },

  // === EXTRA OEFENVRAGEN (15) ===
  {
    id: 'smell-09', category: 'smell', type: 'code-analysis',
    question: 'Deze code heeft een switch die groeit bij elke nieuwe databron. Welke smell EN welk principe?',
    code: `class DAOFactory {
  createDAO(String type) {
    if (type == "SQL") return new SqlDAO();
    if (type == "XML") return new XmlDAO();
    if (type == "CSV") return new CsvDAO();
    // elke nieuwe bron = deze methode aanpassen
  }
}`,
    options: ['Rigidity + OCP-schending', 'Opacity + SRP', 'Fragility + Loose Coupling', 'Complexity + Design for Change'],
    answer: [0],
    explain: 'Simple Factory die groeit = Rigidity. Nieuwe bron = code aanpassen = OCP-schending.',
  },
  {
    id: 'princ-08', category: 'principle', type: 'mcq',
    question: 'Waarom is "program to an interface" belangrijk voor de Manager-klasse?',
    options: [
      'Manager hoeft niet te weten welke concrete DAO gebruikt wordt',
      'Interfaces zijn sneller dan klassen',
      'Java verplicht interfaces',
      'DAO\'s werken niet zonder interface',
    ],
    answer: 0,
    explain: 'Manager praat met IMemberDAO, niet met SQLMemberDAO → loose coupling.',
  },
  {
    id: 'layer-09', category: 'layers', type: 'mcq',
    question: 'De GUI (Presentation) mag zo "dom" mogelijk zijn. Wat betekent dat?',
    options: [
      'Geen businesslogica, alleen tonen en events doorgeven aan Manager',
      'Geen knoppen gebruiken',
      'Geen database queries',
      'Alleen HTML zonder CSS',
    ],
    answer: 0,
    explain: 'Presentation toont data en stuurt acties door. Logica zit in Application Logic.',
  },
  {
    id: 'layer-10', category: 'layers', type: 'code-analysis',
    question: 'In welke laag hoort deze code thuis?',
    code: `class Member {
  -name : String
  -maxLoans : int = 5
  +canBorrow() : boolean
    return currentLoans < maxLoans
  end
}`,
    options: ['Presentation', 'Application Logic', 'Domain', 'Data Storage'],
    answer: [2],
    explain: 'Member met bedrijfsregel canBorrow() = Domain entiteit.',
  },
  {
    id: 'fact-09', category: 'factory', type: 'pseudocode-write',
    question: 'Schrijf pseudocode: main maakt LinFactory aan en geeft die aan Application. Application roept factory.createButton() aan.',
    rubric: {
      mustHave: ['main', 'LinFactory', 'Application', 'createButton', 'new', 'factory'],
      mainMustHave: ['main', 'LinFactory', 'Application'],
      diPattern: true,
    },
    modelAnswer: `main
  factory = new LinFactory()
  app = new Application(factory)
  button = app.getFactory().createButton()
  app.show(button)
end

class Application
  -factory : GUIFactory
  Application(factory : GUIFactory)
    this.factory = factory
  end
  getFactory() : GUIFactory
    return factory
  end
end`,
    explain: 'main instantieert concrete factory en injecteert via constructor.',
    uml: `classDiagram
  class GUIFactory { <<interface>> +createButton() }
  class LinFactory
  class Application { -factory: GUIFactory }
  GUIFactory <|.. LinFactory
  Application --> GUIFactory`,
  },
  {
    id: 'fact-10', category: 'factory', type: 'mcq',
    question: 'Met één Abstract Factory in je app kun je...',
    options: [
      'Maar één actieve databron/familie tegelijk (alle DAO\'s SQL of alle TestData)',
      'Meerdere databronnen mixen per DAO',
      'Geen interfaces gebruiken',
      'De main overslaan',
    ],
    answer: 0,
    explain: 'Eén factory = één familie. Alle DAO\'s komen uit dezelfde bron.',
  },
  {
    id: 'adr-07', category: 'adr', type: 'mcq',
    question: 'Waar in een Nygard ADR beschrijf je alternatieven die je hebt overwogen?',
    options: ['Context', 'Decision', 'Consequences', 'Status'],
    answer: 0,
    explain: 'Bij Nygard zitten alternatieven IN Context, niet als aparte sectie.',
  },
  {
    id: 'adr-08', category: 'adr', type: 'adr-write',
    question: 'Schrijf een Nygard ADR:\n\nLegacy voorraadsysteem (mainframe) moet real-time voorraad tonen in webshop. Opties: polling elke 5 sec, WebSocket, of nightly batch sync.',
    scenario: 'Real-time voorraad legacy + webshop',
    rubric: {
      sections: ['status', 'context', 'decision', 'consequences'],
      decisionKeywords: ['websocket', 'polling', 'batch', 'sync', 'api', 'real-time', 'realtime'],
      contextKeywords: ['legacy', 'mainframe', 'voorraad', 'webshop', 'real'],
      consequencePositive: ['real-time', 'realtime', 'actueel', 'live'],
      consequenceNegative: ['load', 'belasting', 'complex', 'latency', 'vertraging'],
    },
    modelAnswer: `# WebSocket voor real-time voorraad-sync\n\n## Status\nProposed\n\n## Context\nLegacy mainframe heeft voorraaddata. Webshop moet actuele voorraad tonen. Polling belast legacy; batch is niet real-time.\n\n## Decision\nWe bouwen een WebSocket-koppeling via een adapter-laag die legacy-data pusht bij wijzigingen.\n\n## Consequences\n+ Real-time updates voor klanten\n+ Minder polling-belasting dan elke 5 sec\n- Complexe adapter nodig\n- Legacy moet events kunnen emitters`,
    explain: 'Context met legacy-probleem en alternatieven. Decision concreet. +/- consequences.',
  },
  {
    id: 'uml-08', category: 'uml', type: 'mcq',
    question: 'Private attribuut in UML notatie:',
    options: ['- naam : Type', '+ naam : Type', '# naam : Type', '* naam : Type'],
    answer: 0,
    explain: '- (min) = private. + = public. # = protected.',
  },
  {
    id: 'uml-09', category: 'uml', type: 'uml-relation',
    question: 'MemberManager gebruikt MemberDAO in findMember(). MemberDAO is GEEN attribuut. Welke relatie?',
    scenario: 'Tijdelijk gebruik in methode, geen opgeslagen referentie.',
    uml: `classDiagram
  MemberManager ..> MemberDAO`,
    options: ['Inheritance', 'Interface', 'Compositie', 'Aggregatie', 'Dependency', 'Associatie'],
    answer: 4,
    explain: 'Geen attribuut, alleen gebruik in methode = dependency (stippellijn).',
  },
  {
    id: 'princ-09', category: 'principle', type: 'code-analysis',
    question: 'Dit is de GOEDE versie van OrderService. Welk principe wordt nageleefd?',
    code: `class OrderService {
  -dao : IOrderDAO
  OrderService(dao : IOrderDAO) { this.dao = dao; }
  Order find(int id) { return dao.find(id); }
}`,
    options: ['SRP', 'OCP', 'Loose Coupling', 'Design for Change'],
    answer: [2],
    explain: 'Constructor krijgt IOrderDAO interface → loose coupling via DI.',
  },
  {
    id: 'smell-10', category: 'smell', type: 'mcq',
    question: 'Welke design goal conflicteert vaak met Efficiency?',
    options: ['Security', 'Modifiability', 'Reusability', 'Testability'],
    answer: 1,
    explain: 'Modifiability (makkelijk aanpasbaar) vs Efficiency (snel) — je maakt altijd trade-offs.',
  },
  {
    id: 'msg-07', category: 'messaging', type: 'mcq',
    question: 'Behavioral coupling oplossen met events betekent...',
    options: [
      'A roept alleen "dit is gebeurd", B beslist zelf wat te doen',
      'A en B moeten tegelijk online zijn',
      'Berichten worden versleuteld',
      'Geen queue nodig',
    ],
    answer: 0,
    explain: 'Events = losse koppeling. Producer weet niet wat consumer doet.',
  },
  {
    id: 'fact-11', category: 'factory', type: 'factory-uml',
    question: 'MonsterFactory met FrostyFactory, FieryFactory, GoldFactory. Je voegt SilverFactory toe. Wat moet je doen?',
    uml: `classDiagram
    class MonsterFactory { <<interface>> +createSpider() +createDuck() +createTiger() }
    class FrostyFactory
    class FieryFactory
    class GoldFactory
    class SilverFactory
    MonsterFactory <|.. FrostyFactory
    MonsterFactory <|.. FieryFactory
    MonsterFactory <|.. GoldFactory
    MonsterFactory <|.. SilverFactory`,
    options: [
      'SilverFactory implements MonsterFactory + SilverSpider, SilverDuck, SilverTiger maken',
      'MonsterFactory interface aanpassen',
      'FrostyFactory extenden',
      'Alleen SilverSpider maken',
    ],
    answer: 0,
    explain: 'Nieuwe familie = nieuwe factory + alle concrete monsters voor die familie. OCP-proof!',
  },
  {
    id: 'layer-11', category: 'layers', type: 'mcq',
    question: 'Wat is een "verticale slice" bij iteratief bouwen?',
    options: [
      'Eén feature door alle lagen heen werkend maken',
      'Eerst alle DAO\'s, dan alle GUI\'s',
      'Alleen de domain layer afmaken',
      'Code in horizontale stroken knippen',
    ],
    answer: 0,
    explain: 'Verticale slice = dun plakje door Presentation, Logic, Domain en Data Storage.',
  },
];

// Examen-set: representatieve mix zoals echte toets
const EXAM_QUESTION_IDS = [
  'smell-01', 'smell-05', 'princ-01', 'princ-03', 'uml-03', 'uml-04',
  'layer-01', 'layer-05', 'layer-08',
  'adr-04', 'adr-05',
  'fact-05', 'fact-06', 'fact-07',
  'msg-01', 'msg-02',
  'princ-02', 'smell-02', 'uml-02', 'fact-03',
];
