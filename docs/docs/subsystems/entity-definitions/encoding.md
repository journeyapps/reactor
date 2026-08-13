---
title: Encoding
description: Turn live entities into portable references and restore them later.
---

# Encoding

Encoding is the boundary between a live domain object and a portable Reactor entity reference. It lets an entity cross [persistence](../settings-and-persistence.md) and drag-and-drop boundaries without serializing the object.

## The core behavior

`EntityEncoderComponent` defines the contract. A subclass implements `doEncode()` and `doDecode()` while the base class adds the entity type, version, and stable entity ID to the encoded envelope.

Use a custom subclass when encoding needs shared services, migrations, or behavior beyond two callbacks.

:::warning Lifecycle note
Decoding may happen after a page reload. Load the backing store before resolving the reference, and return only an entity that is valid in the current application state.
:::

## Inline encoding

`InlineEntityEncoderComponent` is the callback-based derivative for the common case:

```ts
this.registerComponent(
  new InlineEntityEncoderComponent<TodoModel, { id: string }>({
    version: 1,
    encode: (todo) => ({ id: todo.id }),
    decode: async ({ id }) => this.todoStore.todos.find((todo) => todo.id === id) || null
  })
);
```

Keep the encoded value small and stable. Prefer identifiers over mutable display data.

## What encoding enables

Reactor uses encoded references in persisted settings and panels, [batch selections](../../advanced/batch-actions.md), and native entity drag payloads. [Command-palette](../search-selection-and-command-palette.md#drag-entities-and-actions-into-toolbars) results become draggable when their definition has an encoder; toolbars save the reference and decode it later.

Definitions without an encoder still support descriptions, search, presentation, and opening. They simply cannot participate in workflows that require a portable reference.
