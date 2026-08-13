---
title: Workspaces and panels
description: Create panels, place them in workspaces, and save the layout.
---

# Workspaces and panels

Panels contain application UI. Workspaces arrange panel models into tabs, splits, trays, and floating windows, then save that layout through the [persistence system](./settings-and-persistence.md).

:::note Mental model
A feature creates panel state. A panel factory renders it. The active layout engine decides where it belongs.
:::

## Create a panel model and factory

A panel model contains serializable workspace state:

```tsx
class TodoPanelModel extends ReactorPanelModel {
  constructor() {
    super('todos.list');
    this.setExpand(true, true);
  }
}

class TodoPanelFactory extends ReactorPanelFactory<TodoPanelModel> {
  constructor() {
    super({
      type: 'todos.list',
      name: 'Todos',
      icon: 'list',
      category: 'Todos',
      isMultiple: false,
      padding: true
    });
  }

  protected generatePanelContent(event: WorkspaceModelFactoryEvent<TodoPanelModel>) {
    return <TodoPanelWidget model={event.model} />;
  }

  protected _generateModel() {
    return new TodoPanelModel();
  }
}
```

Register factories during module registration:

```ts
event.ioc.get(WorkspaceStore).registerFactory(new TodoPanelFactory());
```

:::warning Common pitfall
Do not put class instances or other non-serializable objects in panel state. Save an ID, or use [entity encoding](./entity-definitions/encoding.md) so the panel can find the object after a reload.
:::

## Avoid duplicate panels

The workspace engine asks the panel factory whether a requested model matches an open panel. This prevents two editors or inspectors from opening for the same item.

Panel models should:

- keep the factory `type` unchanged after release because saved layouts refer to it;
- serialize meaningful state in `toArray()`;
- restore it in `fromArray()`;
- avoid serializing transient render state;
- encode entity references rather than object instances.

## Generate workspaces

```ts
workspaceStore.registerWorkspaceGenerator({
  generateWorkspace: async () => {
    const root = workspaceStore.generateRootModel();
    root.addModel(panelFactory.generateModel());

    return new WorkspaceModel({
      id: 'todos',
      name: 'Todos',
      priority: 1,
      model: root
    });
  }
});
```

Generators run when Reactor needs a default layout. They can return one `WorkspaceModel`, a `WorkspaceGroup`, or nothing when that module has no default workspace.

## Workspace groups and open policy

A group presents several related layouts while remembering the last active child. The Todo demo uses two child workspaces with different preferred open actions:

```ts
const select = new WorkspaceModel({
  name: 'Select',
  model: generateTodosWorkspace()
}).setPreferredOpenAction(TodoEntities.TODO_ITEM, SetCurrentTodoItemAction.ID);

const view = new WorkspaceModel({
  name: 'View',
  model: generateTodosWorkspace()
}).setPreferredOpenAction(TodoEntities.TODO_ITEM, OpenTodoDialogAction.ID);

return new WorkspaceGroup({
  name: 'todos',
  children: [select, view]
});
```

The same entity can therefore open differently by workspace without changing its [handlers](./entity-definitions/handlers-and-opening.md).

:::tip Pro tip
Use preferred open actions when an entity should open differently in one workspace. Use the entity handler's ordering for the application-wide default.
:::

## Simple and advanced layouts

Reactor includes two placement policies:

- **Simple layout** favors predictable replacement and can route model types to an affiliated workspace.
- **Advanced layout** uses tabs, trays, sizing hints, similar panels, and user-managed arrangement.

Workspace generators can provide separate simple and advanced defaults. `AdvancedWorkspacePreference` selects the active mode.

The advanced layout accepts hints such as `COUPLED`, which places related models into coordinated tab groups, and `ISOLATED_TRAY`, which opens a model in its own collapsed tray.

:::note Hidden complexity
Opening content is policy-driven. The layout engine can activate an existing match, select an appropriate tab group, create a tray, move to an affiliated workspace, or fall back to a floating window.
:::

## Immutable workspaces

Mark generated workspaces immutable when the application owns their structure. Immutable workspaces cannot be renamed, deleted, regrouped, reset, or replaced through import.

Users can still activate existing panels. Newly opened content appears in a floating window—or fullscreen on mobile—when it cannot be added to the locked structure.

## Persistence and recovery

`WorkspaceStore` is a persisted store. It saves:

- serialized workspace and group models;
- the active workspace;
- the active top-level group;
- preferred open actions;
- mutability policy.

Layout and dimension changes trigger a trailing debounced save. Deserialization supports explicit schema migration and resets to generated defaults when stored state cannot be recovered.

Applications can replace the serializer to save a separate layout for each user or selected application.

:::warning Lifecycle note
When the user or selected application changes, check that loaded workspace data still belongs to the current selection before applying it. An old request must not replace the new layout.
:::

## Import, export, and URL hydration

Workspace state can be:

- cloned;
- grouped or ungrouped;
- imported from JSON;
- exported individually or as a complete set;
- hydrated from a URL hash representing panel state.

Immutable state is protected from destructive replacement during import.

## Responsive placement

`addModelInWindow()` creates a floating window on desktop and temporary fullscreen content on mobile. Calling code does not need a separate mobile path.

See [Responsive applications](../runtime/responsive-applications.md) for the broader interaction model.

## Panel and floating-window menus

Panel title context menus reflect both placement and workspace policy:

- A panel inside a mutable workspace can be closed, converted to tabs, or converted to a tray.
- A floating window can always be closed, including when the active workspace is immutable.
- A standalone floating window can be docked into the active workspace.
- A temporary floating window opened from a collapsed tray cannot be docked. Its panel already belongs to that tray, so docking the temporary representation would detach it from the layout that owns it.

`ReactorWindowModel.standalone` distinguishes independent windows from tray-coupled windows. `WorkspaceStore.addModelInWindow()` and `ReactorWorkspaceEngine.generateStandaloneWindowModel()` create standalone windows. Keep tray-created windows coupled so their pinning and visibility lifecycle remains intact.

Panel title buttons use each `Btn.tooltipPos` when provided and otherwise place their tooltip above the title bar.

## Go deeper

<div className="doc-links">
  <a href="./entity-definitions">Generated entity panels</a>
  <a href="../runtime/application-shell">Application chrome</a>
  <a href="../advanced/media-engine">Media-to-panel mapping</a>
  <a href="../advanced/production-patterns">App-scoped persistence</a>
  <a href="../using-reactor/getting-around">Arrange a Reactor workspace</a>
</div>
