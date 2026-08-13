---
title: Data collections
description: Model asynchronous, paginated, and lifecycle-aware data for Reactor applications.
---

# Data collections

`@journeyapps/reactor-lib-data-layer` provides observable primitives for remote and long-lived collections. They are independent of Reactor [panels](../subsystems/workspaces-and-panels.md) and [entities](../subsystems/entity-definitions.md), making them useful inside [stores](../subsystems/modules-and-stores.md) and domain models.

:::note Mental model
Collections own asynchronous list state. Entity definitions explain what the resulting models mean. Presenters decide how those entities appear.
:::

## Collection

`Collection<T>` owns observable items plus loading and failure state:

```ts
const todos = new Collection<TodoData>();

await todos.load(async (event) => {
  const result = await client.listTodos();
  return event.aborted ? [] : result;
});
```

Concurrent calls share the in-flight promise. Clearing a collection marks its current load event aborted, preventing a late result from replacing newer state.

:::note Hidden complexity
The abort flag protects collection state from a stale completion. It does not cancel the underlying network request; use an `AbortController` in the client when transport cancellation matters.
:::

## PaginatedCollection

`PaginatedCollection<T, R>` consumes an async iterator:

```ts
const todos = new PaginatedCollection<TodoData, TodoPage>({
  loaderIterator: () => client.paginateTodos(),
  transformer: (page) => page.items,
  hasMore: (page) => Boolean(page.next)
});

await todos.loadInitialData();
await todos.loadMore();
```

It tracks the last response, accumulated items, loading state, and whether another page exists. `loadAll()` drains the iterator until completion or cancellation.

The collection can also project itself into a `PaginatedSearchResult`, keeping search loading and pagination connected.

## LifecycleCollection

`LifecycleCollection` converts serialized records into long-lived models:

- new keys generate models;
- existing keys patch the existing model;
- removed keys dispose their models.

```ts
const models = new LifecycleCollection({
  collection: todoRecords,
  getKeyForSerialized: (todo) => todo.id,
  generateModel: (todo) => new TodoModel(todo)
});
```

This is valuable when models own listeners, nested collections, cached state, or other resources that should survive a refresh.

:::warning Lifecycle note
Every lifecycle model must implement meaningful `dispose()` behavior. A collection can remove the model from its map, but only the model knows which subscriptions and resources it owns.
:::

## Connect collections to entities

A common pattern is:

1. a [store](../subsystems/modules-and-stores.md) owns a collection;
2. an [entity search behavior](../subsystems/entity-definitions/search.md) returns its models;
3. [descendant providers](../subsystems/entity-definitions/descendants.md) expose nested collections;
4. [presenters](../subsystems/entity-definitions/presentation-and-panels.md) observe model changes;
5. [actions](../subsystems/actions-and-validation.md) mutate through the store and refresh it.

Keep network pagination out of trees and tables. Those widgets should consume collection and entity contracts rather than own transport state.

## Go deeper

<div className="doc-links">
  <a href="../subsystems/modules-and-stores">Store ownership</a>
  <a href="../subsystems/entity-definitions">Entity capabilities</a>
  <a href="../subsystems/search-selection-and-command-palette">Search results</a>
</div>
