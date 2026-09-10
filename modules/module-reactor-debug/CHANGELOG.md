# @journeyapps/reactor-mod-debug

## 0.2.9

### Patch Changes

- 1c31a98: Update React and React DOM to 19.3.0 with matching TypeScript definitions. Update cronstrue in Reactor core and JSZip in the editor module.
- Updated dependencies [ec60ac0]
- Updated dependencies [1c31a98]
  - @journeyapps/reactor-mod@8.2.0

## 0.2.8

### Patch Changes

- Updated dependencies [70a6ef7]
- Updated dependencies [70a6ef7]
  - @journeyapps/reactor-mod@8.1.7

## 0.2.7

### Patch Changes

- 93dc52c: Explicitly include compiled JavaScript, TypeScript declarations, and runtime assets in published packages. This fixes missing build files when packing with pnpm 12.
- Updated dependencies [93dc52c]
  - @journeyapps/reactor-lib-search@1.0.18
  - @journeyapps/reactor-mod@8.1.6

## 0.2.6

### Patch Changes

- d941ef6: Use the public @journeyapps common packages in dependency declarations, imports, and shared bundle externals.
- Updated dependencies [d941ef6]
  - @journeyapps/reactor-lib-search@1.0.17
  - @journeyapps/reactor-mod@8.1.5

## 0.2.5

### Patch Changes

- 80649dd: Publish Reactor packages under the `@journeyapps` scope after moving the repository to the JourneyApps GitHub organization.
- Updated dependencies [80649dd]
  - @journeyapps/reactor-lib-search@1.0.16
  - @journeyapps/reactor-mod@8.1.4

## 0.2.4

### Patch Changes

- 242f14d: Standardize imported TypeScript helpers and declare `tslib` as a runtime dependency wherever emitted JavaScript imports it.
- Updated dependencies [d84d25d]
- Updated dependencies [242f14d]
  - @journeyapps/reactor-mod@8.1.3
  - @journeyapps/reactor-lib-search@1.0.15

## 0.2.3

### Patch Changes

- a824777: Update package dependencies, including support for MobX 7.
- Updated dependencies [a824777]
  - @journeyapps-labs/lib-reactor-search@1.0.14
  - @journeyapps-labs/reactor-mod@8.1.2

## 0.2.2

### Patch Changes

- Updated dependencies [d757f3f]
  - @journeyapps-labs/reactor-mod@8.1.1

## 0.2.1

### Patch Changes

- Updated dependencies [9f3ac40]
  - @journeyapps-labs/reactor-mod@8.1.0

## 0.2.0

### Minor Changes

- 8cdce7d: Give each Reactor module its own hierarchical logger and replace the module lifecycle's raw IOC argument with distinct `ReactorModuleRegisterEvent` and `ReactorModuleInitEvent` values. Only the registration event exposes `registerStore()`, which registers a store through `System` and gives it a child of the module logger. Registered stores are initialized exactly once before module initialization begins.

  Replace explicit Editor store registration and initialization with the module-managed lifecycle.

  Split serializer behavior into `AbstractPersistedStore`; `AbstractStore` now contains only common store lifecycle, logging, readiness, and controls.

  Move all Reactor, Editor, and demo stores onto the shared store lifecycle and add hierarchical logging for registration, initialization, persistence, and key store operations.

  Add a `LoggerStore` registry with inherited INFO-level defaults and persisted per-logger overrides. A new Reactor debug module provides a searchable logging panel exposing the module, store, and action logger tree with effective levels, explicit inheritance controls, global level selection, isolation, and reset.

  Route Reactor, Editor, utility, data-layer, and Node server diagnostics through structured loggers with operationally meaningful levels and contextual payloads. Direct console output remains only where the console is the CLI interface or part of displayed example code.

### Patch Changes

- Updated dependencies [8cdce7d]
  - @journeyapps-labs/reactor-mod@8.0.0
  - @journeyapps-labs/lib-reactor-search@1.0.13
