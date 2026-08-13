---
title: Presentation and panels
description: Present collections of entities and expose them as workspace panels.
---

# Presentation and panels

A presenter turns a collection of domain entities into reusable UI state. A [workspace panel](../workspaces-and-panels.md) can supply the collection and let one of the definition's presenters render it.

## The core presenter behavior

`EntityPresenterComponent` is the base abstraction. It identifies a render type, has a user-facing label, and generates a presenter context. The context owns the state used while a collection is being rendered.

Implement the base class when adding a new presentation family. Most applications should use one of the built-in derivatives.

## Tree presenters

`EntityTreePresenterComponent` specializes the presenter contract for [tree-based content](../ui-system.md#tree-based-content). It adds search scope, lazy [descendant](./descendants.md) loading, tag and metadata display, and sorting.

`InlineTreePresenterComponent` is the concrete convenience implementation:

```ts
this.registerComponent(
  new InlineTreePresenterComponent<TodoModel>({
    label: 'Todo tree',
    loadChildrenAsNodesAreOpened: true,
    cacheTreeEntities: true
  })
);
```

Use it when the normal entity-tree behavior is sufficient. Extend `EntityTreePresenterComponent` when the definition needs a custom presenter context or node-generation strategy.

## Card presenters

`EntityCardsPresenterComponent` is the built-in card derivative. It uses the definition's descriptions and descendant providers to produce card-oriented content:

```ts
this.registerComponent(new EntityCardsPresenterComponent<TodoModel>());
```

## Generate a workspace panel

`EntityPanelComponent` is a separate behavior that connects a collection of entities to the definition's registered presenters:

```ts
this.registerComponent(
  new EntityPanelComponent<TodoModel>({
    label: 'Todos',
    getEntities: () => this.todoStore.rootTodos
  })
);
```

The component generates a panel factory, so the domain module does not need to build separate tree and card panels. Use `defaultPresenter` when the definition has several presenters and one should be selected initially.

For the lower-level tree widgets and models used by presenters, see [Tree-based content](../ui-system.md#tree-based-content).
