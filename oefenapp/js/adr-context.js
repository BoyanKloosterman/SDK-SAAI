// Uitgebreide systeemcontext + diagrammen bij ADR-scenario's
const ADR_CONTEXT = {
  'adr-04': {
    systemContext: `## Het systeem — huidige situatie

**Legacy bibliotheeksysteem (COBOL monolith)**
- Beheert: leden, boeken, uitleningen, reserveringen
- Draait on-premise op mainframe/server
- Alleen bereikbaar via oud SOAP/REST-endpoint (soms offline voor batch-jobs 's nachts)
- Geen message queue, geen events

**Nieuwe webshop**
- Moderne Java/Spring backend + React frontend
- Moet bij bestelling controleren of boek beschikbaar is en uitlening registreren in legacy

**Huidige koppeling (voorstel team)**
- Webshop roept legacy direct aan via synchrone REST
- Bij timeout of offline legacy → hele checkout faalt (500 error naar klant)

## Problemen (waarom ADR nodig is)
| Probleem | Uitleg |
|----------|--------|
| Temporal coupling | Webshop en legacy moeten tegelijk online zijn |
| Geen buffering | Geen queue → data verloren bij storing |
| Tight coupling | Webshop kent legacy URL, payload-formaat, foutcodes |
| Geen retry-logica | Eén mislukte call = mislukte bestelling |

## Overwogen alternatieven
1. **Directe REST** — simpel maar temporal coupling blijft
2. **RabbitMQ queue** — async, berichten bewaard
3. **Nachtelijke batch (CSV)** — geen real-time`,
    uml: `flowchart TB
    subgraph huidig [Huidige koppeling - temporal coupling]
      WS[Webshop API]
      LEG[Legacy COBOL Bibliotheek]
      WS -->|REST sync - wacht op antwoord| LEG
    end
    subgraph probleem [Wat er misgaat]
      LEG -.->|offline 02:00-06:00| X[Checkout faalt]
    end`,
  },

  'adr-05': {
    systemContext: `## Het systeem — huidige situatie

**Legacy HR-systeem**
- Oracle-database met medewerkersgegevens, afdelingen, salarisgroepen
- Monolithische Java EE app, geen publieke API
- Schema is complex, weinig documentatie
- Draait al 12+ jaar, kritisch voor HR-afdeling

**Nieuw talent/portaal-systeem**
- Moet medewerkersnaam, afdeling, manager kunnen tonen
- Alleen-lezen toegang nodig
- Team wil snel live zonder legacy te herschrijven

**Mogelijke koppelingen**
| Optie | Beschrijving |
|-------|--------------|
| Directe DB | Nieuw systeem leest rechtstreeks Oracle-tabellen |
| CSV export | HR exporteert dagelijks CSV, nieuw systeem importeert |
| API-laag | Dunne REST-laag boven legacy die data serveert |

## Risico's directe DB-koppeling
- Schema-wijziging in legacy breekt nieuw systeem (fragility)
- Security: nieuw systeem heeft volledige DB-toegang
- Geen controle over welke velden gedeeld worden`,
    uml: `flowchart LR
    subgraph legacy [Legacy HR]
      HRAPP[HR Applicatie]
      ORA[(Oracle DB)]
      HRAPP --> ORA
    end
    subgraph opties [Koppelopties]
      NEW[Nieuw Portaal]
      NEW -.->|optie A: direct| ORA
      NEW -->|optie B: CSV| FILE[CSV bestand]
      NEW -->|optie C: API| API[Read-only API]
      API --> HRAPP
    end`,
  },

  'adr-06': {
    systemContext: `## Het systeem — huidige situatie

**Legacy betalingssysteem (mainframe)**
- Verwerkt betalingen via synchroon COBOL-programma
- Max capaciteit: **10 requests/seconde** (harde limiet)
- Geen horizontale schaalbaarheid
- 99.5% uptime maar traag bij piek

**Webshop checkout**
- Spring Boot service roept legacy direct aan bij "Betalen"
- Thread blokkeert tot mainframe antwoordt (2-5 sec normaal)

**Black Friday verwachting**
- 1000 betalingen/seconde op piekmoment
- Zonder bescherming: mainframe overload → timeouts → cascade failure

## Gevolg huidige architectuur
\`\`\`
Checkout → Mainframe (sync) → bij overload: alles crasht
\`\`\`

## Overwogen opties
1. Queue + throttling (buffer + max 10/sec naar legacy)
2. Caching (helpt niet bij writes)
3. Legacy vervangen (miljoenen, jaren)`,
    uml: `flowchart TB
    subgraph piek [Black Friday - probleem]
      C1[Checkout 1]
      C2[Checkout 2]
      C3[Checkout ...1000/s]
      MF[Mainframe max 10/s]
      C1 & C2 & C3 -->|sync REST| MF
      MF --> CRASH[Overload / timeouts]
    end`,
  },

  'adr-08': {
    systemContext: `## Het systeem — huidige situatie

**Legacy voorraad (mainframe)**
- Voorraadtellingen in COBOL + DB2
- Geen API, geen events
- Batch-update 's nachts mogelijk

**Webshop**
- Moet "Op voorraad / Niet op voorraad" tonen
- Klanten verwachten actuele info (concurrent doet real-time)

**Huidige workarounds**
| Methode | Nadeel |
|---------|--------|
| Polling elke 5 sec | Belast mainframe, nog steeds temporal coupling |
| Nightly batch | Voorraad kan 24u verouderd zijn |
| WebSocket | Moet gebouwd worden, maar lost coupling op |

## Koppeling nu
Webshop vraagt elke 5 sec voorraad op via REST → mainframe.`,
    uml: `flowchart LR
    WS[Webshop]
  MF[Mainframe Voorraad]
  WS -->|polling elke 5s REST| MF
  MF -->|antwoord sync| WS`,
  },

  'adr-09': {
    systemContext: `## Het systeem

**SAP ERP (legacy, 15 jaar)**
- Module MM: materiaalmanagement / voorraad
- Export: nachtelijke FTP-batch naar flat files
- Geen real-time API beschikbaar voor externe apps

**Mobiele voorraad-app (nieuw)**
- Magazijnmedewerkers scannen producten
- Moet actuele voorraad zien (niet van gisteren)

## Dataflow nu
\`\`\`
SAP --[FTP nacht 03:00]--> bestand op server --[?]--> app
\`\`\`
App heeft geen live data.`,
    uml: `flowchart LR
    SAP[SAP ERP]
    FTP[FTP Server]
    FILE[(voorraad.csv)]
    APP[Mobiele App]
    SAP -->|batch 03:00| FTP
    FTP --> FILE
    FILE -.->|verouderd| APP`,
  },

  'adr-10': {
    systemContext: `## Het systeem

**Legacy CRM (monolith)**
- Klantgegevens, contacthistorie, contracten
- Geen REST API, geen webhooks
- Database: SQL Server, directe toegang mogelijk maar riskant

**Marketing Automation Platform (nieuw)**
- Moet segmenten maken op basis van klantwijzigingen
- Eis: data binnen **5 minuten** na CRM-wijziging

## Huidige situatie
- Geen koppeling — marketing gebruikt verouderde CSV handmatig
- Nightly ETL duurt te lang (volgende ochtend pas data)`,
    uml: `flowchart TB
    CRM[Legacy CRM Monolith]
    DB[(SQL Server)]
    MKT[Marketing Platform]
    CRM --> DB
    DB -.->|nightly ETL 24u vertraging| MKT
    CRM -.->|geen live events| MKT`,
  },

  'adr-11': {
    systemContext: `## Het systeem

**Mainframe betalingsmodule**
- Synchrone verwerking: request → response in één HTTP-call
- Single point of failure voor checkout
- Gepland onderhoud: zondag 00:00-04:00

**Webshop Checkout Service**
- \`PaymentService.pay()\` roept mainframe aan
- Geen queue, geen fallback
- Bij mainframe down: \`Connection refused\` → gebruiker ziet error

## Sequence huidige situatie
1. Gebruiker klikt Betalen
2. Checkout → POST mainframe/pay (BLOCKING)
3. Mainframe offline → exception → checkout crashed`,
    uml: `sequenceDiagram
    participant User
    participant Checkout
    participant Mainframe
    User->>Checkout: Betaal
    Checkout->>Mainframe: POST /pay sync
    Note over Mainframe: offline
    Mainframe--xCheckout: timeout
    Checkout-->>User: Fout 500`,
  },

  'adr-12': {
    systemContext: `## Het integratielandschap — 12 legacy systemen

| Systeem | Functie |
|---------|---------|
| ERP | Orders, facturen |
| CRM | Klanten |
| HR | Personeel |
| WMS | Magazijn |
| ... | +8 andere |

**Huidige koppeling: point-to-point spaghetti**
- Elk systeem praat direct met 2-4 anderen
- ~30 directe verbindingen totaal
- Nieuwe koppeling = N×M probleem

**Nieuw systeem (Data Warehouse)** moet erbij — nog 12 nieuwe verbindingen als je P2P blijft doen?`,
    uml: `flowchart TB
    ERP[ERP] <--> CRM[CRM]
    CRM <--> HR[HR]
    HR <--> WMS[WMS]
    ERP <--> WMS
    WMS <--> FIN[Finance]
    CRM <--> MKT[Marketing]
    FIN <--> ERP
    NEW[Nieuw DWH]
    NEW -.->|12 nieuwe P2P?| ERP
    NEW -.-> CRM
    NEW -.-> HR`,
  },

  'adr-13': {
    systemContext: `## Het systeem

**Legacy HR**
- Salarisdata in beveiligde Oracle DB
- Wekelijkse export: CSV → email naar Finance-medewerker
- Geen encryptie op email, geen audit log

**Finance rapportage-systeem**
- Heeft **dagelijkse** salarisdata nodig voor kostenrapporten
- AVG: elke toegang tot salarisdata moet gelogd worden

## Problemen huidige flow
\`\`\`
HR --[CSV via email]--> persoon --[handmatig import]--> Finance
\`\`\`
- Onveilig (email niet encrypted)
- Geen audit trail
- Wekelijks ≠ dagelijkse behoefte`,
    uml: `flowchart LR
    HR[Legacy HR]
    CSV[CSV bestand]
    EMAIL[Email onversleuteld]
    FIN[Finance Systeem]
    HR --> CSV
    CSV --> EMAIL
    EMAIL -->|handmatig| FIN`,
  },
};
