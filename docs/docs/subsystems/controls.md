---
title: Controls
description: Adapt values and behavior to buttons, widgets, combo boxes, settings, and forms.
---

# Controls

One control can appear as a button, inline widget, or combo-box item. [Actions](./actions-and-validation.md), [settings](./settings-and-persistence.md), and [forms](./forms.md) use controls so these representations share one value and behavior.

:::note Mental model
A control owns the value or behavior. Its button, inline widget, and combo-box items are different views of the same control.
:::

## Controls

`AbstractControl` defines three representations:

```ts
abstract representAsBtn(): Btn;
abstract representAsControl(options?: RepresentAsControlOptions): React.JSX.Element;
abstract representAsComboBoxItems(options?: RepresentAsComboBoxItemsEvent): ComboBoxItem[];
```

This lets a Boolean, date, entity selector, set selector, or action participate in a panel, floating menu, and combo box without duplicating its state transitions.

Common controls include:

- `BooleanControl`
- `SetControl`
- `DateControl`
- `EntityControl`
- `FileControl`
- `ButtonControl`
- `ActionButtonControl`

`AbstractValueControl` owns a mutable value and emits value-change events. All of its renderers use that same value.

```ts
const status = new SetControl({
  initialValue: 'review',
  options: [
    { key: 'draft', label: 'Draft' },
    { key: 'review', label: 'In review' },
    { key: 'done', label: 'Done' }
  ]
});

status.registerListener({
  valueChanged: (value) => saveStatus(value)
});
```

The same instance can render as a selector in a panel, supply a button descriptor to another widget, or generate items for a combo box.

:::warning Common pitfall
Do not create a separate control instance for every representation when those surfaces are meant to edit the same value. They will drift into independent state.
:::

## Action controls

`ActionButtonControl` adapts an event-bound [action](./actions-and-validation.md). It asks the action for its current button descriptor, keeping the label, icon, validation, indicator, and activation callback consistent.

```ts
const control = action.representAsControl({
  eventData: { targetEntity: todo }
});
```

The Actions sandbox shows the same action rendered through standard button, icon-only, panel-sized control, compact control, and combo-box item representations.

## Accept controls in reusable UI

Accept an `AbstractControl` when reusable UI needs a value or behavior but should not require one specific widget. The reusable UI can ask for the representation it needs:

```tsx
function ToolbarValue({ control }: { control: AbstractControl }) {
  return control.representAsControl({ size: LayoutContextSize.SMALL });
}
```

[Settings](./settings-and-persistence.md), [forms](./forms.md), [entity selection](./entity-definitions/search.md), and actions all use this pattern. The surrounding UI chooses the layout; the control manages the value or behavior.

## Implementing a control

Implement all three representations even if one is the primary surface. `representAsBtn()` should return a descriptor and not render React itself. `representAsControl()` selects the standard Reactor widget for the current context. `representAsComboBoxItems()` exposes equivalent choices or activation behavior to menus.

Keep state and callbacks in the control. Do not make each representation maintain its own selection state. For value controls, update `value` so registered listeners and every active representation observe the same change.

:::tip Pro tip
Accept `AbstractControl` in reusable components. Callers can supply a different control without changing the component.
:::

## Controls in forms and settings

`ControlInput` embeds a control in a form. `AbstractUserSetting` embeds one in the settings system. Both preserve the control as the source of interaction state while adding their own concerns:

- forms add labels, validation, visibility, and submission values;
- settings add keys for saved data, defaults, categories, and readiness.

See [Forms](./forms.md) for input modeling and [Settings and persistence](./settings-and-persistence.md) for persisted controls.

## Go deeper

<div className="doc-links">
  <a href="./actions-and-validation">Action controls</a>
  <a href="./forms">Controls inside forms</a>
  <a href="./settings-and-persistence">Persisted controls</a>
  <a href="../runtime/interaction-layers">Combo-box representations</a>
</div>
