---
title: Application model
description: Reactor's kernel, boot lifecycle, modules, stores, and shared runtime.
---

# Application model

A Reactor application is a set of [modules](./modules-and-stores.md) installed into one kernel. The kernel coordinates registration and initialization; the `System` tracks shared stores and [entity definitions](./entity-definitions.md); the [workspace runtime](./workspaces-and-panels.md) renders the result.

:::note Mental model
Construction sets defaults. Registration tells Reactor what the modules provide. Initialization loads saved or remote data.
:::

## Boot sequence

Reactor boots in three phases:

1. **Construction** — modules and stores construct their initial synchronous state.
2. **Registration** — every module receives `ReactorModuleRegisterEvent`. Modules register stores, actions, panels, entities, themes, and settings.
3. **Initialization** — Reactor initializes all registered stores, then calls each module's `init()` method.

This ordering is intentional. Store constructors establish initial state. Registration allows stores and modules to discover one another. Store initialization performs deserialization and asynchronous boot work. Module initialization can then safely use ready stores and perform final startup behavior.

Reactor core renders the application during its module initialization. This means rendering happens after every store has initialized, while the root component itself is selected during registration.

:::warning Lifecycle note
A store constructor must leave the store safe to inspect. Other modules can discover it during registration before asynchronous initialization has completed.
:::

## Shared runtime

Modules communicate through services registered in Reactor's IOC container:

```ts
register({ ioc, registerStore }: ReactorModuleRegisterEvent) {
  const workspaceStore = ioc.get(WorkspaceStore);
  const actionStore = ioc.get(ActionStore);

  registerStore(MyStore, new MyStore());
  actionStore.registerAction(new MyAction());
  workspaceStore.registerFactory(new MyPanelFactory());
}
```

Avoid treating the IOC container as application state. It locates long-lived services; observable state belongs in stores and models.

:::tip Pro tip
Ask the container for shared stores, engines, and registries. Pass request-specific values through method arguments and action events.
:::

## The main concepts

- A [**module** and **store**](./modules-and-stores.md) define installation, state, service, and lifetime boundaries.
- An [**action**](./actions-and-validation.md) describes something the user can do.
- A [**panel**](./workspaces-and-panels.md) is UI that a workspace can place.
- An [**entity definition**](./entity-definitions.md) teaches Reactor about a domain object.
- A [**widget**](./ui-system.md) renders a shared interaction pattern.

These concepts are deliberately composable. For example, an entity definition can expose actions and panel factories; an action can be represented by several widgets; the same panel can appear in different workspace layouts.

## Go deeper

<div className="doc-links">
  <a href="./modules-and-stores">Implement modules and stores</a>
  <a href="../getting-started/architecture">See all three layers</a>
  <a href="../advanced/production-patterns">Scale the composition root</a>
</div>
