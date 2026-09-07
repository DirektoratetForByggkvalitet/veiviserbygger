# AGENTS.md

This file provides guidance to AI agents when working with code in this repository.

## What this is

A [losen](https://github.com/DirektoratetForByggkvalitet/losen)-compliant wizard builder: an editor for creating schema-driven, interactive wizards, plus a runtime that serves those wizards to end users. Firebase Firestore is the backend (wizard definitions + state), Firebase Storage holds uploaded images. A Node/Express API serves the compiled wizard schema (with Redis caching) and proxies storage access; the frontend is bundled and served via NGINX in production.

## Monorepo layout

npm workspaces + Turborepo (`turbo.json`). Root `npm run <script>` fans out via `turbo <script>` to every workspace that defines it.

- `apps/web` — Vite + React editor UI (the wizard builder itself) **and** the embeddable wizard runtime, built from the same source tree as two separate bundles (see "Two builds from one app" below).
- `apps/api` — Express API (esbuild-bundled) that reads wizard data from Firestore, transforms it into a `losen` runtime schema, and serves it with Redis caching.
- `apps/emulators` — Firebase Local Emulator Suite config (Auth, Firestore, Storage) for local dev. No app code.
- `packages/types` — Shared TypeScript types: the Firestore-editor data model (`Wizard`, `WizardVersion`, `PageContent` union, `Expression`, etc.) and the `Requests` type map describing every API route's request/response shape.
- `packages/shared` — Code shared between `web` and `api`: Firestore path/converter builders (`firestore.ts`), a `CustomError`/`respondWithError` pair (`error.ts`), misc helpers like `getOrdered`/`trimText`/`getStorageRefs` (`utils.ts`).
- `packages/eslint-config-custom` — Shared ESLint config (`custom`), extended by both apps' `.eslintrc`.

Workspace packages are imported by their `package.json` `name` (not relative paths), e.g. `import { respondWithError } from 'shared/error'`, `import { Requests } from 'types/requests'`. Check each package's `exports` map before assuming an import path exists.

## Commands

Run from the repo root unless noted. All fan out per-workspace via Turborepo.

```sh
npm install         # install once; also bootstraps husky pre-commit (runs `npm run lint`)
npm run dev          # turbo dev: starts web (vite), api (esbuild watch + nodemon), and the firebase emulators together
npm run build        # turbo build
npm run lint         # turbo lint: eslint + `prettier --check` per workspace
npm run test         # turbo test: jest per workspace
npm run test:watch   # turbo test -- --watch
```

Per-workspace (run inside `apps/web` or `apps/api`):

```sh
npm test -- <pattern>          # run a subset of jest tests, e.g. npm test -- rewrite.test.ts
npm run test:watch
npm run lint:fix               # web only: prettier --write (no eslint --fix script)
```

There is no top-level `lint:fix`; run it per workspace, or use each package's own prettier config.

Java JDK 11+ is required locally for the Firebase emulators (`apps/emulators`). `npm run dev` will fail to start the `emulators` workspace without it, but `web`/`api` still start.

### Releasing

`npm run release:patch|minor|major` — bumps root `package.json` version, commits, tags, and pushes (`--follow-tags`). Requires a clean working tree. A GitHub Actions pipeline then builds and pushes the Docker image on push to `main`.

## Architecture

### Firestore data model (`packages/types`, `packages/shared/firestore.ts`)

Wizard content is stored as a flat, normalized node graph, not a nested tree:

```
wizards/{wizardId}
  { title, publishedVersion: DocRef, draftVersion: DocRef, isTemplate }
wizards/{wizardId}/versions/{versionId}
  { title, pages: OrderedMap<Page|Result>, intro, publishedFrom, publishedTo }
wizards/{wizardId}/versions/{versionId}/nodes/{nodeId}
  { type: 'Text'|'Radio'|'Checkbox'|'Select'|'Input'|'Number'|'Sum'|'Table'|'Branch'|'Error'|'Information'|'Result', ... }
```

Pages and page content reference each other by Firestore `DocumentReference` (see `OrderedMap<{ node: DocumentReference }>` on `Page.content`, `Branch.content`, `Intro.content`). Consumers resolve these references by looking nodes up in the flat `nodes` map rather than following live Firestore refs — see `getCompleteWizard` (`apps/api/src/services/firestore/index.ts`), which fetches wizard + version + *all* nodes for a version in one pass and returns them keyed by id.

`packages/shared/firestore.ts` centralizes every Firestore collection/document path and its type-safe converter (`wizardsRef`, `wizardVersionRef`, `nodesRef`, ...) as `DataPoint<T>` objects. Both the client SDK (`apps/web/src/services/firebase/utils/db.ts`) and the admin SDK (`apps/api/src/services/firestore/utils.ts`) build on the *same* `DataPoint` definitions — add or change a Firestore path in `packages/shared/firestore.ts`, not in either app.

A wizard has a `draftVersion` (edited in the builder) and a `publishedVersion` (served to end users). Editing writes directly to Firestore from the browser (client SDK), gated by the Firestore security rules described in the README; the API only ever *reads*.

### API: schema compilation pipeline (`apps/api/src/utils/losen.ts`)

The API's core job is `transformWizardDataToLosen`: it takes the raw Firestore node graph from `getCompleteWizard` and compiles it into a `losen`-runtime `WizardDefinition` (the format the `losen` rendering engine and the embeddable wizard actually consume). Each stored node `type` has a corresponding `transform*` function (`transformRadio`, `transformBranch`, `transformTable`, ...). When adding a new page-content type, add its type to `PageContent` in `packages/types/index.ts` and add a matching transformer here — both sides need updating.

Notable behavior baked into this pipeline:
- `Branch` nodes with `preset: 'NegativeResult'` are special-cased into an inline error + short-circuit result page.
- Expressions (`Expression`/`SimpleExpression`/`ComplexExpression` in `packages/types`) are compiled into `losen`'s DSL format via `transformExpression`; `Checkbox`-field conditions get expanded into `field.optionId` boolean checks.
- Images referenced by relative storage paths get resolved to signed Firebase Storage URLs (`getImageUrl`), with an emulator-only fallback to public URLs since signed URLs aren't supported against the Storage emulator.
- Rich text (`text`/`heading` HTML) is cleaned and has embedded storage image references rewritten via `processHtml`.

`GET /wizard/:wizardId/:versionId?` (`apps/api/src/routes/wizard.ts`) serves the compiled schema. Requests without a `versionId` (i.e. the published version) are cached in Redis for 60s (`services/cache.ts`); requests for a specific `versionId` (drafts/preview) always recompute. Route request/response types are declared centrally in `packages/types/requests.ts` as `Requests['<path>']['<METHOD>']` and consumed by the route handler's generics — extend that map first when adding or changing an endpoint.

`DependencyContainer` (injected as `di`/`deps` throughout the API: `db`, `storage`, `redis`) is a global ambient type — check `apps/api/types/global.d.ts` before adding new dependencies rather than threading new params by hand.

### Web app: two builds from one source tree (`apps/web/vite.config.ts`)

`apps/web` produces two distinct bundles from the same `src/`:
- **Editor app** (default build): entry `index.html` → `src/main.tsx` → `App.tsx`. The full builder UI — login, wizard overview, the page/node editor, preview. Routing is in `App.tsx` (react-router). `EditableContext` is provided at the root so components can distinguish "being edited in the builder" from "being run standalone."
- **Embed bundle** (`BUILD_TARGET=embed npm run build:base`, entry `src/embed/main.tsx`): a standalone IIFE (`dist/embed.js`) meant to be dropped into third-party sites to render a single published wizard, with its own minimal state (`src/embed/store/state.tsx`) and API hooks (`src/embed/hooks/api.tsx`). It does not depend on Firebase client auth or the editor chrome. `npm run predev`/`build` copies the built `embed.js` into `public/` so the editor app can serve/link to it too.

Path alias `@` → `apps/web/src` (set in both `vite.config.ts` and `tsconfig.json`).

State management is deliberately split by purpose:
- **Jotai atoms** (`src/store/menu.ts`, `modal.ts`, `validate.ts`) — small, independent pieces of editor UI state (menu open/closed, active modal, validation flags).
- **Redux Toolkit** (`src/store/preview.ts`) — only used to host the `losen` package's own runtime state module (`state.reducer`/`state.NAME` from `losen`) when running a live wizard preview inside the builder. This is the same state shape the actual published wizard runtime uses.

`ConfigProvider` fetches `/config` from the API (feature flags/constants) before `FirebaseProvider` initializes the Firebase app — see the provider nesting in `main.tsx`. `FirebaseProvider`/`AuthContext` supports both standard Firebase Auth and an optional OIDC SSO provider (`loginWithOidc`), configured via the `PUBLIC_FIREBASE_AUTH_OIDC_*` env vars described in the README.

### Local dev environment

`npm run dev` starts three long-running processes in parallel via Turborepo: Vite dev server (`web`, proxies `/api/*` to the API per `vite.config.ts`), the API (esbuild watch + nodemon, `apps/api`), and the Firebase emulators (`apps/emulators`, Auth/Firestore/Storage — data persisted to `apps/emulators/data` and re-imported on next start). Default env vars for pointing at the emulators live in `apps/api/.env.development` / `apps/web/.env.development`; override locally via `apps/api/.env.local` (gitignored), never by editing the checked-in `.env.development` files.

## Testing

Jest per workspace (`apps/web`, `apps/api`), not orchestrated as a single root test runner beyond `turbo test`. `web` uses `ts-jest` with a `node` test environment and a jest.setup.js; `api` uses the same `ts-jest`/`node` setup via `jest.config.js`. Tests are colocated with source under `__tests__`/`__test__` directories (e.g. `apps/web/src/lib/__tests__/`, `apps/web/src/services/firebase/utils/__test__/`) rather than in a separate top-level test tree.
