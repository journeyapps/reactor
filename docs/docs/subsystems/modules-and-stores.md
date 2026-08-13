---
title: Modules and stores
description: Define modules, register stores, and manage asynchronous or persisted state.
---

# Modules and stores

Modules are installation boundaries. Stores own state, services, and lifetimes within the [application boot model](./application-model.md).

:::note Mental model
Registration answers “what does this module contribute?” Store initialization answers “what asynchronous state must be ready before modules finish booting?”
:::

## Define a module

A module extends `AbstractReactorModule` and implements registration and initialization:

```ts
export class TodosModule extends AbstractReactorModule {
  constructor() {
    super({ name: 'Todos' });
  }

  register(event: ReactorModuleRegisterEvent) {
    const { ioc } = event;

    event.registerStore(TodoStore, new TodoStore());
    ioc.get(ActionStore).registerAction(new CreateTodoAction());
    ioc.get(WorkspaceStore).registerFactory(new TodoPanelFactory());
  }

  async init({ ioc }: ReactorModuleInitEvent) {
    await ioc.get(TodoStore).loadInitialData();
  }
}
```

Use `register()` to describe what the module contributes. Use `init()` only for work that must happen after every registered store is ready.

:::tip Pro tip
Keep `register()` readable as a table of contents. Move large groups of registrations into named setup functions or smaller modules.
:::

## Define a store

Stores construct usable initial state synchronously. Override `_init()` for asynchronous boot work:

```ts
export class TodoStore extends AbstractStore {
  @observable accessor todos: Todo[] = [];

  constructor() {
    super({ name: 'TODO_STORE' });
  }

  protected async _init() {
    this.todos = await loadTodos();
  }
}
```

Always register stores through the module event. Reactor then:

- binds the store into IOC;
- gives it a child of the module logger;
- initializes it exactly once during boot;
- exposes it through `System.getStores()`.

Call `waitForReady()` when code can run both during and after boot and needs to wait for a particular store.

:::warning Common pitfall
Do not call a store's `init()` manually after registering it with the module event. The kernel initializes registered stores exactly once.
:::

## Persisted stores

Use `AbstractPersistedStore` when a store owns serialized state. Use a [setting](./settings-and-persistence.md) instead for one user-configurable value.

```ts
interface SavedState {
  selectedId?: string;
}

export class SelectionStore extends AbstractPersistedStore<SavedState> {
  @observable accessor selectedId?: string;

  constructor() {
    super({
      name: 'SELECTION_STORE',
      serializer: new LocalStorageSerializer({ key: 'selection' })
    });
  }

  protected serialize(): SavedState {
    return { selectedId: this.selectedId };
  }

  protected async deserialize(data: SavedState) {
    this.selectedId = data.selectedId;
  }

  protected async _initPersisted(deserialized: boolean) {
    if (!deserialized) this.selectedId = undefined;
  }
}
```

The base class deserializes before `_initPersisted()` and provides `save()`, external-change listening, and persistence logging.

Store constructors should still provide usable defaults. Deserialization replaces or augments those defaults during initialization.

## Ownership and disposal

A store is a natural owner for long-lived listeners, clients, collections, and caches. If the user, account, document, or selected app can change, provide a reset or disposal method and ignore requests that finish for the previous selection.

Widget-local effects should remain in widgets. Application-wide reactions should be owned and named by a store or model.

## Go deeper

<div className="doc-links">
  <a href="./application-model">Boot sequence</a>
  <a href="./settings-and-persistence">Settings and serializers</a>
  <a href="../advanced/data-collections">Collection ownership</a>
  <a href="../advanced/production-patterns">Large module composition</a>
</div>
