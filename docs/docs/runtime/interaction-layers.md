---
title: Interaction layers
description: Add dialogs, combo boxes, overlays, and shortcuts.
---

# Interaction layers

Dialogs, menus, overlays, [notifications](./operational-feedback.md#notifications), and [guide](../advanced/guided-workflows.md) callouts appear above the workspace. Reactor's layer system gives them shared stacking, dismissal, and positioning.

:::note Mental model
A directive describes a temporary interaction. A store shows it, closes it, and resolves the result.
:::

## Dialog directives

Use `DialogStore2` with an explicit directive for new modeled dialogs. `FormDialogDirective` connects a [form model](../subsystems/forms.md) to standard save, cancel, validation, and loading behavior:

```ts
const form = new FormModel<{ name: string }>();
form.addInput(new TextInput({ name: 'name', label: 'Todo name', required: true }));

const result = await ioc.get(DialogStore2).showDialog(
  new FormDialogDirective({
    title: 'Create todo',
    form,
    handler: async (form) => {
      await todoStore.create(form.value().name);
    }
  })
);
```

The promise resolves with the directive after successful disposal, or `null` when the interaction is canceled.

:::note Hidden complexity
The form directive observes validation changes, disables submission while invalid, exposes loading state during its handler, and owns disposal. The calling action does not need to reproduce that state machine.
:::

Use `InlineDialogDirective` when a dialog has its own model and React content. The older `DialogStore` remains useful for simple confirmation, input, and error dialogs.

## Combo boxes

Combo boxes consume item descriptors rather than application-specific menu components. Items can include:

- labels, icons, groups, and right-side metadata;
- validation;
- nested children;
- activation callbacks;
- downloads;
- search behavior.

Build items from [actions](../subsystems/actions-and-validation.md) and [controls](../subsystems/controls.md) when possible so labels, icons, validation, and behavior stay in sync.

The directive system includes simple, multi-select, nested, cascading-search, and search-engine-backed combo boxes. See [Search, selection, and command palette](../subsystems/search-selection-and-command-palette.md) to choose between them.

## Anchored overlays and tooltips

`useAnchoredOverlay()` and `ReactorTooltipWidget` render through the shared overlay layer. The overlay store keeps content aligned while its anchor moves, scrolls, or resizes.

Use anchored overlays for interface state that belongs to a visible source element. Use dialogs for interactions that temporarily become the user's primary task.

## Shortcuts

`ShortcutStore` coordinates registered shortcut handlers, user-customizable chords, collision-free key capture, and shortcut import/export. Actions can declare default hotkeys, but handlers own persistence and the set of possible shortcut targets.

:::tip Pro tip
A shortcut should activate an existing action or handler target. It should not become a second implementation of the behavior.
:::

## Layer lifetime

Layers should dispose when:

- the user completes or cancels the interaction;
- the user, account, document, or selected app changes;
- their anchor disappears;
- a guide advances;
- its module is removed.

The layer manager supports click-through layers, user-exit policy, animation, and always-on-top ordering.

:::warning Common pitfall
Do not keep a dialog or overlay alive merely by leaving a React component mounted. Let its directive own completion and disposal so callers can await a reliable outcome.
:::

## Go deeper

<div className="doc-links">
  <a href="../subsystems/forms">Model dialog forms</a>
  <a href="../subsystems/actions-and-validation">Show actions in menus</a>
  <a href="../advanced/guided-workflows">Target layers from guides</a>
  <a href="./operational-feedback">Report outcomes</a>
</div>
