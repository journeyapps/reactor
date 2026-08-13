---
title: Handlers and opening
description: Define what it means to open or select an entity.
---

# Handlers and opening

An entity handler defines what Reactor should do when a user opens an entity. This keeps trees, search results, cards, and selectors independent of [workspace placement](../workspaces-and-panels.md).

## The core behavior

Extend `EntityHandlerComponent` to define two things:

- `openEntity(event)`, which performs the behavior;
- `getDescription(entity)`, which describes that choice in UI.

The event includes the entity, pointer position, and action source. A definition may register several handlers. The `preferred` option marks a default, and workspace preferences can choose another handler where supported.

## Inline callback handlers

`InlineEntityHandlerComponent` is the direct callback derivative:

```ts
this.registerComponent(
  new InlineEntityHandlerComponent<TodoModel>({
    desc: { key: 'select-todo', label: 'Select todo' },
    cb: ({ entity }) => this.todoStore.setCurrent(entity)
  })
);
```

Use it for small behaviors that do not need to be reusable Reactor actions.

## Action-backed handlers

`EntityActionHandlerComponent` delegates opening to an `EntityAction`:

```ts
this.registerComponent(new EntityActionHandlerComponent(SetCurrentTodoItemAction.ID));
```

Use this derivative when opening should share [action](../actions-and-validation.md) validation, metadata, shortcuts, or invocation behavior. Reactor supplies the opened entity as `targetEntity`.

Opening is distinct from contextual actions. Register other applicable action IDs with `registerAdditionalAction()` on the definition.
