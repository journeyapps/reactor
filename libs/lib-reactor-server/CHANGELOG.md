# @journeyapps/reactor-lib-server

## 2.1.1

### Patch Changes

- a824777: Update package dependencies, including support for MobX 7.
- Updated dependencies [a824777]
  - @journeyapps-labs/lib-reactor-utils@2.0.13

## 2.1.0

### Minor Changes

- 9f3ac40: Add deferred action validation so parameterized actions can resolve their inputs before final validation. Entity action context now flows through right-click menus and command-palette entity resolution, where unavailable candidates are validated live and disabled with validation metadata. Actions now support searchable full-name aliases and tags in the command palette, with discovery tags inferred from action behavior. Nested comboboxes now search flattened leaf items with breadcrumb labels while preserving hierarchical browsing when the query is empty.

  Allow deployments to configure the default Reactor root log level with the module-declared `REACTOR_LOG_LEVEL` environment variable. Reactor server modules now fail at startup when a declared public environment variable is missing, and the server/environment workflow is documented.

  Expand the Reactor developer documentation with dedicated subsystem guides for actions, entities, search and selection, controls, forms, settings and persistence, themes, workspaces, UI, and debugging. Built-in and demo actions now expose semantic tags in action entity presenters.

## 2.0.1

### Patch Changes

- 8cdce7d: Give each Reactor module its own hierarchical logger and replace the module lifecycle's raw IOC argument with distinct `ReactorModuleRegisterEvent` and `ReactorModuleInitEvent` values. Only the registration event exposes `registerStore()`, which registers a store through `System` and gives it a child of the module logger. Registered stores are initialized exactly once before module initialization begins.

  Replace explicit Editor store registration and initialization with the module-managed lifecycle.

  Split serializer behavior into `AbstractPersistedStore`; `AbstractStore` now contains only common store lifecycle, logging, readiness, and controls.

  Move all Reactor, Editor, and demo stores onto the shared store lifecycle and add hierarchical logging for registration, initialization, persistence, and key store operations.

  Add a `LoggerStore` registry with inherited INFO-level defaults and persisted per-logger overrides. A new Reactor debug module provides a searchable logging panel exposing the module, store, and action logger tree with effective levels, explicit inheritance controls, global level selection, isolation, and reset.

  Route Reactor, Editor, utility, data-layer, and Node server diagnostics through structured loggers with operationally meaningful levels and contextual payloads. Direct console output remains only where the console is the CLI interface or part of displayed example code.

- Updated dependencies [8cdce7d]
  - @journeyapps-labs/lib-reactor-utils@2.0.12

## 2.0.0

### Major Changes

- ad662fe: Modernize Reactor workspaces and module packaging.

  - Add the mobile Reactor shell, viewport-aware workspace rendering, workspace groups, and updated tab/header/workspace navigation APIs.
  - Export JSON path helpers from `module-editor` for locating Monaco JSON AST nodes by path.
  - Remove built-in server PWA/mobile middleware so apps can own static PWA assets and mobile routing themselves.
  - Make module builds fail when webpack reports errors, restore Terser minification compatibility, and move pnpm override maintenance into `pnpm-workspace.yaml`.
  - Declare missing direct dependencies, remove stale `@types/uuid` packages, and pin transitive dependency overrides for pnpm 11 compatibility.

### Patch Changes

- Updated dependencies [ad662fe]
  - @journeyapps-labs/lib-reactor-utils@2.0.11

## 1.1.12

### Patch Changes

- Updated dependencies [e7adc06]
  - @journeyapps-labs/lib-reactor-utils@2.0.10

## 1.1.11

### Patch Changes

- abd47fc: package bumps
- Updated dependencies [abd47fc]
  - @journeyapps-labs/lib-reactor-utils@2.0.9

## 1.1.10

### Patch Changes

- 2bea4b2: Bump all dependenciess
- Updated dependencies [2bea4b2]
  - @journeyapps-labs/lib-reactor-utils@2.0.8

## 1.1.9

### Patch Changes

- e6ff8ce: Bump all dependencies
- Updated dependencies [e6ff8ce]
  - @journeyapps-labs/lib-reactor-utils@2.0.7

## 1.1.8

### Patch Changes

- Updated dependencies [b691ff0]
  - @journeyapps-labs/lib-reactor-utils@2.0.6

## 1.1.7

### Patch Changes

- 2b3fd96: Bump all dependencies
- Updated dependencies [2b3fd96]
  - @journeyapps-labs/lib-reactor-utils@2.0.5

## 1.1.6

### Patch Changes

- 1bd2ef3: Bump all dependencies
- Updated dependencies [1bd2ef3]
  - @journeyapps-labs/lib-reactor-utils@2.0.4

## 1.1.5

### Patch Changes

- 49b70e1: Improve error message if module fails to load
- 49b70e1: - Date inputs can now accept null
  - Improved nested panel serialization checks
  - Date controls now respect date display options configured in Reactor
- 5eb207d: All deps upgraded

## 1.1.4

### Patch Changes

- Updated dependencies [cb8db2f]
  - @journeyapps-labs/lib-reactor-utils@2.0.3

## 1.1.3

### Patch Changes

- Updated dependencies [4596785]
  - @journeyapps-labs/lib-reactor-utils@2.0.2

## 1.1.2

### Patch Changes

- Updated dependencies [f4006d1]
  - @journeyapps-labs/lib-reactor-utils@2.0.1

## 1.1.1

### Patch Changes

- Updated dependencies [d38098f]
  - @journeyapps-labs/lib-reactor-utils@2.0.0

## 1.1.0

### Minor Changes

- e28a01e: export PWA constant
