---
title: UI system
description: Use Reactor widgets, sizing, surfaces, forms, tooltips, and overlays.
---

# UI system

Reactor widgets are shared interaction primitives, not just visual components. Buttons understand [action validation](./actions-and-validation.md#validation-states), tooltips use [anchored overlays](../runtime/interaction-layers.md#anchored-overlays-and-tooltips), cards expose consistent actions and selection, and controls adapt to the current Reactor size.

The foundational interaction contracts have dedicated guides: [Controls](./controls.md), [Forms](./forms.md), and [Themes](./themes.md). This page focuses on composing their rendered widgets into a consistent application interface.

## Responsive sizing

Wrap a subtree in `ReactorSizeProvider` or pass a `size` prop directly:

```tsx
<ReactorSizeProvider size={Size.SMALL}>
  <PanelButtonWidget label="Save" icon="check" action={save} />
</ReactorSizeProvider>
```

Without an explicit value, Reactor uses a viewport-aware default: small on desktop and medium on mobile. Custom styled widgets can consume the same context through `useReactorSize()` and the `size()` helper.

## Surfaces and cards

Use Reactor surfaces and cards instead of recreating borders, backgrounds, spacing, and selected states. They follow the active theme and participate in the responsive sizing system.

## Tooltips and overlays

`ReactorTooltipWidget` and `useAnchoredOverlay()` render through the shared anchored-overlay layer. Overlays remain aligned while their anchor moves, scrolls, or resizes and can be grouped or configured as click-through.

Button validation messages take priority over the configured tooltip when an action is disabled, pending, or blocked. When a tooltip is identical to the visible label, `useButton()` omits it rather than repeating information the interface already shows. Use `Btn.tooltipPos` to override placement where a widget supports positioned tooltips; panel title buttons default to `TooltipPosition.TOP`.

## Tree-based content

Reactor separates tree structure from tree rendering. Choose the lowest-level building block that owns the behavior you need:

- `TreeContentWidget` applies standard horizontal indentation to arbitrary row content. It does not add selection, icons, or collapse behavior.
- `TreeLeafWidget` renders an interactive row with a label, icons, selection, context actions, tags, metadata, drag-and-drop feedback, and optional right-side content.
- `TreeWidget` combines a `TreeLeafWidget` with collapsible children, loading state, and empty-state content.
- `ReactorTreeLeaf` and `ReactorTreeNode` are stateful tree entities. They own stable keys, matching, sorting, listeners, and persisted open state.
- `CoreTreeWidget` renders a tree entity and recursively delegates to its node or leaf widget.
- `SearchableCoreTreeWidget` adds a search input and passes the resulting matcher through the same tree.

Use `TreeContentWidget` when a custom row only needs to line up with the rest of a tree:

```tsx
<TreeContentWidget depth={depth}>
  <StatusWidget status={status} />
</TreeContentWidget>
```

For a small local hierarchy, compose `TreeWidget` and `TreeLeafWidget` directly:

```tsx
<TreeWidget
  label="Deployments"
  icon="rocket"
  children={(depth) => <TreeLeafWidget depth={depth} label="Production" icon="server" />}
/>
```

Use `ReactorTreeNode` and `ReactorTreeLeaf` with `CoreTreeWidget` when the structure has its own lifecycle, needs search or persisted open state, or changes independently of its React parent. [Entity tree presenters](./entity-definitions/presentation-and-panels.md#tree-presenters) build on these models with description, selection, contextual actions, [descendants](./entity-definitions/descendants.md), and entity drag-and-drop.

### Align nodes and leaves

Leaves normally reserve the same leading space as a collapsible node's toggle. This keeps siblings aligned in a mixed node-and-leaf tree. Set `reserveNodeToggleSpace={false}` when an inline tree contains only root leaves that should align directly with their surrounding content:

```tsx
<CoreTreeWidget tree={tree} reserveNodeToggleSpace={false} />
```

The option only changes indentation passed through to `TreeContentWidget`. It does not change collapse behavior, depth tracking, searching, or custom rendering.

## Forms

[Reactor forms](./forms.md) use `FormModel` and `FormInput` subclasses. Text, textarea, and number inputs default their placeholder to the input label. Use `GroupInput` for nested fields and `hideError` when a containing widget renders the validation message.

## Choosing a component

The playground is the fastest way to compare supported widgets and representations:

- **Actions** demonstrates action-to-button/control/combo-box adaptation and validation states.
- **Forms** demonstrates modeled inputs and grouped fields.
- **Cards**, **Surfaces**, **Tabs**, and **Tables** demonstrate layout primitives.
- **Overlays** demonstrates anchored positioning.
- **Guide** demonstrates guided workflows and attention states.

Run it with `pnpm demo:watch` and select Reactor Playground.
