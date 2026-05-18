# Changelog

Tous les changements notables de Sole sont documentés dans ce fichier.

Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
versionnage [SemVer](https://semver.org/lang/fr/).

---

## [Unreleased]

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

[Unreleased]: https://github.com/ZekJulien/IETC-sole-crm/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/ZekJulien/IETC-sole-crm/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/ZekJulien/IETC-sole-crm/releases/tag/v0.1.0
