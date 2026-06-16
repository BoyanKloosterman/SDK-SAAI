// Gedeelde casuscontext — deel 1 (ADR 1) en deel 2 (ADR 2) per casus
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

## Huidige koppeling Order Service → ERP

\`\`\`
Webshop → Order Service → sync REST → Legacy ERP
\`\`\`

| Probleem | Impact |
|----------|--------|
| **Temporal coupling** | ERP offline = mislukte orders, checkout faalt |
| Geen buffer | Geen retry zonder checkout te blokkeren |
| Tight coupling | Order Service kent ERP-contract direct |

## Jouw opdracht — ADR 1

Leg vast hoe je **Order Service ↔ Legacy ERP** ontkoppelt in **tijd** (temporal decoupling). Overwogen: sync REST, point-to-point queue, nachtelijke batch.`,
    systemContextPart2: `## Casus — deel 2: informeren na verzending

**Situatie na ADR 1**
- Order Service ↔ ERP loopt via RabbitMQ queue (temporal decoupling opgelost)
- Orders worden asynchroon verwerkt wanneer ERP online is

**Nieuw probleem — behavioral coupling**
Na verzending moeten **drie systemen** reageren:
- **Fulfillment SaaS** (extern) — picklist/status
- **Magazijn-app** (intern) — voorraadmutatie
- **Marketing** — "recent verzonden"-feed

Nu roept Order Service alles **synchroon REST** aan. Nieuw magazijn-systeem erbij = Order Service opnieuw aanpassen.

\`\`\`
Order Service → sync REST → Fulfillment SaaS
              → sync REST → Magazijn
              → sync REST → Marketing
\`\`\`

| Probleem | Term uit de les |
|----------|-----------------|
| Behavioral coupling | Producer kent alle consumers |
| Point-to-point | N×M koppelingen — schaalt niet |

## Jouw opdracht — ADR 2

Leg vast hoe je **intern + extern** informeert na verzending — **bouwt voort op ADR 1**. Overwogen: meer P2P REST, point-to-point queues, pub/sub exchange met \`OrderShipped\` event.`,
    uml: `flowchart TB
    subgraph huidig [Huidige situatie - sync P2P]
      WS[Webshop]
      OS[Order Service]
      ERP[Legacy ERP]
      FF[Fulfillment SaaS extern]
      WS --> OS
      OS -->|sync REST| ERP
      OS -->|sync REST| FF
    end
    subgraph gewenst [Richting messaging]
      OS2[Order Service]
      Q[(RabbitMQ queue)]
      EX[Exchange pub/sub]
      OS2 --> Q
      OS2 -->|OrderShipped| EX
    end`,
    umlPart2: `flowchart TB
    OS[Order Service]
    EX[RabbitMQ Exchange]
    FF[Fulfillment SaaS]
    WH[Magazijn]
    MK[Marketing]
    OS -->|OrderShipped event| EX
    EX --> FF
    EX --> WH
    EX --> MK`,
  },

  'adr-casus-02': {
    systemContext: `## Casus — deel 1: GameEnd en leaderboard (temporal coupling)

**Game Server**
- Na elke wedstrijd: \`GameEnd()\`
- Roept **synchroon** \`UpdateLeaderboard()\` aan (~30 seconden)
- Bij piek: **100 wedstrijden/minuut**
- Leaderboard-service soms offline → hele \`GameEnd\` faalt

**Legacy leaderboard**
- Monolith, moeilijk te schalen
- Geen async API

## Probleem (les: temporal coupling)

| Probleem | Uitleg |
|----------|--------|
| Temporal coupling | Game server wacht op leaderboard |
| Cascade | Langzame call blokkeert hele GameEnd |
| Offline leaderboard | Geen games kunnen eindigen |

## Jouw opdracht — ADR 1

Leg vast hoe je **GameEnd ↔ leaderboard** ontkoppelt. Overwogen: sync blijven, point-to-point queue, batch.`,
    systemContextPart2: `## Casus — deel 2: notify + email (behavioral coupling)

**Situatie na ADR 1**
- Leaderboard-updates lopen async via queue (temporal coupling opgelost)

**Nog steeds sync in GameEnd**
- \`NotifyViewers()\` — push naar kijkers
- \`SendWinnerEmail()\` — extern email SaaS
- Nieuwe feature (bijv. Discord-notify) = **game server aanpassen**

## Probleem (les: behavioral coupling)

Game server **kent alle downstream-systemen**. Extern SaaS en interne services worden direct aangeroepen.

## Jouw opdracht — ADR 2

Leg vast hoe je subscribers informeert **zonder** game server te wijzigen bij elke nieuwe consumer. Overwogen: meer sync calls, P2P queues, pub/sub met \`GameEnded\` event. **Verwijs naar ADR 1.**`,
    uml: `flowchart TB
    GS[Game Server GameEnd]
    LB[UpdateLeaderboard 30s]
    GS -->|sync| LB`,
    umlPart2: `flowchart TB
    GS[Game Server]
    EX[RabbitMQ Exchange]
    NV[NotifyViewers]
    EM[Email SaaS extern]
    GS -->|GameEnded event| EX
    EX --> NV
    EX --> EM`,
  },

  'adr-casus-03': {
    systemContext: `## Casus — deel 1: webshop en legacy bibliotheek (temporal coupling)

**Legacy bibliotheeksysteem (COBOL)**
- Uitleningen en reserveringen
- Offline 02:00–06:00 voor batch-jobs
- Geen queue, geen events — alleen synchrone REST

**Nieuwe webshop-module**
- Registreert uitlening in legacy bij bestelling
- Nu: \`POST /legacy/loan\` en wachten op antwoord

**Extern betalingsplatform**
- (Komt in deel 2 — nu focus op legacy-koppeling)

## Probleem

| Probleem | Term |
|----------|------|
| Legacy offline → checkout faalt | **Temporal coupling** |
| Geen buffer | Berichten gaan verloren |

## Jouw opdracht — ADR 1

Leg vast hoe webshop ↔ legacy COBOL ontkoppelt in tijd. Overwogen: sync REST, RabbitMQ queue, nachtelijke batch.`,
    systemContextPart2: `## Casus — deel 2: reservering, betaling en magazijn

**Situatie na ADR 1**
- Uitleningen via durable queue naar legacy-adapter (temporal opgelost)

**Nieuw probleem na reservering**
- **Extern betalingsplatform** (SaaS) moet betaling starten
- **Intern magazijn** moet exemplaar reserveren
- Webshop roept beide **synchroon** aan → behavioral coupling

## Jouw opdracht — ADR 2

Leg vast hoe je na \`LoanReserved\` informeert (intern + extern). Overwogen: sync keten, P2P queues, pub/sub event. **Bouwt voort op ADR 1.**`,
    uml: `flowchart LR
    WS[Webshop]
    LEG[Legacy COBOL]
    WS -->|REST sync| LEG`,
    umlPart2: `flowchart TB
    WS[Webshop]
    EX[RabbitMQ Exchange]
    PAY[Extern betaling SaaS]
    WH[Magazijn intern]
    WS -->|LoanReserved| EX
    EX --> PAY
    EX --> WH`,
  },

  'adr-casus-04': {
    systemContext: `## Casus — deel 1: Black Friday piek (performance)

**Legacy mainframe betalingen**
- Max **10 requests/seconde**
- Geen horizontale schaal

**Checkout-module (nieuw)**
- Synchrone \`PaymentService.pay()\` → mainframe
- Thread blokkeert 2–5 sec

**Black Friday**
- Verwacht **1000 betalingen/seconde**
- Sync = overload, retry storms, timeouts

## Messaging-concept

Producer → queue → consumer throttle max 10/s naar legacy.

## Jouw opdracht — ADR 1

Leg vast hoe je legacy beschermt bij piekbelasting. Overwogen: sync retry, queue + throttling, unlimited competing consumers.`,
    systemContextPart2: `## Casus — deel 2: betrouwbaarheid + fraudedetectie

**Situatie na ADR 1**
- Betalingen via RabbitMQ queue met throttling (piek opgevangen)

**Nieuwe problemen**
- Broker levert **at-least-once** → duplicaten mogelijk
- **Poison messages** kunnen queue blokkeren
- **Extern fraudedetectie SaaS** moet elke betaling zien (subscriber)

## Begrippen uit de les

| Term | Betekenis |
|------|-----------|
| DLQ | Bericht na X pogingen apart zetten |
| Idempotency | Dubbele verwerking = zelfde resultaat |
| ACK/NACK | Consumer bevestigt verwerking |

## Jouw opdracht — ADR 2

Leg vast hoe je betrouwbaarheid borgt (poison messages, duplicaten) terwijl fraud SaaS events krijgt. Overwogen: onbeperkt retry, weggooien, DLQ + idempotency + ACK. **Bouwt voort op ADR 1.**`,
    uml: `flowchart LR
    C[Checkout 1000/s]
    Q[(RabbitMQ buffer)]
    MF[Mainframe 10/s]
    C --> Q --> MF`,
    umlPart2: `flowchart LR
    Q[(payment queue)]
    C[Idempotente consumer]
    DLQ[(dead-letter queue)]
    FR[Fraud SaaS extern]
    Q --> C
    C -->|poison na 3x| DLQ
    C -->|event| FR`,
  },
};
