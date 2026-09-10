---
title: Descriptions
description: Give entities reusable names, icons, tags, and metadata.
---

# Descriptions

A description is Reactor's reusable, presentation-neutral summary of an entity. Trees, cards, selectors, search results, menus, and headers can all ask the definition for the same information instead of formatting the domain object themselves.

## The core behavior

Register an `EntityDescriberComponent` with a label and a `describe` function:

```ts
this.registerComponent(
  new EntityDescriberComponent<TodoModel>({
    label: 'Simple',
    describe: (todo) => ({
      simpleName: todo.name,
      tags: todo.tags,
      labels: [
        { label: 'Sub-todos', value: `${todo.children.length}` },
        { label: 'Notes', value: `${todo.notes.length}` }
      ]
    })
  })
);
```

`simpleName` is the minimum useful description. A description can also supply a complex name, override the definition's icons and colors, add tags, and expose structured labels.

- Use tags for short domain concepts.
- Use labels for named metadata values.
- Keep formatting out of the description; let each presenter adapt the information to its available space.

## Alternate descriptions

Register multiple `EntityDescriberComponent` instances on one definition to offer different summaries of the same entity. For example, keep the `Simple` description above and add a `Detailed` description that includes child and note counts:

```ts
this.registerComponent(
  new EntityDescriberComponent<TodoModel>({
    label: 'Detailed',
    describe: (todo) => ({
      simpleName: todo.name,
      complexName: `${todo.children.length} sub-todos · ${todo.notes.length} notes`,
      tags: todo.tags
    })
  })
);
```

Give each describer a unique, stable `label`. Reactor uses that label in the description selector and to store the user's preference for the entity type. In the Todo sandbox, the **Info** selector switches between **Simple** and **Detailed**.

`definition.describeEntity(entity)` uses the preferred describer. If there is no matching saved preference, it uses the first describer registered on the definition. A caller can also use a specific component's `describeEntity(entity)` method when it needs a particular summary.

:::warning[Keep one definition per entity type]

Add alternate describers to the existing entity definition. A different summary does not require a new entity type or a duplicate definition.

:::
