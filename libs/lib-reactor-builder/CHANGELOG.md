# @journeyapps/reactor-lib-builder

## 3.1.3

### Patch Changes

- 80649dd: Publish Reactor packages under the `@journeyapps` scope after moving the repository to the JourneyApps GitHub organization.

## 3.1.2

### Patch Changes

- 242f14d: Standardize imported TypeScript helpers and declare `tslib` as a runtime dependency wherever emitted JavaScript imports it.

## 3.1.1

### Patch Changes

- a824777: Update package dependencies, including support for MobX 7.

## 3.1.0

### Minor Changes

- 6a9a58d: Add preferred entity handlers and an `EntityHandlerBank` for resolving a default handler.

  Pass the builder's webpack instance to module webpack configuration functions, so custom configurations can share the compiler instance used for builds.

## 3.0.3

### Patch Changes

- ad662fe: Modernize Reactor workspaces and module packaging.

  - Add the mobile Reactor shell, viewport-aware workspace rendering, workspace groups, and updated tab/header/workspace navigation APIs.
  - Export JSON path helpers from `module-editor` for locating Monaco JSON AST nodes by path.
  - Remove built-in server PWA/mobile middleware so apps can own static PWA assets and mobile routing themselves.
  - Make module builds fail when webpack reports errors, restore Terser minification compatibility, and move pnpm override maintenance into `pnpm-workspace.yaml`.
  - Declare missing direct dependencies, remove stale `@types/uuid` packages, and pin transitive dependency overrides for pnpm 11 compatibility.

## 3.0.2

### Patch Changes

- e7adc06: Bump deps

## 3.0.1

### Patch Changes

- 843f74d: Remove the custom symlink-preservation config from the TypeScript and webpack builds, and tighten exported typing for composite compilation.

  Improve built-in editor theme selection and active-line colors, add a tables playground demo, and refine table theming/rendering with explicit row, group, border, and pill styling tokens across the built-in Reactor themes.

## 3.0.0

### Major Changes

- 875fbb2: export react-dom/client

## 2.0.5

### Patch Changes

- abd47fc: package bumps

## 2.0.4

### Patch Changes

- 2bea4b2: Bump all dependenciess

## 2.0.3

### Patch Changes

- e6ff8ce: Bump all dependencies

## 2.0.2

### Patch Changes

- 2b3fd96: Bump all dependencies

## 2.0.1

### Patch Changes

- 1bd2ef3: Bump all dependencies

## 2.0.0

### Major Changes

- 5eb207d: UUID is no longer part of the exposed libraries because its busted in v13

### Patch Changes

- 5eb207d: All deps upgraded

## 1.0.5

### Patch Changes

- cb8db2f: - bump all dependencies
  - fix an issue where workspace constraint system may activate on an empty model causing an error
  - improve theme colors for table row buttons
  - update column display type to accept JSX.Element

## 1.0.4

### Patch Changes

- 4596785: Bump all dependencies

## 1.0.3

### Patch Changes

- f4006d1: Bumped dependencies

## 1.0.2

### Patch Changes

- e40a220: Add more libraries to the exported list

## 1.0.1

### Patch Changes

- f35c835: Improve core module name checks
