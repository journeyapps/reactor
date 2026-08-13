---
sidebar_position: 2
title: How Reactor fits together
description: Understand how Reactor starts modules and turns their features into UI.
---

# How Reactor fits together

Reactor has three layers. Knowing what belongs in each one makes a large application easier to change.

:::note Mental model
The kernel starts the application. Modules register features. Runtime services turn those features into UI.
:::

## 1. Application kernel

The kernel owns boot order and the shared IOC container:

1. modules and stores construct usable synchronous state;
2. modules register stores and features;
3. Reactor initializes all registered stores;
4. modules perform final initialization.

Stores own state and services. The IOC container locates those long-lived objects; it is not itself an application-state model.

Read [Application model](../subsystems/application-model.md) for the boot sequence and [Modules and stores](../subsystems/modules-and-stores.md) for implementation guidance.

## 2. App concepts

This layer describes the important things in your application:

- an [**action**](../subsystems/actions-and-validation.md) says what the user can do;
- an [**entity definition**](../subsystems/entity-definitions.md) describes one kind of object;
- a [**control**](../subsystems/controls.md) adapts behavior or a value to several surfaces;
- a [**form**](../subsystems/forms.md) names and validates inputs;
- a [**setting**](../subsystems/settings-and-persistence.md) saves one user choice;
- a [**search engine**](../subsystems/search-selection-and-command-palette.md) exposes selectable or activatable results.

These objects are not tied to one screen. A single entity definition can provide names, search, trees, cards, saved references, child objects, open actions, documentation, and generated panels.

:::tip Pro tip
Add behavior to the existing definition or action instead of teaching another widget about your model. Other Reactor UI can then reuse it.
:::

Start with [Actions and validation](../subsystems/actions-and-validation.md) and [Entity definitions](../subsystems/entity-definitions.md).

## 3. UI runtime

The runtime turns registered features into an application:

- [workspaces](../subsystems/workspaces-and-panels.md) decide where panels appear and persist;
- layout engines adapt placement policy;
- [layers](../runtime/interaction-layers.md) host dialogs, combo boxes, overlays, and guides;
- shortcuts and the [command palette](../subsystems/search-selection-and-command-palette.md) run registered actions;
- the [Visor and notifications](../runtime/operational-feedback.md) communicate status;
- the [media engine](../advanced/media-engine.md) maps content types to panels;
- [responsive behavior](../runtime/responsive-applications.md) adapts placement and controls.

Feature modules can open an entity, show a dialog, or run an action without owning the whole application shell.

Read [Application shell](../runtime/application-shell.md) and [Workspaces and panels](../subsystems/workspaces-and-panels.md) next.

## One example across all three layers

Suppose a user runs an entity action from the command palette:

1. The command palette discovers the registered action by name, alias, or tag.
2. A parameter asks the target entity definition for candidates.
3. Each candidate is inserted into a partial action event and validated.
4. Reactor resolves the remaining parameters and executes the action.
5. The action can report progress through its status directive.
6. An entity handler can translate the result into a panel model.
7. The active layout engine chooses where that model appears.

The command palette does not need to know where entities are stored. The search does not need to know who asked for the value. The action does not need to know how panels are arranged.

:::note Hidden complexity
This is why the same action works from a tree menu, toolbar, shortcut, guide, or command palette.
:::

## Ownership rules

Use these boundaries when deciding where new behavior belongs:

| Concern                                      | Owner                       |
| -------------------------------------------- | --------------------------- |
| Observable domain or service state           | Store or application model  |
| Something the user can do                    | Action                      |
| How Reactor works with an object             | Entity definition           |
| A mutable value with several representations | Control                     |
| Named input and validation                   | Form input                  |
| Persistent user choice                       | Setting                     |
| Serializable rendered workspace state        | Panel model                 |
| Panel construction and rendering             | Panel factory               |
| Where opened content appears                 | Layout engine and workspace |
| Dialogs, menus, and overlays                 | Layer/directive system      |
| Long-running operation feedback              | Action status or Visor      |

:::warning Common pitfall
Do not put application behavior in a React widget only because that widget needs it first. If it may later appear in a menu, shortcut, guide, or command palette, make it an action.
:::

## Go deeper

<div className="doc-links">
  <a href="../subsystems/application-model">Boot and shared runtime</a>
  <a href="../subsystems/entity-definitions">Working with application data</a>
  <a href="../subsystems/workspaces-and-panels">Panels and saved layouts</a>
  <a href="../advanced/production-patterns">Patterns for large applications</a>
</div>
