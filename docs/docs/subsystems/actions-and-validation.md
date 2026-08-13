---
title: Actions and validation
description: Define an action once and use it across the application.
---

# Actions and validation

An action describes something a user can do. The same action can appear in a button, menu, [command palette](./search-selection-and-command-palette.md#command-palette-discovery), shortcut, [batch operation](../advanced/batch-actions.md), or [guide](../advanced/guided-workflows.md).

:::note Mental model
An action keeps the operation, its validation, and its progress in one place.
:::

## Define and register an action

The Todo demo's create action owns its name, discovery tags, icon, dialog, operation, and progress message:

```ts
export class CreateTodoAction extends Action {
  static ID = 'CREATE_TODO';

  @inject(TodoStore)
  accessor todoStore: TodoStore;

  constructor() {
    super({
      id: CreateTodoAction.ID,
      name: 'Create todo item',
      tags: ['todo', 'create'],
      icon: 'plus'
    });
  }

  protected async fireEvent(event: ActionEvent) {
    event.getStatus().pushMessage('Creating a todo');
    const name = await this.dialogStore.showInputDialog({ title: 'Create todo' });
    if (!name) return false;

    this.todoStore.addTodo(new TodoModel({ name }));
  }
}
```

Register actions during module registration:

```ts
event.ioc.get(ActionStore).registerAction(new CreateTodoAction());
```

Registration gives the action a child logger and makes it discoverable by Reactor's action surfaces.

## Name actions clearly

The `name` is what users see. Use `aliases` for other phrases they may search for and `tags` for shorter search terms:

```ts
super({
  id: 'DELETE_TODO',
  name: 'Delete todo item',
  aliases: ['Remove todo item', 'Discard todo item'],
  tags: ['todo', 'cleanup'],
  behavior: ActionMacroBehavior.DELETE,
  icon: 'trash'
});
```

Macro behavior contributes conventional tags. `DELETE` adds `delete`, `remove`, and `destroy`; `COPY` adds `copy`, `clone`, and `duplicate`.

:::tip Pro tip
Name the operation, not the control. Prefer “Create todo” to “Create button clicked.” The action may later run without a button.
:::

## Show an action in the UI

Actions generate descriptors and [controls](./controls.md) that standard Reactor widgets understand:

```tsx
<PanelButtonWidget {...action.representAsButton({ targetEntity: todo })} />
```

Available representations include:

- `representAsButton()`
- `representAsIcon()`
- `representAsControl()`
- `representAsComboBoxItem()`

The supplied event data is passed to validation and execution. Each representation keeps checking the action's validator, so widgets do not need their own availability rules.

## Validation states

Validators return one result:

| State      | Meaning                                                            |
| ---------- | ------------------------------------------------------------------ |
| `ALLOWED`  | Render and execute normally.                                       |
| `DEFERRED` | More action parameters are required before a decision is possible. |
| `PENDING`  | A live asynchronous decision has not completed.                    |
| `DISABLED` | Keep the action visible but unavailable, optionally with a reason. |
| `BLOCKED`  | Prevent execution but allow activation of a remediation flow.      |
| `HIDDEN`   | Do not show the action here.                                       |

```ts
class TodoLockedValidator extends ActionValidator<EntityActionEvent<TodoModel>> {
  validate(event: Partial<EntityActionEvent<TodoModel>>): ValidationResult {
    if (!event.targetEntity) {
      return { type: ActionValidationState.DEFERRED };
    }
    if (event.targetEntity.locked) {
      return {
        type: ActionValidationState.DISABLED,
        message: 'Unlock the todo before editing it.'
      };
    }
    return { type: ActionValidationState.ALLOWED };
  }
}
```

:::warning Common pitfall
Use `PENDING` only when a validator has started asynchronous work and will notify its listeners when the answer changes. If the missing information is an unresolved action parameter, return `DEFERRED`.
:::

`BLOCKED` lets the application offer a way to fix the problem:

```ts
return {
  type: ActionValidationState.BLOCKED,
  message: 'Connect before refreshing.',
  indicator: { icon: 'plug', tooltip: 'Connection required' },
  onActivate: () => connectionStore.openConnectionDialog()
};
```

Reactor understands the generic outcome; it does not own the application's permission or availability policy.

## Entity and coupled actions

`ParameterizedAction` collects named values before execution. `EntityAction` targets an object described by the [entity system](./entity-definitions.md). `CoupledAction` adds a source and target for assignments, moves, links, and drag-and-drop.

```ts
export class DuplicateTodoAction extends EntityAction<TodoModel> {
  constructor() {
    super({
      id: 'DUPLICATE_TODO',
      name: 'Duplicate todo',
      target: TodoEntities.TODO_ITEM,
      behavior: ActionMacroBehavior.COPY,
      icon: 'copy'
    });
  }

  protected async fireEvent(event: EntityActionEvent<TodoModel>) {
    event.targetEntity.duplicate();
  }
}
```

An action opened from an entity menu already has its target. From the [command palette](./search-selection-and-command-palette.md#action-parameter-resolution), its entity definition resolves one through a registered [search behavior](./entity-definitions/search.md).

:::note Hidden complexity
Candidate entities are placed into partial action events and validated before selection. The picker can therefore hide or disable candidates that would make the final action unavailable.
:::

## Execution lifecycle

The order is:

1. collect or resolve parameters;
2. create the complete action event;
3. run validation;
4. activate remediation for `BLOCKED`, or stop for another unavailable state;
5. notify `willFire` listeners;
6. honor cancellation;
7. execute `fireEvent()`;
8. complete or fail the status directive;
9. notify `didFire` listeners.

Errors are logged, the action status fails, and Reactor presents a standard error dialog before rethrowing.

## Progress indication

`event.getStatus()` shows the action in the Visor. Use it for work that takes long enough to notice; fast actions do not need progress UI.

`getExclusiveExecutionLock()` lets a workflow temporarily cancel other actions while allowing explicit exceptions. The returned cleanup function must always be released.

Actions also support a temporary execution lock. Guided workflows use it to stop unrelated actions while a step is active. Always call the returned cleanup function when the step ends.

See [Progress and status](../runtime/operational-feedback.md) and [Guided workflows](../advanced/guided-workflows.md).

## Destructive and batch behavior

`ActionMacroBehavior` adds common search terms. `ActionRollbackMechanic` says whether destructive work can be recovered through source control. Helpers such as `setupDeleteConfirmation()` add standard confirmation behavior.

Entity actions can opt into batch execution with `batch` and `batch_concurrency`. See [Batch actions](../advanced/batch-actions.md).

## Go deeper

<div className="doc-links">
  <a href="./search-selection-and-command-palette">Parameter resolution</a>
  <a href="./entity-definitions">Entity targets and handlers</a>
  <a href="../runtime/operational-feedback">Status and notifications</a>
  <a href="../advanced/guided-workflows">Action-driven guides</a>
</div>
