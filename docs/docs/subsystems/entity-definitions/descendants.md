---
title: Descendants
description: Describe relationships that entity presenters can traverse.
---

# Descendants

A descendant provider tells Reactor that one entity exposes other entities. [Presenters](./presentation-and-panels.md) traverse the relationship while each child's [definition](../entity-definitions.md) controls its rendering.

## The core relationship

Start with `DescendantEntityProviderComponent`. It identifies the descendant definition and synchronously generates the current descendants for a parent:

```ts
this.registerComponent(
  new DescendantEntityProviderComponent<TodoModel, NoteModel>({
    descendantType: TodoEntities.NOTE,
    generateOptions: (todo) => ({
      descendants: todo.notes,
      category: {
        label: 'Notes',
        openDefault: true
      }
    })
  })
);
```

Return `null` when the relationship should not appear for a particular parent. Omit `category` to place descendants directly beneath the parent, or provide category tree properties to group them under a node.

This base component is enough when the descendants are already available. Tree and card presenters resolve each child through the definition named by `descendantType`.

## Loading and refresh behavior

`DescendantLoadingEntityProviderComponent` extends the base relationship. Its generated options may additionally provide `refreshDescendants` and `loading`:

```ts
this.registerComponent(
  new DescendantLoadingEntityProviderComponent<TodoModel, NoteModel>({
    descendantType: TodoEntities.NOTE,
    generateOptions: (todo) => ({
      descendants: todo.notes,
      loading: () => todo.notesLoading,
      refreshDescendants: () => this.todoStore.loadNotes(todo),
      category: { label: 'Notes' }
    })
  })
);
```

Use this derivative when opening or revealing a tree node should refresh its children. It adds loading feedback, prevents overlapping refreshes, and surfaces refresh errors on the tree node.

Lazy tree presenters decide when descendants are traversed. Cached tree presenters can preserve generated nodes across refreshes; those presenter choices are separate from the relationship itself.
