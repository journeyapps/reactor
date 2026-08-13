---
title: Entity definitions
description: Teach Reactor how to display, find, open, and save references to your data.
---

# Entity definitions

An entity definition teaches Reactor about one kind of data in your application. Your model stays unchanged; the definition tells Reactor how to display, find, open, and save references to it.

:::note Mental model
Define an entity in one place, then reuse it in trees, cards, menus, search, panels, and action pickers.
:::

With a definition, Reactor can answer:

- What is this object called and which icon represents it?
- How can a user search for or select one?
- Which actions apply, and what happens when it opens?
- Can it be rendered as a tree node or card?
- How can a saved panel find this object again?
- Which child entities does it expose?
- Which contextual documentation is relevant?

## Identity and registration

```ts
export class TodoDefinition extends EntityDefinition<TodoModel> {
  @inject(TodoStore)
  accessor todoStore: TodoStore;

  constructor() {
    super({
      type: TodoEntities.TODO_ITEM,
      category: 'Demo items',
      label: 'Todo item',
      icon: 'cube',
      iconColor: 'cyan'
    });
  }

  matchEntity(entity: unknown): boolean {
    return entity instanceof TodoModel;
  }

  getEntityUID(todo: TodoModel): string {
    return todo.id;
  }
}
```

Register definitions through `System` during module registration:

```ts
event.ioc.get(System).registerDefinition(new TodoDefinition());
```

The type string identifies this kind of entity. Reactor uses it to find the definition later.

## Add behaviors to the entity

Components add independent behaviors to a definition. Start with the smallest behavior that expresses what Reactor needs to know, then use a convenience or specialized derivative only when the feature requires it.

A definition can register more than one component of the same behavior. For example, it can offer compact and detailed descriptions or several ways to present the same entities.

| Behavior                                                                     | Start with                          | Add derivatives when you need…                 |
| ---------------------------------------------------------------------------- | ----------------------------------- | ---------------------------------------------- |
| [Descriptions](./entity-definitions/descriptions.md)                         | `EntityDescriberComponent`          | alternate descriptions for different contexts  |
| [Search](./entity-definitions/search.md)                                     | `EntitySearchEngineComponent`       | a simple in-memory entity source               |
| [Presentation and panels](./entity-definitions/presentation-and-panels.md)   | `EntityPresenterComponent`          | trees, cards, or generated workspace panels    |
| [Handlers and opening](./entity-definitions/handlers-and-opening.md)         | `EntityHandlerComponent`            | an inline callback or an action-backed handler |
| [Encoding](./entity-definitions/encoding.md)                                 | `EntityEncoderComponent`            | callback-based encoding and decoding           |
| [Descendants](./entity-definitions/descendants.md)                           | `DescendantEntityProviderComponent` | loading and refresh behavior                   |
| [Contextual documentation](./entity-definitions/contextual-documentation.md) | `EntityDocsComponent`               | contextual links for an entity                 |

The pages in **Entity behaviors** explain each core concept before introducing its derivatives.

## How the Todo example fits together

The Todo definition combines all of these pieces:

```ts
export class TodoDefinition extends EntityDefinition<TodoModel> {
  constructor() {
    super({
      type: TodoEntities.TODO_ITEM,
      label: 'Todo item',
      category: 'Demo items',
      icon: 'cube'
    });

    this.registerComponent(
      new EntityDescriberComponent({
        label: 'Simple',
        describe: (todo) => ({ simpleName: todo.name, tags: todo.tags })
      })
    );

    this.registerComponent(
      new SimpleEntitySearchEngineComponent({
        label: 'Todos',
        getEntities: async () => this.todoStore.todos
      })
    );

    this.registerComponent(
      new InlineTreePresenterComponent({
        label: 'Todo tree',
        loadChildrenAsNodesAreOpened: true
      })
    );

    this.registerComponent(
      new EntityPanelComponent({
        label: 'Todos',
        getEntities: () => this.todoStore.rootTodos
      })
    );

    this.registerComponent(new EntityActionHandlerComponent(SetCurrentTodoItemAction.ID));
    this.registerAdditionalAction(RenameTodoAction.ID);
  }
}
```

That one definition gives Reactor enough information to:

1. show a todo in a tree, card, picker, or menu;
2. find a todo when an action needs one;
3. generate a complete Todos panel;
4. select a todo when it is opened;
5. add **Rename todo** to its context menu.

The full demo also adds notes, sub-todos, alternate tree styles, encoding, documentation links, and another open action.

## Why use the entity system?

Without a definition, every tree, picker, and panel would need its own code for names, icons, search, menus, and opening. The definition keeps those rules together.

:::warning Common pitfall
Do not create a second definition just to change one view. Add another description, presenter, search, or open action to the existing definition.
:::

See `demo/module-todos/src/entities/TodoDefinition.ts` for the complete living example.

## Go deeper

<div className="doc-links">
  <a href="./actions-and-validation">Entity actions</a>
  <a href="./search-selection-and-command-palette">Entity resolution</a>
  <a href="./workspaces-and-panels">Generated panels</a>
  <a href="../advanced/data-collections">Asynchronous collections</a>
</div>
