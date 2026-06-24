// Gedeelde casuscontext — feiten over het systeem, geen voorgeschreven oplossingen
const ADR_CONTEXT = {};

const ADR_CASUS = {
  'adr-casus-01': {
    systemContext: `## Casus — deel 1: legacy ERP en Order Service

**Legacy ERP-monolith (15+ jaar)**
- Orders, voorraad en facturatie in Oracle DB
- Geen message queue — alleen synchrone SOAP/REST
- Elke nacht 01:00–04:00 offline (batch)
- Mag niet worden herschreven (finance-kritisch)

**Nieuwe Order Service (jullie module)**
- Spring Boot — centrale orderverwerking
- Valideert orders in ERP vóór doorsturen naar extern fulfillment

**Extern Fulfillment SaaS**
- Cloud REST API van logistieke partner
- (Komt in deel 2 aan bod — nu focus op ERP-koppeling)

## Huidige koppeling

\`\`\`
Webshop → Order Service → sync REST → Legacy ERP
\`\`\`

**Wat er misgaat**
- ERP offline → mislukte orders, checkout faalt
- Geen buffer: retry zonder checkout te blokkeren is lastig
- Order Service kent het ERP-contract direct

## Jouw opdracht — ADR 1

Leg in een Nygard ADR vast hoe je de koppeling **Order Service ↔ Legacy ERP** verbetert.`,
    systemContextPart2: `## Casus — deel 2: informeren na verzending

**Situatie na ADR 1**
- Je hebt in ADR 1 de koppeling Order Service ↔ ERP heringericht

**Wat er nu speelt**
Na verzending moeten **drie systemen** iets doen:
- **Fulfillment SaaS** (extern) — picklist/status
- **Magazijn-app** (intern) — voorraadmutatie
- **Marketing** — "recent verzonden"-feed

**Huidige koppeling**

\`\`\`
Order Service → sync REST → Fulfillment SaaS
              → sync REST → Magazijn
              → sync REST → Marketing
\`\`\`

**Wat er misgaat**
- Order Service kent en roept elke bestemming direct aan
- Nieuw systeem erbij → Order Service opnieuw aanpassen
- Externe en interne partijen op dezelfde manier gekoppeld

## Jouw opdracht — ADR 2

Leg vast hoe je na verzending informeert (intern én extern). **Bouwt voort op ADR 1.**`,
    uml: `flowchart TB
    WS[Webshop]
    OS[Order Service]
    ERP[Legacy ERP]
    WS --> OS
    OS -->|sync REST| ERP`,
    umlPart2: `flowchart TB
    OS[Order Service]
    FF[Fulfillment SaaS extern]
    WH[Magazijn intern]
    MK[Marketing]
    OS -->|sync REST| FF
    OS -->|sync REST| WH
    OS -->|sync REST| MK`,
  },

  'adr-casus-02': {
    systemContext: `## Casus — deel 1: GameEnd en leaderboard

**Game Server**
- Na elke wedstrijd: \`GameEnd()\`
- Roept **synchroon** \`UpdateLeaderboard()\` aan (~30 seconden)
- Bij piek: **100 wedstrijden/minuut**
- Leaderboard-service soms offline → hele \`GameEnd\` faalt

**Legacy leaderboard**
- Monolith, moeilijk te schalen
- Geen async API

## Huidige koppeling

\`\`\`
GameEnd() → sync → UpdateLeaderboard()  (~30s)
\`\`\`

**Wat er misgaat**
- Game server wacht op leaderboard
- Langzame call blokkeert hele GameEnd
- Offline leaderboard → geen games kunnen eindigen

## Jouw opdracht — ADR 1

Leg vast hoe je **GameEnd ↔ leaderboard** verbetert.`,
    systemContextPart2: `## Casus — deel 2: notify en email

**Situatie na ADR 1**
- Je hebt in ADR 1 GameEnd ↔ leaderboard heringericht

**Wat er nog sync in GameEnd zit**
- \`NotifyViewers()\` — push naar kijkers
- \`SendWinnerEmail()\` — extern email SaaS
- Nieuwe feature (bijv. extra notificatie) = **game server aanpassen**

**Wat er misgaat**
- Game server kent alle downstream-systemen
- Extern SaaS en interne services worden direct aangeroepen

## Jouw opdracht — ADR 2

Leg vast hoe je partijen informeert zonder bij elke nieuwe ontvanger de game server te wijzigen. **Verwijs naar ADR 1.**`,
    uml: `flowchart LR
    GS[Game Server GameEnd]
    LB[UpdateLeaderboard]
    GS -->|sync ~30s| LB`,
    umlPart2: `flowchart TB
    GS[Game Server GameEnd]
    NV[NotifyViewers]
    EM[Email SaaS extern]
    GS -->|sync| NV
    GS -->|sync| EM`,
  },

  'adr-casus-03': {
    systemContext: `## Casus — deel 1: webshop en legacy bibliotheek

**Legacy bibliotheeksysteem (COBOL)**
- Uitleningen en reserveringen
- Offline 02:00–06:00 voor batch-jobs
- Geen queue, geen events — alleen synchrone REST

**Nieuwe webshop-module**
- Registreert uitlening in legacy bij bestelling
- Nu: \`POST /legacy/loan\` en wachten op antwoord

**Extern betalingsplatform**
- (Komt in deel 2 — nu focus op legacy-koppeling)

## Huidige koppeling

\`\`\`
Webshop → sync REST → Legacy COBOL
\`\`\`

**Wat er misgaat**
- Legacy offline → checkout faalt
- Geen buffer voor uitleningen buiten openingstijden legacy

## Jouw opdracht — ADR 1

Leg vast hoe je **webshop ↔ legacy COBOL** verbetert.`,
    systemContextPart2: `## Casus — deel 2: reservering, betaling en magazijn

**Situatie na ADR 1**
- Je hebt in ADR 1 webshop ↔ legacy heringericht

**Wat er na reservering moet gebeuren**
- **Extern betalingsplatform** (SaaS) moet betaling starten
- **Intern magazijn** moet exemplaar reserveren
- Webshop roept beide **synchroon** aan

## Huidige koppeling

\`\`\`
Webshop → sync → Betalingsplatform
        → sync → Magazijn
\`\`\`

**Wat er misgaat**
- Webshop kent en orkestreert alle vervolgstappen
- Uitbreiden met nieuwe stap = webshop aanpassen

## Jouw opdracht — ADR 2

Leg vast hoe je na een reservering betaling en magazijn aanstuurt (intern + extern). **Bouwt voort op ADR 1.**`,
    uml: `flowchart LR
    WS[Webshop]
    LEG[Legacy COBOL]
    WS -->|REST sync| LEG`,
    umlPart2: `flowchart TB
    WS[Webshop]
    PAY[Extern betaling SaaS]
    WH[Magazijn intern]
    WS -->|sync| PAY
    WS -->|sync| WH`,
  },

  'adr-casus-04': {
    systemContext: `## Casus — deel 1: Black Friday piek

**Legacy mainframe betalingen**
- Max **10 requests/seconde**
- Geen horizontale schaal

**Checkout-module (nieuw)**
- Synchrone \`PaymentService.pay()\` → mainframe
- Thread blokkeert 2–5 sec per betaling

**Black Friday**
- Verwacht **1000 betalingen/seconde**
- Sync leidt tot overload, retry storms en timeouts

## Huidige koppeling

\`\`\`
Checkout → sync → Mainframe (max 10/s)
\`\`\`

## Jouw opdracht — ADR 1

Leg vast hoe je het legacy betalingssysteem beschermt bij piekbelasting.`,
    systemContextPart2: `## Casus — deel 2: betrouwbaarheid en fraudedetectie

**Situatie na ADR 1**
- Je hebt in ADR 1 piekbelasting op het mainframe aangepakt

**Wat er nu speelt**
- Berichten kunnen **meerdere keren** aankomen
- Sommige berichten **blijven falen** en blokkeren verwerking
- **Extern fraudedetectie SaaS** moet elke betaling kunnen zien

## Jouw opdracht — ADR 2

Leg vast hoe je betrouwbaarheid borgt én fraudedetectie toegang geeft tot betalingsgegevens. **Bouwt voort op ADR 1.**`,
    uml: `flowchart LR
    C[Checkout ~1000/s]
    MF[Mainframe max 10/s]
    C -->|sync| MF`,
    umlPart2: `flowchart LR
    Q[Betalingsverwerking]
    FR[Fraud SaaS extern]
    Q --> FR`,
  },
};
