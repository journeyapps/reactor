---
title: Contextual documentation
description: Attach relevant documentation links to entity instances.
---

# Contextual documentation

Contextual documentation connects a live entity to a useful help or reference page. Generic entity UI can expose that link without knowing the entity's domain.

## The core behavior

Register an `EntityDocsComponent` with a label and a link resolver:

```ts
this.registerComponent(
  new EntityDocsComponent<TodoModel>({
    label: 'Todo guide',
    getDocLink: (todo) => todo.guideUrl || null
  })
);
```

Return `null` when documentation is not available for a particular entity. The label describes the documentation source or destination shown to the user.

## Multiple documentation sources

`EntityDocsComponent` is already the concrete behavior; there is no required advanced derivative. Register additional components when an entity can link to several useful sources, such as a user guide, an operational runbook, and an external reference.

Keep the link resolver focused on choosing the relevant URL. The UI that consumes the component owns how and where the link is presented.
