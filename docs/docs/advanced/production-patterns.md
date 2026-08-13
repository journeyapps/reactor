---
title: Production patterns
description: Structure large Reactor applications so features remain easy to find and change.
---

# Production patterns

These patterns keep large Reactor applications understandable. They appear at different scales in the Todo demo, Playground, data browsers, administration systems, and IDEs built with Reactor.

## Split features into modules

A [module](../subsystems/modules-and-stores.md) should install one related set of features:

- its stores and clients;
- entity definitions;
- actions;
- panel factories;
- settings;
- theme fragments;
- shell contributions;
- optional workspace generators.

Avoid a single product module that knows every entity and action. A small top-level module may select branding and product defaults, while feature modules register their own behavior.

:::tip Pro tip
Treat a module's `register()` method as its table of contents. If it is difficult to scan, move groups of registrations into clearly named functions or smaller modules.
:::

## Keep registration readable

Registration should describe what exists. Initialization should perform only work that requires every registered store to be ready.

```ts
register(event: ReactorModuleRegisterEvent) {
  event.registerStore(TodoStore, new TodoStore());
  event.ioc.get(System).registerDefinition(new TodoDefinition());
  event.ioc.get(ActionStore).registerAction(new CreateTodoAction());
}
```

See [Application model](../subsystems/application-model.md) for the lifecycle rules.

## Save data for the right user or app

Preferences and workspaces often belong to a user, account, document, or selected application. Give the store a serializer that reads and writes the correct record.

When the user, account, document, or app changes:

1. prevent stale external updates from applying;
2. switch the serializer or its key;
3. load the new saved data;
4. generate defaults only when no saved state exists;
5. ignore late responses for the previous selection.

:::warning Hidden complexity
Loading can finish out of order. Record which user, account, document, or app each request belongs to, and check it again before applying the result.
:::

## Let workspaces place panels

Features should produce panel models and ask `WorkspaceStore` to add them. The active layout engine can then:

- reuse a matching model;
- choose a tab group or tray;
- honor model affinity;
- activate the correct workspace;
- open a floating window;
- substitute fullscreen behavior on mobile.

Use [workspace preferred-open actions](../subsystems/workspaces-and-panels.md#workspace-groups-and-open-policy) when the same entity should open differently between workflows.

## Put availability rules on actions

Put permission and availability checks in [action validators](../subsystems/actions-and-validation.md#validation-states). Buttons, menus, batch operations, the command palette, and shortcuts will then agree.

Use:

- `DISABLED` when the action should be visible but unavailable;
- `HIDDEN` when it must not be exposed;
- `BLOCKED` when the user can activate a remediation path;
- `DEFERRED` when parameters are required before deciding;
- `PENDING` for a live asynchronous decision.

Do not repeat permission checks in individual widgets.

## Extend existing entity definitions

Domain models remain application-owned. Modules extend their [entity definitions](../subsystems/entity-definitions.md) with:

- additional describers or presenters;
- another search source;
- contextual actions;
- documentation links;
- theme overrides;
- descendant providers.

Before registering a second definition for the same data type, check whether you can add a component to the existing definition.

## Clean up listeners and late requests

For every listener, reaction, request, loader, or layer, identify:

- who creates it;
- how long it should live;
- which user, account, document, or app it belongs to;
- how it is canceled or disposed;
- what happens when completion arrives late.

Stores and models are natural lifetime boundaries. Widgets should own only subscriptions that exist because that widget is mounted.

:::warning Common pitfall
MobX makes observation easy; it does not make observation free. An autorun created by a long-lived store or entity component is effectively application-global until explicitly disposed.
:::

## Keep one implementation of each action

Buttons, menus, shortcuts, guides, drag-and-drop, and command-palette entries should call [actions](../subsystems/actions-and-validation.md). Tables, trees, cards, and pickers should use [entity definitions](../subsystems/entity-definitions.md) and [controls](../subsystems/controls.md).

Parallel execution paths eventually disagree about validation, logging, progress, or persistence.

## Version saved data

Do not casually change [panel types](../subsystems/workspaces-and-panels.md), [encoder versions](../subsystems/entity-definitions/encoding.md), or [setting IDs](../subsystems/settings-and-persistence.md): saved data refers to them. Migrate changed workspace shapes or deliberately replace unrecoverable data with a working default.

Document user-visible resets in release notes.

## Go deeper

<div className="doc-links">
  <a href="../getting-started/architecture">Architecture boundaries</a>
  <a href="../subsystems/modules-and-stores">Module lifecycle</a>
  <a href="../subsystems/workspaces-and-panels">Layout policy</a>
  <a href="../subsystems/actions-and-validation">Validation policy</a>
</div>
