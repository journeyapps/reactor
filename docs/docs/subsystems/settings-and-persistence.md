---
title: Settings and persistence
description: Model user settings and persist application-owned state.
---

# Settings and persistence

Reactor separates transient application state, user settings, and persisted store state. Settings model individual choices through [controls](./controls.md). [Persisted stores](./modules-and-stores.md#persisted-stores) own larger serialized state and follow the Reactor store lifecycle.

## Settings

`AbstractSetting` owns a key used in saved data, a serialization version, readiness state, and update notifications. Interactive settings wrap controls so the same value can appear in the settings panel and elsewhere in the UI.

Common setting types include:

- `BooleanSetting`
- `SetSetting`
- `EntitySetting`
- `ToolbarPreference`

Register user-facing settings with `PrefsStore`:

```ts
prefsStore.registerPreference(
  new BooleanSetting({
    key: 'show-completed-todos',
    name: 'Show completed todos',
    category: 'Todos',
    checked: false
  })
);
```

Call `waitForReady()` before using a setting from code that may run during boot. A `serializeID` invalidates persisted data after an incompatible schema change.

:::note Mental model
A setting saves one user choice. A persisted store saves a larger state model.
:::

:::warning Common pitfall
Do not use settings as a general-purpose state store. Selection, loading, and domain data belong in application stores even when they eventually influence a setting.
:::

## Persisted stores

Use `AbstractPersistedStore` when persistence belongs to a store rather than one setting. The store:

- deserializes before its persisted initialization hook;
- exposes `save()`;
- listens for external changes when supported by the serializer;
- logs restore and save activity through the store logger.

Store constructors should still establish usable defaults. Deserialization replaces or augments those defaults during Reactor initialization.

[Workspace persistence](./workspaces-and-panels.md#persistence-and-recovery) follows the same principle. Layout changes trigger a trailing debounced save so a burst of model updates produces one snapshot.

Themes use the settings system for the selected theme, but their extension model is documented separately in [Themes](./themes.md).

## Go deeper

<div className="doc-links">
  <a href="./controls">Setting controls</a>
  <a href="./modules-and-stores">Persisted stores</a>
  <a href="./workspaces-and-panels">Workspace persistence</a>
  <a href="../advanced/production-patterns">Saving data for the right user or app</a>
</div>
