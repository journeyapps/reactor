---
title: Responsive applications
description: Build interactions that work on desktop, tablet, and mobile.
---

# Responsive applications

Reactor applications often begin on desktop with multiple [panels](../subsystems/workspaces-and-panels.md), context menus, shortcuts, drag-and-drop, and saved layouts. Reactor changes how those features appear on smaller screens.

:::note Mental model
Keep the same task available, but change its layout and controls. Do not simply shrink a desktop workspace.
:::

## Viewport modes

Reactor defines three application modes:

- `DESKTOP`
- `TABLET`
- `MOBILE`

Use `useReactorViewportMode()` when behavior or structure must change. Use CSS media queries when only styling changes.

```tsx
const viewport = useReactorViewportMode();

return viewport === ReactorViewportMode.MOBILE ? <TodoMobileHeader /> : <TodoWorkspaceToolbar />;
```

The exported breakpoints and media-query constants keep application styles aligned with Reactor's runtime decisions.

## Component sizing

Viewport mode and component size solve different problems.

- **Viewport mode** changes application behavior and layout strategy.
- **Reactor size** changes the density of a component subtree.

Use `ReactorSizeProvider`, an explicit `size` prop, or `useReactorSize()` for density. See [UI system](../subsystems/ui-system.md) for details.

## Runtime adaptations

Some adaptations happen below application code:

- opening a floating window on mobile creates a temporary fullscreen workspace;
- default Reactor component size changes with the viewport;
- menus can use touch and long-press behavior;
- overlays remain anchored as the viewport changes;
- workspace layout engines can apply different placement policy.

:::note Hidden complexity
`WorkspaceStore.addModelInWindow()` opens a floating window on desktop and fullscreen content on mobile. The calling code does not need two implementations.
:::

## Offer more than one way to act

Dense interaction should have more than one route:

| Desktop interaction      | Alternative                              |
| ------------------------ | ---------------------------------------- |
| Right-click context menu | Action exposed through a visible menu    |
| Keyboard shortcut        | Registered action in the command palette |
| Drag-and-drop            | Coupled action or explicit move command  |
| Floating inspector       | Opened panel model                       |
| Hover tooltip            | Focusable or activatable information     |

[Actions](../subsystems/actions-and-validation.md) and [controls](../subsystems/controls.md) let these routes share one implementation.

:::tip Pro tip
If a task exists only as a mouse gesture, make it an action first. Keep the fast desktop gesture, then expose the same action to mobile and keyboard users.
:::

## Test the interaction, not only the pixels

When reviewing a responsive Reactor feature, verify:

- opened content appears in a usable place;
- primary actions remain discoverable;
- validation messages and fixes remain reachable;
- overlays and dialogs can be dismissed;
- focus does not remain behind a layer;
- touch targets use an appropriate Reactor size;
- no workflow depends exclusively on hover, right-click, or dragging.

The Playground size selector and mobile screenshots in the repository are useful starting points.

## Go deeper

<div className="doc-links">
  <a href="../subsystems/ui-system">Component sizing and surfaces</a>
  <a href="../subsystems/workspaces-and-panels">Workspace placement</a>
  <a href="./interaction-layers">Responsive layers</a>
</div>
