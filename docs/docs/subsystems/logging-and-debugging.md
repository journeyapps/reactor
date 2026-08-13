---
title: Logging and debugging
description: Use hierarchical logging and the Reactor Debug module.
---

# Logging and debugging

Reactor uses hierarchical loggers. A module owns a root logger; registered stores inherit a child logger; registered actions inherit from `ActionStore`. This produces names such as:

```text
Reactor core:Workspace
Reactor core:Actions:Create workspace
Monaco editor:Monaco
```

## Log from modules and stores

Modules can use their logger directly:

```ts
this.logger.info('Todo store ready', { count: this.todos.length });
```

Stores receive a public `logger` when registered:

```ts
this.logger.debug('Refreshing todos', { currentCount: this.todos.length });
this.logger.warn('Todo metadata is incomplete', todo.id);
this.logger.error('Failed to refresh todos', error);
```

Choose levels by what the message means:

- `DEBUG` for detailed execution and state transitions.
- `INFO` for meaningful lifecycle or user-visible operations.
- `WARN` for degraded behavior Reactor can recover from.
- `ERROR` for failed operations requiring investigation.

Use structured arguments instead of building one large string. Color tokens remain compatible with browser and Node transports:

```ts
logger.info('Import complete', Log.green('success'), { imported: count });
```

## Reactor Debug module

Install `@journeyapps/reactor-mod-debug` as an application module to add the **Reactor debug: Logging** panel.

The panel can:

- search the logger hierarchy;
- change the global level;
- override one logger's level;
- isolate a logger and its children;
- reset individual overrides back to inheritance.

Configuration is applied immediately and persisted in browser local storage. Resetting preserves the selected global level.

The demo launcher lists Reactor Debug as an optional module and selects it by default.

:::tip Pro tip
Name loggers after stores, groups of actions, or subsystems rather than component instances. A developer can then isolate a useful part of the application.
:::

:::warning Common pitfall
Do not log credentials, tokens, or private entity payloads. Browser logs and persisted diagnostic choices are user-accessible application state.
:::

## Go deeper

<div className="doc-links">
  <a href="./modules-and-stores">Store lifecycle</a>
  <a href="../runtime/operational-feedback">User-facing status</a>
  <a href="../getting-started/reactor-server">Deployment log levels</a>
</div>
