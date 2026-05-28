# Changelog

Tous les changements notables de Sole sont documentés dans ce fichier.

Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
versionnage [SemVer](https://semver.org/lang/fr/).

---

## [Unreleased]

## [0.20.0] — 2026-05-29 — Qualité (passe 2) : helpers partagés + composants extraits + classe de base

Deuxième passe de **dette technique** (suite de l'audit interne), **sans nouvelle feature, sans migration, sans changement de comportement**. Objectif : éliminer les duplications restantes signalées.

### Helpers / single source of truth
- **`formatClientName`** (`@shared/utils`) : `[firstName, name].filter(Boolean).join(' ')` était recopié dans 3 services main (quote/invoice/pdf) → 1 fonction.
- **`DEFAULT_VAT_RATE`** (`@shared/utils`) : le fallback `?? 21` (4 sites) → 1 constante.
- **`parseDate`** + **`statusKey`** + **`unwrap`** (`@app/utils`, renderer) : `parseDate` (2 pages) factorisé ; `statusKey(prefix, value)` générique consommé par les 6 utils `*StatusKey` ; **`unwrap<T>(IpcResponse<T>)`** remplace le motif `if (res.error) throw…` répété **85 fois** dans les **16 services** front.

### Composants / classe de base extraits
- **`PipelineHeader`** (`shared/components`) : l'en-tête pipeline (chips de statut cliquables + compteurs) était dupliqué entre `quote-list` et `invoice-list` (TS + HTML + ~45 lignes CSS identiques) → composant commun (`statuses`/`counts`/`selected`/`statusPrefix`/`allLabelKey` + output `select`).
- **`ColorPicker`** (`shared/components`) : la grille de pastilles couleur (+ CSS `.swatch*`) dupliquée entre les modales Catégorie et Catégorie-de-dépense → composant commun (`labelKey`/`palette`/`selected` + output `pick`).
- **`CrudSettingsPage<TDto>`** (`shared/`) : classe de base abstraite pour les 4 pages settings de référence (Catégorie/Dépense/TVA/Produit) ; factorise les 3 signals (`modalOpen`/`editing`/`confirmOpen`) + `openCreate`/`openEdit`/`closeModal`/`confirmDelete` (strictement identiques aux 4). `onSubmit`/`onSearch`/`ngOnInit` restent **par page** (divergent : Produit transforme la valeur + charge 2 stores, TVA n'a pas de recherche).

### Décision assumée (anti « mauvaise abstraction »)
- **`PageHeader` et `SettingsHeader` NON fusionnés** : `SettingsHeader` porte une barre d'onglets que `PageHeader` n'a pas → ce n'est pas une duplication mais deux responsabilités proches ; les fusionner créerait un composant fourre-tout à onglets optionnels. Laissés séparés (composition > abstraction forcée).
- **Sécurité** : `isManagedFile` durci (`path.resolve` + frontière `sep`) contre les `..` — renforce aussi `deleteManagedFile`.

> Vérifs : `tsc` main/preload OK, `build:renderer` OK (bundle initial 489 kB < budget 500, budgets CSS tenus). Net : **−170 lignes** environ malgré les nouveaux fichiers partagés.

## [0.19.0] — 2026-05-29 — Qualité : source unique des totaux (shared kernel), durcissement IPC, dédup CSS/commentaires

Passe de **dette technique** post-Phase 11 (préparation soutenance), **sans nouvelle feature, sans migration**.
Trois axes issus d'un audit interne (structure / sécurité / DRY / SOLID).

### 1. Source unique des totaux HT/TVA/TTC (shared kernel)

Le calcul des totaux et de la **ventilation TVA par taux** était **réécrit 5 fois** : `QuoteService.toDto`,
`InvoiceService` (`computeTotals`), `ConversionService`, et les deux `computed()` front (`quote-detail`,
`invoice-detail`) — avec, en prime, un **arrondi divergent** (la facture accumulait en pleine précision, le devis
arrondissait par ligne, le front n'arrondissait pas). Risque de **bug d'argent silencieux**, aggravé par la
conversion devis→facture qui relit `vatBreakdown`.

- **Extraction** dans **`src/shared/utils/document-totals.ts`** (fonctions **pures**, zéro dépendance) :
  `round2`, `lineNet`, `computeDocumentTotals(lines) → { totalHt, totalVat, totalTtc, vatBreakdown }`. Importé par le
  **main** (services) **et** le **renderer** (`computed`) — c'est un **shared kernel** : `shared` ne dépend ni d'Angular
  ni de Node/Prisma, donc graphe **acyclique**, aucune fuite renderer→main.
- **Arrondi unifié** sur la règle **« par ligne »** (la plus défendable : `Σ lignes affichées = total affiché`).
  Corrige au passage l'arrondi de la facture. **Totaux toujours dérivés** (jamais stockés) → aucune migration.
- **Autorité inchangée** : le DTO renvoyé par le back fait foi ; le front recalcule seulement pour le live preview.

### 2. Durcissement sécurité — `OPEN_RECEIPT`

Le canal `OPEN_RECEIPT` faisait `shell.openPath(path)` sur **n'importe quel chemin** envoyé par le renderer.
Désormais gardé par **`isManagedFile(path)`** (helper déjà présent, utilisé jusqu'ici seulement par `deleteManagedFile`) :
seuls les fichiers de `userData/storage` s'ouvrent. Défense en profondeur contre un renderer compromis.

### 3. Dédup CSS + commentaires (conventions)

- **`.filter-select` supprimé** des 3 pages liste (Devis/Facture/Projet) au profit du **`.app-select` global** + nouveau
  modificateur **`.app-select--filter`** (largeur auto) dans `styles.css` — apparence single-source.
- **Commentaires retirés** (convention « zéro commentaire ») : `form-field`, `table-column.interface`,
  `client-table-view`, `eu-formats`.

### Fichiers

- **Nouveau** : `src/shared/utils/document-totals.ts`.
- **Main** : `services/invoice|quote|conversion` (consomment le util) ; `handlers/expense` (`isManagedFile` sur `OPEN_RECEIPT`).
- **Renderer** : `quote-detail`, `invoice-detail` (`totals` via le util), `line-items-editor` (`lineTotal` via `lineNet`) ;
  `styles.css` (`.app-select--filter`) ; `quote-list|invoice-list|project-list` (.html + .css) ; `form-field`,
  `table-column.interface`, `client-table-view` (commentaires).
- **Shared** : `validation/eu-formats` (commentaires).

> Vérifs : `tsc` main/preload OK, `build:renderer` OK (budgets tenus), et `computeDocumentTotals` testé hors Electron
> (cas simples, multi-taux, arrondi 33,33 × 3 = 100,00, remise, coercition des `string` du front).

## [0.18.0] — 2026-05-27 — Phase 11 · 6/6 : Notifications OS natives + arrêt du Pomodoro avec enregistrement

Sixième et **dernier chantier de la Phase 11** : les **notifications système natives** (Win11 / Linux / macOS)
branchées sur le point d'accroche `PomodoroStore.notify()` laissé au 5/6, **+** un correctif d'usage du minuteur
demandé en test : pouvoir **arrêter** un pomodoro en cours **et enregistrer le temps déjà fait** (avant, on ne
pouvait que mettre en pause ou réinitialiser-sans-logger). **Aucune dépendance** (API `Notification` d'Electron),
**aucune migration**.

### Parcours

1. **Notifications natives** : à chaque **fin de phase**, en plus du toast in-app, une **vraie notification OS**
   s'affiche (même quand l'app n'est pas au premier plan) — fin de travail → titre « Pause courte/longue » + détail
   « X min enregistrées — pause de Y min » ; fin de pause → titre « Travail » + « Au travail — X min ». C'est exactement
   le comportement attendu en test (Ubuntu : via le démon de notifications du bureau).
2. **Bouton « Terminer »** (popup) : arrête la session **et enregistre le pomodoro de travail en cours au prorata**
   (durée = temps écoulé arrondi à la minute, `pomodoro:true`) puis revient à l'état initial. **« Réinitialiser »**
   reste l'option qui **annule sans rien enregistrer**. Pendant une pause, « Terminer » arrête simplement (rien à logger).

### Décisions d'architecture

- **Notification côté main, pas côté renderer** : nouveau **`notification:show`** en **`ipcHandleNoTx`** (pas de DB →
  variante non-transactionnelle, comme PDF/dialogue) + `NotificationService` (main) qui appelle
  **`new Notification({title, body}).show()`** d'Electron, gardé par **`Notification.isSupported()`**. C'est l'API
  recommandée (cross-platform fiable) vs l'API web `Notification` du renderer. Handler **standalone** (sans entrée
  `AppDependencies`, comme `i18n`/`log`) car service sans repo.
- **Renderer `NotificationService`** (`@app/services/notification`, root) = fin wrapper `window.api.notification.show`,
  **fire-and-forget** (les échecs de notif ne lèvent pas de toast d'erreur). `PomodoroStore.notify(titleKey, bodyKey,
  params)` émet désormais **toast in-app ET notif native** ; **titres réutilisent les libellés de phase existants**
  (`time.pomo.phase.*`) → notif « titre = phase suivante / corps = détail », **zéro nouvelle clé i18n** pour ça.
- **Arrêt avec log au prorata** (`PomodoroStore.finish()`) : si on est en phase **travail**, log d'une `TimeEntry`
  (`duration = round((phaseTotal − restant) / 60)`, ≥ 1 min, `pomodoro:true`) + toast « X min enregistrées », puis
  `reset()`. **Ne compte pas** dans le total « pomodoros du jour » (ce n'est pas un pomodoro complet) mais **le temps
  est tracé**. `Réinitialiser` = `reset()` pur (annulation). Bundle initial 477 → **478 kB** (budget 500).

### Fichiers

- **Shared** : `channels/notification` (`NOTIFICATION_CHANNELS.SHOW`) + barrel + wire `channels/index` ;
  `dtos/notification` (`NotificationPayloadSchema` `{title, body}`) + barrel ; `interfaces/notification`
  (`NotificationAPI`) + barrel + wire `interfaces/index`.
- **Main** : `services/notification/notification.service` (Electron `Notification`) + barrel ;
  `handlers/notification` (`registerNotificationHandlers`, `ipcHandleNoTx`) + barrel + wire `handlers/index`
  (standalone, sans dépendance).
- **Preload** : `apis/notification.api` + wire `preload/index` + `types/electron/index.d.ts` (+`NotificationAPI`).
- **Renderer** : `services/notification/notification` (+ barrel) ; `stores/pomodoro/pomodoro-store`
  (inject `NotificationService`, `notify()` → toast + natif, **+`finish()`**) ;
  `features/time-entry/components/pomodoro-timer` (bouton **« Terminer »** + Réinitialiser en `variant="danger"`) ;
  i18n `ui/time-entry/time.{fr,en,nl,de}` (+`time.pomo.finish`, +`time.pomo.toast.stopped`).

> **À tester E2E** (`npm start`, Ubuntu) : démarrer un pomodoro avec une **durée courte**, attendre la fin →
> **notification système** « Pause courte » s'affiche (même app en arrière-plan) ; fin de pause → notif « Travail » ;
> en plein travail, cliquer **« Terminer »** → entrée `pomodoro:true` au prorata dans le Journal + toast, retour à
> l'état initial ; **« Réinitialiser »** → rien d'enregistré. (Si aucune notif sous Ubuntu : vérifier qu'un démon de
> notifications tourne ; en dev l'app peut apparaître sous le nom « Electron ».)

## [0.17.0] — 2026-05-27 — Phase 11 · 5/6 : Timer Pomodoro (→ TimeEntry.pomodoro)

Cinquième chantier de la **Phase 11** : un vrai **minuteur Pomodoro** qui rend enfin utile le flag
`TimeEntry.pomodoro` (réservé depuis la Phase 7, écrit `false` jusqu'ici). Le timer **enchaîne** travail /
pause courte / pause longue, **logge automatiquement une `TimeEntry` (`pomodoro:true`)** à chaque pomodoro de
travail terminé, **survit à la navigation ET au redémarrage** de l'app, et ses durées sont **configurables**
(stockées en `CompanySettings`). **Une migration** (4 colonnes de config) ; **aucune dépendance** (minuteur =
`setInterval` maison + `localStorage`).

### Parcours

1. Le minuteur est une **popup globale** ouvrable de **3 endroits** : le **raccourci « Pomodoro » du dashboard**
   (remplace l'ancien « Saisir du temps »), la **pastille navbar** (quand un minuteur tourne), et un **bouton
   « Pomodoro » sur `/time`**. Un clic → la popup s'ouvre **directement**.
2. Dans la popup : on choisit **projet (+ tâche optionnelle)** AVANT de démarrer, on coche *facturable* et on note
   une description ; **anneau de progression SVG** (compte à rebours `mm:ss`), **Démarrer / Pause / Reprendre /
   Réinitialiser**, **nb de pomodoros du jour**, **compteur avant la longue pause**. **Fermer la popup n'arrête pas
   le minuteur** (état dans un service root) — il continue en fond, la pastille l'affiche, on rouvre quand on veut.
3. **Fin d'un pomodoro de travail** → `TimeEntry` créée (`pomodoro:true`, `duration` = durée du pomodoro, projet/
   tâche/facturable/description courants) + **toast** « Pomodoro terminé · X min enregistrées — pause de Y min » →
   la **pause démarre toute seule** ; fin de pause → retour au travail automatique. Seules les phases **travail**
   créent une entrée (les pauses ne polluent pas le journal). Le journal `/time` se **rafraîchit en direct**.
4. **Pastille navbar** : un petit indicateur `⏱ 24:13 · Travail` apparaît dans la barre **uniquement quand un
   minuteur tourne** (couleur par phase, glyphe pause si en pause) ; **clic → rouvre la popup**.
5. **Réglages** (icône engrenage du panneau) : modale **Travail / Pause courte / Longue pause / Longue pause tous
   les N** → enregistrés en base.

### Décisions d'architecture

- **État dans un service root singleton `PomodoroStore`** (`@app/stores/pomodoro`, `providedIn: 'root'`) → **survit
  à la navigation** entre pages. Pur état client : signals + `setInterval` (tick 250 ms), **aucune valeur runtime
  importée d'un barrel de DTO** sur le chemin eager (cf. [[barrel-runtime-value-pulls-zod-eager]]) — seuls des
  **types** `CreateTimeEntryDto` (effacés au build). Crée les entrées via `TimeEntryStore.logPomodoro()` (ajout +
  refresh **sans toast**, le `PomodoroStore` émet son propre toast).
- **Emplacement = popup globale (lazy via `@defer`) + pastille navbar (eager, légère)**. Le panneau
  (`PomodoroPanel` = `app-modal` + `PomodoroTimer` + anneau + modale réglages) est **monté une fois à la racine**
  (`app.html`) dans un **`@defer (when pomodoro.panelOpen())`** → tout part dans un **chunk lazy `pomodoro-panel`
  (~14 kB)** chargé au **premier ouverture** (instantané en Electron local). Seuls `PomodoroStore` + `PomodoroIndicator`
  (et, par dépendance, `TimeEntryStore`/`TimeEntryService`) sont eager. **Bundle initial 457 → 477 kB** (budget 500,
  **zod absent** — le renderer ne valide jamais en zod, vérifié). La pastille est `:host:empty { display:none }`
  (zéro espace quand inactive). **Choix popup vs onglet** : un raccourci dashboard → popup directe est plus immédiat ;
  la popup n'est qu'une **surface de contrôle** (le minuteur vit dans le store root, tourne même popup fermée).
- **Anti-drift** : le compte à rebours se recalcule depuis un **timestamp de fin** (`endsAt`) à chaque tick, jamais
  par décrément cumulatif. Le **total de la phase est figé à son démarrage** (`_phaseTotal`, persisté) → changer les
  durées en plein run ne casse pas l'anneau (s'applique à la phase suivante ; en `IDLE`, l'affichage suit la config).
- **Survie au redémarrage (`localStorage` `sole.pomodoro`)** : on persiste statut/phase/`endsAt`/projet/tâche/… À
  l'ouverture : si **RUNNING** et `endsAt` futur → on **reprend le compte à rebours** ; si la phase a **expiré pendant
  la fermeture** → retour propre à `IDLE` (pas de log rétroactif, on ne peut pas prouver le travail) ; si **PAUSED** →
  on restaure le restant. Le **compteur du jour** se réinitialise si la date stockée n'est pas aujourd'hui.
- **Durées configurables en base, pas en `localStorage`** (décision Q2) : **4 colonnes `CompanySettings`**
  (`pomodoroWorkMinutes` 25 / `pomodoroShortBreakMinutes` 5 / `pomodoroLongBreakMinutes` 15 /
  `pomodoroLongBreakInterval` 4) — ce sont des **réglages métier** qui doivent survivre à un reset, comme la note du
  dashboard. Canal léger **`company:set-pomodoro-settings`** (`ipcHandle` + `SavePomodoroSettingsSchema` borné),
  calqué sur `setDashboardNote`. Édition **dans le panneau timer** (où on s'en sert), pas dans le formulaire Entreprise
  (budget CSS).
- **⚠️ Gotcha TEXT+CHECK reconfirmé** : `prisma migrate dev` a **reconstruit** la table `CompanySettings`
  (RedefineTables, pas un simple `ADD COLUMN`) car le **`CHECK vatRegime` n'est pas modélisable côté Prisma** →
  régénération **sans** le CHECK. **Réinjecté à la main** dans la migration (`CHECK ("vatRegime" IN
  ('NORMAL','FRANCHISE'))`) puis dev.db remis d'aplomb. Vérifié `node:sqlite` (cf. [[verify-db-constraints-node-sqlite]])
  sur une **copie** : défauts 25/5/15/4 OK, CHECK `vatRegime` rejette bien une valeur invalide, colonnes éditables.
- **Notif de fin = toast in-app** pour ce chantier ; la **notif OS native** (Win11/Linux/macOS) du **6/6** branchera
  simplement sur la méthode **`PomodoroStore.notify()`** (déjà appelée à chaque frontière de phase = point d'accroche).
- **Composants extraits pour rester sous le budget 4 kB/CSS** (cf. [[extract-components-not-relax-budgets]]) :
  `PomodoroPanel` (wrapper `app-modal`, monté à la racine via `@defer`), `PomodoroTimer` (vue smart, sans chrome de
  carte — la modale fournit la surface), `PomodoroRing` (anneau SVG dumb, `<ng-content>` au centre, couleur par phase
  via `[style.stroke]`), `PomodoroSettingsModal` (form réactif borné), `PomodoroIndicator` (pastille navbar = bouton).
  Helper générique **`formatClock(s) → mm:ss`** déplacé en **`@app/utils`** (réutilisé par le timer ET la pastille
  eager, pas dans la feature time-entry).

### Fichiers

- **Migration** : `schema/company-settings.prisma` (+4 champs `Int`), `migrations/…add_pomodoro_settings`
  (RedefineTables + **CHECK `vatRegime` réinjecté à la main**).
- **Shared** : `dtos/company/save-pomodoro-settings.dto` (`SavePomodoroSettingsSchema`, bornes) + barrel ;
  `dtos/company/company-settings.dto` (+4 champs) ; `channels/company` (+`SET_POMODORO_SETTINGS`) ;
  `interfaces/company` (+`setPomodoroSettings`).
- **Main** : `repositories/company/company-settings.repository` + `services/company/{company-settings,company}.service`
  (+`setPomodoroSettings`) ; `handlers/company` (+`ipcHandle`).
- **Preload** : `apis/company.api` (+`setPomodoroSettings`).
- **Renderer** : `services/company/company` + `stores/company/company-store` (+`setPomodoroSettings` /
  `savePomodoroSettings`) ; **`stores/pomodoro/pomodoro-store`** (signals + `panelOpen`/`openPanel`/`closePanel`,
  + barrel + wire `stores/index`) ; `stores/time-entry/time-entry-store` (+`logPomodoro`) ;
  **`features/time-entry/components/{pomodoro-panel,pomodoro-timer,pomodoro-ring,pomodoro-settings-modal}`** ;
  **`layout/pomodoro-indicator`** (bouton, + wire `navbar`) ; **`app.{ts,html}`** (`@defer` du `PomodoroPanel` à la
  racine) ; **`pages/dashboard/dashboard.{ts,html,css}`** (raccourci « Saisir du temps » → bouton « Pomodoro » qui
  ouvre la popup) + i18n `ui/dashboard/dashboard.{fr,en,nl,de}` (+`dashboard.action.pomodoro`) ;
  `features/time-entry/pages/time-journal` (bouton « Pomodoro » au lieu d'une bascule d'onglet) ;
  `shared/utils/format-clock` (+ barrel) ; i18n `ui/time-entry/time.{fr,en,nl,de}` (clés `time.view.*` + `time.pomo.*`).

> **À tester E2E** (`npm start`) : **dashboard → raccourci « Pomodoro »** (ou pastille navbar, ou bouton sur `/time`)
> → la **popup s'ouvre direct** ; choisir un projet, **Démarrer** (réduire les durées dans les réglages pour tester
> vite) ; **fermer la popup → le minuteur continue** (pastille navbar visible en naviguant ailleurs, clic → rouvre la
> popup) ; à la fin du pomodoro → entrée `pomodoro:true` créée et **visible dans le Journal `/time`**, toast, **pause
> auto** ; **Pause/Reprendre/Réinitialiser** ; **fermer/rouvrir l'app** pendant un run → le minuteur **reprend** ;
> changer les durées → persiste en base et survit au reload ; changer de langue → libellés OK (FR/EN/NL/DE).

## [0.16.0] — 2026-05-27 — Phase 11 · 4/6 : Dashboard KPIs + graphes SVG + grille personnalisable

Quatrième chantier de la **Phase 11** : la page d'accueil (route `''`, déjà déclarée mais vide) devient un
**vrai tableau de bord** — vue d'ensemble freelance composée de **widgets déplaçables et redimensionnables**
(note rapide, raccourcis, KPIs, graphes). **Zéro dépendance de graphes** : tout est **dessiné main en SVG**
(barres groupées, donut) ou en HTML/CSS (barres horizontales, pipeline). Deux agrégats « par mois sur
l'année » ajoutés côté main (CA encaissé, dépenses) et **une migration** (note rapide persistée en base).

### Parcours

1. À l'ouverture, la route `/` affiche le Dashboard : en-tête + **grille de widgets** (note rapide en haut,
   raccourcis, 5 cartes KPI, 4 graphes).
2. **KPIs** : **CA encaissé du mois**, **total impayé**, **devis en attente (SENT) + taux d'acceptation**,
   **heures du mois**, **dépenses déductibles de l'année**.
3. **Graphes** : **Revenus vs dépenses par mois** (barres verticales groupées, 12 mois), **pipeline
   devis & factures par statut** (barres empilées segmentées + légende), **dépenses par catégorie**
   (donut SVG, couleurs des catégories), **heures par projet** (barres horizontales).
4. **Personnalisation** : chaque widget se **déplace** par glisser-déposer (poignée `⠿`, `@angular/cdk/drag-drop`)
   et **change de largeur** (1/2/3 colonnes via les boutons du chrome). La disposition (ordre + largeur) est
   **persistée en `localStorage`** (préférence d'affichage) ; bouton **« Réinitialiser »** dès qu'une perso existe.
   La **note rapide**, elle, est **persistée en base** (`CompanySettings.dashboardNote`) — c'est une vraie donnée
   (un n° de tél, un rappel client) qui doit **survivre à un reset/réinstall**, pas une simple préférence.
5. **Raccourcis** : nouveau devis / facture / projet / client / dépense / saisir du temps (liens `routerLink`).

### Décisions d'architecture

- **Graphes en SVG/CSS hand-rollés, 0 dépendance** (recharts = React, exclu ; pas de lib lazy non plus) →
  **aucun risque sur le budget bundle** (cf. [[barrel-runtime-value-pulls-zod-eager]]). 4 composants *dumb*
  réutilisables sous `pages/dashboard/components/` : `bar-chart` (SVG, barres groupées + grille + ticks `niceMax`),
  `donut-chart` (SVG, arcs `path` calculés ; cas mono-segment rendu via `<circle>` stroke), `bars-chart` (HTML/CSS,
  barres horizontales triées + top 8), `pipeline-chart` (HTML/CSS, segments `flex-basis %`). **Couleurs passées
  en `var(--color-*)` via `[style.fill]`/`[style.background]`** (les **attributs SVG ne résolvent pas `var()`**,
  contrairement au style inline). `formatValue` injecté en **`input` fonction** (montants/durées formatés par le parent).
- **Dashboard = route lazy** (`loadComponent` sur `''`) → tout le graphe (DashboardStore + services + 5 composants)
  tombe dans un **chunk lazy `dashboard` (~32 kB)**, **bundle initial inchangé à 457 kB** (budget 500). Aucun enum
  importé depuis un barrel de DTO dans cette feature : **listes de statuts locales** (clé i18n + couleur) pour le
  pipeline, par prudence vis-à-vis du piège zod.
- **`DashboardStore` (`@app/stores/dashboard`)** orchestre la lecture : injecte les services renderer
  (`Invoice`/`Quote`/`Expense`/`TimeEntry`) + les stores `Project`/`ExpenseCategory` (pour les noms/couleurs),
  charge **tous les agrégats en parallèle** (`Promise.all`) dans `load()`, expose des **signals en lecture seule**.
  Gère le **layout** (`DashboardWidget[] = { id, span }`) en `localStorage` avec **fusion robuste** au chargement
  (ids inconnus ignorés, widgets manquants ré-append → résiste à un layout obsolète), `setSpan`/`reorder`/`resetLayout`.
  La **note** est lue/écrite via `CompanyService` (DB) ; écriture **debouncée 500 ms** pour ne pas marteler la base à
  chaque frappe. Les **datasets de graphes** (libellés i18n + couleurs) sont assemblés en `computed()` **dans la page**
  (réactifs à la locale via `i18n.locale()`/`i18n.t`), pas dans le store.
- **Note rapide en base, pas en `localStorage`** : décision tranchée — la disposition/la langue sont des préférences
  d'affichage (perte tolérable, `localStorage`), mais la note peut contenir une **vraie donnée** → champ
  **`CompanySettings.dashboardNote` TEXT?** (singleton, **pas de nouvelle table**), sauvegardé avec `dev.db`.
  Migration **`add_dashboard_note`** = simple **`ADD COLUMN`** (colonne nullable → **table non reconstruite** → le
  **CHECK `vatRegime` reste intact**, vérifié `node:sqlite`). Canal léger **`company:set-dashboard-note`** (`z.string()`,
  `ipcHandle`) + `CompanySettingsService.setDashboardNote` (update ciblé, comme les compteurs) ; la lecture passe par
  `CompanyService.getCompany().settings.dashboardNote`.
- **2 nouveaux agrégats « par mois sur l'année »** (les `getStats`/`sumByMonth(year,month)` existants ne donnaient
  que le mois courant) : `InvoiceService.sumPaymentsByMonth(year)` et `ExpenseService.sumByMonth(year)` →
  `number[12]`, **une requête `findMany` + réduction JS par mois** (pas 12 `aggregate`), arrondi 2 décimales.
  Câblés sur les **8 couches** habituelles (DTO zod `{year}`, canal, interface, repo, service, handler `ipcHandle`,
  preload, service renderer). Les autres KPIs/graphes **réutilisent l'existant** (`getStats`, `countByStatus`
  devis+facture, `sumByCategory` — **all-time, choix de réutilisation**, `sumDeductible(year)`, `sumByMonth`,
  `sumByProject`). Vérifs : `tsc` main + preload OK, `build:renderer` OK (templates stricts + budgets).

### Fichiers

- **Shared** : `dtos/invoice/sum-by-month.dto` (`InvoiceSumByMonthSchema`) + `dtos/expense/sum-by-month.dto`
  (`ExpenseSumByMonthSchema`) + barrels ; `channels/invoice` (+`SUM_PAYMENTS_BY_MONTH`), `channels/expense`
  (+`SUM_BY_MONTH`) ; `interfaces/invoice` (+`sumPaymentsByMonth`), `interfaces/expense` (+`sumByMonth`).
- **Main** : `repositories/invoice` (+`sumPaymentsByMonth`), `repositories/expense` (+`sumByMonth`),
  `services/invoice` + `services/expense` (pass-through), `handlers/invoice` + `handlers/expense` (+`ipcHandle`).
- **Note en base** : `schema/company-settings.prisma` (+`dashboardNote String?`), migration `add_dashboard_note` ;
  `channels/company` (+`SET_DASHBOARD_NOTE`), `interfaces/company`, `dtos/company/company-settings.dto`
  (+`dashboardNote`) ; `repositories/company/company-settings` + `services/company/{company-settings,company}.service`
  (+`setDashboardNote`), `handlers/company` ; `preload/apis/company.api` ; `services/company/company` renderer
  (+`getDashboardNote`/`setDashboardNote`).
- **Seed démo enrichi** (`seed/demo-data`) pour que les graphes parlent : paiements répartis **Jan→Mai**
  (factures payées ajoutées), dépenses sur **chaque mois** + plus de catégories (donut), quelques heures plus
  tôt dans l'année, **devis EXPIRED** + **facture CANCELLED** → les **5 classes de statut** présentes au pipeline.
- **Preload** : `apis/invoice.api` + `apis/expense.api` (+ méthode).
- **Renderer** : `services/invoice` + `services/expense` (+ méthode) ; **`stores/dashboard/dashboard-store`**
  (+ barrel + wire `stores/index`) ; **page** `pages/dashboard/dashboard.{ts,html,css}` (réécrite) + **composants**
  `pages/dashboard/components/{kpi-card,bar-chart,donut-chart,bars-chart,pipeline-chart}` (+ barrel) ;
  i18n `ui/dashboard/dashboard.{fr,en,nl,de}` enregistrés dans les 4 locales.

### Ajustements (retours E2E)

- **Note rapide déplacée de `localStorage` vers la base** (`CompanySettings.dashboardNote`) — voir décision ci-dessus.
- **Axe Y du graphe Revenus/Dépenses coupé** : les graduations formatées en montant complet (« 10 000,00 € »)
  débordaient la marge gauche et étaient rognées. Correctif : nouvel `input` **`formatTick`** sur `bar-chart`
  (format **compact** « 10 k € », via `Intl.NumberFormat notation:'compact'`) pour l'axe seulement ; les **tooltips
  et la légende gardent le montant complet** (`formatValue`).

> **À tester E2E** (`npm start`) : ouvrir `/`, vérifier les 5 KPIs et les 4 graphes (avec le seed démo) ;
> **glisser** un widget par sa poignée pour réordonner, **changer la largeur** (1/2/3), **recharger** l'app →
> disposition conservée ; **écrire dans la note** puis recharger / **réinitialiser** → la note **persiste** (base) ;
> **« Réinitialiser »** revient à la disposition par défaut ; **changer de langue** → libellés, noms de mois et
> légendes mis à jour ; axe Y du grand graphe **lisible** (labels compacts non coupés) ; DB vide → états vides sans crash.

## [0.15.0] — 2026-05-27 — Phase 11 · 3/6 : Génération PDF (facture & devis) + régime TVA / mentions légales

Troisième chantier de la **Phase 11** : export **PDF** d'une facture **ou** d'un devis (même moteur),
généré **côté main** avec **pdfmake**, sauvegardé via le **dialogue natif** puis ouvert. Intègre le
**régime de TVA** (assujetti vs **franchise**) reporté de la Phase 10 et l'**autoliquidation intra-UE**.
**Une migration** (`CompanySettings.vatRegime`) ; **une dépendance** (`pdfmake` + `@types/pdfmake`).

### Parcours

1. Sur le détail d'une facture **ou** d'un devis enregistré, bouton « **Exporter en PDF** » → dialogue
   natif de sauvegarde (nom pré-rempli `INV-2026-0001.pdf` / `QUO-…`) → écriture du fichier → ouverture
   via `shell.openPath`. Annuler le dialogue = aucun toast, aucun fichier.
2. Le PDF porte l'en-tête entreprise (**+ logo** si `logoPath`), le bloc client, les dates (échéance pour
   la facture / validité pour le devis), la **réf. devis** si la facture en est issue, le tableau des
   lignes, la **ventilation TVA par taux** (clé du « multi-TVA »), les totaux HT/TVA/TTC, le **payé /
   solde dû** (facture), l'**IBAN/BIC** + conditions de paiement en pied, et la **mention légale** du régime.
3. Onglet Paramètres → Entreprise : nouveau sélecteur **« Régime de TVA »** (Assujetti / Franchise).

### Décisions d'architecture

- **pdfmake (MIT, pur JS)** plutôt que puppeteer/Chromium : pas de module natif, **packaging Electron
  sans souci**. Rendu via les **14 polices PDF standard (Helvetica)** → **aucun fichier de police à
  embarquer** (le WinAnsi standard couvre FR/EN/NL/DE + €). `pdfmake` **externalisé** dans
  `vite.main.config.mts` (comme `better-sqlite3`) — ses métriques de police sont lues par `fs` au runtime,
  on ne le bundle pas. `require('pdfmake')` typé localement (les `@types/pdfmake` ne typent que le build
  navigateur ; root en `commonjs` → `require` dispo).
- **`PdfService` = orchestrateur sans repo** (`src/main/services/pdf`, même esprit que `ConversionService`) :
  compose Invoice/Quote/Company/Client, résout le régime, construit un **modèle normalisé**, délègue le
  rendu. Découpé en `pdf.service` (données) / `pdf-document` (définition pdfmake pure) / `pdf-printer`
  (singleton `PdfPrinter` + `renderToBuffer`). Canaux **`pdf:export-invoice`/`-quote`** en
  **`ipcHandleNoTx`** (lecture seule + dialogue natif > timeout tx) ; le handler fait dialogue + écriture
  + ouverture, le service ne dépend pas d'Electron (testable, buffer pur).
- **i18n : libellés passés du renderer au main** (namespace `pdf.*`, 4 langues) avec la `locale` active →
  **source i18n unique**, le main reste muet (mêmes montants/dates formatés via `Intl` + locale). Suit le
  précédent du chantier 2 (libellés de lignes construits côté renderer). Évite de dupliquer ~30 chaînes
  dans le i18n du main (réservé aux erreurs).
- **Régime TVA = `CompanySettings.vatRegime` TEXT+CHECK** (`NORMAL`/`FRANCHISE`, migration
  `add_vat_regime` — rebuild de table généré par Prisma, **CHECK ajouté à la main** ; vérifié `node:sqlite` :
  `NORMAL`/`FRANCHISE` acceptés, valeur hors liste **rejetée**). **Autoliquidation intra-UE** =
  helper **pur partagé** `resolveVatTreatment` (`src/shared/utils`) piloté par **`Client.country` +
  `Client.vatNumber`** (code pays UE ≠ BE + n° TVA présent ; repli sur le préfixe du n° TVA), **jamais**
  par `Client.type`. Franchise **et** autoliquidation → **TVA mise à 0 dans le PDF + mention légale**
  (franchise art. 56bis CTVA / autoliquidation art. 196 dir. 2006/112/CE) ; le **modèle des lignes reste
  inchangé** (TVA par ligne) — choix conforme à la décision de Phase 10. ⚠️ conséquence assumée : sous un
  régime sans TVA, le TTC **affiché au PDF** (= HT) peut différer du TTC **calculé en interne** (lignes à
  21 %) ; le PDF est une présentation, la mise à 0 effective des lignes n'est pas dans ce chantier.
- **⚠️ Gotcha bundle (zod hors du bundle initial)** : ajouter l'**enum runtime `VatRegime` au barrel**
  `@shared/dtos/company` via `export *` forçait esbuild à **matérialiser le barrel** (et ses voisins
  porteurs de zod) partout où il est importé — y compris le graphe **eager** du Welcome Wizard qui n'en
  utilisait que les **types** → **+330 kB de zod dans le bundle initial** (782 kB, budget 500 kB dépassé).
  Correctif : **ne pas exposer l'enum dans le barrel** ; tous les imports **valeur** de `VatRegime`
  pointent le **module direct** `@shared/dtos/company/vat-regime.enum`, les interfaces l'importent en
  `import type`. Bundle initial **revenu à 454 kB** (vs 452 kB avant). Règle : pas de **valeur runtime**
  dans un barrel de DTO ré-exporté par `export *` et consommé pour ses types côté eager.

### Fichiers

- **Dépendances** : `pdfmake` (deps), `@types/pdfmake` (devDeps) ; `vite.main.config.mts` (+`pdfmake`,
  `/^pdfmake\//` externes).
- **Prisma** : `schema/company-settings.prisma` (+`vatRegime`), migration `add_vat_regime` (CHECK manuel).
- **Shared** : `dtos/pdf` (`ExportPdfSchema` + `PdfLabels`), `channels/pdf`, `interfaces/pdf` + barrels ;
  `dtos/company/vat-regime.enum` (+ `CompanySettingsDto.vatRegime`, `SaveCompanySettingsSchema.vatRegime`) ;
  `utils/vat-treatment` (`resolveVatTreatment`).
- **Main** : `services/pdf` (`pdf.service` / `pdf-document` / `pdf-printer`), `handlers/pdf`,
  `dependencies/pdf` + wire `*/index` ; `services/company/company.service` (cast `vatRegime`).
- **Preload** : `apis/pdf.api` + `preload/index` + window types.
- **Renderer** : `services/pdf` (`PdfService` → labels i18n + `window.api.pdf`), `InvoiceStore`/`QuoteStore`
  (+`exportPdf`), `invoice-detail`/`quote-detail` (bouton « Exporter en PDF »), `company-form`
  (sélecteur régime), i18n `ui/pdf/pdf.{fr,en,nl,de}` (4 agrégateurs) + clés `company.vatRegime.*` (4 langues).

### Ajustements (retours E2E)

- **Séparateur de milliers cassé au PDF** : `Intl.NumberFormat('fr')` utilise un **espace fine
  insécable U+202F** comme séparateur de milliers, **absent du WinAnsi** des polices standard → rendu
  comme un glyphe parasite (« 1 /020,00 € »). Correctif : `normalizeSpaces` remplace U+202F/U+00A0/
  U+2009/U+2007/U+2008 par une espace normale sur tous les montants/dates formatés.
- **Métadonnées PDF** : `info.author` = entreprise, `info.creator`/`info.producer` = « Sole » (au lieu
  de « pdfmake »).
- **UX éditeur de lignes** : ajouter une ligne **place le focus sur la désignation de la nouvelle
  ligne** (`afterNextRender` dans `LineItemsEditor`, partagé Devis+Facture) — plus besoin de tabuler
  toute la page.
- **Sauts de page PDF** : le bloc totaux, la carte client et l'encart mention légale sont
  **`unbreakable`** → un bloc qui ne tient pas en bas de page bascule **entier** sur la suivante (au lieu
  d'être coupé en deux). L'en-tête du tableau de lignes se **répète** sur chaque page.
- **Conformité (2 gaps comblés)** : **date de prestation** (`Invoice.supplyDate`, optionnelle — mention
  TVA obligatoire quand elle diffère de la date de facture ; affichée au PDF si renseignée) **et
  remise % par ligne** (`discount` sur `InvoiceLine`/`QuoteLine`, éditeur partagé → colonne « Remise »,
  totaux/ventilation TVA recalculés net, colonne « Remise » au PDF **affichée seulement si ≥ 1 ligne en
  porte**). **Migration `add_supply_date_and_discount`** : `supplyDate` ajoutée par `ADD COLUMN` (table
  `Invoice` **non reconstruite** → CHECK `status` intact), `discount` via rebuild des tables de lignes
  (sans CHECK) ; vérifié `node:sqlite`. ⚠️ **Peppol/UBL reste un chantier dédié** (e-facturation
  structurée EN 16931, hors PDF).

> **À tester E2E** (`npm start`) : configurer l'entreprise (IBAN/BIC/logo), exporter le PDF d'une facture
> multi-TVA et d'un devis ; passer l'entreprise en **franchise** → TVA à 0 + mention ; client UE hors BE
> avec n° TVA → **autoliquidation** + mention ; **remise sur une ligne** (colonne « Remise » au PDF +
> total net) ; **date de prestation** renseignée ; **facture longue** (>1 page) → totaux non coupés.
> Vérifier l'ouverture native du PDF et l'annulation du dialogue.

## [0.14.0] — 2026-05-27 — Phase 11 · 2/6 : Conversion Devis → Projet + factures (acompte & solde)

Deuxième chantier de la **Phase 11** : un devis accepté devient un **projet + ses factures**, en
deux temps comme dans la vraie vie comptable — **facture d'acompte** (30 % par défaut,
paramétrable) puis **facture de solde** pour le reste. **Zéro nouvelle dépendance** : la
fonctionnalité **compose les services existants** (`QuoteService` / `ProjectService` /
`InvoiceService` / `CompanyService`). **Une migration** : un lien `Invoice → Quote`.

### Parcours

1. Sur un devis **`SENT`**, le bouton « **Accepter** » ouvre une **modale de conversion** (nom du
   projet pré-rempli — masqué si le devis est déjà rattaché ; toggle « facture d'acompte » ;
   pourcentage ; **aperçu TTC** en direct). Validation → devis **`ACCEPTED`**, `projectId` peuplé,
   facture d'acompte **`DRAFT`** créée, navigation vers cette facture.
2. Le devis `ACCEPTED` affiche un **encart « Facturation »** (Total / Déjà facturé / **Restant à
   facturer**) + bouton « **Facturer le solde** » → crée la **facture de solde** (le HT restant,
   ventilé par taux) puis y navigue. Une fois tout facturé : badge « **Entièrement facturé** ».
3. Chaque facture (acompte **et** solde) porte un chip « **Issu du devis QUO-…** » cliquable vers
   le devis — le lien est explicite **dans les deux sens**.

### Décisions d'architecture

- **Lien `Invoice.quoteId` (FK `SetNull`, migration `add_invoice_quote_link`)** : acompte **et**
  solde pointent vers le **même devis** (numéros de facture **distincts**, comme l'exige la loi —
  c'est la **référence** qui les relie, pas le numéro). Permet de calculer « déjà facturé / restant »
  et de **n'additionner que les factures non `CANCELLED`** (une facture annulée libère le solde).
  ⚠️ **gotcha TEXT+CHECK** : ajouter la FK **reconstruit la table `Invoice`** → le `CHECK status`
  régénéré par Prisma est **perdu**, **réajouté à la main** dans la migration (réflexe désormais
  établi). Vérifié `node:sqlite` sur copie : insert→`quoteId` OK, **suppression du devis → facture
  conservée, `quoteId` nullé** (SET NULL), **statut invalide rejeté** par le CHECK.
- **`ConversionService` dédié** (`src/main/services/conversion`, **sans repository**) qui
  **orchestre** les 4 services plutôt que d'alourdir `QuoteService` de dépendances croisées — même
  esprit que `SeedService`. Trois opérations : `convertQuote`, `invoiceBalance`, `getQuoteBilling`.
- **Atomicité via `ipcHandle`** (transactionnel, **pas** `ipcHandleNoTx`) : projet + maj devis +
  facture + **incréments des compteurs** dans la **même transaction ambient** ; si la numérotation
  échoue (`COMPANY_NOT_CONFIGURED`), **tout est annulé**.
- **Solde = net par taux, lignes positives** (choix retenu) : `remaining[taux] = devis[taux] −
  Σ déjà facturé[taux]`, filtré `> 0`. **Aucune ligne négative** → l'**éditeur de lignes partagé**
  Devis/Facture (et sa validation `unitPrice ≥ 0`) **reste intact**. La présentation « récap +
  déduction » est écartée pour ne pas faire fuiter les montants négatifs vers les devis.
- **Acompte multi-TVA correct** : ventilation **par taux** (1 ligne par entrée du `vatBreakdown`),
  suffixe `(taux %)` ajouté **seulement** s'il y a plusieurs taux. Même `toLines()` réutilisé par le solde.
- **Réutilisation du projet lié** : si le devis pointe déjà sur un projet, la conversion **le
  réutilise** ; sinon crée un projet `IN_PROGRESS`. **Échéance** facture = aujourd'hui +
  `paymentTermsDays` (source unique `CompanySettings`, fallback 30 j).
- **`Invoice` enrichie** : `CreateInvoiceSchema.quoteId`, `InvoiceDto.quoteId`/`quoteNumber`
  (relation `quote` ajoutée à l'`include`). Édition normale d'une facture : `quoteId` **préservé**
  (jamais dans le payload d'update).
- **i18n des 4 langues** : namespace `conversion` (`conversion.*` + `conversion.billing.*` /
  `conversion.balance.*`) FR/EN/NL/DE ; libellés de lignes (acompte/solde) construits **côté
  renderer** (locale active) puis stockés en clair. Erreur `NOTHING_TO_INVOICE` (main, 4 langues).

### Fichiers

- **Prisma** : `schema/invoice.prisma` (+`quoteId`/`quote`), `schema/quote.prisma` (+`invoices`),
  migration `add_invoice_quote_link` (CHECK `status` réinjecté à la main).
- **Shared** : `dtos/conversion` (`ConvertQuote*`, `InvoiceBalance*`, `QuoteBilling`),
  `dtos/invoice` (+`quoteId`/`quoteNumber`), `channels/conversion` (3 canaux),
  `interfaces/conversion` + barrels.
- **Main** : `services/conversion` (orchestrateur), `services/invoice` (+`sumInvoicedByRate`,
  +`quoteId` au create, +`quoteNumber` au DTO), `repositories/invoice` (+`findLinesByQuote`,
  include `quote`), `handlers/conversion` + `dependencies/conversion`, wire `*/index`,
  `i18n/errors.{fr,en,nl,de}` (+`NOTHING_TO_INVOICE`).
- **Preload** : `apis/conversion.api` (3 méthodes) + `preload/index` + window types.
- **Renderer** : `services/conversion`, `QuoteStore` (+`convertQuote`/`invoiceBalance`/
  `getQuoteBilling`), modale `features/quote/components/quote-convert-modal`, `quote-detail`
  (encart Facturation + « Facturer le solde »), `invoice-detail` (chip « Issu du devis »),
  i18n `ui/conversion/conversion.{fr,en,nl,de}` dans les 4 agrégateurs.

> **À tester E2E** (`npm start`) : accepter un devis `SENT` (avec/sans acompte) → facture d'acompte ;
> revenir sur le devis → « Facturer le solde » → facture de solde ; vérifier l'encart « restant »
> qui tombe à 0 et le badge « Entièrement facturé » ; chip « Issu du devis » sur les deux factures.

## [0.13.0] — 2026-05-26 — Phase 11 · 1/6 : Welcome Wizard + Seed démo + i18n 4 langues (FR/EN/NL/DE)

Premier chantier (transverse) de la **Phase 11**, livré en **un seul commit** : le **Welcome
Wizard** au premier démarrage, le **seed** (défauts + démo), et le passage en **4 langues**
(sélecteur + persistance). Détail des trois volets ci-dessous.

### i18n & sélecteur de langue (4 langues)

Sole devient **quadrilingue** — FR / EN / **NL** / **DE** (les trois langues officielles belges +
l'anglais). L'infra i18n existait des deux côtés mais **sans sélecteur ni persistance** ; c'est
désormais complet : un sélecteur dans le **wizard** (écran de bienvenue) **et** un nouvel **onglet
Paramètres « Préférences »**, le choix **persiste** (localStorage) et **synchronise le locale du
main** (messages d'erreur backend dans la bonne langue). Bascule **à chaud**, sans reload.

#### Décisions

- **Traductions chargées paresseusement par langue.** Empiler 4 langues × ~430 clés en *eager*
  faisait **dépasser le budget initial** (524 kB > 500 kB). Refonte : un **module agrégateur par
  locale** (`i18n/locales/{en,fr,nl,de}.ts`) **importé dynamiquement** → un *lazy chunk* par langue,
  **zéro traduction dans le bundle initial** (qui retombe à **452 kB**, plus léger qu'avant).
  `I18nService` charge la locale active (**+ EN en base de repli**), `t()` lit un signal
  `_dictionary`. **Budget non relevé** (on règle la cause, pas le seuil).
- **Persistance + synchro main.** Choix stocké en **`localStorage`** (`sole.locale`) — pas en DB, car
  il doit fonctionner **dans le wizard avant** toute entreprise. Nouveau canal **`i18n:setLocale`**
  (`ipcHandleNoTx`) → le main (`setLocale`) aligne ses messages d'erreur. Au boot,
  `provideAppInitializer` **attend** `i18n.init()` (import du chunk de la locale) **avant** le rendu →
  pas de flash de clés non traduites.
- **`TranslatePipe` déjà `pure: false`** (lit `locale()`) → la bascule de langue rafraîchit l'UI
  instantanément, rien à changer côté pipe.
- **Sélecteur = `<select class="app-select">`** (composant partagé `LanguageSelect`, réutilisé wizard
  **+** Préférences) plutôt que le `SegmentedToggle` (icône-only, inadapté à 4 langues). Langues en
  **autonymes** (Français / English / Nederlands / Deutsch).
- **Traductions complètes des deux côtés** : 17 namespaces renderer × NL + DE, + les messages d'erreur
  `main/i18n/errors.{nl,de}.ts`.

#### Fichiers

- **Shared** : `channels/i18n`, `interfaces/i18n`. **Preload** : `apis/i18n.api` + window types.
  **Main** : `handlers/i18n` + `errors.{nl,de}` + enregistrement dans `i18n/index`.
- **Renderer** : `i18n/locales/{en,fr,nl,de}.ts` (agrégateurs lazy), 34 fichiers `*.{nl,de}.ts`,
  `I18nService` refondu (lazy + persist + sync), `LanguageSelect` (shared), onglet **Préférences**
  (`features/settings/pages/preferences` + route + tab `SettingsHeader`), toggle dans le wizard,
  `provideAppInitializer`.

### Welcome Wizard + Seed démo

Au **premier démarrage** (aucune entreprise en base), l'app affiche un **Welcome Wizard** plein
écran à la place du dashboard : **3 étapes** (bienvenue → configuration de l'entreprise →
choix du mode **démo** ou **vide**). Le **seed** (`seedRequiredDefaults` / `seedDemoData`),
jamais créé jusqu'ici, l'est enfin — et tourne **dans le main process** (pas via `prisma db
seed` : `better-sqlite3` est compilé pour l'ABI Electron). Un bouton **« Réinitialiser »** dans
les Paramètres efface tout et relance le wizard (pratique pour la démo à l'oral).

### Décisions d'architecture

- **Seed côté main, déclenché par IPC.** `prisma db seed` est inutilisable (ABI Electron) → le
  seed est un `SeedService` qui **compose les services existants** (`client.add`, `project.add`,
  `invoice.add`…) plutôt que d'écrire du SQL brut, donc toute la logique métier (numéros, statuts,
  totaux) s'applique. Canaux `seed:requiredDefaults` / `seed:demo` / `seed:reset` en
  **`ipcHandleNoTx`** : le seed gère **sa propre transaction** via
  `getDbContext().transaction(fn, { timeout: 120_000 })` — ~70 insertions dépassent le **timeout
  5 s** de la tx interactive par défaut.
- **`DbContext.transaction()` accepte désormais `{ maxWait, timeout }`** (ajout purement additif,
  rétrocompatible, transmis à `$transaction`). Seul le seed l'utilise pour l'instant.
- **Parcours : Bienvenue → Choix démo/vide → (si vide) formulaire entreprise.** Le mode
  **démo** crée **aussi une entreprise de démo** (« Atelier Margaux ») — `seedDemoData` réutilise
  `getNextInvoiceNumber/QuoteNumber`, qui **exige une entreprise configurée**. Le mode **vide**
  ouvre le formulaire société (form Phase 2 réutilisé) pour saisir **sa propre** entreprise, puis
  `seedRequiredDefaults`. Données démo : 1 entreprise, 3 clients (+ contacts), 4 produits,
  5 projets (statuts variés, catégories N:M), 7 tâches, 18 entrées de temps (dont 3 pomodoro),
  9 dépenses, 5 devis (DRAFT→ACCEPTED→REJECTED), 8 factures + paiements donnant des statuts
  **PAID / OVERDUE / SENT / DRAFT** réalistes (dates **relatives à aujourd'hui** via un helper
  `at(jours)`, donc toujours fraîches).
- **`seedRequiredDefaults`** (idempotent — garde sur `category.length > 0`) crée les **catégories
  projet** (5) + **catégories de dépense** (6). Les **taux de TVA restent seedés par la migration**
  (21/12/6/0) ; `reset` ne les touche pas.
- **Gate du wizard côté renderer.** `provideAppInitializer` charge `CompanyStore` au boot ; si
  `!isConfigured()` → `WizardService.start()`. `App` rend le shell (navbar + `router-outlet`
  animé) **en permanence** et **superpose** le wizard en overlay (`position: fixed`,
  `z-index: 900`, sous le toaster à 1000) quand `wizard.active()`. ⚠️ envelopper le `router-outlet`
  animé dans un `@if/@else` faisait passer `@routeAnim` de `null` à `''` dans le même cycle de
  détection → **NG0100** ; l'overlay garde le timing d'origine de l'animation. Le wizard est piloté
  par le signal dédié `WizardService.active` (pas par `isConfigured()`, sinon il se fermerait dès
  la sauvegarde de la société), remis à `false` en fin de parcours.
- **Form société réutilisé** (`CompanyForm`, Phase 2) à l'étape 2 — zéro formulaire dupliqué.
  **3 étapes en composants enfants** (`WizardWelcome` / `WizardCompany` / `WizardSeedChoice`),
  navigation par signal `step` ; chaque CSS sous le budget **4 kB**.
- **`reset` FK-safe** : `deleteMany` enfants→parents (paiements → lignes → factures → … →
  entreprise), taux de TVA conservés, + purge du dossier `storage/` (justificatifs) via
  `clearAllStorage()`.

### Fichiers (résumé)

- **Main** : `seed/` (`required-defaults`, `demo-data`, `types`), `services/seed`,
  `handlers/seed`, `dependencies/seed` ; tweaks `core/db-context` (+timeout) &
  `core/file-storage` (+`clearAllStorage`).
- **Shared** : `channels/seed`, `interfaces/seed`. **Preload** : `apis/seed.api` + window types.
- **Renderer** : `services/seed`, `services/wizard`, `stores/seed`, `features/welcome-wizard/*`,
  gate dans `App` + `app.config` (`provideAppInitializer`), **zone de danger** (« Réinitialiser »)
  en bas de `company-settings`, i18n `welcome-wizard.{en,fr}` (`wizard.*` / `seed.*` /
  `settings.reset.*`).

> ⚠️ Pas de migration dans ce chantier (aucun nouveau modèle). **À tester E2E** (`npm start`) :
> le wizard ne s'affiche qu'avec une base **sans** entreprise.

## [0.12.0] — 2026-05-26 — Phase 10 : Bundle Invoice (Facture) + paiements + éditeur de lignes partagé

Entité **Invoice** (`Facture`) end-to-end — **le bundle le plus complexe : deux
sous-entités** (`InvoiceLine` **et** `Payment`) + **logique de statut automatique**. Deux
pages dédiées : **liste `/invoices`** (lien navbar « Factures ») avec **en-tête pipeline**
(compteurs par statut) **+ agrégats phares** (total impayé & encaissé ce mois) + filtres ;
**page détail `/invoices/:id`** (+ `/invoices/new`) avec lignes en `FormArray`, **totaux
HT/TVA/TTC + encaissé + reste à payer** recalculés en `computed()`, et une **section
Paiements** (liste + sous-formulaire) pour encaisser des **paiements partiels**. En passant,
l'**éditeur de lignes** est enfin **extrait en composant partagé** (`LineItemsEditor`) commun
Devis ⇄ Facture, et la section paiements en composant `PaymentsPanel` propre à la facture.
*(Conversion devis → facture et génération PDF restent en Phase 11, comme prévu.)*

### Décisions d'architecture

- **Deux sous-entités sans bundle propre.** `InvoiceLine` est synchronisée par **diff**
  (`syncLines`, identique à `QuoteLine` : le front envoie tout le tableau, chaque ligne avec
  `id?`). `Payment` est manipulée par des canaux dédiés **`ADD_PAYMENT` / `REMOVE_PAYMENT`**
  (pas de diff : on ajoute/supprime un encaissement à l'unité). Les deux en **`onDelete:
  Cascade`** (4ᵉ et 5ᵉ Cascade) : supprimer une facture élague lignes **et** paiements.
- **Logique de statut automatique (cœur de la phase).** `status` **TEXT+CHECK**
  (`DRAFT / SENT / PAID / OVERDUE / CANCELLED`, CHECK manuel dans la migration). Le service
  recalcule le statut (`refreshStatus`) **après chaque écriture** (création, édition de
  lignes, ajout/retrait de paiement) **et en lecture** (`get` / `getById`) : `paidAmount ≥
  totalTtc → PAID` ; sinon `dueDate < aujourd'hui → OVERDUE` ; sinon `SENT`. `DRAFT` et
  `CANCELLED` sont **gelés** (jamais écrasés automatiquement). Le passage en retard étant
  *temporel*, il est évalué **paresseusement en lecture** (pas de scheduler — appli locale) :
  ouvrir la page rafraîchit les statuts, donc le pipeline et l'agrégat impayé restent justes.
  Transitions manuelles via **`UPDATE_STATUS`** (boutons « Marquer envoyée » / « Annuler » /
  « Repasser en brouillon »).
- **Totaux calculés, jamais stockés (normalisation)** — comme le devis : pas de `montantHT`/
  `tva` dénormalisés (la spec les modélisait). `toDto` dérive `totalHt`/`totalVat`/`totalTtc`
  + **ventilation TVA par taux** (`vatBreakdown`) des lignes, plus `paidAmount` (Σ paiements)
  et `balanceDue`. **TVA par ligne** + **picker produit** (`InvoiceLine.vatRate` `@default(21)`
  + `productId` FK `Product` `SetNull` avec snapshot) — **réutilise tel quel `VatRate` +
  `Product`** de la 0.11.0.
- **Numérotation auto réutilisant l'infra Company.** `InvoiceService` ⇒
  `CompanyService.getNextInvoiceNumber()` (format `invoiceNumberFormat` + compteur
  `CompanySettings`, reset annuel), incrément **atomique dans le même `ipcHandle`**. ⚠️ exige
  une entreprise configurée (`COMPANY_NOT_CONFIGURED`).
- **`Payment.method` TEXT+CHECK** (`TRANSFER / CHECK / CASH / CARD`, CHECK manuel) plutôt qu'un
  enum Prisma — cohérent avec le reste du projet.
- **Agrégats visibles dans l'en-tête de liste** (le dashboard reste un placeholder, Phase 11) :
  **total impayé** = `Σ max(0, totalTtc − paidAmount)` sur les factures `SENT`/`OVERDUE`
  (réduction JS car les totaux sont dérivés, non stockés) ; **CA encaissé du mois** = vrai
  agrégat Prisma `payment.aggregate _sum` filtré sur `date` du mois. + `countByStatus`
  (`groupBy` statut) pour le pipeline.
- **Éditeur de lignes extrait en composant partagé** (`LineItemsEditor`) — le « candidat à
  extraire » noté en 0.11.0 est fait : le `FormArray` de lignes (combobox produit + qté + PU +
  sélecteur TVA + total + suppr + « ajouter une ligne ») vit dans `shared/components`, **utilisé
  par Devis ET Facture**. Factory `buildLineGroup(fb, line?, defaultRate)` partagée ; i18n
  `lineEditor.*` dans le namespace `common`. `quote-detail` **refactoré** pour le consommer.
- **Section paiements extraite en composant `PaymentsPanel`** (`features/invoice/components`,
  **pas** `shared` : un paiement n'existe que sur une facture, jamais sur un devis). Décompose
  la page détail et garde **chaque CSS de composant sous le budget 4 kB** (budget **inchangé** :
  on extrait plutôt que de relever le seuil).
- **8 comportements vérifiés `node:sqlite`** sur une copie de `dev.db` (sans Electron) : CHECK
  `status` (rejet/accept), CHECK `method` (rejet/accept), unicité `number`, FK Client
  `Restrict`, FK Project `SetNull`, Cascade lignes **et** paiements — 10 assertions vertes.

### Ajouté

**Prisma**
- `prisma/schema/invoice.prisma` — `Invoice` (FK Client `Restrict`, Project `SetNull`, 1:N `lines` + `payments`)
- `prisma/schema/invoice-line.prisma` — `InvoiceLine` (`vatRate` `@default(21)`, `productId` FK `Product` `SetNull`)
- `prisma/schema/payment.prisma` — `Payment` (`amount`, `method`, `reference?`, FK Invoice `Cascade`)
- `prisma/migrations/20260526155508_add_invoice/` — 3 tables + **CHECK manuels** (`status`, `method`) + unicité `number`
- Relations inverses `invoices Invoice[]` (Client, Project) + `invoiceLines InvoiceLine[]` (Product)

**Bundle Invoice (full)** — `InvoiceRepository` (include lignes/paiements/client/projet, `countByStatus` via `groupBy`, CRUD lignes + paiements, `sumPaymentsBetween`, `findByStatuses`), `InvoiceService` (CRUD + `syncLines` + `addPayment`/`removePayment` + `refreshStatus` auto + `getStats` + `toDto` avec `vatBreakdown`/`paidAmount`/`balanceDue`), handlers `ipcHandle` (GET / GET_BY_ID / COUNT_BY_STATUS / GET_STATS / ADD / UPDATE / UPDATE_STATUS / REMOVE / ADD_PAYMENT / REMOVE_PAYMENT), DI, preload `window.api.invoice`, service + store (CRUD + paiements + signaux `counts`/`stats`), pages `/invoices` + `/invoices/:id`
**Composants** — `LineItemsEditor` (**shared**, Devis + Facture) ; `PaymentsPanel` (feature invoice)
**Shared** — DTOs `invoice` (read interfaces + Zod create/update/status/record-payment + enums `InvoiceStatus`/`PaymentMethod` + `InvoiceStats` + `status-count`), `INVOICE_CHANNELS`, `InvoiceAPI`
**i18n** — namespace `invoice` (fr/en) + clés partagées `lineEditor.*` (common) + nav « Factures »
**UI** — `StatusBadge` étendu (`PAID` succès / `OVERDUE` danger) ; en-tête de liste à 2 agrégats ; icône nav `LucideReceiptEuro`

### Modifié

- `quote-detail` (Phase 9) — **refactoré** pour consommer `LineItemsEditor` (suppression du `FormArray` de lignes inline + CSS dupliqué)
- `client.prisma`, `project.prisma`, `product.prisma` — relations inverses vers `Invoice`/`InvoiceLine`
- `i18n.ts`, `preload/index.ts`, `renderer/.../types/electron/index.d.ts`, `navbar`, `app.routes.ts`, `app-routes.const.ts`, barrels `channels`/`interfaces`/`stores`/`components` — câblage du bundle + des 2 composants
- `common.{fr,en}` — clés `lineEditor.*` + `nav.invoices`

## [0.11.0] — 2026-05-26 — Multi-TVA configurable + Catalogue produits (extension Phase 9)

Deux entités de référence **`VatRate`** et **`Product`** (bundles complets, gérées sous
**Paramètres**), plus une **refonte des lignes de devis** : la **TVA passe au niveau de la
ligne** (ventilation multi-taux, ex. Belgique 21/12/6/0) et chaque ligne peut référencer un
**produit du catalogue** (pré-remplissage + lien `SetNull` avec **snapshot**). Tout est pensé
pour être **réutilisé tel quel par la Facture** (Phase 10).

### Décisions d'architecture

- **`VatRate` = table de référence + onglet Settings « TVA »** : les taux disponibles sont
  gérés en base (CRUD), **seedés dans la migration** avec les 4 taux belges (21 défaut / 12 /
  6 / 0). Un seul `isDefault` à la fois — le service appelle `clearDefault()` (un
  `updateMany`) **dans la transaction** avant de poser le nouveau défaut. Les lignes de devis
  ne pointent **pas** vers `VatRate` par FK : elles **snapshotent la valeur numérique** du
  taux (intégrité historique — éditer/supprimer un taux ne réécrit pas les devis émis) ; la
  liste `VatRate` n'alimente que le sélecteur.
- **`Product` = catalogue + onglet Settings « Catalogue »** : `name`, `unitPrice`, `vatRate`
  par défaut, `unit`, `description`. `QuoteLine.productId` est une **FK `SetNull`** (5ᵉ
  SetNull) : choisir un produit **pré-remplit** description/prix/TVA de la ligne, mais la
  ligne **conserve sa propre copie** (snapshot) — supprimer un produit met `productId` à NULL
  sans toucher aux montants de la ligne. Vérifié `node:sqlite`.
- **TVA par ligne (supersede le `vatRate` document-level de 0.10.0)** : `vatRate` déplacé de
  `Quote` → `QuoteLine` (`@default(21)`). `QuoteService.toDto` calcule désormais une
  **ventilation par taux** (`vatBreakdown: { rate, baseHt, vat }[]`, regroupée par taux),
  `totalVat` = somme des TVA par taux, `totalTtc` = HT + TVA. Le form détail recalcule la même
  ventilation en `computed()`. Notion SGBD : agrégation/regroupement par taux.
- **Migration `add_quote_line_vat` — gotcha TEXT+CHECK** : retirer `Quote.vatRate` force un
  **rebuild de la table `Quote`** (pattern `RedefineTables` de Prisma), dont le SQL régénéré
  **perd le `CHECK` sur `status`** (Prisma ne le connaît pas). Le `CHECK` a été **réajouté à
  la main** dans la migration ; survie vérifiée `node:sqlite`. (Rappel utile pour toute
  future migration qui reconstruit une table à colonne TEXT+CHECK.)
- **Réutilisation maximale** : les deux entités de référence calquent le bundle `ExpenseCategory`
  (le plus léger) ; leurs pages vivent en **onglets Settings** (cohérent avec Catégories /
  Dépenses — données de référence regroupées). L'éditeur de lignes (`FormArray`) du devis
  accueille un `<select>` TVA (réactif, `formControlName`) et la désignation est une **combobox**
  (`<input list>` + `<datalist>` des produits) : saisie libre **ou** choix d'un produit qui
  pré-remplit prix/TVA — **une seule box** au lieu de deux. La combobox + le sélecteur TVA
  resserviront aux lignes de Facture.

### Ajouté

**Prisma**
- `prisma/schema/vat-rate.prisma` — `VatRate` (`label`, `rate` `@unique`, `isDefault`)
- `prisma/schema/product.prisma` — `Product` (`name`, `description?`, `unitPrice`, `vatRate`, `unit?`, `archived`, relation `quoteLines QuoteLine[]`)
- `prisma/migrations/20260526120930_add_vat_rate/` — table `VatRate` + **seed des 4 taux belges**
- `prisma/migrations/20260526121353_add_product/` — table `Product`
- `prisma/migrations/20260526122410_add_quote_line_vat/` — `QuoteLine` + `vatRate` & `productId` (FK `SetNull`), retrait de `Quote.vatRate` (rebuild + **CHECK `status` réajouté**)

**Bundle VatRate (full)** — `VatRateRepository` (+`clearDefault`), `VatRateService` (single-default), handler GET/ADD/UPDATE/REMOVE, DI, preload `window.api.vatRate`, store, page Settings `/settings/vat-rates` + `VatRateFormModal`
**Bundle Product (full)** — `ProductRepository`, `ProductService`, handler, DI, preload `window.api.product`, store, page Settings `/settings/products` + `ProductFormModal` (sélecteur de TVA depuis `VatRate`)
**Shared** — DTOs `vat-rate` + `product` (read/create/update), `VAT_RATE_CHANNELS`/`PRODUCT_CHANNELS`, `VatRateAPI`/`ProductAPI`
**i18n** — namespaces `vat-rate` + `product` (fr/en), onglets `settings.tab.vatRates` / `settings.tab.products`

### Modifié

- `quote.prisma` — retrait de `vatRate` (désormais par ligne)
- `quote-line.prisma` — + `vatRate` (`@default(21)`) + `productId` (FK `Product` `SetNull`)
- DTOs Quote — `QuoteLineDto` + `vatRate`/`productId` ; `QuoteDto` retire `vatRate`, ajoute `vatBreakdown: QuoteVatBreakdownLine[]` ; `QuoteLineInputSchema` + `vatRate`/`productId`
- `QuoteService.toDto` — ventilation TVA par taux (remplace le calcul mono-taux de 0.10.0)
- `features/quote/pages/quote-detail` — carte « Dates » (sans TVA document), **désignation en combobox (`datalist` produits) + sélecteur TVA par ligne**, totaux **ventilés par taux** ; charge `VatRateStore` + `ProductStore`. Le **prix/TVA pré-remplis sont figés sur la ligne** (`QuoteLine`) : modifier un produit plus tard n'impacte aucun devis déjà créé (snapshot)
- `settings-header` — 2 onglets (« TVA » `LucidePercent`, « Catalogue » `LucidePackage`)
- `app.routes.ts` + `app-routes.const.ts` — routes `settings/vat-rates` et `settings/products`
- `i18n.ts`, `preload/index.ts`, `renderer/.../types/electron/index.d.ts`, barrels `channels`/`interfaces`/`stores` — câblage des 2 bundles

## [0.10.0] — 2026-05-26 — Phase 9 : Bundle Quote

Entité **Quote** (`Devis` dans la spec) end-to-end — **premier bundle avec une
sous-entité dynamique** (`QuoteLine` / `LigneDevis`) éditée via un **`FormArray`
Angular**. Deux pages dédiées : une **liste `/quotes`** (lien navbar « Devis ») avec
un **en-tête pipeline** (compteurs cliquables par statut, qui filtrent) + filtre client
+ recherche par numéro ; et une **page détail `/quotes/:id`** (+ `/quotes/new`) avec
en-tête client/projet/dates/TVA/statut, **lignes ajoutables/supprimables dynamiquement**
et **totaux HT / TVA / TTC recalculés en `computed()`**. Workflow de statut
**brouillon → envoyé → accepté / refusé** avec boutons d'action rapides. *(Conversion
devis → projet/facture reportée en Phase 11, comme prévu par la spec.)*

### Décisions d'architecture

- **Sous-entité `QuoteLine` sans bundle propre, synchronisée par diff** (comme
  `Contact`, `ProjectCategory`, `ExpenseReceipt`) : le front envoie le **tableau complet**
  des lignes (`lines: QuoteLineInput[]`, chaque ligne portant un `id` optionnel) ;
  `QuoteService.syncLines` **diffe** contre les ids en base — supprime les manquantes,
  met à jour celles avec `id`, crée celles sans `id` (même esprit que `syncCategories`
  de Project et le diff `keepReceiptIds`/`newReceiptPaths` d'Expense). `QuoteLine` en
  **`onDelete: Cascade`** (4ᵉ Cascade) : supprimer un devis supprime ses lignes — vérifié
  `node:sqlite`.
- **Totaux calculés, jamais stockés (normalisation)** : pas de colonne `montantHT`
  dénormalisée (la spec la modélisait). Le total HT est **dérivé** des lignes (`Σ quantité ×
  prixUnitaire`), donc `QuoteService.toDto` calcule `totalHt` / `totalVat` (via `vatRate`
  stocké par devis, défaut 21) / `totalTtc` à la volée et les expose dans `QuoteDto`. Évite
  la redondance et la resynchronisation à chaque édition de ligne — exactement la notion
  SGBD « pas de donnée dérivée stockée ». La liste affiche `totalTtc`, le détail recalcule
  en live côté form (`computed()` branché sur `valueChanges`).
- **Numérotation auto réutilisant l'infra Company (Phase 2)** : `QuoteService` dépend de
  `CompanyService` et appelle **`getNextQuoteNumber()`** (format `quoteNumberFormat` +
  compteur `quoteNumberCounter` de `CompanySettings`, reset annuel) — au lieu d'un compteur
  ad hoc. L'incrément vit dans le **même `ipcHandle` transactionnel** que la création du
  devis → **atomique** (si la création échoue, l'incrément du compteur est rollback). ⚠️
  Émettre un devis exige donc une entreprise configurée (sinon `COMPANY_NOT_CONFIGURED`,
  remonté proprement) — cohérent : un devis a besoin de l'identité de l'émetteur.
- **FK `Client` Restrict + FK `Project?` SetNull + `status` TEXT+CHECK** : Restrict (3ᵉ)
  empêche de supprimer un client ayant des devis ; SetNull (3ᵉ) conserve les devis d'un
  projet supprimé (`projectId → NULL`, le champ étant *peuplé après acceptation* selon la
  spec) ; `status` en **TEXT + CHECK** (`DRAFT / SENT / ACCEPTED / REJECTED / EXPIRED`,
  CHECK ajouté à la main dans la migration `add_quote`) plutôt qu'un enum Prisma. Les 4
  comportements (CHECK rejette/accepte, Restrict bloque, SetNull nullifie, Cascade élague)
  + l'unicité de `number` **vérifiés sur une copie de `dev.db` via `node:sqlite`**.
- **Statut éditable + transitions rapides** : `status` est dans le form (couvre la création
  et tout changement au save), **plus** un canal léger dédié **`UPDATE_STATUS`** branché sur
  des boutons d'en-tête contextuels (« Marquer envoyé » sur un brouillon ; « Marquer accepté »
  / « Marquer refusé » sur un envoyé) qui persistent immédiatement. Agrégat **`countByStatus`**
  via `groupBy({ by: ['status'], _count })` alimentant l'en-tête pipeline (rafraîchi après
  chaque mutation, comme TimeEntry/Expense).
- **`FormArray` réactif + signaux** : la page détail mixe `ReactiveFormsModule` et signals —
  un `formTick` (bumpé sur `valueChanges`, façon `FormField`) sert de dépendance aux
  `computed()` `totals` et `availableProjects` (projets filtrés sur le client choisi).
  Changer de client **réinitialise** le projet (sous garde `suppressClientReset` pour ne pas
  écraser la valeur chargée en édition). Validation client-side (`Validators` + min 1 ligne)
  doublée du `min(1)` Zod à la frontière IPC.
- **Réutilisation des primitives partagées** : aucune nouvelle brique transverse. `DataTable`
  (colonnes `'badge'` + `'currency'` + `'date'`), `StatusBadge` (étendu de 5 classes
  `.badge--DRAFT/SENT/ACCEPTED/REJECTED/EXPIRED`), `Button`, `ConfirmDialog`, `SearchBar`,
  `formatCurrency`, classe globale `.app-select`. Page liste smart → `DataTable` ; page détail
  porte la logique de form (jamais le store).

### Ajouté

**Prisma**
- `prisma/schema/quote.prisma` — modèle `Quote` (`number` unique, `issueDate` `@default(now())`, `validUntil`, `status` TEXT défaut `DRAFT`, `vatRate` défaut 21, `notes?`, FK `Client` **Restrict**, FK `Project?` **SetNull**, relation `lines QuoteLine[]`)
- `prisma/schema/quote-line.prisma` — sous-entité `QuoteLine` (`description`, `quantity`, `unitPrice`, FK `Quote` **Cascade**)
- Relations inverses `quotes` sur `Client` (`Quote[]`) et `Project` (`Quote[]`)
- `prisma/migrations/20260526111805_add_quote/` — tables `Quote` + `QuoteLine`, **CHECK ajouté à la main** sur `status`, FK Restrict/SetNull/Cascade, index unique `Quote_number_key`

**Bundle Quote (main)**
- `QuoteRepository` (extends `BaseRepository`, `searchFields: ['number']`, include `client`+`project`+`lines`, `findByIdWithRelations`, agrégat `countByStatus` via `groupBy`, `updateStatus`, helpers sous-entité `findLineIds`/`createLine`/`updateLine`/`deleteLine`)
- `QuoteService` — pur : `get` / `getById` / `countByStatus` / `add` (numéro via `CompanyService` + création des lignes) / `update` (+ `syncLines` diff) / `updateStatus` / `remove` ; `toDto` aplatit `clientName` + `projectName` et **calcule** `totalHt`/`totalVat`/`totalTtc` + total par ligne
- `QuoteHandler` — `GET` / `GET_BY_ID` / `COUNT_BY_STATUS` / `ADD` / `UPDATE` / `UPDATE_STATUS` / `REMOVE` via `ipcHandle` (transactionnel)
- DI factories Quote (repo + service, service injecté avec `CompanyService`) + wire dans `AppDependencies`
- Preload `quote.api.ts` exposé via `window.api.quote`

**Shared layer**
- DTOs Quote dans `src/shared/dtos/quote/` (read `QuoteDto` avec totaux + `QuoteLineDto` ; create/update Zod avec `QuoteLineInputSchema` partagé ; `UpdateQuoteStatusSchema` ; `QuoteStatus` enum ; `QuoteStatusCount`)
- `QUOTE_CHANNELS`, interface `QuoteAPI`

**Frontend Angular**
- `services/quote/quote.ts` — `QuoteService` (wrapper `window.api.quote`, dont `countByStatus` / `updateStatus`)
- `stores/quote/quote-store.ts` — `QuoteStore` (devis + compteurs par statut + add/update/updateStatus/remove, rafraîchit les compteurs après mutation)
- `features/quote/pages/quote-list/` — page `/quotes` (en-tête pipeline cliquable par statut + filtre client + recherche + `DataTable` bordé), lazy-loadée
- `features/quote/pages/quote-detail/` — page `/quotes/:id` (+ `/quotes/new`) : form réactif (client, projet filtré, dates, TVA, statut, notes) + **`FormArray` de lignes** (ajouter/supprimer, total par ligne) + bloc **totaux HT/TVA/TTC en `computed()`** + boutons de transition de statut + suppression
- `features/quote/utils/quote-status.ts` — `QUOTE_STATUSES` + `quoteStatusKey`
- i18n `i18n/ui/quote/quote.{fr,en}.ts`
- 5 classes de statut `.badge--DRAFT/SENT/ACCEPTED/REJECTED/EXPIRED` sur `StatusBadge`
- Lien navbar « Devis » (`LucideFileText` → `/quotes`) + routes `quotes` / `quotes/new` / `quotes/:id`

### Modifié

- `client.prisma` — relation inverse `quotes Quote[]`
- `project.prisma` — relation inverse `quotes Quote[]`
- `shared/components/status-badge/status-badge.css` — 5 couleurs de badge pour les statuts de devis
- `app.routes.ts` + `app-routes.const.ts` — routes et paths `quotes` / `quoteNew` / `quoteDetail` (`new` avant `:id`)
- `navbar.ts` — 7ᵉ item de navigation « Devis »
- `i18n.ts` — enregistrement du namespace `quote` ; `common` — clé `nav.quotes` (fr + en)
- `preload/index.ts` + `renderer/.../types/electron/index.d.ts` — exposition de `window.api.quote`

## [0.9.0] — 2026-05-25 — Phase 8 : Bundle Expense

Entité **Expense** (`Depense` dans la spec) end-to-end, avec une **page dédiée
`/expenses`** (lien navbar « Dépenses ») en **liste globale filtrable** : toutes les
dépenses, filtrables par **catégorie** (« Toutes » + par catégorie) et par **plage
de dates**, avec un en-tête d'agrégat phare — le **total déductible de l'année
courante**. Saisie via une modale (libellé → montant → date → catégorie → projet
optionnel → **justificatifs multiples** (dialogue natif + ouverture) → notes).
**Deuxième agrégat visible** — exigence du PDF (le 1ᵉʳ étant la durée du mois en Phase 7).

### Décisions d'architecture

- **FK `ExpenseCategory` en `onDelete: Restrict` + FK `Project?` en `onDelete:
  SetNull`** : un même modèle exerce les **deux** contraintes restantes. Restrict
  (2ᵉ occurrence, après Client) empêche de supprimer une catégorie de dépense
  utilisée (`P2003` → `FK_VIOLATION`) ; SetNull (2ᵉ occurrence, après Task→TimeEntry)
  conserve les dépenses d'un projet supprimé (`projectId → NULL`). Vérifié sur une
  copie de `dev.db` (`node:sqlite`) : Restrict bloque, SetNull nullifie + conserve,
  `date` par défaut, et l'agrégat déductible (scénario spec : 5 dépenses, 3+1
  déductibles). **Pas de `TEXT + CHECK`** ici (aucun champ à valeurs contraintes) →
  migration `add_expense` sans édition SQL manuelle (les `onDelete` suffisent).
- **Deux agrégats de dépense réels** (notion SGBD « Agrégat ») : `sumDeductible(year)`
  via `aggregate({ _sum: { amount }, where: { date: [année], expenseCategory: {
  deductible: true } } })` — **filtre sur la relation** (le flag `deductible` vit sur
  la catégorie) combiné à un agrégat ; et `sumByCategory()` via `groupBy({ by:
  ['expenseCategoryId'], _sum: { amount } })`. Le store **rafraîchit les deux après
  chaque mutation** (comme TimeEntry).
- **Justificatif = dialogue de fichier Electron natif → `ipcHandleNoTx`** : le
  wrapping transactionnel est **global** (`ipcHandle` enveloppe chaque appel dans une
  transaction interactive Prisma, timeout 5 s). Or `dialog.showOpenDialog` peut rester
  ouvert plus longtemps → la transaction expirerait. Plutôt qu'un `ipcMain.handle`
  brut hors-pattern, on **factorise** l'infra IPC et on expose `ipcHandleNoTx` :
  **même enveloppe `{ data, error }` + même `toIpcError`** (Zod inclus), mais **sans
  transaction**. `PICK_RECEIPT` (aucune écriture DB) l'utilise ; le **dialogue** vit
  dans le **handler** (concern Electron UI). Réutilisable pour les futures opérations
  main sans DB (export PDF Phase 9/10, notifications natives Phase 11).
- **Justificatifs multiples = relation 1:N + copie gérée + ouverture native** : une
  dépense porte **plusieurs** justificatifs via **`ExpenseReceipt`** (`Expense 1:N
  ExpenseReceipt`, `onDelete: Cascade` — **3ᵉ Cascade** après ProjectCategory et Task,
  vérifiée `node:sqlite`). Sous-entité sans bundle propre (manipulée par
  `ExpenseService`, comme Contact/ProjetCategorie). À l'enregistrement, chaque fichier
  choisi est **copié** dans un dossier de l'app (`userData/storage/<scope>/<année>/
  <uuid>_<nom_original>.<ext>`, scope `expenses`) ; chemin + nom d'origine stockés en DB
  → le justificatif survit même si l'original est déplacé/supprimé. Module
  **`core/file-storage`** **générique et scopé** (`storeFile(path, scope, date)` /
  `deleteManagedFile` / `isManagedFile`, `fs/promises` async) — réutilisable hors Expense
  (PDF Devis/Facture…). La modale gère une **liste** : ajouter (dialogue natif) /
  **ouvrir** (`shell.openPath` → canal `OPEN_RECEIPT`) / retirer. À la sauvegarde, le
  **diff** se fait par `keepReceiptIds` (lignes gardées) + `newReceiptPaths` (nouvelles) —
  même esprit que `syncCategories` de Project ; le service élague/ajoute les **lignes**,
  le handler copie/supprime les **fichiers** (cf. décision suivante sur l'I/O hors tx).
- **Aucune I/O fichier dans la transaction DB**, orchestrée **à la frontière** (sinon
  corruption silencieuse) : avec l'adapter **`better-sqlite3` synchrone**, une
  transaction interactive Prisma **ne survit pas** à un `await` non-DB au milieu (la
  copie de fichier) → dépense enregistrée mais ses justificatifs **perdus, sans erreur**
  (l'INSERT après l'`await` était silencieusement abandonné). Correctif **respectant les
  couches** (principe « les services ignorent la transactionnalité ») : le pattern
  **copie AVANT → transaction DB pure → cleanup APRÈS / compensation** est extrait dans
  un helper réutilisable **`core/persist-with-files`** (`persistWithFiles({ scope,
  incoming, obsolete, run })` : copie les fichiers entrants hors tx → `getDbContext().
  transaction(run)` → supprime les fichiers obsolètes après commit, ou les copies
  fraîches si la tx échoue). Le **handler reste mince** (`ipcHandleNoTx`, câble juste les
  spécificités Expense) ; le **service reste pur** (repos + DTO, zéro `DbContext`, zéro
  fichier) ; le helper resservira à Devis/Facture (PDF) **sans duplication**. C'est la
  reco standard (effets de bord/I/O hors transaction ; orchestration tx + side-effects
  dans une couche applicative, domaine pur). Résultat : DB atomique + erreurs qui
  remontent, plus d'état partiel silencieux. (Le timeout de 5 s n'était PAS en cause : la
  sélection a lieu hors tx, la copie est sub-seconde.)
- **`DataTable` étendue avec un type de colonne `'currency'`** (additif, non-breaking —
  même approche que `'color'` en P3, `'boolean'` en P4, `'tags'` en P5) : rend un
  nombre formaté en € (`Intl.NumberFormat`), aligné à droite, chiffres tabulaires.
  Le **tri devient numérique** quand les deux valeurs sont des nombres (corrige aussi
  le tri du budget projet). Réutilisable pour Devis/Facture (Phases 9-10, riches en
  montants). Helper `formatCurrency` partagé via `@app/utils`.
- **DTO read aplati + JOIN `include`** : `findAll(filter)` joint `expenseCategory` +
  `project` + `receipts` ; le service aplatit `expenseCategoryName` /
  `expenseCategoryColor` / `deductible` (depuis la catégorie) et `projectName` (nullable)
  dans `ExpenseDto`, et expose `receipts: ExpenseReceiptDto[]`, si bien que la table
  affiche catégorie colorée + flag déductible + projet sans charger les DTO complets.
  `create`/`update` relisent via `findByIdWithRelations`.
- **Liste globale plutôt que page scopée projet** (cohérent avec `/time`) : une seule
  page liste toutes les dépenses avec filtre catégorie + plage de dates, ce qui rend
  l'agrégat déductible annuel lisible. Page smart `ExpenseList` → `DataTable` partagé +
  `ExpenseFormModal` (compose `app-modal`). La logique de form vit dans la modale.

### Ajouté

**Prisma**
- `prisma/schema/expense.prisma` — modèle `Expense` (FK `ExpenseCategory` Restrict, FK `Project?` SetNull, `amount` Float, `date` `@default(now())`, `notes` optionnel, relation `receipts ExpenseReceipt[]`)
- `prisma/schema/expense-receipt.prisma` — sous-entité `ExpenseReceipt` (`name`, `path`, FK `Expense` **Cascade**)
- Relations inverses `expenses` sur `ExpenseCategory` (`Expense[]`) et `Project` (`Expense[]`)
- `prisma/migrations/20260525000000_add_expense/` — table `Expense` (FK Restrict + SetNull, aucun CHECK)
- `prisma/migrations/20260525201938_add_expense_receipt/` — table `ExpenseReceipt` (FK Cascade) + retrait de la colonne `receiptPath` sur `Expense`

**Bundle Expense (main)**
- `ExpenseRepository` (extends `BaseRepository`, `searchFields: ['label']`, `findAll` filtré catégorie+dates, `findByIdWithRelations`, agrégats `sumByCategory` via `groupBy` / `sumDeductible` via `aggregate _sum` filtré sur la relation)
- `ExpenseService` — **pur (tx-ignorant)** : `getAll` / `sumByCategory` / `sumDeductible` / `getReceipts` / `add(scalar, receipts)` / `update(scalar, keepIds, newReceipts)` / `remove` (lignes `ExpenseReceipt` ajoutées/élaguées), mapping Prisma→DTO (aplatit `expenseCategoryName`/`expenseCategoryColor`/`deductible` + `projectName`, expose `receipts`)
- `ExpenseRepository` — + méthodes sous-entité `findReceipts` / `addReceipt` / `removeReceipt`
- `ExpenseHandler` — `GET_ALL` / `SUM_BY_CATEGORY` / `SUM_DEDUCTIBLE` (via `ipcHandle`) ; `ADD` / `UPDATE` / `REMOVE` **minces** via `ipcHandleNoTx` déléguant à `persistWithFiles` (copie hors tx + tx DB + cleanup) ; `PICK_RECEIPT` (dialogue natif) et `OPEN_RECEIPT` (`shell.openPath`)
- DI factories Expense (repo + service) + wire dans `AppDependencies`
- Preload `expense.api.ts` exposé via `window.api.expense`

**Infra main (core)**
- `ipcHandleNoTx` (`src/main/core/ipc.handle.ts`) — variante non-transactionnelle du wrapper IPC (même enveloppe + `toIpcError` + Zod, sans `DbContext.transaction()`) ; logique commune factorisée dans un `register(channel, schema, fn, transactional)` privé
- `src/main/core/file-storage.ts` — stockage de fichiers **global et scopé** (`storeFile(path, scope, date)` / `deleteManagedFile` / `isManagedFile`) : copie sous `userData/storage/<scope>/<année>/<uuid>_<nom>`, `fs/promises` async + `randomUUID` ; réutilisable hors Expense
- `src/main/core/persist-with-files.ts` — `persistWithFiles({ scope, incoming, obsolete, run })` : orchestration réutilisable **copie fichiers (hors tx) → `DbContext.transaction(run)` → cleanup obsolètes (post-commit) / compensation (échec)** ; garde l'I/O fichier hors de la transaction DB, handlers minces, services purs

**Shared layer**
- DTOs Expense dans `src/shared/dtos/expense/` (read DTO + `ExpenseReceiptDto` ; create avec `receiptPaths`, update avec `keepReceiptIds`/`newReceiptPaths` ; `ExpenseFilter` + `SumDeductibleDto` + `CategoryAmountCount`, dates coercées)
- `EXPENSE_CHANNELS`, interface `ExpenseAPI`

**Frontend Angular**
- `services/expense/expense.ts` — `ExpenseService` (wrapper `window.api.expense`, dont `pickReceipt` / `openReceipt`)
- `stores/expense/expense-store.ts` — `ExpenseStore` (dépenses + agrégats catégorie/déductible année + add/update/remove + pickReceipt/openReceipt, recharge liste + agrégats après mutation)
- `features/expense/pages/expense-list/` — page `/expenses` (filtre catégorie + plage de dates + en-tête total déductible + `DataTable` bordé + modale), lazy-loadée
- `features/expense/components/expense-form-modal/` — modale (libellé, montant €, date, catégorie, projet optionnel, **liste de justificatifs** : ajouter / ouvrir / retirer, notes) + **création de catégorie à la volée** (« + Nouvelle catégorie » → réutilise `ExpenseCategoryFormModal` en modale imbriquée, auto-sélection de la catégorie créée — comme la page Projet en P5)
- `shared/utils/format-currency.ts` (+ alias `@app/utils`) — `formatCurrency` (€ via `Intl.NumberFormat`)
- i18n `i18n/ui/expense/expense.{fr,en}.ts`
- Type de colonne `'currency'` sur le `DataTable` partagé (+ tri numérique)
- Lien navbar « Dépenses » (`LucideReceiptText` → `/expenses`) + route `expenses`

### Modifié

- `expense.prisma` — retrait de `receiptPath` (remplacé par la relation 1:N `receipts ExpenseReceipt[]`)
- `expense-category.prisma` — relation inverse `expenses Expense[]`
- `project.prisma` — relation inverse `expenses Expense[]`
- `core/ipc.handle.ts` — factorisation `register(...)` + ajout de `ipcHandleNoTx` (`ipcHandle` inchangé : transactionnel par défaut)
- `shared/components/modal/` — **gestion des modales empilées** : Échap ne ferme désormais que la modale **du dessus** (pile de modales partagée), au lieu de toutes les modales ouvertes. Permet d'imbriquer la modale catégorie dans la modale dépense sans fermer le formulaire parent ; réutilisable pour les éditeurs de lignes Devis/Facture (P9-10)
- `data-table` — union `TableColumnType` + branche `'currency'` + `formatCurrency` + tri numérique quand les deux valeurs sont des nombres + style `.cell-currency`
- `app.routes.ts` + `app-routes.const.ts` — route et path `expenses`
- `navbar.ts` — 6ᵉ item de navigation « Dépenses »
- `i18n.ts` — enregistrement du namespace `expense` ; `common` — clé `nav.expenses` (fr + en)
- `preload/index.ts` + `renderer/.../types/electron/index.d.ts` — exposition de `window.api.expense`
- Barrels `channels`, `interfaces`, `stores` — export du domaine `expense`

## [0.8.0] — 2026-05-25 — Phase 7 : Bundle TimeEntry

Entité **TimeEntry** (`TempsPasse` dans la spec) end-to-end, avec une **page dédiée
`/time`** (lien navbar « Temps ») conçue comme un **journal global** : toutes les
entrées de temps, filtrables par **projet** (« Tous » + par projet) et par **plage
de dates**, avec un en-tête d'**agrégats de durée** — total du **mois en cours** et
total du **projet sélectionné**. Saisie manuelle via une modale (projet → tâche
optionnelle → durée en **heures + minutes** → date → bascule **facturable** →
description). **Premier agrégat de durée visible** — exigence du PDF.

### Décisions d'architecture

- **Journal global plutôt que page scopée projet** : à la différence de `/tasks`
  (un projet à la fois), `/time` liste **toutes** les entrées avec un filtre projet
  (« Tous » par défaut) + une plage de dates, ce qui rend l'**agrégat mensuel
  multi-projets** lisible. IPC : `getAll(filter?)` (projet + dates) au lieu d'un
  `getByProject` strict.
- **Deux agrégats de durée réels** (notion SGBD « Agrégat ») :
  `sumByMonth(year, month)` via `prisma.timeEntry.aggregate({ _sum: { duration },
  where: { date: [début, fin du mois] } })` (l'exemple verbatim du cours), et
  `sumByProject()` via `groupBy({ by: ['projectId'], _sum: { duration } })`. Le
  store **rafraîchit les deux après chaque mutation**.
- **FK `Task` optionnelle en `onDelete: SetNull`** : supprimer une tâche **conserve**
  ses entrées de temps (`taskId → NULL`) — **premier `SetNull` du projet**, complète
  le panel Cascade (Project, ProjectCategory, Contact, Task) / Restrict (Client).
  FK `Project` en `onDelete: Cascade`. Vérifié sur une copie de `dev.db`
  (`node:sqlite`) : SetNull, Cascade, defaults (`billable`/`pomodoro`/`date`) et
  `projectId` NOT NULL.
- **Durée stockée en minutes (Int)**, saisie en **heures + minutes** : conversion
  `toMinutes()` à la soumission, `splitDuration()` au pré-remplissage, rendu via
  `formatDuration()` (`1h30` / `45m`). Pas de `TEXT+CHECK` ici (aucun champ à
  valeurs contraintes).
- **Flag `pomodoro` présent dès maintenant** (`Boolean @default(false)`, miroir de
  `methodePomodoro`) mais **non éditable** : la saisie manuelle l'écrit toujours à
  `false` ; il est affiché en lecture (icône) et sera alimenté par le timer Pomodoro
  de la Phase 11. Pastille **facturable** également rendue par ligne.
- **Re-fetch avec relations après mutation** : `create`/`update` du `BaseRepository`
  ne joignent pas ; le service relit via `findByIdWithRelations` (include
  `project` + `task`) pour aplatir `projectName` / `taskTitle` dans le DTO de lecture
  (le journal affiche « Projet · Tâche » sans charger les DTO complets).
- **Bornes de date robustes** : le filtre `to` est étendu à la **fin de journée**
  côté repo (`endOfDay`) ; les dates `YYYY-MM-DD` sont parsées en **local**
  (`new Date(y, m-1, d)`) côté renderer pour éviter les décalages de fuseau.
- **Composants présentationnels « dumb »** (`TimeEntryList`) pilotés par la page
  smart `TimeJournal` (filtres + agrégats + modale) — cohérent avec le découpage
  3 couches ; la logique de form vit dans `TimeEntryFormModal` (compose `app-modal`).

### Ajouté

**Prisma**
- `prisma/schema/time-entry.prisma` — modèle `TimeEntry` (FK `Project` Cascade, FK `Task?` SetNull, `duration` Int minutes, `billable`/`pomodoro` Boolean, `date`/`description` optionnels)
- Relations inverses `timeEntries` sur `Project` (`TimeEntry[]`) et `Task` (`TimeEntry[]`)
- `prisma/migrations/20260522175651_add_time_entry/` — table `TimeEntry` (FK SetNull + Cascade)

**Bundle TimeEntry (main)**
- `TimeEntryRepository` (extends `BaseRepository`, `searchFields: ['description']`, `findAll` filtré projet+dates, `findByIdWithRelations`, agrégats `sumByProject` via `groupBy` / `sumByMonth` via `aggregate _sum`)
- `TimeEntryService` — `getAll` / `sumByProject` / `sumByMonth` / `add` / `update` / `remove`, mapping Prisma→DTO (aplatit `projectName` / `taskTitle`)
- `TimeEntryHandler` — `GET_ALL` / `SUM_BY_PROJECT` / `SUM_BY_MONTH` / `ADD` / `UPDATE` / `REMOVE` (validés Zod)
- DI factories TimeEntry (repo + service) + wire dans `AppDependencies`
- Preload `time-entry.api.ts` exposé via `window.api.timeEntry`

**Shared layer**
- DTOs TimeEntry dans `src/shared/dtos/time-entry/` (read DTO en interface avec `projectName`/`taskTitle` + create/update en schémas Zod + `TimeEntryFilter` + `SumByMonthDto` + `ProjectDurationCount`, dates coercées)
- `TIME_ENTRY_CHANNELS`, interface `TimeEntryAPI`

**Frontend Angular**
- `services/time-entry/time-entry.ts` — `TimeEntryService` (wrapper `window.api.timeEntry`)
- `stores/time-entry/time-entry-store.ts` — `TimeEntryStore` (entrées + agrégats mois/projet + add/update/remove, recharge liste + agrégats après mutation)
- `features/time-entry/pages/time-journal/` — page `/time` (filtre projet + plage de dates + agrégats + modale), lazy-loadée
- `features/time-entry/components/time-entry-list/` — liste « dumb » (date, projet · tâche, durée, pastilles facturable/pomodoro, actions)
- `features/time-entry/components/time-entry-form-modal/` — modale (projet, tâche optionnelle chargée à la volée, durée h+m, date, toggle facturable, description)
- `features/time-entry/utils/format-duration.ts` — `formatDuration` / `toMinutes` / `splitDuration`
- i18n `i18n/ui/time-entry/time.{fr,en}.ts`
- Lien navbar « Temps » (`LucideClock` → `/time`) + route `time`

### Modifié

- `project.prisma` — relation inverse `timeEntries TimeEntry[]`
- `task.prisma` — relation inverse `timeEntries TimeEntry[]`
- `app.routes.ts` + `app-routes.const.ts` — route et path `time`
- `navbar.ts` — 5ᵉ item de navigation « Temps »
- `i18n.ts` — enregistrement du namespace `time` ; `common` — clé `nav.time` (fr + en)
- `preload/index.ts` + `renderer/.../types/electron/index.d.ts` — exposition de `window.api.timeEntry`
- Barrels `channels`, `interfaces`, `stores` — export du domaine `time-entry`

## [0.7.0] — 2026-05-22 — Phase 6 : Bundle Task

Entité **Task** (`Tache` dans la spec) end-to-end, avec une **page dédiée `/tasks`**
(lien navbar « Tâches ») : sélecteur de projet en haut, **bascule de vue Kanban /
Liste**, board à 4 colonnes (À faire / En cours / Terminée / Bloquée) en **glisser-
déposer** (`@angular/cdk/drag-drop`) qui change le statut, badge de priorité coloré,
date limite (rouge si dépassée), et **résumé d'agrégat** (compteurs par statut via
`GROUP BY`). La page travaille toujours dans le contexte d'**un** projet sélectionné.

### Décisions d'architecture

- **Page dédiée `/tasks` plutôt qu'inline dans la page projet** : itéré après un
  premier jet (tâches enterrées dans `/projects/:id`, jugé peu pratique). Les tâches
  deviennent first-class via un **sélecteur de projet** en tête de page ; l'IPC reste
  scopé projet (`getByProject` / `countByStatus`).
- **Vue Kanban en glisser-déposer (`@angular/cdk/drag-drop`)** : 4 `cdkDropList`
  connectés (un par statut) dans un `cdkDropListGroup` ; déposer une carte appelle
  `TaskStore.move(id, status)` (mise à jour **optimiste** + rollback en cas d'erreur,
  silencieuse — pas de toast par déplacement). Bascule **Kanban / Liste** (la liste
  compacte réutilise les lignes : pastille de statut cyclable + priorité + échéance).
- **Deux `TEXT + CHECK` dans un même modèle** : `status` (`TODO` / `IN_PROGRESS` /
  `DONE` / `BLOCKED`) et `priority` (`LOW` / `MEDIUM` / `HIGH` / `URGENT`), CHECK
  ajoutés à la main dans la migration (miroir du `status` de Project). Valeurs typées
  dans `TaskStatus` / `TaskPriority` (TS).
- **FK `Project` en `onDelete: Cascade`** : supprimer un projet supprime ses tâches —
  complète le panel Restrict (Client) / Cascade (ProjectCategory) de la Phase 5.
  Vérifié sur une copie de `dev.db` (`node:sqlite`) : CHECK ×2, defaults, et Cascade.
- **Agrégat DB réel `countByStatus`** : `prisma.task.groupBy({ by: ['status'],
  _count })` par projet — exerce la notion SGBD « Agrégat ». Exposé en IPC et rendu
  en chips de comptage ; le store **rafraîchit l'agrégat après chaque mutation**.
- **`toggleStatus(id)`** : avance rapidement le statut `TODO → IN_PROGRESS → DONE →
  TODO` (et `BLOCKED → TODO`), via une table de cycle pure côté service. Surfacé par
  le bouton-pastille rond de chaque ligne en vue Liste.
- **IPC scopé par projet** : `getByProject(projectId)` + `countByStatus(projectId)`
  plutôt qu'un `get` paginé global. `IdSchema` réutilisé pour valider le `projectId`.
- **`StatusBadge` réutilisé** pour le statut **et** la priorité (classes
  `badge--TODO/DONE/BLOCKED` + `badge--LOW/MEDIUM/HIGH/URGENT` ajoutées ;
  `IN_PROGRESS` existait déjà depuis Project).
- **Composants présentationnels « dumb »** (`TaskKanban`, `TaskListView`) pilotés par
  la page smart `TaskBoard` (sélecteur projet + bascule de vue + modale + agrégat) —
  cohérent avec le découpage 3 couches. La logique de form vit dans `TaskFormModal`
  (compose `app-modal`).

### Ajouté

**Prisma**
- `prisma/schema/task.prisma` — modèle `Task` (FK `Project` Cascade, `status`/`priority` TEXT, `dueDate`/`description` optionnels)
- Relation inverse `tasks` sur `Project` (`Task[]`)
- `prisma/migrations/20260522162207_add_task/` — table `Task` + CHECK `status IN (...)` et `priority IN (...)` ajoutés manuellement

**Bundle Task (main)**
- `TaskRepository` (extends `BaseRepository`, `searchFields: ['title']`, `findByProjectId`, `countByStatus` via `groupBy`)
- `TaskService` — `getByProject` / `countByStatus` / `add` / `update` / `toggleStatus` (table de cycle) / `remove`, mapping Prisma→DTO
- `TaskHandler` — `GET_BY_PROJECT` / `COUNT_BY_STATUS` / `ADD` / `UPDATE` / `TOGGLE_STATUS` / `REMOVE` (validés Zod)
- DI factories Task (repo + service) + wire dans `AppDependencies`
- Preload `task.api.ts` exposé via `window.api.task`

**Shared layer**
- DTOs Task dans `src/shared/dtos/task/` (read DTO en interface + `TaskStatus`/`TaskPriority` enums + `TaskStatusCount` + create/update en schémas Zod, dates coercées)
- `TASK_CHANNELS`, interface `TaskAPI`

**Frontend Angular**
- `services/task/task.ts` — `TaskService` (wrapper `window.api.task`)
- `stores/task/task-store.ts` — `TaskStore` (liste + compteurs par statut + add/update/toggle/`move` optimiste/remove, rafraîchit l'agrégat)
- `features/task/pages/task-board/` — page `/tasks` (sélecteur projet + bascule Kanban/Liste + agrégat + modale), lazy-loadée
- `features/task/components/task-kanban/` — board 4 colonnes en glisser-déposer (`@angular/cdk/drag-drop`)
- `features/task/components/task-list-view/` — liste compacte « dumb » (pastille statut + priorité + échéance + actions)
- `features/task/components/task-form-modal/` — modale création/édition (titre, statut, priorité, date limite, description)
- `features/task/utils/` — `TASK_STATUSES`/`taskStatusKey` + `TASK_PRIORITIES`/`taskPriorityKey`
- i18n `i18n/ui/task/task.{fr,en}.ts`
- Lien navbar « Tâches » (`LucideListTodo` → `/tasks`) + route `tasks`

### Modifié

- `project.prisma` — relation inverse `tasks Task[]`
- `status-badge.css` — classes de badge statut (`TODO`/`DONE`/`BLOCKED`) + priorité (`LOW`/`MEDIUM`/`HIGH`/`URGENT`)
- `app.routes.ts` + `app-routes.const.ts` — route et path `tasks`
- `navbar.ts` — 4ᵉ item de navigation « Tâches »
- `i18n.ts` — enregistrement du namespace `task` ; `common` — clé `nav.tasks` (fr + en)
- `preload/index.ts` + `renderer/.../types/electron/index.d.ts` — exposition de `window.api.task`
- Barrels `channels`, `interfaces`, `stores` — export du domaine `task`

### Mutualisation (revue qualité)

- **`shared/components/segmented-toggle/`** — toggle segmenté **générique** (`options` + icônes via `ngComponentOutlet`, `value`/`valueChange`). Remplace l'ancien `ViewModeSwitch` figé (`inbox`/`table`) : **migré côté Client** aussi, puis `ViewModeSwitch` supprimé.
- **`shared/utils/format-date.ts`** (+ alias `@app/utils`) — `formatDate` partagé ; `isTaskOverdue` regroupé dans les utils Task. Supprime le copier-coller `formatDate`/`isOverdue` entre `TaskKanban` et `TaskListView`.
- **Classe globale `.app-select`** (`styles.css`) — style unique des `<select>` (chevron + focus). Dédup `task-board`, `task-form-modal` et `project-detail` (chevron data-uri retiré de chaque CSS).
- **`shared/components/icon-button/`** — bouton-icône partagé (`variant` default/danger, `title`, `clicked`, `stopPropagation` intégré). Remplace le `.icon-btn` local des actions edit/supprimer de `TaskListView` ; réutilisable pour les futures actions de ligne.

### Supprimé

- `shared/components/view-mode-switch/` — remplacé par le `SegmentedToggle` générique

### Dépendances

- Ajout de `@angular/cdk` `^21.2.12` (renderer) — `@angular/cdk/drag-drop` pour le Kanban

## [0.6.0] — 2026-05-22 — Phase 5 : Bundle Project

Entité **Project** (`Projet` dans la spec) end-to-end — **premier bundle avec une
relation N:M explicite** (`ProjectCategory`) et un aggregate root portant une FK
sortante (`Client`, `onDelete: Restrict`). Page liste filtrable `/projects` +
page détail dédiée `/projects/:id` (et `/projects/new`), avec sélection client
(single-select), catégories (multi-select de chips colorés), statut, dates,
taux horaire/journalier et budget.

### Décisions d'architecture

- **Jonction N:M explicite `ProjectCategory`** (`@@id([projectId, categoryId])`,
  `onDelete: Cascade` des deux côtés) — modélisée avec `Project` dans
  `project.prisma`, **sans bundle propre** : manipulée via `ProjectService`
  (`linkCategory` / `unlinkCategory` au niveau repo, `syncCategories` au niveau
  service). L'UI envoie un simple `categoryIds: number[]` ; le service **diffe**
  l'existant (add/remove) à la frontière, le tout enveloppé dans la **transaction
  ambient** (`ipcHandle` → `DbContext`) → liaison atomique create/update + liens.
- **`status` en TEXT+CHECK** (valeurs anglaises `PROSPECT` / `IN_PROGRESS` /
  `ON_HOLD` / `COMPLETED` / `CANCELLED`) plutôt qu'un enum Prisma — miroir exact
  du `type` de Client (cohérence multi-DB SQLite/PG, CHECK ajouté à la main dans
  la migration). Les valeurs typées vivent dans `ProjectStatus` (TS).
- **FK `Client` en `onDelete: Restrict`** : démontre la contrainte Restrict du
  cours (supprimer un client qui a des projets échoue au niveau DB → `P2003` déjà
  traduit en `FK_VIOLATION`). Complète le `Cascade` (Contact, ProjectCategory).
- **Dates coercées à la frontière IPC** (`z.coerce.date()`, `.nullable()` sur
  update pour pouvoir effacer une date) : le renderer envoie des objets `Date`
  (préservés par le structured clone d'Electron), Prisma les stocke directement.
- **Canal IPC `GET_BY_ID`** ajouté (en plus de GET/ADD/UPDATE/REMOVE) : la page
  détail est **deep-linkable** (`/projects/:id`) et recharge le projet + ses
  relations (`include: { client, categories: { include: { category } } }`).
- **Filtrage serveur via Prisma `where`** sur la page liste (statut = `where.status`,
  client = `where.clientId`, catégorie = `where.categories.some.categoryId`)
  combiné à la recherche `searchFields: ['name']` — exerce le **filtrage sur
  relation** (N:M) en plus du JOIN `include`.
- **Page détail dédiée** (`/projects/:id` + `/projects/new`) plutôt que l'inbox
  inline de Client : conforme à la spec (Phase 5) et adapté à un formulaire riche
  (client, multi-catégories, dates, taux, budget).
- **`DataTable` étendu avec un type de colonne `'tags'`** (additif, non-breaking —
  même approche que `'color'` en Phase 3 et `'boolean'` en Phase 4) : rend une
  liste de chips colorés (`TableTag { label, color? }`), réutilisé ici pour les
  catégories N:M.
- **Front en 3 couches** (cohérent Client/Company/Category) : `ProjectService`
  (IPC + signals) → `ProjectStore` (orchestration + toast/erreur) → pages
  liste/détail. La logique de form vit dans le composant détail.

### Ajouté

**Prisma**
- `prisma/schema/project.prisma` — modèles `Project` (FK `Client` Restrict, `status` TEXT, dates/taux/budget optionnels) + `ProjectCategory` (jonction N:M `@@id` composite, Cascade)
- Relations inverses `projects` sur `Client` (`Project[]`) et `Category` (`ProjectCategory[]`)
- `prisma/migrations/20260522120852_add_project/` — tables `Project` + `ProjectCategory` + CHECK `status IN (...)` ajouté manuellement

**Bundle Project (main)**
- `ProjectRepository` (extends `BaseRepository`, include client+catégories, `searchFields: ['name']`, `findByIdWithRelation`, `findCategoryIds`, `linkCategory`, `unlinkCategory`)
- `ProjectService` — `get` / `getById` / `add` / `update` (sync catégories) / `remove`, mapping Prisma→DTO (flatten jonction → `CategoryDto[]`, client → `ClientDto`)
- `ProjectHandler` — `GET` / `GET_BY_ID` / `ADD` / `UPDATE` / `REMOVE` (validés Zod)
- DI factories Project (repo + service) + wire dans `AppDependencies`
- Preload `project.api.ts` exposé via `window.api.project`

**Shared layer**
- DTOs Project dans `src/shared/dtos/project/` (read DTO en interface + `ProjectStatus` enum + create/update en schémas Zod avec `categoryIds` + dates coercées)
- `PROJECT_CHANNELS`, interface `ProjectAPI`

**Frontend Angular**
- `services/project/project.ts` — `ProjectService` (wrapper `window.api.project` + signals)
- `stores/project/project-store.ts` — `ProjectStore` (load/getById/add/update/remove + toast/erreur)
- `features/project/pages/project-list/` — page `/projects` (recherche + filtres statut/client/catégorie + `DataTable`)
- `features/project/pages/project-detail/` — page `/projects/:id` & `/projects/new` (form client/statut/dates/taux/budget + multi-select catégories en chips)
- `features/project/utils/project-status.ts` — `PROJECT_STATUSES` + `projectStatusKey`
- i18n `i18n/ui/project/project.{fr,en}.ts`
- Type de colonne `'tags'` sur le `DataTable` partagé (+ `TableTag`)
- Lien navbar « Projets » (`LucideFolderKanban` → `/projects`)

### Modifié

- `data-table` — union `TableColumnType` + branche `'tags'` + helper `getTags()` + styles `.cell-tags`
- `status-badge` — classes de couleur des statuts projet (`badge--PROSPECT` … `badge--CANCELLED`)
- **`FormField`** — affordance des inputs revue (bordure `--color-border-soft` désormais *visible*, hover, halo de focus accent) : la bordure était jusque-là `--color-border` = `--color-bg-elevated`, donc invisible → les champs « ressemblaient à des champs non éditables ». Bénéficie à **tous** les formulaires (Client/Company/Category/Project).
- `styles.css` — `color-scheme: dark` sur `body` (le `<input type="date">` natif et les contrôles OS s'affichent en thème sombre)
- Page détail Projet redesignée : sections-cartes centrées (`Informations` / `Planning & budget` / `Catégories` / `Description`, langage `.view-section`, reveal échelonné), inputs/selects/dates harmonisés (chevron custom, suffixe `€`), **sélecteur de catégories explicite** (chips à pastille/coche + compteur + hint « cliquez pour sélectionner »)
- **Création de catégorie à la volée** depuis la section Catégories de la page Projet (chip « + Nouvelle catégorie » → réutilise `CategoryFormModal` ; la catégorie créée est auto-sélectionnée) — évite l'aller-retour vers les Paramètres
- `app.routes.ts` + `app-routes.const.ts` — routes/paths `projects`, `projectNew`, `projectDetail`
- `navbar.ts` — 3ᵉ item de navigation « Projets »
- `i18n.ts` — enregistrement du namespace `project`
- i18n `common` — clé `nav.projects` (fr + en)
- Barrels `channels`, `interfaces`, `stores` — export du domaine `project`

## [0.5.0] — 2026-05-21 — Phase 4 : Bundle ExpenseCategory

Entité **ExpenseCategory** (catégories de note de frais, `CategorieDepense` dans
la spec) end-to-end. **Quasi-jumeau de Category** sur l'archi durcie (Zod à la
frontière IPC + transactions ambient `DbContext`), avec un champ booléen
`deductible` en plus. Premier bundle « fondation » sans FK sortante, dernier
avant la relation N:M de Projet (Phase 5).

### Décisions d'architecture

- **ExpenseCategory = duplication du template canonique Category** : `extends
  BaseRepository`, `searchFields: ['name']`, garde d'unicité service
  (`isExist('name')` → `EXPENSE_CATEGORY_NAME_TAKEN`) en miroir exact de Category.
  Le seul ajout métier est `deductible: Boolean @default(true)`.
- **Couleur obligatoire** (`color String`, miroir exact de Category) plutôt
  qu'optionnelle (spec `couleur?`) ou absente (ERD README) : réutilise sans
  adaptation toute la machinerie existante (palette curée, colonne `'color'`,
  chip d'aperçu live) sans introduire d'état « pas de couleur ».
- **Pattern HEX `#RRGGBB` extrait dans `src/shared/validators/`** : le regex
  était dupliqué dans les DTOs Zod de Category **et** ExpenseCategory.
  `HexColorSchema` (+ const `HEX_COLOR`) devient la source unique, importée par
  les 4 DTOs (create/update × 2 entités). Nouveau dossier `validators/` partagé.
- **`DataTable` étendue avec un type de colonne `'boolean'`** (additif,
  non-breaking — même approche que `'color'` en Phase 3) : check vert
  (`LucideCheck`) si vrai, tiret atténué sinon. Langage-agnostique (pas d'i18n
  dans la table générique), réutilisable par les futurs flags (`facturable`,
  `archived`…).
- **Toggle « Déductible fiscalement »** : switch stylé **local à la modale**
  (pas encore de composant Toggle partagé) lié au control reactive `deductible`,
  cohérent avec les swatches de palette locaux.
- **Palette partagée par re-export** : `EXPENSE_CATEGORY_PALETTE` ré-exporte
  `CATEGORY_PALETTE` (14 accents Catppuccin) — zéro duplication du tableau.
- **3ᵉ onglet « Dépenses » dans `SettingsHeader`** (anticipé en Phase 3) : route
  `/settings/expense-categories` à plat, icône `LucideReceipt`.
- **Front en 3 couches** (cohérent Client/Company/Category) :
  `ExpenseCategoryService` (IPC + signals) → `ExpenseCategoryStore`
  (orchestration + toast/erreur) → page/modale.

### Ajouté

**Prisma**
- `prisma/schema/expense-category.prisma` — modèle `ExpenseCategory` (`name` unique, `deductible` Boolean default true, `color`, timestamps)
- `prisma/migrations/20260521212719_add_expense_category/` — table `ExpenseCategory` + index unique `name`

**Bundle ExpenseCategory (main)**
- `ExpenseCategoryRepository` (extends `BaseRepository`, `searchFields: ['name']`)
- `ExpenseCategoryService` — `get` / `add` (garde unicité) / `update` / `remove`
- `ExpenseCategoryHandler` — `GET` / `ADD` / `UPDATE` / `REMOVE` (validés Zod)
- DI factories ExpenseCategory (repo + service) + wire dans `AppDependencies`
- Preload `expense-category.api.ts` exposé via `window.api.expenseCategory`
- Code d'erreur i18n `EXPENSE_CATEGORY_NAME_TAKEN` (fr + en)

**Shared layer**
- DTOs ExpenseCategory dans `src/shared/dtos/expense-category/` (read DTO en interface + create/update en schémas Zod, `deductible` booléen + couleur `#RRGGBB`)
- `EXPENSE_CATEGORY_CHANNELS`, interface `ExpenseCategoryAPI`
- `src/shared/validators/` — `HexColorSchema` + `HEX_COLOR` (validateur couleur partagé)

**Frontend Angular**
- `services/expense-category/expense-category.ts` — `ExpenseCategoryService` (wrapper `window.api.expenseCategory` + signals)
- `stores/expense-category/expense-category-store.ts` — `ExpenseCategoryStore` (load/add/update/remove + toast/erreur)
- `features/expense-category/pages/expense-category-settings/` — page `SearchBar` + `DataTable` + bouton « Nouvelle »
- `features/expense-category/components/expense-category-form-modal/` — modale création/édition (palette curée + aperçu chip + toggle déductible)
- `features/expense-category/utils/expense-category-colors.ts` — `EXPENSE_CATEGORY_PALETTE` (re-export de `CATEGORY_PALETTE`)
- i18n `i18n/ui/expense-category/expense-category.{fr,en}.ts`
- Type de colonne `'boolean'` sur le `DataTable` partagé (template + css + `LucideCheck`)

### Modifié

- DTOs Category (`create`/`update`) — utilisent désormais `HexColorSchema` partagé au lieu du regex inline dupliqué
- `data-table` — union `TableColumnType` + branche `'boolean'` + import `LucideCheck` + styles `.cell-bool`
- `SettingsHeader` — 3ᵉ onglet « Dépenses » (`LucideReceipt` → `/settings/expense-categories`)
- `app.routes.ts` + `app-routes.const.ts` — route et paths `settingsExpenseCategories`
- `i18n.ts` — enregistrement du namespace `expenseCategory`
- i18n `settings` — clé `settings.tab.expenseCategories` (fr + en)

## [0.4.0] — 2026-05-21 — Phase 3 : Bundle Category

Entité **Category** (étiquettes colorées des projets) end-to-end. Premier
bundle multi-rows depuis Client — retour au **template canonique** (extends
`BaseRepository`) après le cas singleton de Company, désormais sur l'archi
durcie (Zod à la frontière IPC + transactions ambient `DbContext`). Les
Paramètres deviennent une **page unifiée à onglets**.

### Décisions d'architecture

- **Category = template canonique multi-rows** : `CategoryRepository` étend
  `BaseRepository` (contrairement au repo singleton standalone de Company),
  `searchFields: ['name']` pour la recherche serveur. Le bundle exerce la
  réplication du pattern sur la nouvelle archi (Zod + `DbContext`) avant la
  relation N:M de Projet (Phase 5).
- **Nom unique en défense en profondeur** : contrainte DB (`@unique` → `P2002`
  traduit en `UNIQUE_VIOLATION`) + garde service (`isExist('name')` sur `add` →
  `CATEGORY_NAME_TAKEN`, calqué sur l'email de Client) + `Validators.required`
  côté form.
- **Picker de couleur curé** (palette d'accents Catppuccin Mocha) plutôt que
  l'`input type="color"` natif de l'OS : cohérent avec le thème global, plus
  rapide à l'oral, et le rendu correspond exactement au futur badge sur les
  projets. Validation Zod `#RRGGBB`.
- **En-tête Paramètres unifié sur une seule ligne** (`SettingsHeader`) : titre +
  description de la page à gauche, onglets en **pills centrés**, actions
  (Enregistrer / « + Nouvelle ») à droite — au lieu de deux lignes (titre global
  « Paramètres » + en-tête de page). Gagne une ligne verticale. Pills cohérentes
  avec la navbar flottante (sans réintroduire la sidebar retirée en 0.2.1).
  `SettingsHeader` reçoit l'icône (via `ngComponentOutlet`, comme la navbar) + les
  clés titre/sous-titre en inputs et projette les actions ; chaque page le compose.
  Routes `/settings/*` à plat (redirect `settings → company`). Anticipe la Phase 4
  (catégories de dépense = 3ᵉ onglet).
- **`DataTable` étendu avec un type de colonne `'color'`** (additif, non-breaking) :
  pastille + hex. Première couleur « first-class » dans une table générique,
  réutilisable par les futurs statuts colorés.
- **Coquille `Modal` partagée** : overlay + backdrop + fermeture Échap extraits
  dans `app-modal` (slots titre / corps / actions). `CategoryFormModal` **et**
  `ConfirmDialog` la composent → une seule implémentation d'overlay dans toute
  l'app. La modale catégorie y ajoute l'aperçu live du chip + la palette ;
  suppression déclenchée en mode édition, confirmée par `ConfirmDialog`.
- **Front en 3 couches** (cohérent Client/Company) : `CategoryService` (IPC +
  signals) → `CategoryStore` (orchestration + toast/erreur) → page/modale.

### Ajouté

**Prisma**
- `prisma/schema/category.prisma` — modèle `Category` (`name` unique, `color`, timestamps)
- `prisma/migrations/20260521160005_add_category/` — table `Category` + index unique `name`

**Bundle Category (main)**
- `CategoryRepository` (extends `BaseRepository`, `searchFields: ['name']`)
- `CategoryService` — `get` / `add` (garde unicité) / `update` / `remove`
- `CategoryHandler` — `GET` / `ADD` / `UPDATE` / `REMOVE` (validés Zod)
- DI factories Category (repo + service) + wire dans `AppDependencies`
- Preload `category.api.ts` exposé via `window.api.category`
- Code d'erreur i18n `CATEGORY_NAME_TAKEN` (fr + en)

**Shared layer**
- DTOs Category dans `src/shared/dtos/category/` (read DTO en interface + create/update en schémas Zod, couleur `#RRGGBB`)
- `CATEGORY_CHANNELS`, interface `CategoryAPI`

**Frontend Angular**
- `services/category/category.ts` — `CategoryService` (wrapper `window.api.category` + signals)
- `stores/category/category-store.ts` — `CategoryStore` (load/add/update/remove + toast/erreur)
- `features/category/pages/category-settings/` — page `SearchBar` + `DataTable` + bouton « Nouvelle »
- `features/category/components/category-form-modal/` — modale création/édition (palette curée + aperçu chip)
- `features/category/utils/category-colors.ts` — `CATEGORY_PALETTE` (14 accents Catppuccin)
- `features/settings/settings-header/` — en-tête Paramètres partagé (titre/desc + onglets centrés + slot actions)
- i18n `i18n/ui/category/category.{fr,en}.ts` + `i18n/ui/settings/settings.{fr,en}.ts`
- `shared/components/modal/` — `Modal` réutilisable (overlay + backdrop + Échap, slots titre/corps/actions)
- Type de colonne `'color'` sur le `DataTable` partagé (template + css)

### Modifié

- `app.routes.ts` — routes `/settings/*` à plat (`settings` redirige vers `company`, + `categories`)
- `CompanySettings` — en-tête restructuré pour composer `SettingsHeader` (titre/desc à gauche, actions Annuler/Enregistrer à droite)
- `app-routes.const.ts` — paths `settings` / `settingsCategories`
- `navbar.ts` — l'icône Paramètres pointe vers `/settings` (hub) au lieu de `/settings/company`
- `i18n.ts` — enregistrement des namespaces `category` + `settings`
- `data-table` — union `TableColumnType` + branche `'color'` + styles `.cell-color`
- `ConfirmDialog` — refactoré sur `app-modal` (API publique `visible`/`title`/`message`/`confirmed`/`cancelled` inchangée)

## [0.3.0] — 2026-05-20 — Phase 2 : Bundle Company

Entité **Company** (singleton) end-to-end : identité légale + paramètres de
facturation, page `/settings/company`. Accompagnée d'un durcissement transversal
de l'archi backend (transactions ambient via `DbContext`, validation runtime Zod
à la frontière IPC).

### Décisions d'architecture

- **Company en singleton à PK String** (`id @default("default")`) plutôt qu'un `Int autoincrement` : SQLite auto-génère un rowid sur tout `Int` PK, ce qui ne garantit jamais l'unicité d'un singleton. Une PK `String` à valeur fixe fait échouer toute 2ᵉ insertion **au niveau DB** (violation de PK). Le repo singleton **n'étend pas `BaseRepository`** (son contrat CRUD `id: number` ne colle pas) — il est standalone avec `get()` + `upsert()`.
- **Split `Company` / `CompanySettings` (1:1)** : identité légale immuable (nom, adresse, TVA, PEPPOL, IBAN, logo) séparée des préférences mutables (defaults facturation + compteurs). PK partagée (`companyId @id`).
- **Format de numéro à tokens** (`invoiceNumberFormat` / `quoteNumberFormat`) : template type Odoo (`{YYYY}`, `{YY}`, `{MM}`, `{####}`…) avec reset annuel paramétrable. Le compteur reste un `Int`, le formatage est une fonction pure côté service. Validation : le format **doit** contenir un token compteur (`{#+}`).
- **Transactions ambient via `DbContext` + AsyncLocalStorage** : chaque appel IPC est automatiquement enveloppé dans une transaction par `ipcHandle()`. Les repos lisent `dbContext.client` (la tx active ou le client de base), les services restent **ignorants de la transactionnalité**. Garantit l'atomicité "all-or-nothing" sans `$transaction` dans le code métier. Pattern DB-agnostique (SQLite local ou Postgres cloud).
- **Règle service-to-service** : un service n'appelle que (1) son propre repo, (2) d'autres services — jamais le repo d'un autre domaine. Permet aux transactions ambient de composer à travers les services.
- **Validation runtime à la frontière IPC via Zod** : les DTOs d'input sont des schémas Zod, les types TS sont dérivés (`z.infer`) — impossible de diverger. `ipcHandle()` valide l'input **avant** d'ouvrir la transaction. Ferme le trou "interface TS = compile-time only".
- **Singleton DI orthogonal au scope transactionnel** : les services restent des singletons stateless ; le state par-requête (la tx) vit dans `DbContext`/AsyncLocalStorage, pas dans les instances → safe même en multi-user concurrent.
- **Front en 3 couches** (cohérent avec Client) : `CompanyService` (wrapper IPC + signals) → `CompanyStore` (façade métier : orchestration async + état + toast/erreur) → composants. La logique **métier/état** vit dans le store, la logique **de form** (FormGroup, validators, mapping form↔DTO, preview) vit dans le composant — jamais dans le store (qui ne doit pas connaître Angular Forms).
- **Form extrait en composant réutilisable** (`CompanyForm`) : émet `submitted(SaveCompanyInput)`, expose `submit()`/`reset()`/`valid`, masque les compteurs via `showCounters`. La page reste thin (orchestration store + chrome). Anticipe la réutilisation par le Welcome Wizard (Phase 11).
- **`formatNumber` déplacé en `shared/`** : utilisé côté main (numérotation réelle) ET renderer (preview live du format) → source unique, pattern DB-agnostique préservé.

### Ajouté

**Prisma**
- `prisma/schema/company.prisma` — modèle `Company` (singleton String PK, identité légale, champs PEPPOL)
- `prisma/schema/company-settings.prisma` — modèle `CompanySettings` (1:1, defaults facturation + compteurs facture/devis)
- `prisma/migrations/20260519165140_add_company/` — tables `Company` + `CompanySettings`

**Infra transactionnelle**
- `src/main/core/db-context.ts` — `DbContext` (AsyncLocalStorage) : getter `client` + `transaction(fn)` avec réutilisation des tx imbriquées

**Bundle Company (main)**
- `CompanyRepository` (standalone) — `get()` + `upsert(company, settings?)`
- `CompanySettingsRepository` — increment/reset des compteurs (logique reset annuel)
- `CompanyService` — `getCompany`, `saveCompany`, `getNextInvoiceNumber`/`getNextQuoteNumber` (service-to-service, non exposés IPC), `resetInvoiceCounter`/`resetQuoteCounter`
- `CompanySettingsService` — owns le settings repo
- `CompanyHandler` — `GET` / `SAVE` (validé) / `RESET_*` (validé)
- DI factories Company (2 repos + 2 services) + wire dans `AppDependencies`
- Preload `company.api.ts` exposé via `window.api.company`

**Shared layer**
- DTOs Company dans `src/shared/dtos/company/` (read DTOs en interfaces + save inputs en schémas Zod)
- `COMPANY_CHANNELS`, `CompanyAPI`, `SaveCompanyInputSchema` (nested company + settings)
- `src/shared/utils/format-number.ts` — formatage des tokens (fonction pure testée, partagée main + renderer)

**Frontend Angular**
- `services/company/company.ts` — `CompanyService` (wrapper `window.api.company` + signal)
- `stores/company/company-store.ts` — `CompanyStore` (load/save/reset + toast/erreur + état)
- `features/company/components/company-form/` — `CompanyForm` réutilisable (form 2 zones Identité/Facturation, validators EU, preview live, mapping form↔DTO, compteurs conditionnels via `showCounters`)
- `features/company/pages/company-settings/` — page thin `/settings/company` (chrome + orchestration store)
- `features/company/utils/company-form-validators.ts` — validators (TVA, format numéro avec token compteur, vat/zip/companyNumber par pays)
- i18n `i18n/ui/company/company.{fr,en}.ts`
- Route `settings/company` (`app-routes.const.ts` + `app.routes.ts`)
- Lien navbar ⚙️ câblé vers `/settings/company`

**Validation (Zod)**
- Schémas Zod sur tous les DTOs d'input (Client, Contact, Company) — types dérivés via `z.infer`
- `FindManyArgsSchema`, `IdSchema`, `CounterValueSchema`

### Modifié

- `ipcHandle()` — 2 overloads : `(channel, schema, fn)` valide puis ouvre la tx / `(channel, fn)` variadique sans validation. Wrappe systématiquement dans `dbContext.transaction()`.
- `toIpcError()` — `P2002` extrait dynamiquement le champ violé via `e.meta?.target` (plus de "email" hardcodé) + cas `ZodError`
- `t()` i18n — supporte l'interpolation `{{param}}`
- `BaseRepository` — prend un `DbContext` + un resolver de delegate (`db => db.client`) au lieu du `PrismaClient` direct ; accède à `dbContext.client[model]` à chaque appel
- Repos + DI Client/Contact — migrés vers `DbContext`
- `core/db.ts` — `initDbContext()` / `getDbContext()` remplacent `initDb()` / `getDb()`
- DTOs Client/Contact d'input convertis en schémas Zod (validation email, etc.)
- i18n : codes `UNIQUE_VIOLATION`, `VALIDATION_FAILED`, `COMPANY_NOT_CONFIGURED`

### Dépendances

- Ajout de `zod` `^4.4.3`

## [0.2.1] — 2026-05-18 — Refactor navigation

Refonte du chrome de navigation : la sidebar + topbar fixes sont remplacées
par une **navbar horizontale flottante** unique, et la zone de contenu vit
désormais dans une carte arrondie sur `bg-base`. Transitions de route en
fondu doux ajoutées en bonus.

### Décisions d'architecture

- **Navbar pill flottante unique** à la place du couple sidebar + topbar : brand à gauche, pill central avec boutons icon-only qui révèlent leur label au hover/active, actions settings + user à droite.
- **Suppression de `LayoutService`** : `sidebarCollapsed` et `titlePage` n'ont plus de raison d'être avec une navbar horizontale sans état persistant. Les callers (`Dashboard`, `ClientList`) sont nettoyés.
- **Shell flottant** : le contenu vit dans une seule carte arrondie posée sur `bg-base`, plus de chrome plein-écran.
- **Cross-fade entre routes** via `@angular/animations` (200 ms out + 250 ms in, en parallèle), zéro setup par page.
- **Preload de tous les lazy chunks** (`withPreloading`) : la première navigation reste fluide malgré le découpage en `loadComponent`.
- **`inlineCritical` désactivé** dans `angular.json` : l'astuce par défaut d'Angular (`media="print"` + `onload` inline sur le `<link>`) est bloquée par notre CSP `script-src` stricte, ce qui cassait silencieusement les règles CSS externes.

### Ajouté

- `src/renderer/src/app/layout/navbar/` — composant `Navbar` standalone (HTML + CSS + TS)
- `src/renderer/src/app/route.animations.ts` — trigger d'animation de routes partagé
- Clé i18n `nav.dashboard` (FR + EN)

### Modifié

- `app.config.ts` — `provideRouter(..., withPreloading(PreloadAllModules))` + `provideAnimations()`
- `app.html` / `app.ts` / `app.css` — shell réorganisé autour de la navbar + carte flottante, trigger d'animation câblé sur le `<router-outlet>`
- `angular.json` — `optimization.styles.inlineCritical: false`

### Supprimé

- `src/renderer/src/app/layout/sidebar/` (HTML + CSS + TS)
- `src/renderer/src/app/layout/topbar/` (HTML + CSS + TS)
- `src/renderer/src/app/services/layout/` (`LayoutService` + spec + barrel)

---

## [0.2.0] — 2026-05-18 — Phase 1 : Bundle Client

### Décisions d'architecture

- **TEXT + CHECK constraint** à la place des enums Prisma pour tous les champs à valeurs contraintes (ex: `type` sur `Client`).
  Raison : Prisma ne supporte pas les CHECK constraints dans le schéma (issue #3388 ouverte depuis 2020, toujours absente en v7). Les enums Prisma génèrent des `CREATE TYPE ... AS ENUM` sur PostgreSQL — difficiles à faire évoluer (`ALTER TYPE` limité). Un `String` + CHECK explicite dans la migration est identique sur SQLite et PG, et trivial à modifier. Les valeurs typées sont gérées côté TypeScript dans `src/shared/dtos/`.
- **Un fichier `.prisma` par modèle** (pas de regroupement) pour un historique git lisible et des migrations isolées.
- **Adresse éclatée** en 4 champs atomiques (`street`, `zipCode`, `city`, `country`) sur `Client` — nécessaire pour le formatage PDF des factures.
- **Champs PEPPOL** ajoutés sur `Client` (`vatNumber`, `peppolId`) pour anticiper la facturation électronique européenne (obligatoire B2G en Belgique depuis 2024).
- **`updatedAt @updatedAt`** ajouté sur les aggregate roots (pas sur les sub-entities sans cycle de vie propre).
- **Nommage en anglais** sur tous les modèles et champs Prisma pour cohérence avec le reste du code TypeScript.
- **Repository = Prisma types uniquement, Service = mapping vers DTO** — séparation stricte des couches.
- **`BaseService` sans mutations** — uniquement `toDto()` abstrait + helpers `mapMany`/`mapOne`. Les mutations restent dans chaque service pour éviter d'oublier la logique métier.
- **Pure Signal Store natif Angular** (zéro NgRx) — `@Injectable` avec signals privés + `asReadonly` + computed.
- **Stores séparés des services IPC** — analogie backend : services Angular = repositories (IPC), stores = services métier.
- **Path aliases `@app/*`** dans `tsconfig.json` pour éviter les `../../../../../`.
- **DTOs un fichier par schema** (`client.dto.ts`, `create-client.dto.ts`, `update-client.dto.ts`, etc.) pour discipline et lisibilité git.

### Ajouté

**Prisma**
- `prisma/schema/client.prisma` — modèle `Client` (TEXT+CHECK sur `type`, adresse atomique, PEPPOL fields, `createdAt`/`updatedAt`)
- `prisma/schema/contact.prisma` — modèle `Contact` (sub-entity de `Client`, `onDelete: Cascade`)
- `prisma/migrations/20260515155101_add_client/migration.sql` — tables `Client` + `Contact` + index unique email + CHECK `type IN ('INDIVIDUAL', 'COMPANY')` ajouté manuellement après `--create-only`

**Architecture main**
- `BaseRepository<T>` générique — `findById`, `findMany` (paginé + search via `searchFields` constructeur), `create`, `update`, `remove`, `isExist(field, value)`
- `ClientRepository` / `ContactRepository` — étendent `BaseRepository`, `searchFields` configurés au constructeur, méthodes spécifiques (`findByIdWithRelation`, `findByClientId`)
- `BaseService<TEntity, TDto>` — `toDto()` abstrait + `mapMany()` / `mapOne()` utilitaires, **pas de mutations**
- `ClientService` / `ContactService` — mapping Prisma → DTO via `toDto()`, `isExist` sur email avant `add`
- `ClientHandler` / `ContactHandler` — via `ipcHandle()` global, zéro try/catch
- `ipcHandle()` wrapper IPC — catch `AppError` + `PrismaClientKnownRequestError` (P2002/P2003/P2025) + erreurs inconnues, log via `LogService`, traduit via i18n main, retourne `IpcResponse<T>` = `{ data, error }`
- `AppError(code)` — base class pour erreurs métier, code traduit par i18n
- i18n main process : `src/main/i18n/errors.en.ts` / `errors.fr.ts` chargé via `app.getLocale()` au boot
- DI factories par entité + wire dans `bootstrap.ts`
- Preload `client.api.ts` / `contact.api.ts` exposés via `window.api.client` / `window.api.contact`

**Shared layer**
- DTOs un fichier par schema dans `src/shared/dtos/client/` (Client + Contact)
- `ClientType` const enum avec valeurs `INDIVIDUAL` / `COMPANY`
- `CLIENT_CHANNELS` / `CONTACT_CHANNELS` en TS enum dans `src/shared/channels/client/`
- `ClientAPI` / `ContactAPI` interfaces (contrat IPC) dans `src/shared/interfaces/client/`
- `IpcResponse<T>` + `FindManyArgs` + `PaginatedResult<T>` dans `src/shared/types/`

**Architecture Angular**
- Pure Signal Store : `ClientStore` + `ContactStore` dans `src/app/stores/client/` (Contact = sub-entity du domaine Client)
- Services IPC : `ClientService` + `ContactService` dans `src/app/services/client/` — wrappent `window.api.*` + signals locaux
- Feature : page unique `ClientList` (vue inbox/table switchable) — création/édition/contacts tout inline dans le panel droit
- Composants feature : `ClientForm`, `ContactForm`, `ContactList` (cards grid avec search local)
- Shared components : `Button`, `FormField`, `FormActions`, `StatusBadge`, `ConfirmDialog`, `DataTable` (générique avec sort), `DataTableHeader`, `InboxLayout` (master-detail), `SearchBar` (debounced), `PageHeader`, `Avatar` (initiales colorées hash-based), `Card`
- `TranslatePipe` (`pure: false`, name `t`) — réactif au switch de langue via signal `I18nService.locale`
- `I18nService` — imports statiques des fichiers de traduction (validation + UI common + client/contact), navigator.language fallback
- i18n : `src/app/i18n/validation/` (en/fr) + `src/app/i18n/ui/common.*` + `src/app/i18n/ui/client/client|contact.*`
- `AppRoutes` const avec `paths` (Angular router config) et `nav` (navigation) dérivés depuis une source unique — zéro magic string
- `NavItem` interface avec `icon: Type<unknown>` pour icons dynamiques via `ngComponentOutlet`
- Path aliases `@app/components|pipes|enums|interfaces|stores|services|core|i18n` dans `tsconfig.json` + `baseUrl: "."`
- `@lucide/angular` v2 — import individuel par composant, syntaxe `<svg lucideX />` directive-based (tree-shakable)
- Custom scrollbar (thin, accent au hover) en CSS global

**UI/UX**
- Vue **Inbox** (défaut) : panel gauche liste avec search top + bouton "+ Nouveau" sticky bottom, panel droit détail/edit inline
- Vue **Table** : data-table générique avec colonnes triables
- **Toolbar compacte** : search + view switch [☰/⊞] sur une ligne (plus de PageHeader)
- Édition client **inline dans la même vue** : les `<span>` deviennent `<input>` au clic Edit, layout identique
- Contacts en **cards grid** (`auto-fill` min 240px) avec search local et placeholders "Non défini" pour fields vides — toutes les cards de même hauteur
- Mailto/tel links cliquables sans déclencher l'edit
- Champs vides affichés en italique "Non défini" partout (cohérence visuelle)
- App shell `height: 100vh` + `overflow: hidden` → scroll confiné au router-outlet uniquement

### Modifié

- `ErrorService.handle()` accepte `unknown` au lieu de `Error | string` (TypeScript catch est `unknown` par défaut)
- `ConfirmDialog.visible` passé en `input()` contrôlé par le parent (au lieu de signal interne)
- Sidebar `NavItem.icon` accepte un `Type<unknown>` (composant Lucide) au lieu d'une string — rendu via `ngComponentOutlet`

### Supprimé

- `prisma/schema/_init.prisma` — stub remplacé par `client.prisma`
- `prisma/migrations/20260514181208_init/migration.sql` — migration stub initiale
- `ClientDetail` page séparée — tout le CRUD (create/edit/contacts) est désormais inline dans `ClientList` panel droit
- Route `/clients/:id` et `/clients/new` — plus de pages full-screen, le shell est l'inbox

---

## [0.1.0] — 2026-05-14 — Phase 0 : chrome Angular

Mise en place de l'infrastructure UI réutilisable pour les phases suivantes.
Aucune entité métier ici : tout sera ajouté à partir de Phase 1 (Client).

### Ajouté

**Layout & navigation**
- `App` shell : flex sidebar fixe + zone main scrollable + topbar fixe + toaster overlay
- `Sidebar` standalone collapsable (brand "Sole", footer version, modifier BEM `--collapsed`)
- `Topbar` standalone : titre dynamique consommant `LayoutService.titlePage()` + bouton burger pour collapse
- `Dashboard` placeholder (page routée `/`) pour Phase 11
- Routing standalone via `provideRouter` + `loadComponent` (lazy-loading)

**Services Angular**
- `LayoutService` : signals `titlePage` + `sidebarCollapsed` exposés en `asReadonly`, mutations via `setTitle()` / `toggleSidebar()` (pattern getter/setter strict)
- `ToastService` : queue UUIDv4, helpers `success` / `info` / `warning` / `error`, `Map<Uuid, TimerState>` pour pause/resume au hover sans perte de temps
- `ErrorService` : orchestrateur unique pour signaler une erreur — toast utilisateur + log fichier main process

**Toaster (composant overlay global)**
- Style : `backdrop-filter: blur(24px) saturate(180%)`, fonds translucides via `color-mix()`
- 5 positions via string enum (`top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-right`)
- Variant `--hero` (toast avec titre, plus large, plus ombré)
- Barre de progression animée en CSS, durée pilotée par CSS variable inline
- Pause au hover : `animation-play-state: paused` synchro avec `clearTimeout` côté service

**Theming**
- Palette **Catppuccin Mocha** en CSS custom properties (`--color-bg-base`, `--color-text`, `--color-success`, etc.)
- Variables de sizing partagées (`--sidebar-width`, `--topbar-height`, `--radius`, `--transition`)
- Reset CSS minimal dans `styles.css`

**Architecture renderer**
- `core/types/uuid.type.ts` — template literal type `${string}-${string}-${string}-${string}-${string}` aligné sur la signature de `crypto.randomUUID()`
- `core/handlers/global-error.handler.ts` — déplacé dans `handlers/`
- `enums/toast/` — string enums `TypeToast` et `PositionToast` (valeur = classe CSS, élimine la couche de mapping)
- `models/toast/` — interface `Toast` + `TimerState`
- Fichiers `index.ts` barrel exports par dossier

**Infra**
- `src/preload/tsconfig.json` créé (manquait au boilerplate, résout les imports `@shared/*` côté preload)
- `src/shared/interfaces/log.interface.ts` — `LogApi` extrait du renderer pour le rendre partageable
- `prisma/schema/_init.prisma` — modèle stub temporaire (à remplacer en Phase 1 par `client.prisma`)
- `app.commandLine.appendSwitch('ozone-platform-hint', 'auto')` pour Wayland natif sur Linux multi-DPI
- `sole.code-workspace` — workspace VS Code multi-root pour navigation séparée par sous-projet

### Modifié

- Fenêtre Electron : titre `Renderer` → `Sole` (dans `index.html`)
- Fichier SQLite : `app.db` → `sole.db` (dans `bootstrap.ts`)

### Supprimé

- Entité de référence `ping` du boilerplate :
  - `prisma/schema/ping.prisma`
  - `src/main/handlers/ping.handler.ts`
  - `src/main/services/ping.service.ts`
  - `src/main/repositories/ping.repository.ts`
  - `src/main/dependencies/ping.repository.dependency.ts`
  - `src/main/dependencies/ping.service.dependency.ts`
  - `src/preload/apis/ping.api.ts`
  - `src/shared/channels/ping.channels.ts`
  - `src/shared/interfaces/ping.dto.ts`
  - `src/shared/interfaces/ping.interface.ts`
  - `src/renderer/src/app/features/ping/`
  - `src/renderer/src/app/services/ping/`
- Migration initiale `20260511170536_init` (associée à l'entité `ping`)

---

[Unreleased]: https://github.com/ZekJulien/IETC-sole-crm/compare/v0.11.0...HEAD
[0.11.0]: https://github.com/ZekJulien/IETC-sole-crm/compare/v0.10.0...v0.11.0
[0.10.0]: https://github.com/ZekJulien/IETC-sole-crm/compare/v0.9.0...v0.10.0
[0.9.0]: https://github.com/ZekJulien/IETC-sole-crm/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/ZekJulien/IETC-sole-crm/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/ZekJulien/IETC-sole-crm/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/ZekJulien/IETC-sole-crm/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/ZekJulien/IETC-sole-crm/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/ZekJulien/IETC-sole-crm/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/ZekJulien/IETC-sole-crm/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/ZekJulien/IETC-sole-crm/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/ZekJulien/IETC-sole-crm/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/ZekJulien/IETC-sole-crm/releases/tag/v0.1.0
