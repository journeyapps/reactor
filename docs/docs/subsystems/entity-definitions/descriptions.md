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

There is no more advanced describer class to adopt. Instead, register more than one `EntityDescriberComponent` when the same entity needs genuinely different summaries, such as a compact name and a detailed operational view.

Reactor keeps the components as a preference bank. UI that supports description selection can choose one, while generic UI can use the preferred description.

:::warning Common pitfall
Do not create another entity definition just to change how an entity is described. Add another describer to the existing definition.
:::
