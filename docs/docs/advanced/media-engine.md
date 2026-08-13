---
title: Media engine
description: Map files and other content types to application panels.
---

# Media engine

The media engine connects a file or other content to the [panel](../subsystems/workspaces-and-panels.md) that opens it. [Modules](../subsystems/modules-and-stores.md) can add formats without changing the workspace shell or file browser.

:::note Mental model
An `AbstractMediaType` answers three questions: does this type match, how is its media model created, and which panel model opens it?
:::

## Define a media type

```ts
export class TodoExportMediaType extends AbstractMediaType<TodoExportMedia> {
  constructor() {
    super({
      mime: 'application/x-reactor-todos',
      extensions: ['todos.json'],
      displayName: 'Todo export',
      icon: 'list-check'
    });
  }

  generateMedia(options: GenerateMediaOptions) {
    return new TodoExportMedia({ ...options, type: this });
  }

  generatePanelFactory() {
    return this.workspaceStore.engine.getFactory(TodoImportPanelFactory.TYPE);
  }

  generateModel(media: TodoExportMedia) {
    return new TodoImportPanelModel({ source: media.getOptions().uid });
  }
}
```

Register it during module registration:

```ts
ioc.get(MediaEngine).registerMediaType(new TodoExportMediaType());
```

Registration also installs the type's panel factory with the workspace engine.

## Media models

`AbstractMedia` holds:

- content;
- a UID that remains the same when the media is saved and restored;
- a display name;
- its media type.

It provides common conversion helpers for `File`, `ArrayBuffer`, base64 strings, and `Uint8Array` content. Calling `open()` delegates to the media type, which generates a panel model and asks the active workspace layout to place it.

:::note Hidden complexity
The media type chooses what panel state represents the content. The workspace layout engine still decides where that panel belongs, so media support remains independent of application arrangement.
:::

## Media loaders

A `MediaLoader` can load media from its saved ID:

```ts
mediaEngine.registerMediaLoader({
  canLoadMedia: (uid) => uid.startsWith('todo-export:'),
  loadMedia: async (uid) => todoExportStore.loadMedia(uid)
});
```

Use loaders when serialized panel state or another subsystem knows the identity of content but should not know how it is fetched.

## Match carefully

The default media type matches configured path extensions. Keep extensions specific and register only one intentional owner for a format.

:::warning Common pitfall
Do not put file-fetching logic in a panel widget. Resolve media through a loader or application store, then let the panel render the resulting state.
:::

## Go deeper

<div className="doc-links">
  <a href="../subsystems/workspaces-and-panels">Panel models and placement</a>
  <a href="../subsystems/entity-definitions">Saving entity references</a>
  <a href="../advanced/production-patterns">Feature modules</a>
</div>
