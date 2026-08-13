---
title: Batch actions
description: Run one entity action across many selected items.
---

# Batch actions

`BatchStore` runs ordinary [entity actions](../subsystems/actions-and-validation.md#entity-and-coupled-actions) for multiple selected items. It groups [encoded references](../subsystems/entity-definitions/encoding.md) by type, finds compatible actions, loads the entities, confirms once, and reports aggregate [progress](../runtime/operational-feedback.md).

:::note Mental model
A batch action is an ordinary `EntityAction` executed repeatedly. The action still contains the behavior for one item.
:::

## Enable batching

Set `batch` on an entity action:

```ts
export class DeleteTodoAction extends EntityAction<TodoModel> {
  constructor() {
    super({
      id: 'DELETE_TODO',
      name: 'Delete todo',
      target: TodoEntities.TODO_ITEM,
      icon: 'trash',
      batch: true,
      batch_concurrency: 2,
      behavior: ActionMacroBehavior.DELETE,
      rollbackMechanic: ActionRollbackMechanic.NONE
    });
  }
}
```

The action still works for one target. When the selection contains several encoded entities of that type, `BatchStore` shows it in the batch menu.

## What the store coordinates

For a selected action, Reactor:

1. filters selections to the action's target entity type;
2. uses `System` to turn saved entity references back into objects;
3. asks once for confirmation when behavior is destructive;
4. executes the action for each target with bounded concurrency;
5. updates aggregate Visor progress;
6. notifies batch lifecycle listeners;
7. clears or preserves selection according to the surrounding UI.

Rollback metadata changes the confirmation language. It does not implement rollback.

:::note Hidden complexity
Each invocation still uses the normal action lifecycle and validation.
:::

## Choose concurrency deliberately

`batch_concurrency` defaults to one. Increase it only when:

- operations are independent;
- the backing API accepts parallel requests;
- ordering does not matter;
- the application can explain partial failure.

:::warning Common pitfall
High concurrency is not free performance. It can amplify rate limits, stale validation, and partial updates. Start sequentially and increase from evidence.
:::

## Design for partial failure

A batch may succeed for some targets and fail for others. Actions should produce errors that identify the failed entity, and stores should refresh affected collections after completion.

For operations that must be atomic across all selected entities, create a dedicated action whose target is an aggregate or selection model instead of relying on repeated batch execution.

## Go deeper

<div className="doc-links">
  <a href="../subsystems/actions-and-validation">Action behavior</a>
  <a href="../subsystems/entity-definitions">Entity encoding</a>
  <a href="../runtime/operational-feedback">Progress and outcomes</a>
</div>
