# Changelog

Tous les changements notables de Sole sont documentés dans ce fichier.

Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/),
versionnage [SemVer](https://semver.org/lang/fr/).

---

## [Unreleased]

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

[Unreleased]: https://github.com/ZekJulien/IETC-sole-crm/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/ZekJulien/IETC-sole-crm/releases/tag/v0.1.0
