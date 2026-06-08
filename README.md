# SDK & SAAI Toetstrainer

Oefenapp voor het vak **Software Design & Software Architectuur (SDK & SAAI)**. Gebaseerd op echte toetsinhoud: design smells, design principes, UML, vier architectuurlagen, Nygard ADR's, factory pattern en pseudocode.

Geen installatie nodig — pure HTML/CSS/JavaScript, draait lokaal in de browser.

---

## Starten

### Snelste manier (Windows)

Dubbelklik op:

```
Start Toetstrainer.bat
```

Of vanuit de map erboven:

```
../Start Toetstrainer.bat
```

Dit start een lokale webserver op poort **8765** en opent de browser op `http://localhost:8765`.

### Handmatig

```powershell
cd oefenapp
python -m http.server 8765
```

Open daarna `http://localhost:8765` in de browser.

> **Let op:** open `index.html` direct alleen als Python niet beschikbaar is. Sommige browsers blokkeren dan scripts vanaf `file://`. De batch-file gebruikt daarom een lokale server.

---

## Oefenmodi

| Modus | Beschrijving |
|-------|--------------|
| **Examenmodus** | 7 vragen per ronde, willekeurig uit de examenpool. Zelfde opbouw als de echte toets (zie hieronder). |
| **Open vragen** | Alle open vragen — het type dat het meest voorkomt op de toets. |
| **ADR-oefening** | Alleen Nygard ADR-scenario's (legacy-integratie). |
| **Alles incl. meerkeuze** | Volledige vragenbank (~100+ vragen). |
| **Zwakke punten** | Herhaal vragen waar je eerder onder de 70% scoorde. |
| **Per onderwerp** | Oefen per categorie (smells, UML, lagen, factory, messaging, …). |

Voortgang (scores per vraag) wordt opgeslagen in `localStorage` van je browser.

---

## Examenmodus — opbouw

Elke examenronde bestaat uit **7 vragen** op een schaal van **10 punten**:

| Vraag | Type | Punten |
|-------|------|--------|
| 1–2 | Meerkeuze | 0,25 pt elk (samen 0,5 pt) |
| 3 | Open deelvragen (3.1, 3.2, 3.3) | 1,5 pt |
| 4–5 | ADR schrijven (legacy-scenario) | 2,5 pt elk (**50% van totaal**) |
| 6–7 | Pseudocode / factory | 1,5 pt elk |

Vragen worden **willekeurig** gekozen uit pools per type. Geen dubbele vragen binnen één ronde. Start opnieuw voor een andere set.

De vaste toets van destijds staat als referentie in de code (`EXAM_REFERENCE` in `questions-extra.js`).

---

## Onderwerpen

- **Design Smells** — herkennen en benoemen (SRP, God Class, …)
- **Design Principes** — SOLID, loose coupling, code-analyse
- **UML** — relaties, compositie vs. aggregatie, diagrammen (Mermaid)
- **4 Architectuurlagen** — presentatie, applicatie, domein, infrastructuur
- **Nygard ADR** — Context, Decision, Consequences + architectuurdiagrammen
- **Factory & Pseudocode** — LinFactory, WinFactory, loose coupling
- **Messaging & Integratie** — queues, temporal coupling, legacy-koppeling

---

## Beoordeling

### Lokaal (standaard)

Open antwoorden worden automatisch beoordeeld door `grader.js`:

- **Meerkeuze / UML** — exacte match
- **Open vragen** — keywords + rubric
- **ADR** — Nygard-formaat (25%) + context (15%) + oplossingskwaliteit (40%) + consequences (20%)
- **Pseudocode** — structuur en kernconcepten (factory, interface, DI)
- **Vier lagen / loose coupling** — inhoudelijke checks op deelvragen

### AI-beoordeling (optioneel)

Via **Gemini** of **OpenAI** voor rijkere feedback op open vragen.

1. Ga op de startpagina naar **AI-beoordeling**
2. Kies provider (Gemini aanbevolen — gratis tier via [Google AI Studio](https://aistudio.google.com/apikey))
3. Plak je API-key
4. Klik **Test API-verbinding**

De key wordt alleen lokaal opgeslagen (`localStorage`). Bij een API-fout valt de app terug op de lokale beoordeling.

**Rate limiting:** minimaal 6 seconden tussen AI-aanroepen (voorkomt 429-fouten op de gratis tier).

---

## Bestandsstructuur

```
oefenapp/
├── index.html              # App-shell
├── Start Toetstrainer.bat  # Launcher (Python HTTP-server)
├── README.md
├── css/
│   └── style.css
└── js/
    ├── questions.js        # Basisvragenbank + categorieën
    ├── adr-context.js      # ADR-scenario's met context + Mermaid-diagrammen
    ├── questions-extra.js  # Extra open vragen + examenconfig
    ├── grader.js           # Lokale beoordeling
    ├── ai-grader.js        # Optionele AI-beoordeling
    └── app.js              # UI, modi, voortgang
```

**Script-volgorde in `index.html` is belangrijk:**

```
questions.js → adr-context.js → questions-extra.js → grader.js → ai-grader.js → app.js
```

---

## Vraagtypes

| Type | Gebruik |
|------|---------|
| `mcq` | Meerkeuze |
| `code-analysis` | Codefragment analyseren |
| `uml-relation` | UML-relatie kiezen |
| `ordering` | Volgorde bepalen |
| `open-identify` | Smell/principe benoemen |
| `open-write` | Vrije tekst |
| `open-multi` | Meerdere deelvragen (3.1, 3.2, 3.3) |
| `adr-write` | Volledige ADR schrijven |
| `pseudocode-write` | Pseudocode / factory |
| `factory-uml` | UML bij factory pattern |

Nieuwe vragen toevoegen: object in `questions.js` of `questions-extra.js`. Voor ADR's met diagram: context in `adr-context.js`.

---

## Techniek

- Geen build-stap, geen npm
- [Mermaid](https://mermaid.js.org/) via CDN voor UML/architectuurdiagrammen
- Data en voortgang in `localStorage` (`saai-progress`, `saai-ai-key`)
- Werkt offline zodra de pagina geladen is (behalve AI-beoordeling en Mermaid-CDN)

---

## Tips

- Oefen eerst **ADR-oefening** — dat is 50% van het examen
- Gebruik **Examenmodus** vlak voor de toets voor realistische timing
- Bij open vragen: lees het **modelantwoord** na controle — daar zit de leerstof
- ADR-vragen hebben een uitklapbaar **systeemcontext**-paneel met architectuurdiagram

---

## Licentie

Privé oefenmateriaal voor studie SDK & SAAI.
