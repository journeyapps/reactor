---
sidebar_position: 2
title: Local development
---

# Local development

This guide is for contributing to Reactor itself. To understand how the pieces compose before changing them, read [How Reactor fits together](./architecture.md).

## Requirements

- A supported Node.js release
- `pnpm` 11

The repository pins its pnpm version in the root `package.json`.

## Build the repository

```bash
pnpm install
pnpm build
```

`pnpm build` compiles TypeScript and builds every Reactor module bundle.

:::tip[Pro tip]
Run `pnpm build:ts` while iterating on framework types. Run the complete build before handing off changes that affect module bundling or the server.
:::

## Run the demos

```bash
pnpm demo:watch
```

The launcher asks which optional modules to include. Reactor core and the Monaco editor are always loaded. Reactor Debug is selected by default, and the playground automatically includes its Todo dependency.

Open [http://localhost:9527](http://localhost:9527) after the server starts.

Use `pnpm demo:start` for the same launcher without file watching.

## Run checks

```bash
pnpm build:ts
pnpm test
```

Individual packages can be tested or built with `pnpm --dir`, for example:

```bash
pnpm --dir modules/module-reactor test
pnpm --dir modules/module-reactor build:module
```

## Build the documentation

The documentation site expects the package declarations produced by the root TypeScript build.

```bash
pnpm build:ts
pnpm --dir docs build
```

For local documentation development:

```bash
pnpm --dir docs start
```

The static documentation build also regenerates API Markdown from package declarations.

:::warning[Generated content]
Do not edit `docs/docs/generated` directly. Improve exported TSDoc in the owning package and rebuild the site.
:::
