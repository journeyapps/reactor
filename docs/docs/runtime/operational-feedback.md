---
title: Progress and status
description: Show progress, background activity, notifications, and unavailable actions.
---

# Progress and status

Users need to know what the application is doing, whether background work succeeded, and why an [action](../subsystems/actions-and-validation.md) is unavailable.

Reactor separates four kinds of feedback:

| Need                                                | System                  |
| --------------------------------------------------- | ----------------------- |
| Progress for an executing action                    | Action status directive |
| Aggregate background activity and persistent status | Visor                   |
| Transient outcome or announcement                   | Notification            |
| Why an action is unavailable                        | Action validation       |

:::note Mental model
Status shows what the application is doing. Validation explains what the user can do. Notifications report what just happened.
:::

## Action progress

Every action event can expose a `VisorLoadingDirective` through `getStatus()`:

```ts
protected async fireEvent(event: ActionEvent) {
  const status = event.getStatus();
  status.pushMessage('Preparing todos');

  await todoStore.refresh();

  status.update(80, 'Updating the workspace');
  status.complete('Todos are ready');
}
```

The directive holds messages, optional percentage progress, and a final success or error state. It appears in the Visor only after the action calls `getStatus()`.

:::tip Pro tip
Call `getStatus()` when the operation lasts long enough for progress to be meaningful. Fast actions do not need ceremonial loading state.
:::

## Persistent Visor metadata

`VisorMetadata` shows a small piece of app-wide information, such as the active todo, sync state, current mode, or connection health.

The Todo demo registers `CurrentTodoItemVisorMetadata`, which observes the active item and reports a clickable value. Register metadata during module registration:

```ts
ioc.get(VisorStore).registerActiveMetadata(new CurrentTodoItemVisorMetadata());
```

Metadata can include a value, icon, color, and click behavior. Its `init()` method connects it to the relevant store.

:::note Lifecycle note
`VisorStore` initializes the metadata. If metadata subscribes to a store, dispose that subscription when the metadata is no longer needed.
:::

## Wrapping background work

Code outside an action can use `VisorStore.wrap()`:

```ts
await visorStore.wrap('Refreshing todos', async (status) => {
  await todoStore.refresh();
  status.complete();
});
```

The wrapper completes unresolved directives on success and marks them failed when work throws.

## Notifications

`NotificationStore` provides transient success, information, validation, special, and error messages. Notifications may include [action-backed buttons](../subsystems/actions-and-validation.md#show-an-action-in-the-ui) and structured validation results.

Use duplicate checking for repeating background conditions:

```ts
notificationStore.showNotificationWithDuplicateCheck({
  type: NotificationType.ERROR,
  title: 'Refresh failed',
  description: 'The todo list could not be refreshed.'
});
```

Repeated identical messages reset the existing notification timer rather than flooding the user.

## Explain unavailable actions

Put the reason an action is unavailable in its validator. A validator can hide, disable, defer, block, or mark an action pending. `BLOCKED` can also offer a button that helps the user fix the problem.

See [Actions and validation](../subsystems/actions-and-validation.md) for the state definitions and execution order.

:::warning Common pitfall
Do not show an error notification every time a disabled action is rendered. Validation is live application state; notifications are discrete events.
:::

## Go deeper

<div className="doc-links">
  <a href="../subsystems/actions-and-validation">Validation and action lifecycle</a>
  <a href="../subsystems/logging-and-debugging">Logging and debugging</a>
  <a href="../advanced/batch-actions">Progress for batch work</a>
</div>
