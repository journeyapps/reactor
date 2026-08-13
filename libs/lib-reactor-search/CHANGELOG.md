# @journeyapps/reactor-lib-search

## 1.0.16

### Patch Changes

- 80649dd: Publish Reactor packages under the `@journeyapps` scope after moving the repository to the JourneyApps GitHub organization.
- Updated dependencies [80649dd]
  - @journeyapps/reactor-lib-utils@2.0.15

## 1.0.15

### Patch Changes

- 242f14d: Standardize imported TypeScript helpers and declare `tslib` as a runtime dependency wherever emitted JavaScript imports it.
- Updated dependencies [242f14d]
  - @journeyapps/reactor-lib-utils@2.0.14

## 1.0.14

### Patch Changes

- a824777: Update package dependencies, including support for MobX 7.
- Updated dependencies [a824777]
  - @journeyapps-labs/lib-reactor-utils@2.0.13

## 1.0.13

### Patch Changes

- Updated dependencies [8cdce7d]
  - @journeyapps-labs/lib-reactor-utils@2.0.12

## 1.0.12

### Patch Changes

- ad662fe: Modernize Reactor workspaces and module packaging.

  - Add the mobile Reactor shell, viewport-aware workspace rendering, workspace groups, and updated tab/header/workspace navigation APIs.
  - Export JSON path helpers from `module-editor` for locating Monaco JSON AST nodes by path.
  - Remove built-in server PWA/mobile middleware so apps can own static PWA assets and mobile routing themselves.
  - Make module builds fail when webpack reports errors, restore Terser minification compatibility, and move pnpm override maintenance into `pnpm-workspace.yaml`.
  - Declare missing direct dependencies, remove stale `@types/uuid` packages, and pin transitive dependency overrides for pnpm 11 compatibility.

- Updated dependencies [ad662fe]
  - @journeyapps-labs/lib-reactor-utils@2.0.11

## 1.0.11

### Patch Changes

- Updated dependencies [e7adc06]
  - @journeyapps-labs/lib-reactor-utils@2.0.10

## 1.0.10

### Patch Changes

- abd47fc: package bumps
- Updated dependencies [abd47fc]
  - @journeyapps-labs/lib-reactor-utils@2.0.9

## 1.0.9

### Patch Changes

- Updated dependencies [2bea4b2]
  - @journeyapps-labs/lib-reactor-utils@2.0.8

## 1.0.8

### Patch Changes

- Updated dependencies [e6ff8ce]
  - @journeyapps-labs/lib-reactor-utils@2.0.7

## 1.0.7

### Patch Changes

- Updated dependencies [b691ff0]
  - @journeyapps-labs/lib-reactor-utils@2.0.6

## 1.0.6

### Patch Changes

- Updated dependencies [2b3fd96]
  - @journeyapps-labs/lib-reactor-utils@2.0.5

## 1.0.5

### Patch Changes

- 1bd2ef3: Bump all dependencies
- Updated dependencies [1bd2ef3]
  - @journeyapps-labs/lib-reactor-utils@2.0.4

## 1.0.4

### Patch Changes

- Updated dependencies [cb8db2f]
  - @journeyapps-labs/lib-reactor-utils@2.0.3

## 1.0.3

### Patch Changes

- Updated dependencies [4596785]
  - @journeyapps-labs/lib-reactor-utils@2.0.2

## 1.0.2

### Patch Changes

- Updated dependencies [f4006d1]
  - @journeyapps-labs/lib-reactor-utils@2.0.1

## 1.0.1

### Patch Changes

- d38098f: Use common labs libs
- Updated dependencies [d38098f]
  - @journeyapps-labs/lib-reactor-utils@2.0.0
