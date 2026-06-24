// Extra ADR-casussen — elk 1 gedeeld scenario, 2 Nygard ADR's
const ADR_CASUSES_EXTRA = [
  {
    id: 'adr-casus-02', category: 'adr', type: 'open-multi', topic: 's10',
    question: 'Casus: Online gaming platform — legacy leaderboard + nieuwe game server + extern email SaaS.\n\nSchrijf twee Nygard ADR\'s die de kwaliteit van het systeem verhogen.',
    scenario: 'Gaming — GameEnded (lesvoorbeeld)',
    examCasus: true,
    parts: [
      {
        key: 'adr1', label: 'ADR 1', weight: 1, type: 'adr-write',
        question: 'ADR 1 — GameEnd() en leaderboard\n\nLees de systeemcontext. Beschrijf het probleem, vergelijk opties en leg je beslissing vast.',
        rubric: {
          problemMustMention: ['temporal', 'coupling', 'sync', 'leaderboard', 'offline'],
          alternativesExpected: ['sync', 'queue', 'rabbitmq', 'batch', 'asynchroon'],
          solutionQuality: {
            excellent: [{ patterns: ['rabbitmq', 'queue', 'asynchroon', 'message'], why: 'Temporal decoupling — GameEnd wacht niet op 30s leaderboard.' }],
            poor: [{ patterns: ['synchroon blijven', 'sync blijven', 'direct aanroepen'], penalty: 30, why: 'Sync blijft temporal coupling.' }],
          },
          bestSolution: 'P2P queue: GameEnd publiceert message, leaderboard consumeert async.',
          consequencePositive: ['temporal', 'offline', 'schaal'], consequenceNegative: ['complex', 'eventual'],
        },
        modelAnswer: '# Async queue voor leaderboard-updates\n\n## Status\nAccepted\n\n## Context\nSync UpdateLeaderboard (30s) bij 100 games/min. Offline leaderboard = GameEnd faalt. Overwogen: sync, P2P queue, batch.\n\n## Decision\n1. Game server publiceert GameEnd-berichten naar RabbitMQ queue.\n2. Leaderboard-service consumeert asynchroon (geen blocking GameEnd).\n\n## Consequences\n+ Temporal coupling opgelost\n+ GameEnd blijft snel\n- Eventual consistency op ranglijst\n- Queue-infrastructuur',
      },
      {
        key: 'adr2', label: 'ADR 2', weight: 1, type: 'adr-write',
        question: 'ADR 2 — Notify en email\n\nLees de systeemcontext (deel 2). Leg vast hoe je kijkers en externe partijen informeert na een wedstrijd. Bouwt voort op ADR 1.',
        rubric: {
          problemMustMention: ['behavioral', 'coupling', 'extern', 'subscriber'],
          alternativesExpected: ['sync', 'point', 'queue', 'pub', 'sub', 'exchange', 'gameended'],
          solutionQuality: {
            excellent: [{ patterns: ['pub/sub', 'pub sub', 'exchange', 'gameended', 'game ended'], why: 'Behavioral decoupling — game server kent subscribers niet.' }],
            poor: [{ patterns: ['sync', 'synchroon', 'direct aanroepen'], penalty: 25, why: 'Behavioral coupling blijft.' }],
          },
          bestSolution: 'Pub/sub: GameEnded event via exchange; notify + email als subscribers.',
          consequencePositive: ['behavioral', 'extern', 'schaal'], consequenceNegative: ['complex', 'debug', 'volgorde'],
        },
        modelAnswer: '# Pub/sub met GameEnded event\n\n## Status\nAccepted\n\n## Context\nSync notify + email = behavioral coupling. Extern SaaS + interne viewers. Bouwt voort op ADR 1 (RabbitMQ). Overwogen: sync, P2P queues, pub/sub.\n\n## Decision\n1. Publiceer `GameEnded` event (verleden tijd) naar RabbitMQ exchange.\n2. NotifyViewers en Email-SaaS-adapter subscriben via eigen queues.\n\n## Consequences\n+ Nieuwe subscriber zonder game server wijziging\n+ Extern en intern gelijk via events\n- Moeilijker debuggen\n- Event-volgorde niet gegarandeerd',
      },
    ],
    modelAnswer: 'ADR 1: queue voor temporal. ADR 2: pub/sub GameEnded voor behavioral.',
    explain: 'Lesdia gaming: eerst temporal, dan behavioral decoupling.',
  },
  {
    id: 'adr-casus-03', category: 'adr', type: 'open-multi', topic: 's10',
    question: 'Casus: Legacy bibliotheek (COBOL) + nieuwe webshop-module + extern betalingsplatform.\n\nSchrijf twee Nygard ADR\'s voor betere toekomstige kwaliteit.',
    scenario: 'Bibliotheek — legacy + webshop + extern betaling',
    examCasus: true,
    parts: [
      {
        key: 'adr1', label: 'ADR 1', weight: 1, type: 'adr-write',
        question: 'ADR 1 — Uitlening registreren in legacy\n\nLees de systeemcontext. Beschrijf het probleem, vergelijk opties en leg je beslissing vast.',
        rubric: {
          problemMustMention: ['temporal', 'offline', 'coupling', 'legacy'],
          alternativesExpected: ['rest', 'sync', 'rabbitmq', 'queue', 'batch'],
          solutionQuality: {
            excellent: [{ patterns: ['rabbitmq', 'queue', 'durable', 'asynchroon'], why: 'Berichten bewaard tot legacy online.' }],
            poor: [{ patterns: ['sync rest', 'synchroon', 'direct rest'], penalty: 30, why: 'Temporal coupling blijft.' }],
          },
          bestSolution: 'Durable P2P queue webshop → legacy adapter.',
          consequencePositive: ['temporal', 'offline', 'queue'], consequenceNegative: ['infrastructuur', 'eventual'],
        },
        modelAnswer: '# Queue voor legacy-uitleningen\n\n## Status\nAccepted\n\n## Context\nSync REST naar COBOL-bibliotheek. Offline batch-window = mislukte checkout. Overwogen: sync, queue, batch.\n\n## Decision\n1. Webshop publiceert uitlening-messages naar durable RabbitMQ queue.\n2. Legacy-adapter consumeert wanneer COBOL online is.\n\n## Consequences\n+ Orders bewaard bij legacy-uitval\n+ Geen rewrite legacy nodig\n- Adapter + broker\n- Vertraagde bevestiging',
      },
      {
        key: 'adr2', label: 'ADR 2', weight: 1, type: 'adr-write',
        question: 'ADR 2 — Betaling en magazijn na reservering\n\nLees de systeemcontext (deel 2). Leg vast hoe je betaling en magazijn aanstuurt. Bouwt voort op ADR 1.',
        rubric: {
          problemMustMention: ['behavioral', 'extern', 'coupling', 'sync'],
          alternativesExpected: ['sync', 'queue', 'pub', 'sub', 'loanreserved', 'event'],
          solutionQuality: {
            excellent: [{ patterns: ['pub/sub', 'pub sub', 'exchange', 'loanreserved', 'event'], why: 'Behavioral decoupling intern/extern.' }],
            good: [{ patterns: ['rabbitmq', 'queue'], why: 'Asynchroon maar P2P kent nog alle consumers.' }],
            poor: [{ patterns: ['sync', 'synchroon keten'], penalty: 25, why: 'Coupling blijft.' }],
          },
          bestSolution: 'Pub/sub LoanReserved event; betaling en magazijn als subscribers.',
          consequencePositive: ['behavioral', 'extern', 'los'], consequenceNegative: ['complex', 'idempot'],
        },
        modelAnswer: '# Pub/sub LoanReserved\n\n## Status\nProposed\n\n## Context\nSync betaling + magazijn na reservering. Extern SaaS + intern systeem. Voortbouwend op ADR 1 queue. Overwogen: sync, P2P, pub/sub.\n\n## Decision\n1. Publiceer `LoanReserved` event naar RabbitMQ exchange.\n2. Betalings-adapter en magazijn subscriben via eigen queues.\n\n## Consequences\n+ Webshop kent subscribers niet meer\n+ Extern platform via adapter\n- Idempotency nodig\n- Eventual consistency',
      },
    ],
    modelAnswer: 'ADR 1: temporal queue. ADR 2: pub/sub LoanReserved.',
    explain: 'Bibliotheek-casus — zelfde patroon als examen.',
  },
  {
    id: 'adr-casus-04', category: 'adr', type: 'open-multi', topic: 's10',
    question: 'Casus: Legacy mainframe betalingen + checkout-module + extern fraudedetectie SaaS.\n\nSchrijf twee Nygard ADR\'s.',
    scenario: 'Betalingen — piek + betrouwbaarheid',
    examCasus: true,
    parts: [
      {
        key: 'adr1', label: 'ADR 1', weight: 1, type: 'adr-write',
        question: 'ADR 1 — Black Friday piek\n\nLees de systeemcontext. Beschrijf het probleem, vergelijk opties en leg je beslissing vast.',
        rubric: {
          problemMustMention: ['10', 'piek', '1000', 'overload', 'retry'],
          alternativesExpected: ['retry', 'queue', 'throttl', 'rabbitmq'],
          solutionQuality: {
            excellent: [{ patterns: ['queue', 'throttl', 'rabbitmq', '10'], why: 'Buffer + throttle beschermt legacy.' }],
            poor: [{ patterns: ['sync retry', 'onbeperkt retry'], penalty: 25, why: 'Retry storm (les).' }],
          },
          bestSolution: 'Queue buffer + consumer max 10/s naar mainframe.',
          consequencePositive: ['piek', 'buffer', 'legacy'], consequenceNegative: ['vertraging', 'queue'],
        },
        modelAnswer: '# Queue met throttling\n\n## Status\nAccepted\n\n## Context\n1000/s vs 10/s mainframe. Sync = crash. Overwogen: retry, throttle queue, unlimited consumers.\n\n## Decision\n1. Checkout publiceert PaymentRequested naar RabbitMQ.\n2. Consumer throttle max 10/s naar mainframe.\n\n## Consequences\n+ Legacy beschermd\n+ Pieken opgevangen\n- Vertraging op piekdagen\n- Broker nodig',
      },
      {
        key: 'adr2', label: 'ADR 2', weight: 1, type: 'adr-write',
        question: 'ADR 2 — Betrouwbaarheid en fraudedetectie\n\nLees de systeemcontext (deel 2). Leg vast hoe je betrouwbaarheid borgt en fraudedetectie toegang geeft. Bouwt voort op ADR 1.',
        rubric: {
          problemMustMention: ['at-least', 'idempot', 'poison', 'duplicaat', 'ack'],
          alternativesExpected: ['dlq', 'dead-letter', 'idempot', 'ack', 'nack'],
          solutionQuality: {
            excellent: [{ patterns: ['dlq', 'dead-letter', 'idempot', 'ack'], why: 'DLQ + idempotency = lesoplossing.' }],
            poor: [{ patterns: ['onbeperkt retry', 'weggooien'], penalty: 25, why: 'Queue blokkeert of dataverlies.' }],
          },
          bestSolution: 'DLQ na X retries + idempotente payment consumer + ACK.',
          consequencePositive: ['betrouw', 'poison', 'extern'], consequenceNegative: ['complex', 'monitoring'],
        },
        modelAnswer: '# DLQ en idempotente verwerking\n\n## Status\nAccepted\n\n## Context\nAt-least-once uit ADR 1 queue. Poison messages + duplicaten. Fraud SaaS als subscriber. Overwogen: retry, weggooi, DLQ+idempotency.\n\n## Decision\n1. Consumer is idempotent; ACK alleen na succes.\n2. Poison messages na 3x naar dead-letter queue.\n\n## Consequences\n+ Queue blokkeert niet\n+ Fraud SaaS krijgt betrouwbare events\n- DLQ-processen nodig\n- Meer ontwikkeltijd',
      },
    ],
    modelAnswer: 'ADR 1: throttle queue. ADR 2: DLQ + idempotency.',
    explain: 'Piek + betrouwbaarheid op één casus.',
  },
];
