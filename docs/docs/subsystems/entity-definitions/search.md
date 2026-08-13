---
title: Search
description: Make entities discoverable without coupling UI to domain stores.
---

# Search

An entity search behavior gives Reactor a standard way to find instances of an [entity definition](../entity-definitions.md). [Controls](../controls.md), [action parameters](../actions-and-validation.md#entity-and-coupled-actions), selectors, and the [command palette](../search-selection-and-command-palette.md) can consume it without knowing the backing store.

## The core behavior

`EntitySearchEngineComponent` is the base contract. A custom implementation supplies a `SearchEngine` from `getSearchEngine()`:

```ts
class RecentTodoSearchComponent extends EntitySearchEngineComponent<TodoModel> {
  getSearchEngine() {
    return new RecentTodoSearchEngine(this.todoStore);
  }
}
```

The base component adapts that engine for entity combo boxes and command-palette search. Extend it when search has its own paging, ranking, remote query, or streaming behavior.

## Simple entity lists

`SimpleEntitySearchEngineComponent` is the convenience implementation for a function that returns entities:

```ts
this.registerComponent(
  new SimpleEntitySearchEngineComponent<TodoModel>({
    label: 'Todos',
    getEntities: async () => this.todoStore.todos
  })
);
```

It maps the entities to stable result keys and, by default, filters them by the described `simpleName`. Set `filterResultsWithMatcher: false` when `getEntities` has already applied the query, such as for a server-side search.

While `getEntities` is pending, search-backed combo boxes show a spinner and **Loading...**. A custom search engine can return a collection-backed `SearchResult` when results should arrive incrementally. Existing items remain selectable while `loading` is true, and the combo box shows **Loading more...** beneath them. Use `loadingMessage` and `loadingMoreMessage` on `SearchEngineComboBoxDirective` for domain-specific text.

## Parent-dependent searches

`SimpleParentEntitySearchEngine` extends the simple-list behavior for entities that can only be selected after choosing a parent:

```ts
this.registerComponent(
  new SimpleParentEntitySearchEngine<ProjectModel, TodoModel>({
    label: 'Project todos',
    type: TodoEntities.PROJECT,
    getEntities: async (event) => this.todoStore.getTodos(event.parameters!.parent)
  })
);
```

It adds a required parent entity parameter and builds a cascading selector: Reactor resolves the parent first, then passes it to the child search. Use this derivative for relationships such as a repository's branches or a project's todos. It intentionally does not expose itself as a command-palette search because its parent must be resolved through the cascade.

## Multiple search behaviors

A definition can register several search components, such as recent entities and all entities. Give each one a meaningful label so users can distinguish them where Reactor offers a choice.

See [Search, selection, and command palette](../search-selection-and-command-palette.md) for result resolution, action parameters, and command-palette behavior.
