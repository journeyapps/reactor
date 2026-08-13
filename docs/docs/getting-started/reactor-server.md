---
sidebar_position: 3
title: Reactor server and environment
---

# Reactor server and environment

Reactor modules are browser bundles, but they need a small server to select the modules for an application, serve their bundles, and generate the HTML that boots Reactor. `@journeyapps/reactor-lib-server` provides those building blocks for Express applications.

:::note Mental model
The server chooses and serves module bundles. The browser installs them. `reactor.config.json` tells both sides how to load a module.
:::

## Describe a module

Every module package has a `reactor.config.json` next to its `package.json`:

```json title="reactor.config.json"
{
  "name": "Example module",
  "slug": "example",
  "env": ["EXAMPLE_API_URL"]
}
```

- `name` is the human-readable module name used by server diagnostics.
- `slug` becomes the bundle route: `/module/example/bundle.js`.
- `env` is the allowlist of server environment variables exposed to browser code.
- `loader` can optionally provide a loading-screen fragment and background color.

Only declare values that are safe to send to the browser. Secrets such as service credentials must never appear in `env`.
The server throws during startup when a loaded module declares an environment variable that was not provided to `loadModules`.

:::warning Security boundary
Every declared module environment value becomes browser-readable configuration. An allowlist prevents accidental exposure only when applications avoid spreading `process.env` into `loadModules`.
:::

## Create an Express server

The following example loads module directories from `MODULES`, serves their bundles, and renders the Reactor entrypoint:

```ts title="src/index.ts"
import express from 'express';
import { createServer } from 'http';
import { join } from 'path';
import {
  createBaseIndexMiddleware,
  createModuleLoaderContentTransformer,
  loadModules,
  serveModules
} from '@journeyapps/reactor-lib-server';

const app = express();
const server = createServer(app);

const modules = loadModules({
  env: {
    MODULES: process.env.MODULES!.split(','),
    EXAMPLE_API_URL: process.env.EXAMPLE_API_URL,
    REACTOR_LOG_LEVEL: process.env.REACTOR_LOG_LEVEL || 'INFO'
  }
});

const moduleEnv = modules.reduce((env, module) => ({ ...env, ...module.getEnvs() }), {});

serveModules({ app, modules });

const index = await createBaseIndexMiddleware({
  title: 'My Reactor application',
  indexFile: join(require.resolve('@journeyapps/reactor-lib-server'), '../../media/index.html'),
  getEnv: () => moduleEnv,
  domTransform: ($) => createModuleLoaderContentTransformer($, modules),
  templateVars: {
    LOADER_BACKGROUND_COLOR: '#1d1d1d'
  }
});

app.get('*', index);
server.listen(Number(process.env.PORT || 9527));
```

The important distinction is:

- `loadModules({ env })` gives the server an explicit allowlist of public configuration values. Do not spread `process.env` into it.
- `module.getEnvs()` selects only the values declared by that module.
- `getEnv(request)` writes the selected values into `window.process.env`. Applications can merge additional public, request-specific data here; authentication is outside the Labs Reactor server.

Module code can then expose a typed view of its public environment:

```ts title="src/env.ts"
type ExampleEnv = {
  EXAMPLE_API_URL: string;
};

export const ENV = window.process.env as ExampleEnv;
```

## Environment variable reference

| Variable            | Used by                | Description                                                                                                                                                                         |
| ------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MODULES`           | Application server     | Comma-separated module directories or package names. Convert it to an array before calling `loadModules`.                                                                           |
| `PORT`              | Demo server convention | HTTP port. The Reactor server library does not choose a port itself.                                                                                                                |
| `NODE_ENV`          | Reactor server         | Added automatically to the browser environment by `createBaseIndexMiddleware`.                                                                                                      |
| `REACTOR_LOG_LEVEL` | Reactor core module    | Default browser root logger level. Accepts `OFF`, `ERROR`, `WARN`, `INFO`, or `DEBUG`. Supply `INFO` as the server default; invalid values also fall back to `INFO` in the browser. |

Each application module may declare additional variables in its own `reactor.config.json`.

## Logging precedence

`REACTOR_LOG_LEVEL` establishes the default for Reactor root loggers. Browser choices made in **Reactor debug: Logging** take precedence:

1. a logger-specific browser override;
2. the persisted browser global level;
3. `REACTOR_LOG_LEVEL`;
4. `INFO`.

This lets deployments choose a useful baseline while developers can temporarily isolate or increase logging without restarting the server.

## Go deeper

<div className="doc-links">
  <a href="./architecture">Browser runtime architecture</a>
  <a href="../subsystems/modules-and-stores">Module installation</a>
  <a href="../subsystems/logging-and-debugging">Browser diagnostics</a>
</div>
