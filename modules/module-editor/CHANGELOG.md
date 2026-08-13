# @journeyapps/reactor-mod-editor

## 2.3.10

### Patch Changes

- a824777: Update package dependencies, including support for MobX 7.
- Updated dependencies [a824777]
  - @journeyapps-labs/lib-reactor-search@1.0.14
  - @journeyapps-labs/lib-reactor-utils@2.0.13
  - @journeyapps-labs/reactor-mod@8.1.2

## 2.3.9

### Patch Changes

- Updated dependencies [d757f3f]
  - @journeyapps-labs/reactor-mod@8.1.1

## 2.3.8

### Patch Changes

- Updated dependencies [9f3ac40]
  - @journeyapps-labs/reactor-mod@8.1.0

## 2.3.7

### Patch Changes

- 8cdce7d: Give each Reactor module its own hierarchical logger and replace the module lifecycle's raw IOC argument with distinct `ReactorModuleRegisterEvent` and `ReactorModuleInitEvent` values. Only the registration event exposes `registerStore()`, which registers a store through `System` and gives it a child of the module logger. Registered stores are initialized exactly once before module initialization begins.

  Replace explicit Editor store registration and initialization with the module-managed lifecycle.

  Split serializer behavior into `AbstractPersistedStore`; `AbstractStore` now contains only common store lifecycle, logging, readiness, and controls.

  Move all Reactor, Editor, and demo stores onto the shared store lifecycle and add hierarchical logging for registration, initialization, persistence, and key store operations.

  Add a `LoggerStore` registry with inherited INFO-level defaults and persisted per-logger overrides. A new Reactor debug module provides a searchable logging panel exposing the module, store, and action logger tree with effective levels, explicit inheritance controls, global level selection, isolation, and reset.

  Route Reactor, Editor, utility, data-layer, and Node server diagnostics through structured loggers with operationally meaningful levels and contextual payloads. Direct console output remains only where the console is the CLI interface or part of displayed example code.

- Updated dependencies [8cdce7d]
  - @journeyapps-labs/reactor-mod@8.0.0
  - @journeyapps-labs/lib-reactor-utils@2.0.12
  - @journeyapps-labs/lib-reactor-search@1.0.13

## 2.3.6

### Patch Changes

- Updated dependencies [d03a9f4]
- Updated dependencies [28cbbab]
  - @journeyapps-labs/reactor-mod@7.0.0

## 2.3.5

### Patch Changes

- Updated dependencies [214a4c7]
  - @journeyapps-labs/reactor-mod@6.2.1

## 2.3.4

### Patch Changes

- Updated dependencies [7138a52]
  - @journeyapps-labs/reactor-mod@6.2.0

## 2.3.3

### Patch Changes

- a454696: small api fixes
- Updated dependencies [a454696]
  - @journeyapps-labs/reactor-mod@6.1.2

## 2.3.2

### Patch Changes

- 3af4a4e: Fix issues with the workspace system by using the latest projectstorm react-workspaces packages
- Updated dependencies [3af4a4e]
  - @journeyapps-labs/reactor-mod@6.1.1

## 2.3.1

### Patch Changes

- Updated dependencies [6a9a58d]
  - @journeyapps-labs/reactor-mod@6.1.0

## 2.3.0

### Minor Changes

- ad662fe: Modernize Reactor workspaces and module packaging.

  - Add the mobile Reactor shell, viewport-aware workspace rendering, workspace groups, and updated tab/header/workspace navigation APIs.
  - Export JSON path helpers from `module-editor` for locating Monaco JSON AST nodes by path.
  - Remove built-in server PWA/mobile middleware so apps can own static PWA assets and mobile routing themselves.
  - Make module builds fail when webpack reports errors, restore Terser minification compatibility, and move pnpm override maintenance into `pnpm-workspace.yaml`.
  - Declare missing direct dependencies, remove stale `@types/uuid` packages, and pin transitive dependency overrides for pnpm 11 compatibility.

### Patch Changes

- Updated dependencies [1671610]
- Updated dependencies [ad662fe]
  - @journeyapps-labs/reactor-mod@6.0.0
  - @journeyapps-labs/lib-reactor-search@1.0.12
  - @journeyapps-labs/lib-reactor-utils@2.0.11

## 2.2.4

### Patch Changes

- Updated dependencies [5088953]
  - @journeyapps-labs/reactor-mod@5.6.0

## 2.2.3

### Patch Changes

- Updated dependencies [dfaf01d]
  - @journeyapps-labs/reactor-mod@5.5.0

## 2.2.2

### Patch Changes

- Updated dependencies [e7adc06]
- Updated dependencies [e7adc06]
  - @journeyapps-labs/lib-reactor-utils@2.0.10
  - @journeyapps-labs/reactor-mod@5.4.0
  - @journeyapps-labs/lib-reactor-search@1.0.11

## 2.2.1

### Patch Changes

- 843f74d: Remove the custom symlink-preservation config from the TypeScript and webpack builds, and tighten exported typing for composite compilation.

  Improve built-in editor theme selection and active-line colors, add a tables playground demo, and refine table theming/rendering with explicit row, group, border, and pill styling tokens across the built-in Reactor themes.

- Updated dependencies [843f74d]
  - @journeyapps-labs/reactor-mod@5.3.1

## 2.2.0

### Minor Changes

- 90369e2: Export react-dom/client

### Patch Changes

- Updated dependencies [90369e2]
  - @journeyapps-labs/reactor-mod@5.3.0

## 2.1.3

### Patch Changes

- Updated dependencies [875fbb2]
  - @journeyapps-labs/lib-reactor-builder@3.0.0
  - @journeyapps-labs/reactor-mod@5.2.1

## 2.1.2

### Patch Changes

- Updated dependencies [7a189d0]
  - @journeyapps-labs/reactor-mod@5.2.1

## 2.1.1

### Patch Changes

- Updated dependencies [aab22fb]
  - @journeyapps-labs/reactor-mod@5.2.0

## 2.1.0

### Minor Changes

- 8d89bbc: Polish tree rendering, command palette performance, color picker behavior, and editor suggest rendering integrations.
  - Tree rendering: move reactor node rendering through node-level `renderWidget(event, renderChild)` hooks, export tree child render types, and preserve custom wrappers (including entity DnD wrappers) when rendering and searching.
  - Command palette: reduce hover-driven rerenders by stabilizing category handlers and entry rendering (`PureComponent`/memoized entry wrappers), improving list interaction performance.
  - Color picker: refresh overlay styling to match theme inputs/buttons, add reset/close controls, improve layering behavior, and refine update flow for picker interactions.
  - Monaco/editor integration: add suggest renderer patch registration APIs, enable custom suggest icon/color transforms, and default inline suggest details on editor widgets while preserving consumer options.
  - Editor module setup: normalize editor layer manager initialization for module-editor activation.

### Patch Changes

- Updated dependencies [8d89bbc]
- Updated dependencies [19b76f8]
  - @journeyapps-labs/reactor-mod@5.1.0

## 2.0.2

### Patch Changes

- Updated dependencies [70533b4]
  - @journeyapps-labs/reactor-mod@5.0.2

## 2.0.1

### Patch Changes

- Updated dependencies [17f54d8]
  - @journeyapps-labs/reactor-mod@5.0.1

## 2.0.0

### Major Changes

- 53bb55b: Expanded built-in theming and completed major editor/core migration off deprecated systems.
  - Added a new built-in core theme: `Bunny` (purple-forward), including registration, module wiring, and exports.
  - Refined core dark-theme polish for `Reactor` and `JourneyApps` to improve surface hierarchy, readability, card/table integration, and accent consistency.
  - Continued `Reactor Light` comfort pass with better separator clarity, softened contrast, and improved metadata/tag readability.
  - Tuned card metadata/tag chip styling to be more theme-aware and less visually harsh across light/dark themes.
  - Made card selection emphasis theme-specific across built-ins so selected states follow each theme accent language (for example Scarlet red, Journey orange, Bunny purple) instead of a shared blue treatment.
  - Improved selected tree-row background consistency across built-in themes, including Reactor-specific behavior where selection fill should remain subtle/neutral.
  - Refined panel/search icon contrast in light mode (including search-history affordances and tray glyph balance) for clearer visibility without reintroducing harsh saturation.
  - Polished status-card presentation in Reactor-family themes with better surface/background pairing and clearer border separation.
  - Improved table row striping behavior so even/odd row backgrounds are consistently rendered and easier to scan.
  - Reduced divider/separator intensity on key cards and settings surfaces so section boundaries read clearly without overpowering content.
  - Added safer theme-fragment resolution fallback logic to avoid hard runtime failures when a fragment lacks a requested theme key.
  - Added editor theme coupling for `Bunny` and guarded editor theme sync paths to avoid undefined selection/serialization regressions.
  - Updated action retrieval helpers in editor/demo/core touchpoints to use `ActionStore` directly.

  Breaking/migration notes:
  - Replaced editor theme provider workflow with entity-definition workflow (`EditorThemeEntityDefinition`) and migrated editor theme selection setting from `ProviderControl` to `EntitySetting`.
  - Removed legacy `EditorThemeProvider` usage and registration in editor module bootstrap.

- a96420d: Modernized core entity/action internals and removed deprecated provider + legacy DnD surfaces.
  - Added and expanded entity card presentation support, including richer describer-driven metadata rendering (`tags`, structured `labels`, and icon usage in cards).
  - Extended the describer API surface:
    - `EntityDescription.tags?: string[]` for lightweight chip-style classification.
    - `EntityDescription.labels?: EntityLabel[]` for structured key/value metadata rendering.
    - `EntityLabel` metadata now supports visual semantics (`color`, `colorForeground`, `tooltip`, `active`) and inline icon descriptors (`name`, `color`, `spin`).
  - Improved tree/card presenter UX parity with clearer empty states and search-result handling for entity collections.
  - Refined searchable tree result plumbing to report concrete matched entities, improving determinism and simplifying no-result checks.
  - Fixed searchable tree highlight lifecycle regressions (including nested tree/card contexts) to prevent initial match flicker/flash-out in active searches.
  - Stabilized tree collection rendering updates to avoid unnecessary node regeneration during search-driven rerenders.
  - Corrected deferred-force-update behavior used by tree widgets to prevent duplicate immediate+deferred update paths.
  - Refactored `EntityDefinition` to use explicit component banks per concern instead of a single mixed component collection.
  - Added reusable bank abstractions (`ComponentBank`, `PreferredSetBank`) and extracted concern-specific banks (`EntityEncoderBank`, `EntitySearchBank`).
  - Improved preferred describer preference behavior using `SetSetting`-backed controls and cleaner per-definition setting integration.
  - Reduced bank API indirection by standardizing on `getItems()`/`getPreferred()` usage.
  - Improved Reactor initialization ordering to reduce startup races across workspace, prefs, and UX store setup.
  - Fixed input-dialog initial value propagation so provided defaults are shown correctly.
  - Fixed `ArrayInput` initialization so initial values render immediately (without needing extra user interaction).
  - Improved dialog module imports to avoid root barrel coupling in dialog widget internals.
  - Fixed card presenter overflow/bleed issues so nested tree content is clipped correctly within card bounds.
  - Improved metadata/tag readability in card presenter output:
    - metadata icon colors now follow theme-aware foreground defaults more consistently.
    - tag chip styling was tuned to be less harsh while preserving contrast and readability.
  - Refined built-in theme card borders across Reactor/Scarlet/Oxide/Journey and improved Reactor Light hierarchy/contrast balance for clearer panel/tray/header boundaries.
  - Overhauled the Reactor Light theme palette to be easier on the eyes while improving structural clarity (surfaces, separators, metadata readability, and card/tag presentation).
  - Fixed a tree-search clear regression where stale text matches could persist until hover, by ensuring tree leaf/node widgets perform a post-listener-registration refresh.

  Breaking/migration notes:
  - Removed deprecated provider-based flows from core/editor paths and migrated key selections to entity definitions (`Workspace`, `EditorTheme`).
  - `System` is no longer the action access surface in active code paths; action lookup/registration now goes through `ActionStore`.
  - Migrated remaining legacy drag/drop integrations in active widget paths to `dnd3` hooks (`useDraggableEntity` / `useDraggableRaw`), and removed old `dnd`/`dnd2` usage from migrated surfaces.
  - Updated built-in and demo/editor module wiring to register and resolve actions through `ActionStore` instead of legacy `System` action helpers.

### Patch Changes

- abd47fc: package bumps
- Updated dependencies [53bb55b]
- Updated dependencies [a96420d]
- Updated dependencies [489e215]
- Updated dependencies [9fcd0a4]
- Updated dependencies [abd47fc]
  - @journeyapps-labs/reactor-mod@5.0.0
  - @journeyapps-labs/lib-reactor-builder@2.0.5
  - @journeyapps-labs/lib-reactor-utils@2.0.9
  - @journeyapps-labs/lib-reactor-search@1.0.10

## 1.1.15

### Patch Changes

- 2bea4b2: Bump all dependenciess
- Updated dependencies [2bea4b2]
- Updated dependencies [2bea4b2]
  - @journeyapps-labs/reactor-mod@4.0.2
  - @journeyapps-labs/lib-reactor-builder@2.0.4
  - @journeyapps-labs/lib-reactor-utils@2.0.8
  - @journeyapps-labs/lib-reactor-search@1.0.9

## 1.1.14

### Patch Changes

- e6ff8ce: Bump all dependencies
- Updated dependencies [e6ff8ce]
  - @journeyapps-labs/lib-reactor-builder@2.0.3
  - @journeyapps-labs/lib-reactor-utils@2.0.7
  - @journeyapps-labs/reactor-mod@4.0.1
  - @journeyapps-labs/lib-reactor-search@1.0.8

## 1.1.13

### Patch Changes

- Updated dependencies [0b471b5]
  - @journeyapps-labs/reactor-mod@4.0.0

## 1.1.12

### Patch Changes

- 110fe9c: Fixed Monaco editor refocus on cmd pallete closure

## 1.1.11

### Patch Changes

- Updated dependencies [7f06677]
  - @journeyapps-labs/reactor-mod@3.0.3

## 1.1.10

### Patch Changes

- Updated dependencies [9fe67f3]
  - @journeyapps-labs/reactor-mod@3.0.2

## 1.1.9

### Patch Changes

- b691ff0: Fix issues with module-editor due to new monaco changes
- Updated dependencies [b691ff0]
  - @journeyapps-labs/lib-reactor-utils@2.0.6
  - @journeyapps-labs/reactor-mod@3.0.1
  - @journeyapps-labs/lib-reactor-search@1.0.7

## 1.1.8

### Patch Changes

- 2b3fd96: Bump all dependencies
- d948a53: react-dom needs to be a dependency
- Updated dependencies [2b3fd96]
- Updated dependencies [2b3fd96]
- Updated dependencies [2b3fd96]
  - @journeyapps-labs/lib-reactor-builder@2.0.2
  - @journeyapps-labs/lib-reactor-utils@2.0.5
  - @journeyapps-labs/reactor-mod@3.0.0
  - @journeyapps-labs/lib-reactor-search@1.0.6

## 1.1.7

### Patch Changes

- Updated dependencies [9f8ab19]
  - @journeyapps-labs/reactor-mod@2.1.1

## 1.1.6

### Patch Changes

- 1bd2ef3: Bump all dependencies
- Updated dependencies [6ab9986]
- Updated dependencies [1bd2ef3]
  - @journeyapps-labs/reactor-mod@2.1.0
  - @journeyapps-labs/lib-reactor-builder@2.0.1
  - @journeyapps-labs/lib-reactor-search@1.0.5
  - @journeyapps-labs/lib-reactor-utils@2.0.4

## 1.1.5

### Patch Changes

- 5eb207d: All deps upgraded
- Updated dependencies [5eb207d]
- Updated dependencies [49b70e1]
- Updated dependencies [5eb207d]
  - @journeyapps-labs/lib-reactor-builder@2.0.0
  - @journeyapps-labs/reactor-mod@2.0.0

## 1.1.4

### Patch Changes

- cb8db2f: - bump all dependencies
  - fix an issue where workspace constraint system may activate on an empty model causing an error
  - improve theme colors for table row buttons
  - update column display type to accept JSX.Element
- Updated dependencies [cb8db2f]
  - @journeyapps-labs/lib-reactor-builder@1.0.5
  - @journeyapps-labs/lib-reactor-utils@2.0.3
  - @journeyapps-labs/reactor-mod@1.2.3
  - @journeyapps-labs/lib-reactor-search@1.0.4

## 1.1.3

### Patch Changes

- 4596785: Bump all dependencies
- Updated dependencies [4596785]
- Updated dependencies [4596785]
  - @journeyapps-labs/reactor-mod@1.2.2
  - @journeyapps-labs/lib-reactor-builder@1.0.4
  - @journeyapps-labs/lib-reactor-utils@2.0.2
  - @journeyapps-labs/lib-reactor-search@1.0.3

## 1.1.2

### Patch Changes

- Updated dependencies [26c9fad]
  - @journeyapps-labs/reactor-mod@1.2.1

## 1.1.1

### Patch Changes

- f4006d1: Bumped dependencies
- Updated dependencies [0612bc5]
- Updated dependencies [f4006d1]
  - @journeyapps-labs/reactor-mod@1.2.0
  - @journeyapps-labs/lib-reactor-builder@1.0.3
  - @journeyapps-labs/lib-reactor-utils@2.0.1
  - @journeyapps-labs/lib-reactor-search@1.0.2

## 1.1.0

### Minor Changes

- e2b847d: Expose commonly used monaco internals

## 1.0.5

### Patch Changes

- 6eb16b2: Also export react-monaco-editor to prevent duplicate monaco-editor includes

## 1.0.4

### Patch Changes

- Updated dependencies [e40a220]
  - @journeyapps-labs/lib-reactor-builder@1.0.2
  - @journeyapps-labs/reactor-mod@1.1.1

## 1.0.3

### Patch Changes

- d38098f: use new labs common libs\
- Updated dependencies [d38098f]
- Updated dependencies [d38098f]
- Updated dependencies [d38098f]
  - @journeyapps-labs/lib-reactor-search@1.0.1
  - @journeyapps-labs/reactor-mod@1.1.0
  - @journeyapps-labs/lib-reactor-utils@2.0.0

## 1.0.2

### Patch Changes

- Updated dependencies [f35c835]
  - @journeyapps-labs/lib-reactor-builder@1.0.1
  - @journeyapps-labs/reactor-mod@1.0.1

## 1.0.1

### Patch Changes

- 46d4bf9: Fix an issue with the react version not matching the react-dom version
- Updated dependencies [46d4bf9]
  - @journeyapps-labs/reactor-mod@1.0.1
