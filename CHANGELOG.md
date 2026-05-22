# Changelog

Tous les changements notables de Sole sont documentés dans ce fichier.

Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
versionnage [SemVer](https://semver.org/lang/fr/).

---

## [Unreleased]

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

[Unreleased]: https://github.com/ZekJulien/IETC-sole-crm/compare/v0.6.0...HEAD
[0.6.0]: https://github.com/ZekJulien/IETC-sole-crm/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/ZekJulien/IETC-sole-crm/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/ZekJulien/IETC-sole-crm/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/ZekJulien/IETC-sole-crm/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/ZekJulien/IETC-sole-crm/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/ZekJulien/IETC-sole-crm/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/ZekJulien/IETC-sole-crm/releases/tag/v0.1.0
