---
title: Getting around a Reactor application
description: Find commands, arrange your workspace, and keep frequent actions close at hand.
---

# Getting around a Reactor application

Reactor applications are organized around workspaces, panels, and commands instead of a fixed sequence of pages. Each product chooses which features to install, so names and available actions will differ, but the main interactions are consistent.

:::note This guide will grow
This is a practical starting point for people using Reactor-based applications. It covers the shared application shell and can be expanded as more user workflows settle.
:::

## Know the main areas

A typical Reactor application contains:

- a header with application context, workspace choices, search, and account controls;
- one active workspace containing panels, tabs, trays, or split views;
- optional left, right, and header toolbars for pinned actions or entities;
- a footer or status area for progress, connection state, and operational details.

Your application may hide some of these areas or rename its workspaces. The workspace is still the main place where your current task is arranged.

## Find and run a command

Select **Search** in the header to open the command palette. The **Everything** tab searches across the registered application content, while **Actions** narrows the results to commands.

Start typing any part of a command's name or a related term. Use the arrow keys to change the highlighted result and Enter to select it, or select a result with the pointer. Some actions may ask for another value before they run. Unavailable actions can remain visible with an explanation of what is required.

:::tip Pro tip
Use the command palette when you know what you want to do but not where the application placed it. The same action can appear in a panel, menu, shortcut, and command palette.
:::

## Pin something you use often

When advanced workspace management is enabled, you can drag an action or another supported entity from the command palette into a visible toolbar:

1. Open the command palette and find the item.
2. Drag the result toward the header, left, or right toolbar.
3. Drop it when the toolbar highlights.

The new button is saved with your preferences. Select it to run or open the item. Right-click a pinned button and choose **Delete** to remove it. Right-click an outer vertical toolbar to hide it or clear all of its items.

Not every search result is draggable. A result must represent an entity that the application knows how to save and restore.

## Work with panels and windows

Panels contain the tools and information for your current task. Depending on the workspace, you can arrange panels into tabs, trays, split areas, or floating windows.

Right-click a panel title to see the actions available for its current placement. In an editable workspace you can close the panel or convert it to tabs or a tray. A standalone floating window can also be docked back into the workspace. A temporary window shown from a collapsed tray stays attached to that tray, so it only offers **Close**.

Double-click a floating-window title to maximize or restore it. Use the title-bar buttons for the same operation and to close the window.

## Switch and customize workspaces

Use the workspace choices in the header to move between task layouts. A product may group related workspaces under one heading and remember the last child you used.

With advanced workspace management enabled, workspace context menus can include actions such as rename, clone, group, import, export, or reset. Some workspaces are managed by the application and intentionally cannot be changed.

:::warning Resetting a workspace
Reset restores the generated workspace layout and discards your saved arrangement for that workspace. Export first if you may want the current layout again.
:::

## Recover when the layout gets in the way

If a panel is missing, first use the command palette to open the action or entity again. If the whole arrangement is no longer useful, open the workspace menu and choose **Reset workspaces**. You can also export a useful layout before experimenting and import it later.

Application preferences may include toggles for advanced workspace management and the left or right toolbar. If an interaction described here is absent, check those preferences or ask the application's administrator whether it is enabled.

## For application developers

This page describes the shared user experience. To configure these systems in a Reactor module, continue with:

<div className="doc-links">
  <a href="../subsystems/search-selection-and-command-palette">Search and command palette</a>
  <a href="../subsystems/workspaces-and-panels">Workspaces and panels</a>
  <a href="../subsystems/settings-and-persistence">Settings and persistence</a>
</div>
